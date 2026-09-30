# Manuelles Deployment — Kurzreferenz

**Das ist derzeit der einzige Deploy-Weg.** `deploy-production.yml` ist stillgelegt (nur
`workflow_dispatch`, kein Runner, B24); ein automatischer Deploy über GHCR + Tailscale folgt
später. Vollständiger Hintergrund in `deploy.md` — hier nur der eigentliche Befehlsablauf
plus die Stolperfallen, die in der Praxis aufgetreten sind.

Voraussetzung: auf hillerhome, im Repo unter `/opt/portfolio`, Postgres/Garage/Umami laufen
bereits dauerhaft (`restart: unless-stopped`) — nur die App wird neu gebaut/gestartet.

## Ablauf

```bash
cd /opt/portfolio
git pull origin main
C="docker compose --env-file .env.prod -f docker-compose.prod.yml"
TS=$(date +%F-%H%M)

# Rückweg sichern: Image taggen, DB-Dump (Migrationen laufen gleich beim Start)
docker tag portfolio-app:latest "portfolio-app:rollback-$TS"
$C exec -T postgres pg_dump -U portfolio -Fc portfolio | sudo tee "/var/backups/predeploy/portfolio-$TS.dump" >/dev/null

# Build: braucht keine DB und keine Secrets (B25 Session 10), die laufende App bleibt online
$C build app

# Neustart nur der App; --wait wartet auf den Healthcheck (/api/health = Payload inkl.
# prodMigrations + Postgres bereit). Caddy überbrückt die ~10 s (lb_try_duration).
$C up -d --no-deps --wait --wait-timeout 180 app

# Verifizieren
for p in / /arbeiten /journal /api/health; do curl -fsS -o /dev/null -w "%{http_code} $p\n" "https://kilia-siebert.de$p"; done
$C logs --tail=40 app
```

**Rollback:** `docker tag portfolio-app:rollback-$TS portfolio-app:latest && $C up -d --no-deps --wait app`.
Nur wenn die neue Version eine Migration mit Contract-Schritt (Drop/Umbenennung) hatte, zusätzlich den
Dump zurückspielen (`pg_restore --clean`, vorher App stoppen). Ab Session 11 macht das `scripts/deploy.sh`.

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
  Anschließend committen. Expand/Contract beachten (Session 11 / `CLAUDE.md`), damit die
  vorige App-Version beim Rollback weiterläuft.

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
  einen Fix-Branch + PR** — auch wenn der manuelle Deploy selbst lokal auf hillerhome ohne
  PR läuft. Sonst bricht der nächste automatische Deploy (Runner-Pipeline) am selben
  Problem erneut.
