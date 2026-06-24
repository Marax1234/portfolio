# Manuelles Deployment — Kurzreferenz

Für den Fall, dass die GitHub-Actions-Pipeline (`deploy-production.yml`) nicht läuft oder
manuell nachgeholt werden muss. Vollständiger Hintergrund in `deploy.md` — hier nur der
eigentliche Befehlsablauf plus die Stolperfallen, die in der Praxis aufgetreten sind.

Voraussetzung: auf hillerhome, im Repo unter `/opt/portfolio`, Postgres/MinIO/Umami laufen
bereits dauerhaft (`restart: unless-stopped`) — nur die App wird neu gebaut/gestartet.

## Ablauf

```bash
cd /opt/portfolio
git pull origin main

# Postgres/MinIO müssen für Migrations + SSG erreichbar sein (sind es i.d.R. schon)
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d postgres minio

# Container-IPs ändern sich bei jedem Neustart — vor JEDEM Build neu generieren
./scripts/gen-build-env.sh

# Build (führt im Builder-Stage automatisch `payload migrate` + `next build` aus)
docker compose --env-file .env.prod -f docker-compose.prod.yml build app

# Neustart nur der App, Rest bleibt unberührt
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --no-deps app

# Verifizieren
curl -I http://10.10.0.2:3000
curl -I https://kilia-siebert.de
docker compose -f docker-compose.prod.yml logs --tail=40 app
```

## Stolperfallen

- **`--env-file` muss vor `-f` stehen.** Andere Reihenfolge interpoliert `${VAR}` in der
  Compose-Datei stillschweigend leer — keine Fehlermeldung, nur falsche/leere Env-Werte.

- **`gen-build-env.sh` ist nicht optional.** Postgres/MinIO bekommen bei jedem
  `docker compose up`/`down` potenziell neue Bridge-IPs. Das Skript schreibt sie nach
  `.env.production.local`, das der Build (Network-Mode `host`) braucht. Ohne frischen Lauf
  zeigt der Build auf eine tote IP → `payload migrate` schlägt mit Connection-Fehler fehl.

- **pnpm-Version im Dockerfile muss zur Lockfile-Konvention passen.** Das Repo nutzt
  `pnpm-workspace.yaml` für `overrides`/`allowBuilds` (pnpm-10-Feature). Pinnt das
  Dockerfile eine ältere pnpm-Version, ignoriert `pnpm install --frozen-lockfile` diese
  Workspace-Overrides stillschweigend und bricht mit
  `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` ab. Im Zweifel: dieselbe Major-Version wie in
  `.github/workflows/*.yml` (`pnpm/action-setup`, `version:`) verwenden.

- **Jede Payload-Schema-Änderung braucht eine committete Migration.** `push: false` in
  `payload.config.ts` heißt: ohne passende Migration unter `src/migrations/` bricht der
  Build bei der statischen Seitengenerierung mit `relation "..." does not exist` ab,
  sobald eine Seite die betroffenen Felder zur Build-Zeit abfragt (z. B. `/` via
  `SiteConfig`, `/arbeiten/[slug]` via `generateStaticParams`). Migration lokal/gegen die
  laufende Prod-DB erzeugen:
  ```bash
  docker run --rm -v /opt/portfolio:/app -w /app --network host \
    --env-file .env.production.local node:20-alpine sh -c "
      corepack enable && corepack prepare pnpm@10 --activate &&
      pnpm install --frozen-lockfile --prod=false &&
      pnpm payload migrate:create <name>
    "
  sudo chown -R $USER:$USER src/migrations
  ```
  Anschließend committen — sonst fehlt sie beim nächsten Build auf jedem anderen Host
  (und in der CI/Runner-Pipeline) wieder.

- **`sharp`/libvips-Fetch ist flaky.** Der Retry-Loop im Dockerfile (`deps`-Stage) fängt
  das normalerweise ab; falls der Build trotz 3 Versuchen an `require('sharp')` scheitert,
  einfach den Build erneut anstoßen (Registry-Problem, kein Code-Fehler).

- **DB-Seed/Migration-Erzeugung niemals per `docker compose exec app`.** Der `runner`-Stage
  enthält nur `.next/standalone` — kein `pnpm`, kein `src/`. Dafür immer den
  Temp-Container-Pfad mit vollem Quellbaum nutzen (siehe oben).

- **Alle Code-Fixes, die dabei nötig werden (Dockerfile, Migrations, Scripts), gehören auf
  einen Fix-Branch + PR** — auch wenn der manuelle Deploy selbst lokal auf hillerhome ohne
  PR läuft. Sonst bricht der nächste automatische Deploy (Runner-Pipeline) am selben
  Problem erneut.
