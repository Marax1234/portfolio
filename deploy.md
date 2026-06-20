# Deployment-Guide — Portfolio Kilian Siebert auf hillerhome + Oracle VPS

> **Zielsetzung:** Das komplette Portfolio (Next.js + Payload + PostgreSQL + MinIO + Umami)
> läuft containerisiert auf deinem Mini-PC `hillerhome` im Heimnetz. Der Oracle VPS dient
> als öffentlicher Einstiegspunkt (feste IPv4 + HTTPS) und reicht den Traffic über den
> bereits bestehenden WireGuard-Tunnel an hillerhome durch. Deployment per Git-Pipeline.
>
> **Kein Hetzner.** Stattdessen: vorhandene Infrastruktur aus `SYSTEM.md`.

---

## 0. Architektur dieses Setups

```
Internet (Besucher)
        │ 443/80
        ▼
Oracle VPS — 130.61.109.245 (feste öffentliche IPv4)
  ┌──────────────────────────────────────────────┐
  │  Caddy (Reverse Proxy + Auto-HTTPS)           │
  │  kilia-siebert.de   → 10.10.0.2:3000         │
  │  cdn.kilia-siebert.de → 10.10.0.2:9000       │
  │  umami.kilia-siebert.de → 10.10.0.2:3001     │
  └──────────────────────┬───────────────────────┘
                         │ WireGuard-Tunnel (10.10.0.0/24)
                         ▼
hillerhome — 192.168.2.112 / WG 10.10.0.2 (Heimnetz)
  ┌──────────────────────────────────────────────┐
  │  Docker-Stack (intern, NICHT öffentlich)      │
  │   app:3000  ·  postgres:5432  ·  minio:9000   │
  │   umami:3001                                  │
  │  + bestehender Portainer-Container            │
  └──────────────────────────────────────────────┘
```

**Warum diese Aufteilung?**

- hillerhome hat **kein öffentliches IPv4** (DS-Lite). Let's Encrypt braucht aber einen
  öffentlich erreichbaren Punkt → der VPS übernimmt TLS-Terminierung.
- Der App-Stack bleibt komplett im Heimnetz → mehr Kontrolle, keine Cloud-Speicherkosten.
- Der Tunnel besteht schon (`wg0`, hillerhome=`10.10.0.2`, VPS=`10.10.0.1`).
- **Kein CDN nötig** für den Start — MinIO wird direkt über den VPS/Caddy ausgeliefert.
  (Später bei Bedarf Bunny.net/Cloudflare davor — siehe §10.)

---

## 0.1 Status (Stand: 2026-06-20) — was auf hillerhome bereits erledigt ist

Dieser Abschnitt hält fest, was beim tatsächlichen Durchführen schon umgesetzt wurde,
inkl. Abweichungen vom ursprünglichen Plan, die sich erst beim Ausführen gezeigt haben.
Die betroffenen §-Abschnitte unten sind entsprechend ergänzt.

- **§1–§3 erledigt.** Docker 29.6, Compose v5.1.4, WireGuard-Handshake aktuell,
  `ip_forward` persistent gesetzt, Repo liegt unter `/opt/portfolio`. Port-Check: keine
  Kollision mit dem laufenden Portainer (8000/9443) oder sonstigen Diensten.
- **§4 `docker-compose.prod.yml` erstellt** — inkl. der schon im Doc vermerkten Korrekturen
  (Umami intern Port 3000, `UMAMI_DB_PASSWORD` an `postgres`). Zusätzlich `app.build.args`
  für alle `NEXT_PUBLIC_*`-Werte und `app.build.network: host` — siehe §7.1/§7.3, neu.
- **§5 `init-db/01-umami.sh` erstellt**, wie im Doc beschrieben.
- **§6 `.env.prod` erstellt und ausgefüllt.** Secrets per `openssl rand` generiert.
  E-Mail läuft über Gmail-SMTP (App-Passwort) statt Resend — `EMAIL_FROM` bewusst auf die
  Gmail-Adresse gesetzt, da Gmails SMTP-Relay fremde Absenderdomains sonst verwirft/ablehnt.
  **Wichtig gefunden:** `.env.prod` fehlte in `.gitignore` (nur `.env.production` war
  erfasst, nicht `.env.prod`) — ergänzt, bevor Secrets committed werden konnten.
- **§7 Dockerfile + `next.config.ts` erstellt**, `output: "standalone"` ergänzt — plus drei
  Erweiterungen, die sich erst beim echten Build gezeigt haben, siehe §7.1–§7.3.
- **Host-Fix (neu, §14.7): Docker-Container hatten keinen Internetzugang.** `iptables: false`
  im Docker-Daemon (vermutlich gegen das UFW-Bypass-Problem gesetzt) deaktiviert auch
  Dockers NAT/Forwarding fürs Bridge-Netz — `pnpm install` im Build scheiterte an DNS.
  Gelöst per dauerhaftem, eng begrenztem systemd-Service statt `iptables: true` zu setzen.
- **Repo-Fix: `pnpm-workspace.yaml` hatte kein `packages:`-Feld.** Das ließ jede
  `corepack pnpm`-Operation (sogar `pnpm --version`) mit `ERROR packages field missing or
  empty` fehlschlagen. Ergänzt um `packages: ["."]`.
- **Repo-Fix (neu, §7.2): Payload-Migrations fehlten komplett.** `/arbeiten/[slug]` ruft
  per `generateStaticParams` schon beim `next build` Payload/Postgres auf — ohne Migrations
  (nur Dev-Push, der in production nicht greift) schlug der Build mit `relation "projects"
  does not exist` fehl. Erste Migration erzeugt, `prodMigrations` verdrahtet, `payload
  migrate` läuft jetzt als Dockerfile-Schritt vor `next build`.
- **Build erfolgreich** (`portfolio-app:latest`, alle 17 Routen generiert).
- **§8 erledigt.** Stack komplett hochgefahren (Postgres/MinIO/App/Umami), MinIO-Bucket
  `portfolio-media` angelegt + public-download, DB-Seed gelaufen (Admin-User + Demo-Inhalte).
  Zwei neue Repo-Fixes dabei gefunden, siehe §7.4 (Seed läuft nicht per `exec app`, Runner
  hat kein pnpm/src) und §7.5 (`/admin` crashte mit `ERR_DLOPEN_FAILED` — sharp/libvips,
  zwei unabhängige Ursachen: flaky optional-dependency-Fetch + Next.js-Tracing-Lücke für
  `output: standalone`). Lokal über `10.10.0.2:3000` verifiziert: `/`, `/admin` (inkl.
  Login), `/arbeiten`, `/arbeiten/[slug]`, `/journal`, `/kontakt`, `/sitemap.xml`,
  `/robots.txt` — alle 200.

- **§9 begonnen — Caddy auf dem Oracle VPS.** SSH-Zugriff eingerichtet (hillerhome-Pubkey in
  `~/.ssh/authorized_keys` von `ubuntu@10.10.0.1` ergänzt). Drei Dinge abwichen vom Plan:
  - **VPS ist ARM64** (Oracle Always-Free, Ampere/Neoverse-N1, Ubuntu 24.04.4 „noble"), nicht
    x86 — relevant nur fürs Caddy-Image (`caddy:2-alpine` ist multi-arch, kein Problem).
  - **Docker war nicht vorinstalliert.** Per offiziellem apt-Repo nachinstalliert
    (`docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin`,
    `docker-compose-plugin` → Compose v5.1.4), `ubuntu`-User zur `docker`-Gruppe ergänzt.
    Dabei ein **Host-Fix** gefunden: ein seit über einer Woche (10. Juni) hängender
    `apt.systemd.daily`-Prozess hielt den dpkg/apt-Lock — musste manuell gekillt werden,
    bevor `apt install` lief (mit Nutzer-Rückfrage vorher, da Prozess-Kill auf Produktiv-VPS).
  - **nginx lief schon** (Default-Config, Port 80, kein Proxy konfiguriert) — gestoppt und
    deaktiviert (`systemctl disable nginx`), damit Caddy 80/443 frei bekommt.
  - `/opt/caddy/docker-compose.yml` + `/opt/caddy/Caddyfile.prod` liegen wie in §9.2
    geplant bereit (`network_mode: host`, da Caddy die Tunnel-IP `10.10.0.2` erreichen muss).
  - **Blocker gefunden: `kilia-siebert.de` ist noch nicht registriert** (DENIC-Whois:
    `Status: free`). Ohne Domain kann Let's Encrypt keine Zertifikate ausstellen — §9.1/§9.4
    stehen deshalb noch aus. Um den restlichen Pfad trotzdem zu verifizieren, läuft aktuell
    eine **temporäre Test-Config** (`/opt/caddy/Caddyfile`, kein TLS, einfacher `:80`-Block
    mit `host`-Matchern statt Domain-Blöcken) — die echte Config liegt unangetastet in
    `Caddyfile.prod` und muss nach Domain-Registrierung nur zurückbenannt werden
    (`mv Caddyfile.prod Caddyfile && docker compose up -d --force-recreate`).
  - **Verifiziert (mit Test-Config), Ende-zu-Ende über den Tunnel:** App (`10.10.0.2:3000`)
    und Umami (`10.10.0.2:3001`) antworten mit 200, MinIO (`10.10.0.2:9000`) mit 403
    (erwartet — Root-Pfad ohne Bucket/Objekt, beweist aber Erreichbarkeit). Getestet sowohl
    von der VPS selbst (`curl -H "Host: ..." http://localhost/`) als auch **von außen gegen
    die öffentliche IP** (`curl -H "Host: ..." http://130.61.109.245/`) — letzteres bestätigt
    nebenbei, dass die Oracle-Security-List/NSG **und** die VPS-UFW Port 80 bereits korrekt
    aus `0.0.0.0/0` freigeben (§13-Punkt war als offen markiert, ist jetzt verifiziert erledigt
    für Port 80; 443 separat in UFW bestätigt offen, NSG dafür aber noch nicht live getestet,
    da kein TLS-Dienst auf 443 lauscht, solange die Domain fehlt).

- **Domain-Verwechslung gefunden und korrigiert (2026-06-20).** Die tatsächlich registrierte
  Domain ist `kilia-siebert.de` (ohne „n" — DENIC-Whois: `Status: connect`, Nameserver schon
  auf `ui-dns.*` gesetzt). Überall im Repo (Doku, `.env.prod`, App-Source, Dockerfile-Build-Args,
  VPS-Caddyfiles) stand bis dahin `kilian-siebert.de` (Tippfehler-Verwechslung mit dem Namen
  „Kilian Siebert", war zu dem Zeitpunkt noch nicht registriert). Per Rückfrage beim Nutzer
  bestätigt: `kilia-siebert.de` ist die korrekte, gewollte Domain — global ersetzt.

- **§9 abgeschlossen.** DNS A-Records (`@`, `cdn`, `umami` → `130.61.109.245`) waren beim Domain-
  Check bereits gesetzt (kein manueller Schritt mehr nötig). Auf dem VPS: Domain in
  `Caddyfile.prod` korrigiert, als aktive `Caddyfile` eingesetzt (vorherige Test-Config als
  `Caddyfile.testbak` aufgehoben), Container neu gestartet. Let's-Encrypt-Zertifikate für alle
  drei Subdomains erfolgreich ausgestellt (tls-alpn-01-Challenge). App mit korrigierten
  `NEXT_PUBLIC_*`-Build-Args neu gebaut. Verifiziert über HTTPS von außen: `/`, `/admin`,
  `/arbeiten`, `/journal`, `/kontakt`, `/sitemap.xml`, `/robots.txt` sowie Umami — alle 200.

- **§10 abgeschlossen, mit Repo-Fix.** Beim Versuch, das Umami-API-Token einzurichten: Umami
  3.1.0 self-hosted hat **kein** „API Keys"-Menü unter Settings (nur Application, Preferences,
  Account, Profile, Teams) — per Context7/`docs.umami.is` verifiziert, dass API-Keys ein
  **Umami-Cloud-only**-Feature sind (`docs.umami.is/docs/cloud/api-key`), keine Versionsfrage.
  Self-hosted authentifiziert ausschließlich per Login (`POST /api/auth/login` mit
  Username/Passwort → JWT). Da die App (`src/lib/umami.ts`) bis dahin ein statisches
  `UMAMI_API_TOKEN` erwartete (Risiko: unbemerktes Ablaufen ohne dokumentierte Lebensdauer),
  auf Wunsch des Nutzers umgestellt auf **Login-on-Demand**: die App loggt sich serverseitig
  selbst ein, cacht das JWT für 1 h, und retry't einmal bei `401`. Betroffene Stellen
  (`docker-compose.prod.yml`, `.env.prod`/`.env.example`, `docs/deployment.md`,
  `StatsDashboard.tsx`-Hinweistext) von `UMAMI_API_TOKEN` auf `UMAMI_ADMIN_USERNAME` /
  `UMAMI_ADMIN_PASSWORD` umgestellt. Website `KilianPortfolio` (Domain `kilia-siebert.de`)
  angelegt, Website-ID + Admin-Credentials in `.env.prod` eingetragen, App neu gebaut —
  Tracker-Script liefert die korrekte Website-ID aus, Stats-Dashboard im Admin nutzt die
  neuen Credentials.

**Offen / nächster Schritt:** §11 (Git-Pipeline / self-hosted Runner), §12 (Backup-Cron).
Danach die übrigen Go-Live-Punkte: Kontaktformular-Test (Submission → E-Mail), Impressum/
Datenschutz mit echtem Text, OG-Bild, Beispiel-Video/HLS-Test.

---

## 1. Voraussetzungen prüfen (auf hillerhome)

Vieles ist laut `SYSTEM.md` schon da. Kurz verifizieren:

```bash
# Docker & Compose vorhanden?
docker --version            # erwartet: 29.5.0
docker compose version      # Compose v2 muss vorhanden sein

# Tunnel aktiv?
sudo wg show                # latest handshake sollte aktuell sein

# Vom hillerhome aus den VPS über den Tunnel erreichen?
ping -c 3 10.10.0.1
```

Falls `docker compose` (das v2-Plugin) fehlt:

```bash
sudo apt update && sudo apt install -y docker-compose-plugin
```

---

## 2. Offenes TODO zuerst erledigen: ip_forward dauerhaft

Laut `SYSTEM.md` schlägt der PostUp-Befehl für `ip_forward` fehl. Das brauchen wir,
damit der Tunnel-Traffic sauber geroutet wird. Jetzt dauerhaft setzen:

```bash
echo 'net.ipv4.ip_forward=1' | sudo tee /etc/sysctl.d/99-wireguard.conf
sudo sysctl -p /etc/sysctl.d/99-wireguard.conf
```

---

## 3. Projektverzeichnis & Repo auf hillerhome

```bash
sudo mkdir -p /opt/portfolio
sudo chown $USER:$USER /opt/portfolio
git clone <repo-url> /opt/portfolio
cd /opt/portfolio
```

---

## 4. Docker Compose für hillerhome (`docker-compose.prod.yml`)

> **Unterschied zur Hetzner-Vorlage:** Kein Caddy hier drin (das macht der VPS).
> Die Ports werden **nur an die WireGuard-IP `10.10.0.2`** gebunden — niemals an
> `0.0.0.0`, damit nichts versehentlich ins Heimnetz/Internet leakt (vgl. das
> UFW-Docker-Problem in `SYSTEM.md`).

```yaml
# docker-compose.prod.yml
# App + PostgreSQL + MinIO + Umami — läuft auf hillerhome
# Ports gebunden an WireGuard-IP 10.10.0.2 (nur über Tunnel erreichbar)

services:

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URI: postgres://portfolio:${POSTGRES_PASSWORD}@postgres:5432/portfolio
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      NEXT_PUBLIC_SERVER_URL: https://${DOMAIN}
      S3_BUCKET: ${S3_BUCKET}
      S3_REGION: us-east-1
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY_ID: ${MINIO_ACCESS_KEY}
      S3_SECRET_ACCESS_KEY: ${MINIO_SECRET_KEY}
      S3_FORCE_PATH_STYLE: "true"
      NEXT_PUBLIC_S3_PUBLIC_URL: https://cdn.${DOMAIN}
      FFMPEG_DOCKER_IMAGE: jrottenberg/ffmpeg:6.1-ubuntu2204
      EMAIL_FROM: ${EMAIL_FROM}
      EMAIL_FROM_NAME: ${EMAIL_FROM_NAME}
      CONTACT_NOTIFY_TO: ${CONTACT_NOTIFY_TO}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      NEXT_PUBLIC_UMAMI_SRC: https://umami.${DOMAIN}/script.js
      NEXT_PUBLIC_UMAMI_WEBSITE_ID: ${UMAMI_WEBSITE_ID}
      UMAMI_API_URL: http://umami:3001
      UMAMI_ADMIN_USERNAME: ${UMAMI_ADMIN_USERNAME}
      UMAMI_ADMIN_PASSWORD: ${UMAMI_ADMIN_PASSWORD}
      UMAMI_WEBSITE_ID: ${UMAMI_WEBSITE_ID}
    ports:
      - "10.10.0.2:3000:3000"   # nur über WireGuard-Tunnel
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_started
    networks:
      - internal

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: portfolio
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d:ro   # legt umami-DB mit an (siehe §5)
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U portfolio"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal
    # KEIN ports-Block — DB bleibt rein intern

  minio:
    image: minio/minio:latest
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio-data:/data
    ports:
      - "10.10.0.2:9000:9000"   # nur über Tunnel — vom VPS-Caddy als cdn.* gefronted
    networks:
      - internal

  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://umami:${UMAMI_DB_PASSWORD}@postgres:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${UMAMI_APP_SECRET}
    ports:
      - "10.10.0.2:3001:3000"   # Umami lauscht im Container auf 3000
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - internal

volumes:
  pgdata:
  minio-data:

networks:
  internal:
    driver: bridge
```

> **Wichtig zu Umami-Port:** Das Umami-Image lauscht intern auf Port **3000**.
> Damit es nicht mit der App kollidiert, mappen wir außen auf `3001`
> (`10.10.0.2:3001:3000`). Innerhalb des Docker-Netzes erreicht die App Umami
> als `http://umami:3000` — die `UMAMI_API_URL` oben sollte daher auf
> `http://umami:3000` zeigen (nicht 3001). Korrigiere die Zeile entsprechend:
> `UMAMI_API_URL: http://umami:3000`.

---

## 5. PostgreSQL: zweite DB für Umami anlegen

Umami und die App teilen sich denselben Postgres-Container, brauchen aber getrennte
Datenbanken. Lege eine Init-Datei an:

```bash
mkdir -p /opt/portfolio/init-db
cat > /opt/portfolio/init-db/01-umami.sh <<'EOF'
#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-SQL
    CREATE USER umami WITH PASSWORD '${UMAMI_DB_PASSWORD}';
    CREATE DATABASE umami OWNER umami;
SQL
EOF
chmod +x /opt/portfolio/init-db/01-umami.sh
```

> Damit `${UMAMI_DB_PASSWORD}` im Script ankommt, muss die Variable im Postgres-Service
> als Environment gesetzt sein. Ergänze im `postgres`-Block unter `environment:`:
> `UMAMI_DB_PASSWORD: ${UMAMI_DB_PASSWORD}`
>
> **Hinweis:** Das Init-Script läuft nur beim **allerersten** Start (leeres Volume).
> Falls die DB schon existiert, die Umami-DB manuell anlegen:
> ```bash
> docker compose -f docker-compose.prod.yml exec postgres \
>   psql -U portfolio -c "CREATE USER umami WITH PASSWORD 'DEIN_PW';"
> docker compose -f docker-compose.prod.yml exec postgres \
>   psql -U portfolio -c "CREATE DATABASE umami OWNER umami;"
> ```

---

## 6. Umgebungsvariablen (`.env.prod`)

```bash
cd /opt/portfolio
cp .env.example .env.prod   # falls vorhanden, sonst neu anlegen
nano .env.prod
```

Inhalt:

```bash
# === Domain ===
DOMAIN=kilia-siebert.de
NEXT_PUBLIC_SERVER_URL=https://kilia-siebert.de

# === Kern ===
PAYLOAD_SECRET=          # openssl rand -hex 32

# === Datenbank ===
POSTGRES_PASSWORD=       # openssl rand -hex 24

# === Object Storage (MinIO) ===
MINIO_ACCESS_KEY=        # openssl rand -hex 12
MINIO_SECRET_KEY=        # openssl rand -hex 24
S3_BUCKET=portfolio-media
NEXT_PUBLIC_S3_PUBLIC_URL=https://cdn.kilia-siebert.de

# === Video-Pipeline ===
FFMPEG_DOCKER_IMAGE=jrottenberg/ffmpeg:6.1-ubuntu2204

# === E-Mail (z. B. Resend) ===
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=               # Resend-API-Key
EMAIL_FROM=noreply@kilia-siebert.de
EMAIL_FROM_NAME=Kilian Siebert Portfolio
CONTACT_NOTIFY_TO=kilian@kilia-siebert.de

# === Umami ===
UMAMI_DB_PASSWORD=       # openssl rand -hex 24
UMAMI_APP_SECRET=        # openssl rand -hex 32
UMAMI_WEBSITE_ID=        # erst nach Umami-Setup (§9) eintragen
UMAMI_ADMIN_USERNAME=    # erst nach Umami-Setup (§9) eintragen — kein API-Key bei
UMAMI_ADMIN_PASSWORD=    # self-hosted Umami, siehe §10 und src/lib/umami.ts
NEXT_PUBLIC_UMAMI_SRC=https://umami.kilia-siebert.de/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=

# === Seed (nur initial) ===
SEED_ADMIN_EMAIL=kilian@kilia-siebert.de
SEED_ADMIN_PASSWORD=     # sicheres Passwort
```

Schnell alle Secrets generieren:

```bash
for v in PAYLOAD_SECRET UMAMI_APP_SECRET; do echo "$v=$(openssl rand -hex 32)"; done
for v in POSTGRES_PASSWORD MINIO_SECRET_KEY UMAMI_DB_PASSWORD; do echo "$v=$(openssl rand -hex 24)"; done
echo "MINIO_ACCESS_KEY=$(openssl rand -hex 12)"
```

---

## 7. Dockerfile & Next.js Standalone

Das tatsächlich verwendete `Dockerfile` weicht vom ursprünglichen Plan ab — drei Probleme
sind erst beim echten Build aufgetaucht (§7.1–§7.3). Aktueller Stand:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@9 --activate && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
# NEXT_PUBLIC_*-Werte werden beim Build in den Client-Bundle eingebacken
# (Compose-`environment:` wirkt nur zur Laufzeit) — daher hier als Build-Args.
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_S3_PUBLIC_URL
ARG NEXT_PUBLIC_UMAMI_SRC
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_S3_PUBLIC_URL=${NEXT_PUBLIC_S3_PUBLIC_URL}
ENV NEXT_PUBLIC_UMAMI_SRC=${NEXT_PUBLIC_UMAMI_SRC}
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=${NEXT_PUBLIC_UMAMI_WEBSITE_ID}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@9 --activate
# Migrations müssen vor dem Build laufen: /arbeiten/[slug] fragt Payload (→ Postgres)
# schon zur Build-Zeit per generateStaticParams ab (siehe §7.2).
# .env.production.local liegt im Build-Kontext (siehe §7.3 / scripts/gen-build-env.sh).
RUN set -a && . ./.env.production.local && set +a && pnpm payload migrate
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

In `next.config.ts` sicherstellen:

```ts
const nextConfig = {
  output: "standalone",
  // ...
};
```

**Repo-Voraussetzung:** `pnpm-workspace.yaml` braucht ein `packages:`-Feld (z. B.
`packages: ["."]`), sonst scheitert jede `corepack`-pnpm-Operation (auch `pnpm --version`)
mit `ERROR packages field missing or empty` — betrifft auch lokale Dev-Installs, nicht nur
Docker.

### 7.1 Build-Args für `NEXT_PUBLIC_*` (in `docker-compose.prod.yml`)

```yaml
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SERVER_URL: https://${DOMAIN}
        NEXT_PUBLIC_S3_PUBLIC_URL: https://cdn.${DOMAIN}
        NEXT_PUBLIC_UMAMI_SRC: https://umami.${DOMAIN}/script.js
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: ${UMAMI_WEBSITE_ID}
```

Ohne das würden die `NEXT_PUBLIC_*`-Werte mit den `localhost`-Defaults aus `next.config.ts`
gebaut, weil Compose-`environment:` nur zur Laufzeit wirkt, nicht beim Build.

### 7.2 Payload-Migrations (Repo hatte keine)

`/arbeiten/[slug]` (`src/app/(frontend)/arbeiten/[slug]/page.tsx`) nutzt
`generateStaticParams` — das läuft schon beim `next build`, nicht erst zur Laufzeit, und
ruft dafür Payload (→ Postgres lokal) ab. Payloads automatischer Schema-Push ist laut
offizieller Doku **nur in development aktiv**; in production zählen ausschließlich
Migrations. Ohne sie schlägt der Build mit `relation "projects" does not exist` fehl.

Einmalig die erste Migration erzeugen (braucht eine erreichbare, leere Postgres-Instanz —
am einfachsten gegen die schon laufenden hillerhome-Container):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d postgres minio
./scripts/gen-build-env.sh   # siehe §7.3
docker run --rm -v /opt/portfolio:/app -w /app --network host \
  --env-file .env.production.local node:20-alpine sh -c "
    corepack enable && corepack prepare pnpm@9 --activate &&
    pnpm install --frozen-lockfile --prod=false &&
    pnpm payload migrate:create initial
  "
sudo chown -R $USER:$USER src/migrations
```

In `src/payload.config.ts`:

```ts
import { migrations } from "./migrations";
// ...
db: postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URI },
  push: false,              // production: nur Migrations, kein Auto-Push
  prodMigrations: migrations,
}),
```

Die erzeugten `src/migrations/*.ts` + `index.ts` werden committed. Künftige
Schema-Änderungen: erneut `pnpm payload migrate:create <name>` lokal/gegen Dev-DB laufen
lassen, committen — der Dockerfile-Schritt `pnpm payload migrate` wendet sie beim nächsten
Build automatisch an.

### 7.3 Build-Zeit-Environment & Netzwerk (`network: host`)

Zwei Probleme zusammen: (1) der Build braucht `PAYLOAD_SECRET`, `DATABASE_URI`, `S3_*` etc.
zur Build-Zeit (für Migrations + SSG), nicht nur zur Laufzeit. (2) BuildKit unterstützt für
`RUN`-Instruktionen während des Builds **keine benutzerdefinierten Compose-Netzwerke** —
nur `host`, `none` oder `default`. Der App-Build kann das eigene `internal`-Netzwerk aus
§4 also nicht nutzen, um `postgres`/`minio` per Service-Name zu erreichen.

Lösung: `network: host` fürs Build (siehe §7.1-Snippet, `app.build.network: host` in
`docker-compose.prod.yml`) + ein generiertes `.env.production.local`, das Postgres/MinIO
über ihre **tatsächlichen Container-IPs** statt Service-Namen anspricht (im Host-Network-
Modus gibt es keine Docker-DNS-Auflösung für Service-Namen).

`scripts/gen-build-env.sh` automatisiert das (liest `.env.prod`, ermittelt die aktuellen
Container-IPs per `docker inspect`, schreibt `.env.production.local`):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d postgres minio
./scripts/gen-build-env.sh
docker compose --env-file .env.prod -f docker-compose.prod.yml build app
```

**Wichtig:** `--env-file .env.prod` muss bei `docker compose` **vor** `-f` stehen, sonst
werden alle `${VAR}`-Platzhalter in der Compose-Datei stillschweigend leer interpoliert
(keine Fehlermeldung!). Immer mit `docker compose --env-file .env.prod -f
docker-compose.prod.yml config` gegenprüfen, wenn unsicher.

**Bekannte Einschränkung:** Die Container-IPs in `.env.production.local` sind nur bis zum
nächsten `docker compose down`/`up` der Container gültig (Docker vergibt IPs nicht
garantiert stabil neu). Vor jedem `build app` daher `./scripts/gen-build-env.sh` erneut
laufen lassen, solange Postgres/MinIO schon stehen.

`.env.production.local` liegt im Build-Kontext (`COPY . .` im Builder-Stage), landet aber
**nicht** im finalen Image — die `runner`-Stage kopiert nur `.next/standalone`,
`.next/static` und `public`. Datei ist über `.env.*.local` in `.gitignore` erfasst.

### 7.4 DB-Seed läuft nicht über `exec app` (Repo-Fix, neu)

`docker compose exec app pnpm payload run src/seed/index.ts` aus §8 schlägt fehl
(`exec: "pnpm": executable file not found in $PATH`) — der `runner`-Stage enthält **nur**
`.next/standalone`, `.next/static` und `public`, kein `pnpm`, kein `src/`, kein vollständiges
`node_modules` mit der Payload-CLI. Gleiche Ursache wie bei den Migrations in §7.2: der
Seed-Schritt braucht den vollen Quellbaum, nicht den schlanken Runtime-Build.

Lösung: Seed wie die Migrations-Erzeugung über einen temporären Container mit vollem
Quellbaum laufen lassen (Postgres/MinIO müssen schon laufen, `gen-build-env.sh` muss
gelaufen sein, `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` müssen zusätzlich in
`.env.production.local` stehen — `gen-build-env.sh` schreibt sie aktuell nicht automatisch,
nach dem Lauf von Hand ergänzen oder das Skript erweitern):

```bash
docker run --rm -v /opt/portfolio:/app -w /app --network host \
  --env-file .env.production.local node:20-alpine sh -c "
    corepack enable && corepack prepare pnpm@9 --activate &&
    pnpm install --frozen-lockfile --prod=false &&
    pnpm payload run src/seed/index.ts
  "
```

Ist idempotent (siehe Kommentar in `src/seed/index.ts`) — mehrfaches Ausführen schadet nicht.

### 7.5 `/admin` crasht mit `ERR_DLOPEN_FAILED` (sharp/libvips) — Repo-Fix, neu

Nach Stack-Start liefert `/admin` HTTP 500, App-Logs zeigen:

```
⨯ Error: Failed to load external module sharp-...: Error: Could not load the "sharp" module
using the linuxmusl-x64 runtime
ERR_DLOPEN_FAILED: Error loading shared library libvips-cpp.so.8.18.3: No such file or directory
```

Zwei voneinander unabhängige Ursachen, beide gefixt:

1. **Flaky Optional-Dependency-Fetch beim `pnpm install` in der `deps`-Stage.** Das
   `@img/sharp-libvips-linuxmusl-x64@1.3.0`-Paket (für `sharp@0.35.1`, von Payload
   benötigt) landete im Image gelegentlich ohne seine eigentliche `.so`-Datei (nur
   `package.json`/`versions.json`/`index.js` vorhanden) — verifiziert per `npm pack`, dass
   das Paket auf der Registry vollständig ist; es ist also ein Fetch-Problem, kein
   Registry-Problem. Das ältere, von Next.js intern genutzte `sharp@0.34.5`
   (`@img/sharp-libvips-linuxmusl-x64@1.2.4`) war davon nie betroffen.

   Fix in `Dockerfile`, `deps`-Stage: nach dem Install per `node -e "require('sharp')"`
   verifizieren, dass das Modul lädt, und bei Fehlschlag bis zu dreimal mit
   `pnpm install --frozen-lockfile --force` neu holen, bevor der Build fortfährt:

   ```dockerfile
   RUN for i in 1 2 3; do \
         pnpm install --frozen-lockfile --force && node -e "require('sharp')" && exit 0; \
         echo "sharp failed to load, retrying ($i/3)"; \
       done; \
       node -e "require('sharp')"
   ```

   Damit bricht der Build hart ab, statt ein kaputtes Image zu produzieren, falls auch der
   dritte Versuch scheitert.

2. **Next.js' `output: standalone`-Tracing lässt sharps Binary weg, selbst wenn es in der
   `builder`-Stage korrekt installiert ist.** sharp lädt sein Plattform-Binary über einen
   zur Laufzeit berechneten Pfad (abhängig von `process.platform`/`arch`/libc) — Next.js'
   statisches Datei-Tracing (`@vercel/nft`) für den `standalone`-Output erkennt solche
   dynamischen Requires nicht zuverlässig. Ergebnis: `.next/standalone/node_modules`
   enthält zwar `sharp` selbst, aber nicht zwingend dessen `@img/sharp-libvips-*`-Abhängigkeit
   mit der `.so`-Datei — unabhängig vom Fix in Punkt 1.

   Offizieller Workaround laut Next.js-Doku (`outputFileTracingIncludes`), in
   `next.config.ts` ergänzt:

   ```ts
   outputFileTracingIncludes: {
     "/*": [
       "node_modules/sharp/**/*",
       "node_modules/@img/**/*",
       "node_modules/.pnpm/@img+**/**/*",
       "node_modules/.pnpm/sharp@**/**/*",
     ],
   },
   ```

   Die letzten beiden Globs sind nötig, weil pnpm seine Pakete im `.pnpm`-Content-Store
   ablegt und nur per Symlink verknüpft — das einfache `node_modules/sharp/**/*` aus der
   Next.js-Doku (für npm/yarn ohne Content-Store) reicht hier nicht. Kostet ca. 250 MB
   zusätzliche Image-Größe (296 MB → 553 MB), aber für ein selbst gehostetes Portfolio
   unkritisch.

---

## 8. Stack starten & MinIO-Bucket anlegen

**Reihenfolge geändert gegenüber dem Originalplan** (§7.2/§7.3): Der App-Build braucht
Postgres + MinIO schon laufend (Migrations + Build-Zeit-SSG), daher kein einzelnes
`up -d --build` für den ganzen Stack mehr — Datenbank/Storage zuerst, dann bauen, dann
den Rest hochfahren:

```bash
cd /opt/portfolio

# 1. Postgres + MinIO zuerst (Build braucht sie als Migrations-/SSG-Ziel)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d postgres minio

# 2. Build-Zeit-Env generieren (Container-IPs, siehe §7.3) und App bauen
./scripts/gen-build-env.sh
docker compose --env-file .env.prod -f docker-compose.prod.yml build app

# 3. Restlichen Stack hochfahren (app, umami)
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d

# Logs beobachten
docker compose -f docker-compose.prod.yml logs -f app

# MinIO-Bucket einmalig anlegen
docker compose -f docker-compose.prod.yml exec minio \
  mc alias set local http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
docker compose -f docker-compose.prod.yml exec minio \
  mc mb --ignore-existing local/portfolio-media
docker compose -f docker-compose.prod.yml exec minio \
  mc anonymous set download local/portfolio-media

# Datenbank-Seed (Admin-User + Beispielinhalte) — NICHT per `exec app`, siehe §7.4:
# der Runner-Stage fehlen pnpm/src. Stattdessen per temporärem Container mit vollem
# Quellbaum (SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD müssen in .env.production.local stehen):
docker run --rm -v /opt/portfolio:/app -w /app --network host \
  --env-file .env.production.local node:20-alpine sh -c "
    corepack enable && corepack prepare pnpm@9 --activate &&
    pnpm install --frozen-lockfile --prod=false &&
    pnpm payload run src/seed/index.ts
  "
```

Test vom hillerhome aus (lokal, über die Tunnel-IP):

```bash
curl -I http://10.10.0.2:3000
```

---

## 9. Caddy auf dem Oracle VPS einrichten

Jetzt der Teil, der den Stack öffentlich macht. **Auf dem VPS** (per SSH dorthin):

```bash
ssh <user>@130.61.109.245
```

### 9.1 DNS-Records setzen

Bei deinem Domain-Anbieter für `kilia-siebert.de`:

| Typ | Name | Wert |
|---|---|---|
| A | `@` | `130.61.109.245` |
| A | `cdn` | `130.61.109.245` |
| A | `umami` | `130.61.109.245` |

### 9.2 Caddy als Container auf dem VPS

```bash
sudo mkdir -p /opt/caddy && cd /opt/caddy
```

`docker-compose.yml` auf dem VPS:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config

volumes:
  caddy-data:
  caddy-config:
```

`Caddyfile` auf dem VPS — proxyt über den Tunnel an hillerhome (`10.10.0.2`):

```
kilia-siebert.de {
    reverse_proxy 10.10.0.2:3000
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
}

cdn.kilia-siebert.de {
    reverse_proxy 10.10.0.2:9000
    encode gzip
}

umami.kilia-siebert.de {
    reverse_proxy 10.10.0.2:3001
}
```

> **Wichtig:** Caddy läuft hier mit Host-Netzwerkzugriff auf `10.10.0.2`. Da Caddy
> im Container läuft, muss der Container die Tunnel-IP erreichen. Am einfachsten:
> `network_mode: host` im Caddy-Service ergänzen, damit `10.10.0.2` direkt erreichbar
> ist. Dann den `ports`-Block weglassen (Host-Modus bindet direkt):
>
> ```yaml
>   caddy:
>     image: caddy:2-alpine
>     restart: unless-stopped
>     network_mode: host
>     volumes:
>       - ./Caddyfile:/etc/caddy/Caddyfile:ro
>       - caddy-data:/data
>       - caddy-config:/config
> ```

### 9.3 VPS-Firewall / Oracle Security List

Stelle sicher, dass auf dem VPS die Ports **80** und **443** offen sind — sowohl in
der Oracle-Cloud-Security-List (Ingress-Regeln) als auch in der lokalen Firewall
(`iptables`/`ufw`) des VPS. Port `51820/UDP` (WireGuard) ist laut `SYSTEM.md` bereits offen.

```bash
# Beispiel mit ufw auf dem VPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

> In der Oracle-Konsole zusätzlich die VCN-Security-List / NSG für 80+443 TCP Ingress
> aus `0.0.0.0/0` freigeben — das wird oft vergessen.

### 9.4 Caddy starten

```bash
cd /opt/caddy
docker compose up -d
docker compose logs -f caddy   # TLS-Zertifikat-Ausstellung beobachten
```

Caddy holt sich automatisch Let's-Encrypt-Zertifikate für alle drei Domains.

---

## 10. Umami fertig konfigurieren

1. `https://umami.kilia-siebert.de` aufrufen.
2. Login mit Default `admin` / `umami` → **sofort Passwort ändern**.
3. Website anlegen (Domain `kilia-siebert.de`).
4. **Website-ID** kopieren → in `.env.prod` als `UMAMI_WEBSITE_ID` und
   `NEXT_PUBLIC_UMAMI_WEBSITE_ID` eintragen.
5. **Kein API-Key-Menü** unter Settings — das ist eine Umami-Cloud-Funktion
   (docs.umami.is/docs/cloud/api-key), selbst gehostete Instanzen haben sie nicht.
   Stattdessen Username + das in Schritt 2 gesetzte Passwort in `.env.prod` als
   `UMAMI_ADMIN_USERNAME` / `UMAMI_ADMIN_PASSWORD` eintragen — `src/lib/umami.ts`
   loggt sich damit bei Bedarf selbst ein (POST `/api/auth/login`) und cacht das
   JWT für eine Stunde, statt ein statisches Token zu pflegen, das irgendwann
   unbemerkt abläuft.
6. App neu bauen (die `NEXT_PUBLIC_*`-Werte werden beim Build eingebacken, die
   `UMAMI_ADMIN_*`-Werte erst zur Laufzeit benötigt — Reihenfolge wie in §7.3/§8:
   Postgres/MinIO müssen laufen, `gen-build-env.sh` muss vorher laufen):

```bash
cd /opt/portfolio
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d postgres minio
./scripts/gen-build-env.sh
docker compose --env-file .env.prod -f docker-compose.prod.yml build app
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --no-deps app
```

---

## 11. Git-Pipeline (automatisches Deployment)

Damit ein `git push` automatisch auf hillerhome deployt. Da hillerhome kein öffentliches
IPv4 hat, nutzt der Runner den Pull-Ansatz über Tailscale oder einen self-hosted Runner.

### Variante A — Self-hosted GitHub-Actions-Runner auf hillerhome (empfohlen)

Der Runner läuft direkt auf hillerhome und braucht keinen eingehenden Zugriff.

```bash
# Auf hillerhome
sudo mkdir -p /opt/actions-runner && cd /opt/actions-runner
# Runner-Paket von GitHub holen (URL aus Repo → Settings → Actions → Runners → New)
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/<version>/actions-runner-linux-x64-<version>.tar.gz
tar xzf actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/<user>/<repo> --token <RUNNER_TOKEN>
sudo ./svc.sh install
sudo ./svc.sh start
```

Workflow `.github/workflows/deploy.yml` im Repo:

```yaml
name: Deploy to hillerhome

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: self-hosted          # läuft auf hillerhome
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Sync to /opt/portfolio
        run: |
          rsync -a --delete \
            --exclude='.git' --exclude='.env.prod' --exclude='init-db' \
            ./ /opt/portfolio/

      - name: Build & restart app
        working-directory: /opt/portfolio
        run: |
          docker compose --env-file .env.prod -f docker-compose.prod.yml up -d postgres minio
          ./scripts/gen-build-env.sh
          docker compose --env-file .env.prod -f docker-compose.prod.yml build app
          docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --no-deps app
```

> Vorteil: kein eingehender Port nötig, der Runner holt die Jobs aktiv von GitHub.
> `.env.prod` wird bewusst **nicht** überschrieben (steht nur lokal auf hillerhome).
>
> **Reihenfolge wichtig (§7.2/§7.3):** Postgres/MinIO müssen vor `build app` laufen
> (Payload-Migrations + SSG für `/arbeiten/[slug]` brauchen eine erreichbare DB schon beim
> `next build`), und `gen-build-env.sh` muss bei jedem Deploy neu laufen (Container-IPs
> sind nicht stabil über Neustarts hinweg). `--env-file` steht bei allen Befehlen bewusst
> **vor** `-f` — andere Reihenfolge interpoliert `${VAR}` stillschweigend leer.

### Variante B — Reiner Webhook-Pull (ohne GitHub Actions)

Einfaches Deploy-Script auf hillerhome, getriggert per Cron oder manuell:

```bash
cat > /opt/portfolio/deploy.sh <<'EOF'
#!/bin/bash
set -e
cd /opt/portfolio
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env.prod build app
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --no-deps app
echo "Deploy fertig: $(date)"
EOF
chmod +x /opt/portfolio/deploy.sh
```

---

## 12. Backups

```bash
# PostgreSQL-Dump (täglich per Cron)
docker compose -f /opt/portfolio/docker-compose.prod.yml exec -T postgres \
  pg_dump -U portfolio portfolio | gzip > /opt/backup/portfolio-$(date +%Y%m%d).sql.gz

# MinIO-Daten auf externen Speicher (z. B. via rsync — Tool ist laut SYSTEM.md vorhanden)
rsync -a /var/lib/docker/volumes/portfolio_minio-data/_data/ /pfad/zum/backup/media/
```

Cron-Eintrag (`crontab -e` auf hillerhome):

```
0 3 * * * /opt/portfolio/backup.sh
```

Retention: 7 Tage täglich, 4 Wochen wöchentlich.

---

## 13. Go-Live-Checkliste

- [x] `ip_forward` dauerhaft gesetzt (§2)
- [x] WireGuard-Tunnel aktiv, VPS ↔ hillerhome erreichbar
- [x] `docker-bridge-nat.service` enabled + aktiv (§14.7) — Container haben Internetzugang
- [x] `pnpm-workspace.yaml` hat `packages:`-Feld (§7)
- [x] Payload-Migrations committed, `payload migrate` läuft vor `next build` (§7.2)
- [x] App-Image gebaut (`portfolio-app:latest`, alle Routen generiert)
- [x] Stack auf hillerhome läuft, Ports nur an `10.10.0.2` gebunden
- [x] MinIO-Bucket `portfolio-media` angelegt, public-download gesetzt
- [x] DB-Seed gelaufen, Admin-User existiert (§7.4: Seed lief gegen Build-Image per
      temporärem Container, da der Runner kein pnpm/`src` enthält)
- [x] Domain registriert — tatsächlich `kilia-siebert.de` (ohne „n", siehe §0.1
      Domain-Verwechslung 2026-06-20), nicht das ursprünglich geplante `kilian-siebert.de`
- [x] DNS A-Records (`@`, `cdn`, `umami`) → `130.61.109.245` (waren beim Check bereits gesetzt)
- [x] Oracle Security List + VPS-Firewall: 80 + 443 offen, von außen gegen
      `130.61.109.245` und per ausgestelltem TLS-Zertifikat verifiziert
- [x] Caddy auf VPS läuft, TLS-Zertifikate ausgestellt (Let's Encrypt, alle drei Subdomains,
      kein Browser-Fehler)
- [x] `https://kilia-siebert.de` lädt die Website (verifiziert: `/`, `/admin`, `/arbeiten`,
      `/journal`, `/kontakt`, `/sitemap.xml`, `/robots.txt` alle 200 über HTTPS)
- [x] `/admin` erreichbar, Login funktioniert (Fix nötig, siehe §7.5)
- [x] Umami eingerichtet — Website `KilianPortfolio`, Website-ID + Admin-Credentials in
      `.env.prod` (kein API-Key bei self-hosted, siehe §10/§0.1 — Login-on-Demand statt
      statischem Token), App neu gebaut
- [ ] Kontaktformular → Submission in Payload → E-Mail kommt an
- [ ] Impressum + Datenschutz mit echtem Text gefüllt
- [ ] OG-Bild, Social-Links gesetzt
- [x] `/sitemap.xml` + `/robots.txt` (disallow `/admin`) korrekt
- [ ] Beispiel-Video transkodiert, HLS-Wiedergabe funktioniert
- [ ] Git-Pipeline getestet (Push → Auto-Deploy)
- [ ] Backup-Cron läuft

---

## 14. Wichtige Stolperfallen (spezifisch für dein Setup)

1. **Docker umgeht UFW.** Laut `SYSTEM.md` bindet Docker an `0.0.0.0` und ignoriert UFW.
   Deshalb sind oben **alle** Ports explizit an `10.10.0.2` gebunden. Niemals `3000:3000`
   ohne IP-Präfix schreiben — sonst wäre die App im ganzen Heimnetz offen.

2. **Caddy auf dem VPS muss `10.10.0.2` erreichen.** Im Container-Standardnetz ist die
   Tunnel-IP evtl. nicht direkt routbar → `network_mode: host` verwenden (§9.2).

3. **Umami-Port-Mapping.** Image lauscht intern auf 3000. Außen auf 3001 gemappt,
   intern aber als `http://umami:3000` ansprechen.

4. **PersistentKeepalive ist gesetzt** (25 s) — gut, der Tunnel bleibt bei DS-Lite stabil
   offen. Falls der VPS mal neu startet, baut hillerhome den Tunnel automatisch wieder auf.

5. **WireGuard-Latenz.** Aller öffentlicher Traffic läuft VPS → Tunnel → hillerhome.
   Für ein Portfolio völlig ausreichend, aber große Video-Dateien gehen denselben Weg.
   Wenn das zu langsam wird: erst dann ein echtes CDN (Bunny.net) vor `cdn.kilia-siebert.de`
   schalten (Pull-Zone auf die VPS-CDN-Domain).

6. **Portainer existiert schon.** Der neue Stack kann bequem auch über das bestehende
   Portainer (`https://192.168.2.112:9443`) überwacht werden — einfach als zusätzlichen
   Stack importieren statt rein per CLI.

7. **Docker-Container hatten keinen Internetzugang (gefunden beim ersten Build).**
   `/etc/docker/daemon.json` setzt `"iptables": false` — vermutlich genau gegen das oben
   in Punkt 1 beschriebene UFW-Bypass-Problem. Nebenwirkung: Docker legt dadurch auch
   **keine NAT/MASQUERADE-Regeln** für seine Bridge-Netzwerke an, Container hatten also
   gar kein Internet (DNS schlug mit `EAI_AGAIN` fehl, `pnpm install` im Build scheiterte).

   **Nicht** `iptables: true` setzen — das reaktiviert Dockers automatisches
   iptables-Management vollständig und damit wieder das UFW-Bypass-Problem. Stattdessen
   eine eng begrenzte, dauerhafte Ausnahme nur für Dockers Standard-Adresspool
   (`172.16.0.0/12` — kollidiert mit keinem anderen Interface auf diesem Host: LAN ist
   `192.168.2.0/24`, WireGuard `10.10.0.0/24`, Tailscale CGNAT `100.64.0.0/10`):

   - `/usr/local/sbin/docker-bridge-nat.sh` — idempotentes Skript, das per `iptables`
     genau drei Regeln setzt: `POSTROUTING`-MASQUERADE für `172.16.0.0/12` über `enp2s0`,
     plus zwei `FORWARD`-ACCEPT-Regeln (raus + ESTABLISHED/RELATED zurück).
   - `/etc/systemd/system/docker-bridge-nat.service` — `oneshot`-Service, `enabled`, läuft
     bei jedem Boot vor `docker.service`.

   Container-zu-Container-Traffic auf demselben Bridge-Netzwerk ist davon nicht betroffen
   (kein `br_netfilter`-Modul geladen auf diesem Host, solcher Traffic geht nicht durch die
   `FORWARD`-Chain) — die Regel betrifft ausschließlich Traffic, der tatsächlich Richtung
   Internet geroutet wird.

8. **BuildKit kann kein benutzerdefiniertes Compose-Netzwerk fürs Build nutzen** (siehe
   §7.3) — `network:` unter `build:` akzeptiert nur `host`/`none`/`default`. Für den
   App-Build (der wegen Migrations/SSG eine laufende Postgres/MinIO braucht) heißt das:
   `network: host` + Ansprache über Container-IPs statt Service-Namen.

9. **Payload pusht Schema nur in development**, nie in production — unabhängig davon, ob
   `push: true` explizit gesetzt wird (das hätte man vermuten können, stimmt aber laut
   Doku nicht: der Flag steuert nur, ob Push in *development* abschaltbar ist). Production
   braucht immer Migrations, siehe §7.2.