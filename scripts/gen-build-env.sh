#!/bin/bash
# Erzeugt .env.production.local für den Docker-Build (siehe deploy.md §7.3).
#
# next build/payload migrate brauchen schon beim Bauen eine erreichbare Postgres/Garage
# (SSG fragt /arbeiten/[slug] per generateStaticParams gegen die DB ab). BuildKit
# unterstützt aber keine benutzerdefinierten Compose-Netzwerke fürs Build (nur
# host/none/default) — der App-Build läuft daher mit `network: host` (siehe
# docker-compose.prod.yml) und muss Postgres/Garage über ihre tatsächlichen
# Container-IPs ansprechen, nicht über die Service-Namen.
#
# Voraussetzung: postgres + garage laufen bereits (docker compose up -d postgres garage).
set -euo pipefail
# Enthält Secrets → nur für den Eigentümer lesbar, auch wenn die Datei neu angelegt wird.
umask 077
cd "$(dirname "$0")/.."

set -a
source .env.prod
set +a

PG_IP=$(docker inspect portfolio-postgres-1 --format '{{(index .NetworkSettings.Networks "portfolio_internal").IPAddress}}')
GARAGE_IP=$(docker inspect portfolio-garage-1 --format '{{(index .NetworkSettings.Networks "portfolio_internal").IPAddress}}')

cat > .env.production.local <<EOF
PAYLOAD_SECRET=${PAYLOAD_SECRET}
DATABASE_URI=postgres://portfolio:${POSTGRES_PASSWORD}@${PG_IP}:5432/portfolio
NEXT_PUBLIC_SERVER_URL=https://${DOMAIN}
S3_BUCKET=${S3_BUCKET}
S3_REGION=us-east-1
S3_ENDPOINT=http://${GARAGE_IP}:3900
S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID}
S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY}
S3_FORCE_PATH_STYLE=true
NEXT_PUBLIC_S3_PUBLIC_URL=https://cdn.${DOMAIN}
EMAIL_FROM=${EMAIL_FROM}
EMAIL_FROM_NAME="${EMAIL_FROM_NAME}"
CONTACT_NOTIFY_TO=${CONTACT_NOTIFY_TO}
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EOF
chmod 600 .env.production.local .env.prod

echo "postgres: ${PG_IP}  garage: ${GARAGE_IP}"
echo ".env.production.local geschrieben."
