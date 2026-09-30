# Deployment-Architektur — Portfolio Kilian Siebert

Ist-Zustand und Entscheidungen, Stand 2026-09-30 (B25 Session 17). Befehle für den Deploy selbst:
[`manual-deploy.md`](../manual-deploy.md). CI-Gates und GitHub-Settings:
[`security/github-settings.md`](security/github-settings.md). Host-Details (VPS, hillerhome, Monitoring,
Backups) pflegt Max im privaten Ops-Repo (`docs/hosts.md`, `docs/operations.md`). Der frühere Guide
liegt als Historie in [`archive/deploy-guide-2026-06.md`](archive/deploy-guide-2026-06.md).

## 1. Überblick

```
Besucher ──443──▶ Oracle VPS (feste IPv4, Caddy: TLS, HSTS, Proxy)
                    │  WireGuard 10.10.0.0/24 (hillerhome baut den Tunnel auf, DS-Lite)
                    ▼
                  hillerhome 10.10.0.2 (Docker, docker-compose.prod.yml)
                    app:3000 · garage:3902 (Web, read-only) · umami:3001 · postgres (nur intern)
```

| Name | Ziel | Hinweis |
|---|---|---|
| `kilia-siebert.de` | `10.10.0.2:3000` (App) | `lb_try_duration 30s` überbrückt den Neustart beim Deploy |
| `www.kilia-siebert.de` | 301 → Apex | |
| `cdn.kilia-siebert.de` | `10.10.0.2:3902` (Garage-Web-Endpoint) | Bucket per Host-Alias, `Cache-Control` 1 Tag + SWR |
| `umami.kilia-siebert.de` | `10.10.0.2:3001` | öffentlich nur `/script.js`, `/api/send`, sonst `basic_auth` |

- hillerhome hat keine öffentliche IPv4, deshalb terminiert der VPS TLS (Let's Encrypt) und reicht über
  WireGuard durch. Alle Ports auf hillerhome sind an `10.10.0.2` bzw. `127.0.0.1` gebunden.
- **Header:** Caddy setzt nur HSTS (1 Jahr, `includeSubDomains`, kein `preload`). Alle
  inhaltsbezogenen Header (XFO, nosniff, Referrer, Permissions-Policy, CSP) kommen aus `next.config.ts`.
- **CSP (B4):** seit B25 Session 21 als `Content-Security-Policy-Report-Only` auf den Frontend-Routen
  (Policy: `src/lib/csp.ts`). Browser melden Verstöße an `/api/csp-report`, die App schreibt je Verstoß eine
  Zeile ins Log: `docker logs portfolio-app-1 2>&1 | grep csp-report`. Das Log beginnt mit jedem Deploy neu.
  Nach 7 Tagen ohne Verstöße wird derselbe Wert erzwungen (Session 22), dann entfällt `X-Frame-Options`.
- **Wartungsseite:** Ist die App oder hillerhome weg, liefert Caddy nach 30 s eine statische Seite mit 503.
- DNS für `kilia-siebert.de` liegt bei IONOS (CAA nur Let's Encrypt), Umzug zu deSEC ist geplant (B25 C1).

## 2. Dienste (`docker-compose.prod.yml`)

| Dienst | Image | Daten | Grenzen |
|---|---|---|---|
| `app` | `ghcr.io/marax1234/portfolio-app@sha256:…`, lokal als `portfolio-app:latest` getaggt | Volume `next-image-cache` (nur `/app/.next/cache/images`) | 2 GB RAM, 3 CPUs, Healthcheck `/api/health` |
| `postgres` | `postgres:16-alpine` (Major-Pin bewusst) | Volume `pgdata`; `init-db/01-umami.sh` legt DB+User `umami` an (**nur bei leerem Volume**) | 1 GB |
| `garage` | `dxflrs/garage` (Tag + Digest) | Volumes `garage-meta`, `garage-data`; Config `garage.toml` | 256 MB |
| `umami` | `ghcr.io/umami-software/umami` (Tag + Digest) | DB `umami` in Postgres | 768 MB |

- **Env:** `/opt/portfolio/.env.prod` auf hillerhome (600, gitignored), Quelle der Werte ist Max' Tresor.
  Variablen siehe Compose-Datei; `.env.example` ist die Vorlage für die lokale Entwicklung.
- **Uploads** gehen über das S3-Plugin nach Garage (`garage:3900`), ausgeliefert werden sie über `cdn.*`.
  Website, Alias, CORS: `scripts/storage-init.sh` (idempotent, `manual-deploy.md`).
- **Video:** ffmpeg im App-Image, eine Transkodierung gleichzeitig mit `nice 19`, Download gestreamt.
- **Migrationen** laufen beim App-Start (`prodMigrations`), nie im Build. Regel: Expand/Contract (`CLAUDE.md`).

## 3. Image-Build

- `Dockerfile` (drei Stufen `deps` → `builder` → `runner`, Node 24 LTS mit Digest). Der Build braucht
  **keine DB und keine Secrets**: `.env*` liegt nicht im Kontext, eingebacken werden nur die
  öffentlichen `NEXT_PUBLIC_*` (Build-Args, in der CI mit den Prod-Werten).
- `/arbeiten/[slug]` und `/journal/[slug]` entstehen per on-demand ISR beim ersten Aufruf, die übrigen
  Payload-Seiten rendern pro Request mit gecachten Daten (Tag-basierte Revalidierung aus den Hooks).
- pnpm-Version aus `packageManager`, Store als BuildKit-Cache-Mount, `node-linker=hoisted` im Image
  (Turbopack ≥ 16.3 bricht an pnpm-Symlinks in `outputFileTracingIncludes`, vercel/next.js#97507).
  `require('sharp')` ist Build-Gate in `deps` und `runner`.
- Runner-Stage ohne npm/corepack/yarn, läuft als `nextjs` (UID 1001).

## 4. Pipeline: vom Merge bis live

```
PR   → CI Security Gates: Gitleaks · SCA · CodeQL · tsc · Lint · Test · Build (+ Trivy) · DAST · zizmor
main → Build: ghcr.io/marax1234/portfolio-app:<sha> (öffentlich) + CycloneDX-SBOM + SLSA-Provenance
     → DAST gegen genau diesen Digest (rot → Issue [dast] …, kein Deploy)
     → deploy.yml (workflow_run nach grüner CI): wartet auf Max' Freigabe im Environment production
     → gh attestation verify → Tailscale (ephemerer Node tag:ci, OIDC, kein Auth-Key)
     → ssh deploy@hillerhome sha256:<digest>
hillerhome: sshd ForceCommand → /usr/local/sbin/portfolio-deploy (nur sha256:<64 hex>)
     → sudo -u hillerhome /opt/portfolio/scripts/deploy.sh sha256:<digest>
```

`scripts/deploy.sh` ist der **einzige** Deploy-Weg, aus der CI wie von Hand: Commit aus dem Image-Label,
nur Commits auf `origin/main`, Rollback-Tag + `pg_dump` vor dem Wechsel, `up --wait`, Smoke-Test,
automatischer Rollback, ntfy. Ablauf, manueller Rollback und Stolperfallen: `manual-deploy.md`.
Einrichtung (Tailscale-ACL, Federated Identity, `DEPLOY_SSH_KEY`): `security/github-settings.md` →
„Auto-Deploy“.

## 5. Entscheidungen (B25, 2026-09-29)

| # | Entscheidung | Grund |
|---|---|---|
| A1 | Image in CI → GHCR → Freigabe → Tailscale-SSH → Deploy-User mit erzwungenem Kommando. **Kein Self-hosted Runner.** | Öffentliches Repo; nichts dauerhaft mit Docker-Rechten auf dem Host |
| A2 | GHCR-Package öffentlich | Keine Secrets im Image, kein Pull-Token auf dem Host |
| A3 | ~10 s Neustart pro Deploy, Caddy `lb_try_duration 30s` | Blue/Green lohnt bei einem Host nicht |
| A4 | Expand/Contract für Migrationen + Dump vor jedem Deploy | Rollback ohne DB-Restore |
| A6 | DAST-Fehler → GitHub-Issue, kein ntfy aus GitHub | ntfy-Topic bleibt außerhalb von GitHub |
| B1 | `/admin` bleibt öffentlich (Kilian pflegt ohne VPN), Lockout + `unlock` nur für Eingeloggte, GraphQL aus | Kleinste öffentliche Fläche |
| B3 | App setzt die Inhalts-Header, Caddy nur HSTS | Die App kennt ihre Routen (Live-Preview = same-origin iframe) |
| B4 | CSP erst `Report-Only` (Frontend), nach 1 Woche ohne Verstöße scharf | |
| C2 | Kein HSTS-Preload | Familien-Domain mit IONOS-Mail, Tragweite zu groß |
| D2 | Seed nur lokal, keine `SEED_ADMIN_*` auf dem Host | |
| E2 | Nur der Bild-Cache überlebt den Deploy | Sonst alte ISR-Seiten nach dem Deploy |

## 6. Betrieb

- **Monitoring:** `health-check` (systemd-Timer, beide Hosts) prüft Container, Disk, RAM, WireGuard und
  die öffentlichen URLs inkl. `/api/health` → ntfy. Details im Ops-Repo.
- **Backups:** restic, täglich, Kreuz-Backup hillerhome ↔ VPS über WireGuard: Postgres-Dumps, Garage
  (Snapshot + Datei-Export), `/opt` inkl. `.env.prod`. Restore und Totalausfall: Ops-Repo.
- **Updates:** Dependabot (7 Tage Cooldown, `minimumReleaseAge` in pnpm), Merge nur nach Review.
  Umami/Garage: Tag + Digest in beiden Compose-Dateien anheben, vorher Backup, dann auf hillerhome
  `docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --no-deps <dienst>`.

## 7. Stolperfallen

1. **Docker umgeht UFW.** Deshalb hat `/etc/docker/daemon.json` auf hillerhome `"iptables": false`, und
   jeder Port ist an eine IP gebunden. Niemals `3000:3000` ohne IP-Präfix. NAT für Container-Netze
   (`172.16.0.0/12`) setzt `docker-bridge-nat.service`.
2. **`--env-file` vor `-f`**, sonst interpoliert Compose `${VAR}` stillschweigend leer.
3. **Umami lauscht im Container auf 3000**, außen `10.10.0.2:3001`; die App spricht intern `http://umami:3000`.
4. **Payload pusht das Schema nur in `development`.** Produktion braucht immer eine committete Migration.
5. **Caddyfile auf dem VPS ist als Einzeldatei gemountet:** nach `install`/`cp` `docker compose restart caddy`
   statt `reload` (neue Inode).
6. **`init-db/` läuft nur bei leerem `pgdata`-Volume** (legt DB + User `umami` an). Bei einem Neuaufbau
   also erst Postgres mit leerem Volume starten, dann die Dumps einspielen; bei einem vorhandenen Volume
   passiert nichts.
