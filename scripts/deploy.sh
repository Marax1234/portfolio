#!/usr/bin/env bash
# Production-Deploy auf hillerhome (B25 D-04). Einziger Deploy-Weg, manuell wie aus der CI.
#
#   scripts/deploy.sh sha256:<64 hex>    Image aus GHCR per Digest (Normalfall, auch CI)
#   scripts/deploy.sh build [<commit>]   Image lokal bauen (Rückfall), Default: origin/main
#
# Als hillerhome in /opt/portfolio (Docker-Gruppe, sudo -n für Dump-Ordner und ntfy-Config).
# Die CI kommt über den Deploy-User: authorized_keys → /usr/local/sbin/portfolio-deploy
# (prüft das Argument) → sudo -u hillerhome dieses Skript (Ops-Repo, hillerhome/).
#
# Ablauf: Commit bestimmen (nur Commits auf origin/main) → Checkout (detached) → Rollback-Tag
# → pg_dump (Modus 600) → Image bauen bzw. per Digest holen → `up --wait` (Healthcheck)
# → Smoke-Test intern + über die Domain → ntfy. Schlägt Start oder Smoke-Test fehl: voriges
# Image + voriger Commit, erneut prüfen, ntfy PROBLEM. Aufbewahrung: je 3 Rollback-Tags/Dumps.
#
# Migrationen laufen beim App-Start (prodMigrations). Rollback ohne DB-Restore geht nur bei
# Expand/Contract (CLAUDE.md). Nach einem Contract-Schritt gehört der Dump-Restore dazu:
#   docker compose … stop app && docker compose … exec -T postgres \
#     pg_restore -U portfolio -d portfolio --clean --if-exists < portfolio-<ts>.dump
#
# Env (nur für manuelle Läufe): DEPLOY_FORCE_SMOKE_FAIL=1 = Rollback-Übung (Smoke-Test prüft
# zusätzlich einen Pfad, den es nicht gibt).
set -Eeuo pipefail

REPO_DIR=/opt/portfolio
IMAGE_REPO=ghcr.io/marax1234/portfolio-app
LOCAL_IMAGE=portfolio-app
DUMP_DIR=/var/backups/predeploy
KEEP=3
SITE_URL=https://kilia-siebert.de
INTERNAL_URL=http://10.10.0.2:3000
SMOKE_PAGES=(/ /arbeiten /journal /impressum)

log() { printf '%s deploy: %s\n' "$(date +%T)" "$*" >&2; logger -t portfolio-deploy -- "$*" 2>/dev/null || true; }
die() { log "FEHLER: $*"; exit 1; }

# ntfy wie health-check, das Topic ist ein Secret: nur aus /etc/server-alerts.conf (root 600),
# per stdin an curl (nicht in die Prozessliste).
notify() { # title message priority tags
  local url
  url=$(sudo -n sh -c '. /etc/server-alerts.conf && printf %s "$NTFY_URL"' 2>/dev/null) || url=""
  if [[ -z $url ]]; then log "ntfy: keine Config lesbar"; return 0; fi
  printf 'url = "%s"\n' "$url" | curl -fsS -m 10 -o /dev/null --config - \
    -H "Title: $(hostname): $1" -H "Priority: $3" -H "Tags: $4" -d "$2" || log "ntfy fehlgeschlagen"
}

compose() { docker compose --env-file .env.prod -f docker-compose.prod.yml "$@"; }

smoke() {
  local p body
  curl -fsS -m 10 -o /dev/null --retry 10 --retry-delay 3 --retry-all-errors "$INTERNAL_URL/api/health" \
    || { log "Smoke: $INTERNAL_URL/api/health"; return 1; }
  curl -fsS -m 10 -o /dev/null --retry 5 --retry-delay 3 --retry-all-errors "$SITE_URL/api/health" \
    || { log "Smoke: $SITE_URL/api/health"; return 1; }
  local pages=("${SMOKE_PAGES[@]}")
  [[ ${DEPLOY_FORCE_SMOKE_FAIL:-} == 1 ]] && pages+=(/__deploy-rollback-uebung)
  for p in "${pages[@]}"; do
    body=$(curl -fsS -m 20 --retry 3 --retry-delay 3 "$SITE_URL$p") || { log "Smoke: $p nicht 200"; return 1; }
    grep -q '<h1' <<<"$body" || { log "Smoke: $p ohne <h1>"; return 1; }
  done
  log "Smoke-Test ok (${pages[*]}, /api/health intern + extern)"
}

# Behält die $KEEP jüngsten Rollback-Tags (Name enthält Datum/Uhrzeit) und Dumps (mtime).
retention() {
  local t f
  docker image ls "$LOCAL_IMAGE" --format '{{.Tag}}' | grep '^rollback-' | sort -r | tail -n +$((KEEP + 1)) \
    | while read -r t; do docker image rm "$LOCAL_IMAGE:$t" >/dev/null && log "Aufräumen: $LOCAL_IMAGE:$t"; done || true
  sudo -n find "$DUMP_DIR" -maxdepth 1 -name 'portfolio-*.dump' -printf '%T@ %p\n' | sort -rn | tail -n +$((KEEP + 1)) \
    | while read -r _ f; do sudo -n rm -f -- "$f" && log "Aufräumen: $f"; done || true
}

rollback() { # voriger-commit rollback-tag neuer-commit dump
  local prev=$1 tag=$2 rev=$3 dump=$4
  compose logs --no-color --tail=60 app >&2 || true
  if [[ -z $tag ]]; then
    notify "PROBLEM Deploy" "Commit ${rev:0:12} fehlgeschlagen, kein Rollback-Image vorhanden." urgent rotating_light
    die "kein Rollback-Image"
  fi
  log "Rollback auf $LOCAL_IMAGE:$tag, Commit ${prev:0:12}"
  docker tag "$LOCAL_IMAGE:$tag" "$LOCAL_IMAGE:latest"
  git checkout --quiet --detach "$prev"
  if compose up -d --no-deps --wait --wait-timeout 180 app && DEPLOY_FORCE_SMOKE_FAIL='' smoke; then
    notify "PROBLEM Deploy" "Commit ${rev:0:12} fehlgeschlagen, automatisch zurück auf ${prev:0:12} ($tag). Dump: $dump" high warning
    die "Deploy fehlgeschlagen, Rollback ok"
  fi
  notify "PROBLEM Deploy + Rollback" "Commit ${rev:0:12} fehlgeschlagen UND Rollback auf $tag nicht gesund. Sofort prüfen. Dump: $dump" urgent rotating_light
  die "Rollback fehlgeschlagen"
}

main() {
  local mode=${1:-} digest="" rev prev_rev ts tag="" dump
  cd "$REPO_DIR"
  umask 077
  exec 9>"$REPO_DIR/.git/deploy.lock"
  flock -n 9 || die "ein anderer Deploy läuft"
  [[ -f .env.prod ]] || die ".env.prod fehlt"
  [[ -z $(git status --porcelain --untracked-files=no) ]] || die "Checkout nicht sauber (git status)"
  git fetch --quiet origin

  case $mode in
    sha256:*)
      [[ $# -eq 1 && $mode =~ ^sha256:[0-9a-f]{64}$ ]] || die "ungültiger Digest"
      digest=$mode
      docker pull --quiet "$IMAGE_REPO@$digest" >/dev/null || die "Pull $IMAGE_REPO@$digest fehlgeschlagen"
      rev=$(docker image inspect -f '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$IMAGE_REPO@$digest")
      ;;
    build)
      [[ $# -le 2 ]] || die "Aufruf: $0 build [<commit>]"
      rev=$(git rev-parse --verify --quiet "${2:-origin/main}^{commit}") || die "Commit unbekannt: ${2:-}"
      ;;
    *) die "Aufruf: $0 sha256:<digest> | build [<commit>]" ;;
  esac
  [[ $rev =~ ^[0-9a-f]{40}$ ]] || die "kein gültiger Commit im Image-Label: '$rev'"
  git merge-base --is-ancestor "$rev" origin/main || die "Commit $rev liegt nicht auf origin/main"

  prev_rev=$(git rev-parse HEAD)
  ts=$(date +%F-%H%M%S)
  log "Start ${digest:-build}, Commit ${rev:0:12} (bisher ${prev_rev:0:12})"

  # Rückweg: laufendes Image taggen, Dump vor den Migrationen des neuen Images.
  if docker image inspect "$LOCAL_IMAGE:latest" >/dev/null 2>&1; then
    tag=rollback-$ts
    docker tag "$LOCAL_IMAGE:latest" "$LOCAL_IMAGE:$tag"
  fi
  dump=$DUMP_DIR/portfolio-$ts.dump
  sudo -n install -d -m 700 "$DUMP_DIR"
  compose exec -T postgres pg_dump -U portfolio -Fc portfolio </dev/null | sudo -n install -m 600 /dev/stdin "$dump" \
    || { sudo -n rm -f -- "$dump"; die "pg_dump fehlgeschlagen, nichts geändert"; }
  (( $(sudo -n stat -c %s "$dump") > 1024 )) || die "Dump $dump zu klein, nichts geändert"
  log "Dump $dump, Rollback-Tag ${tag:-keins}"

  git checkout --quiet --detach "$rev"
  if [[ -n $digest ]]; then
    docker tag "$IMAGE_REPO@$digest" "$LOCAL_IMAGE:latest"
  elif ! compose build app; then
    git checkout --quiet --detach "$prev_rev"
    notify "PROBLEM Deploy" "Build von ${rev:0:12} fehlgeschlagen, App läuft unverändert." high warning
    die "Build fehlgeschlagen, App unverändert"
  fi

  if compose up -d --no-deps --wait --wait-timeout 180 app && smoke; then
    notify "OK Deploy" "Commit ${rev:0:12} live (${digest:-lokal gebaut}). Rollback-Tag ${tag:-keins}." default white_check_mark
    retention
    log "Fertig: Commit $rev ${digest:-lokal gebaut}"
    return 0
  fi
  rollback "$prev_rev" "$tag" "$rev" "$dump"
}

# main erst nach vollständigem Einlesen ausführen: `git checkout` ersetzt diese Datei während des Laufs.
main "$@"; exit $?
