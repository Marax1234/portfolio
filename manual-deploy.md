# Manuelles Deployment — Kurzreferenz

**Einziger Deploy-Weg ist `scripts/deploy.sh`** – aus der CI (`deploy.yml`: Merge → Image in GHCR →
Freigabe im Environment `production` → Tailscale → Deploy-User → Skript) oder von Hand auf hillerhome.
Hintergrund in `deploy.md`, hier nur die Befehle und die Stolperfallen aus der Praxis.

Voraussetzung: auf hillerhome als `hillerhome`, Postgres/Garage/Umami laufen dauerhaft
(`restart: unless-stopped`), nur die App wird ersetzt.

## Ablauf

```bash
cd /opt/portfolio
scripts/deploy.sh sha256:<digest>   # Image aus ghcr.io/marax1234/portfolio-app (wie die CI)
scripts/deploy.sh build             # Rückfall ohne GHCR: origin/main lokal bauen
scripts/deploy.sh build <commit>    # bestimmter Commit, muss auf origin/main liegen
```

Das Skript macht nacheinander:

1. Commit bestimmen (beim Digest aus dem Label `org.opencontainers.image.revision`), nur Commits
   auf `origin/main`, Checkout **detached** auf diesen Commit (`git status` zeigt, was läuft).
2. Laufendes Image als `portfolio-app:rollback-<datum-uhrzeit>` taggen, `pg_dump -Fc` nach
   `/var/backups/predeploy/portfolio-<datum-uhrzeit>.dump` (Modus 600).
3. Image holen (Digest) bzw. bauen (`build`, ohne DB und Secrets), als `portfolio-app:latest` taggen.
4. `up -d --no-deps --wait` (Healthcheck `/api/health` = Payload inkl. `prodMigrations` bereit;
   Caddy überbrückt die ~10 s mit `lb_try_duration`).
5. Smoke-Test: `/api/health` intern und über die Domain, `/`, `/arbeiten`, `/journal`, `/impressum`
   mit 200 und `<h1`.
6. ntfy OK bzw. PROBLEM (Topic aus `/etc/server-alerts.conf`), Log: `journalctl -t portfolio-deploy`.
7. Aufräumen: nur die 3 jüngsten Rollback-Tags und Dumps bleiben.

**Automatischer Rollback:** Scheitert Start oder Smoke-Test, taggt das Skript das vorige Image
zurück, stellt den vorigen Commit wieder her, startet neu, prüft erneut und meldet per ntfy.
Übung: `DEPLOY_FORCE_SMOKE_FAIL=1 scripts/deploy.sh build` (prüft einen Pfad, den es nicht gibt).

**Manueller Rollback:** `scripts/deploy.sh sha256:<voriger digest>` (Digests: GHCR bzw. Deploy-Log)
oder lokal `docker tag portfolio-app:rollback-<ts> portfolio-app:latest` und
`docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --no-deps --wait app`.
Nur bei einer Migration mit Contract-Schritt (Drop/Umbenennung, siehe `CLAUDE.md`) zusätzlich den
Dump zurückspielen: App stoppen, dann
`sudo cat <dump> | docker compose … exec -T postgres pg_restore -U portfolio -d portfolio --clean --if-exists`.

## Object Storage (Garage)

Seit B4 (2026-09) ersetzt Garage (`dxflrs/garage`, Tag + Digest gepinnt) MinIO. Garage legt
App-Key und Bucket beim Start selbst an (`--single-node --default-bucket`, Werte aus
`S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`/`S3_BUCKET`, dazu `GARAGE_RPC_SECRET` in `.env.prod`).
Website-Zugriff, Host-Alias `cdn.<domain>`, CORS und Platzhalter setzt einmalig (idempotent):

```bash
# als hillerhome (Docker-Gruppe), NICHT mit sudo: sudo verwirft die Env mit den Credentials
set -a; . ./.env.prod; set +a
COMPOSE_ENV_FILES=.env.prod COMPOSE_FILE=docker-compose.prod.yml S3_ENDPOINT=http://127.0.0.1:3900 \
  NEXT_PUBLIC_S3_PUBLIC_URL=https://cdn.$DOMAIN ./scripts/storage-init.sh
```

- Caddy (VPS) proxyt `cdn.<domain>` ohne Rewrite auf den Web-Endpoint `10.10.0.2:3902`
  (Host-Header bleibt erhalten → Bucket-Alias). Die S3-API (3900) ist nur intern bzw. auf
  `127.0.0.1` erreichbar, ein öffentliches Bucket-Listing gibt es nicht mehr.
- Status: `docker compose -f docker-compose.prod.yml exec garage /garage status` bzw.
  `/garage bucket info portfolio-media`.
- Update: Tag **und** Digest in beiden Compose-Dateien anheben (Release ≥ 7 Tage alt,
  Release-Notes auf Breaking Changes prüfen), vorher Backup.

## Stolperfallen

- **`--env-file` muss vor `-f` stehen.** Andere Reihenfolge interpoliert `${VAR}` in der
  Compose-Datei stillschweigend leer — keine Fehlermeldung, nur falsche/leere Env-Werte.

- **Keine `.env.production.local` mehr.** Der Build fragt keine DB ab (B25 Session 10):
  `/arbeiten/[slug]` und `/journal/[slug]` entstehen beim ersten Aufruf (on-demand ISR), die
  übrigen Payload-Seiten pro Request mit gecachten Daten. `gen-build-env.sh` und
  `network: host` sind entfallen.

- **pnpm-Version kommt aus `packageManager` in `package.json`** (inkl. sha512). Corepack im
  Dockerfile und `pnpm/action-setup` in der CI lesen sie dort; nicht zusätzlich in Workflows
  oder im Dockerfile pinnen. `minimumReleaseAge` (7 Tage) steht in `pnpm-workspace.yaml`.

- **Jede Payload-Schema-Änderung braucht eine committete Migration.** `push: false` in
  `payload.config.ts` heißt: Ohne Migration unter `src/migrations/` scheitern die Seiten zur
  Laufzeit mit `relation "..." does not exist` (der Build merkt es nicht mehr). Migrationen
  lokal gegen die Dev-DB erzeugen, keine Prod-Secrets nötig:
  ```bash
  pnpm db:up && pnpm payload migrate:create <name>
  ```
  Anschließend committen. Expand/Contract beachten (`CLAUDE.md`), damit die vorige
  App-Version beim Rollback weiterläuft.

- **Checkout in `/opt/portfolio` ist detached** (seit `deploy.sh`). Kein `git pull` von Hand,
  keine lokalen Änderungen: Das Skript bricht bei einem unsauberen Checkout ab.

- **`sharp`/libvips-Fetch ist flaky.** Der Retry-Loop im Dockerfile (`deps`-Stage) fängt
  das normalerweise ab; falls der Build trotz 3 Versuchen an `require('sharp')` scheitert,
  einfach den Build erneut anstoßen (Registry-Problem, kein Code-Fehler).

- **DB-Seed/Migration-Erzeugung niemals per `docker compose exec app`.** Der `runner`-Stage
  enthält nur `.next/standalone` — kein `pnpm`, kein `src/`. Migrationen entstehen lokal
  (siehe oben), der Seed ist nur für lokale Daten gedacht.

- **`next/image`-Cache liegt im Volume `portfolio_next-image-cache`** (nur
  `/app/.next/cache/images`, B23/E2) und überlebt Deploys. HTML/ISR startet mit jedem neuen
  Container frisch. Bei kaputten Bildvarianten: App stoppen, Volume löschen, neu starten.

- **Alle Code-Fixes, die dabei nötig werden (Dockerfile, Migrations, Scripts), gehören auf
  einen Fix-Branch + PR**. `deploy.sh` deployt ohnehin nur Commits auf `origin/main`, der
  nächste CI-Deploy würde sonst am selben Problem erneut scheitern.
