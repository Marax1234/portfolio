# Deployment-Dokumentation — Portfolio Kilian Siebert

**Zweck dieses Dokuments:** Vollständige Spezifikation für den produktiven Betrieb.
Betrifft ausschließlich das Deployment — Entwicklung und Sprint-Planung sind in
`sprintplan-portfolio-kilian-siebert.md` beschrieben.

**Versionsstand:** Next.js 16.2.9 · Payload 3.85.1 · PostgreSQL 16 · Node 20+

---

## 1. Systemanforderungen

### Server (Hetzner VPS)
- **Standort:** Deutschland (EU-Datenraum, DSGVO-konform, niedrige Latenz)
- **Mindestgröße:** CPX21 (3 vCPU, 4 GB RAM, 80 GB SSD) — für ein Portfolio lange ausreichend
- **Betriebssystem:** Ubuntu 22.04 LTS oder Debian 12
- **Software:** Docker Engine 24+ · Docker Compose v2 · Caddy 2 (als Container)

### Ports (öffentlich)
| Port | Dienst | Beschreibung |
|---|---|---|
| 80 | Caddy | HTTP → automatisch auf HTTPS umgeleitet |
| 443 | Caddy | HTTPS (automatisches TLS via Let's Encrypt) |

Alle anderen Ports (PostgreSQL, MinIO, App, Umami) sind **nur intern** — nie direkt nach außen.

### Domain
- Hauptdomain: `kilia-siebert.de` (oder gewählt)
- Caddy kümmert sich um DNS-Challenge und Zertifikat automatisch
- DNS-A-Record auf die VPS-IP setzen

---

## 2. Dienste-Übersicht

```
Internet
   │ 443/80
   ▼
┌─────────────────────────────────────────────────────────┐
│  Caddy (Reverse Proxy + Auto-HTTPS)                      │
│  → kilia-siebert.de  → App:3000                         │
└─────────────────────┬───────────────────────────────────┘
                      │ intern
          ┌───────────▼──────────────────┐
          │  Next.js + Payload (Port 3000)│
          │  - Website (öffentlich)       │
          │  - Admin-Panel /admin         │
          │  - REST-API /api              │
          └────┬────────────┬────────────┘
               │            │
     ┌─────────▼──┐   ┌─────▼──────┐   ┌───────────┐
     │ PostgreSQL  │   │ MinIO/S3   │   │  Umami    │
     │  Port 5432  │   │ Port 9000  │   │ Port 3001  │
     │  (intern)   │   │  (intern)  │   │ (intern)   │
     └─────────────┘   └─────┬──────┘   └───────────┘
                             │
                    ┌────────▼────────┐
                    │  CDN (Pull-Zone)│  ← Bunny.net / Cloudflare
                    │  Medien & Video │    (externer Dienst, cached)
                    └─────────────────┘
```

### Dienste im Detail

| Dienst | Image / Quelle | Rolle |
|---|---|---|
| **App** | gebaut aus Repo | Next.js + Payload in einem Prozess |
| **PostgreSQL 16** | `postgres:16-alpine` | Alle Inhalte, Sessions, Kontaktanfragen |
| **MinIO** | `minio/minio:latest` | Originaldateien, Bildvarianten, HLS-Segmente |
| **Umami** | `ghcr.io/umami-software/umami:postgresql-latest` | Cookieless Web-Analytics |
| **Caddy** | `caddy:2-alpine` | Reverse Proxy, Auto-HTTPS, Security-Header |

---

## 3. Produktives Docker Compose

Die Datei `docker-compose.prod.yml` muss im Repo noch angelegt werden.
Hier die vollständige Vorlage:

```yaml
# docker-compose.prod.yml
# Produktiv-Setup: App + PostgreSQL + MinIO + Umami + Caddy
# Verwendung: docker compose -f docker-compose.prod.yml up -d

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
      NEXT_PUBLIC_S3_PUBLIC_URL: https://cdn.${DOMAIN}   # CDN-URL vor MinIO
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
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_started
    networks:
      - internal
      - web

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: portfolio
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U portfolio"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  minio:
    image: minio/minio:latest
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio-data:/data
    networks:
      - internal

  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://umami:${UMAMI_DB_PASSWORD}@postgres:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${UMAMI_APP_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - internal

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
    networks:
      - internal
      - web

volumes:
  pgdata:
  minio-data:
  caddy-data:
  caddy-config:

networks:
  internal:
    driver: bridge
  web:
    driver: bridge
```

### Caddyfile (Beispiel)

```
kilia-siebert.de {
    reverse_proxy app:3000
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
}

# Umami intern erreichbar machen (optional — falls subdomain gewünscht)
# umami.kilia-siebert.de {
#     reverse_proxy umami:3001
# }
```

### Dockerfile (muss noch im Repo angelegt werden)

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

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

> **Hinweis:** Next.js `output: "standalone"` muss in `next.config.ts` aktiviert
> werden, damit das schlankste Production-Image entsteht.

---

## 4. Alle Umgebungsvariablen

Vollständige Liste für `.env.prod` (Server-seitig, nie committen):

```bash
# === Kern ===
PAYLOAD_SECRET=<256-bit-random-hex>          # openssl rand -hex 32
NEXT_PUBLIC_SERVER_URL=https://kilia-siebert.de

# === Datenbank ===
POSTGRES_PASSWORD=<sicheres-passwort>
# DATABASE_URI wird im Compose automatisch aus POSTGRES_PASSWORD gebaut

# === Object Storage (MinIO) ===
MINIO_ACCESS_KEY=<zufällig>
MINIO_SECRET_KEY=<zufällig>
S3_BUCKET=portfolio-media

# CDN-URL (Pull-Zone vor MinIO):
NEXT_PUBLIC_S3_PUBLIC_URL=https://cdn.kilia-siebert.de

# === Video-Pipeline ===
FFMPEG_DOCKER_IMAGE=jrottenberg/ffmpeg:6.1-ubuntu2204

# === E-Mail (transaktional, z. B. Resend oder Postmark) ===
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=<resend-api-key>
EMAIL_FROM=noreply@kilia-siebert.de
EMAIL_FROM_NAME=Kilian Siebert Portfolio
CONTACT_NOTIFY_TO=kilian@kilia-siebert.de

# === Umami Analytics ===
UMAMI_DB_PASSWORD=<sicheres-passwort>
UMAMI_APP_SECRET=<zufällig>
UMAMI_WEBSITE_ID=<aus-umami-dashboard>
# Kein API-Key bei self-hosted Umami (Cloud-only Feature) — Login-Credentials statt Token:
UMAMI_ADMIN_USERNAME=<umami-admin-username>
UMAMI_ADMIN_PASSWORD=<umami-admin-passwort>

# === Umami Frontend (werden in die App-Binary eingebaut bei Build) ===
NEXT_PUBLIC_UMAMI_SRC=https://umami.kilia-siebert.de/script.js
# oder selbst-gehostetem Pfad / Proxy-Pfad (für Ad-Blocker-Bypass)
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<gleich wie UMAMI_WEBSITE_ID>

# === Seed (nur beim initialen Setup) ===
SEED_ADMIN_EMAIL=kilian@kilia-siebert.de
SEED_ADMIN_PASSWORD=<sicheres-passwort>
```

---

## 5. Erststart-Ablauf (Schritt für Schritt)

```bash
# 1. Repo auf den Server klonen
git clone <repo-url> /opt/portfolio && cd /opt/portfolio

# 2. .env anlegen (aus obiger Liste, alle Werte setzen)
cp .env.example .env.prod
# → .env.prod bearbeiten

# 3. FFmpeg-Image vorziehen (wird von der Video-Pipeline gebraucht)
docker pull jrottenberg/ffmpeg:6.1-ubuntu2204

# 4. Produktions-Stack starten
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 5. MinIO-Bucket anlegen (einmalig)
docker compose -f docker-compose.prod.yml exec minio \
  mc alias set local http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
docker compose -f docker-compose.prod.yml exec minio \
  mc mb --ignore-existing local/portfolio-media
docker compose -f docker-compose.prod.yml exec minio \
  mc anonymous set download local/portfolio-media

# 6. Datenbank-Seed (legt Admin-User und Beispielinhalte an)
docker compose -f docker-compose.prod.yml exec app \
  pnpm payload run src/seed/index.ts

# 7. Umami einrichten
# → https://umami.kilia-siebert.de aufrufen (oder intern, je nach Caddyfile)
# → Website anlegen → Website-ID + API-Token ins .env.prod eintragen
# → Stack neu starten: docker compose ... up -d

# 8. CDN-Pull-Zone einrichten
# → Bunny.net oder Cloudflare: Pull Zone auf http://<vps-ip>:9000/portfolio-media
# → CNAME cdn.kilia-siebert.de → Pull-Zone-Hostname
# → NEXT_PUBLIC_S3_PUBLIC_URL=https://cdn.kilia-siebert.de neu in .env, rebuild
```

---

## 6. Updates

```bash
# Code-Update
git pull origin main
docker compose -f docker-compose.prod.yml build app
docker compose -f docker-compose.prod.yml up -d --no-deps app

# Dependency-Update (kontrolliert, nicht blind auf latest)
# → Erst in Dev testen, dann auf Prod
pnpm update --interactive
```

> Payload und Next.js entwickeln sich schnell. Versions-Pinning gilt (Sprintplan §0.4):
> Versions-Bumps erst in einer Testumgebung prüfen, dann auf Prod.

---

## 7. Backups

```bash
# PostgreSQL-Dump (täglich per Cron empfohlen)
docker exec portfolio-postgres-1 pg_dump -U portfolio portfolio \
  | gzip > /backup/portfolio-$(date +%Y%m%d).sql.gz

# MinIO-Daten (Sync auf externen Speicher, z. B. Hetzner Storage Box)
# rclone sync minio-data/ hetzner-box:/portfolio-backup/media/
```

Mindest-Retention: 7 Tage täglich, 4 Wochen wöchentlich.

---

## 8. Vor dem Go-Live — Checkliste

- [ ] Echter Impressum-Text in `src/app/(frontend)/impressum/page.tsx` eintragen
- [ ] Echter Datenschutz-Text in `src/app/(frontend)/datenschutz/page.tsx` eintragen
- [ ] OG-Bild `public/og-default.jpg` durch reales 1200×630-Bild ersetzen
- [ ] Social-Links in `src/lib/navigation.ts` (`SOCIAL_LINKS`) mit echten URLs füllen
- [ ] `NEXT_PUBLIC_SERVER_URL` auf die echte Domain setzen (OG-Tags, Sitemap)
- [ ] Umami-Website-ID in `.env.prod` (nach Schritt 7 in §5)
- [ ] SMTP-Anbieter konfiguriert, Test-Mail gesendet
- [ ] CDN-Pull-Zone live, `NEXT_PUBLIC_S3_PUBLIC_URL` auf CDN-Domain gesetzt
- [ ] DNS-Records propagiert (A + CNAME)
- [ ] Caddy-HTTPS aktiv (Let's Encrypt), kein Browser-Zertifikat-Fehler
- [ ] `/sitemap.xml` erreichbar und vollständig
- [ ] `/robots.txt` korrekt (disallow `/admin`)
- [ ] Admin-Login unter `/admin` funktioniert
- [ ] Kontaktformular → Submission in Payload-Admin → E-Mail-Benachrichtigung
- [ ] Beispiel-Video transkodiert, HLS-Wiedergabe im Browser

---

## 9. Monitoring (Empfehlung)

- **Uptime:** Uptime Kuma (selbst gehostet, leichtgewichtig) oder UptimeRobot (Free-Tier)
  → prüft `https://kilia-siebert.de` alle 60 Sekunden, Alert per Mail
- **Logs:** `docker compose logs -f app` — Payload und Next.js loggen strukturiert
- **Speicher:** `df -h` auf dem VPS, Alarm wenn < 20 % frei

---

## 10. Optionaler Sonderfall: Managed Video

Falls die FFmpeg-Pipeline zu wartungsintensiv wird, ist Video der einzige Baustein,
der sinnvoll ausgelagert werden kann (Sprintplan §4, Tech-Stack §7):

- **Mux** oder **Cloudflare Stream** als Managed-Video-Dienst
- Frontend-Änderung: `VideoLoop.tsx` bekommt eine `src`-Prop mit der Mux-HLS-URL
  statt der MinIO-URL — alles andere bleibt unverändert
- Die `Videos`-Collection und die `transcodeVideo`-Pipeline fallen weg
- Kosten: ca. 0,003–0,01 USD/min Storage + Bandbreite
