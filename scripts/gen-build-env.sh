#!/bin/bash
# Erzeugt .env.production.local für den Docker-Build (siehe deploy.md §7.3).
#
# next build/payload migrate brauchen schon beim Bauen eine erreichbare Postgres/MinIO
# (SSG fragt /arbeiten/[slug] per generateStaticParams gegen die DB ab). BuildKit
# unterstützt aber keine benutzerdefinierten Compose-Netzwerke fürs Build (nur
# host/none/default) — der App-Build läuft daher mit `network: host` (siehe
# docker-compose.prod.yml) und muss Postgres/MinIO über ihre tatsächlichen
# Container-IPs ansprechen, nicht über die Service-Namen.
#
# Voraussetzung: postgres + minio laufen bereits (docker compose up -d postgres minio).
set -euo pipefail
cd "$(dirname "$0")/.."

set -a
source .env.prod
set +a

PG_IP=$(docker inspect portfolio-postgres-1 --format '{{(index .NetworkSettings.Networks "portfolio_internal").IPAddress}}')
MINIO_IP=$(docker inspect portfolio-minio-1 --format '{{(index .NetworkSettings.Networks "portfolio_internal").IPAddress}}')

cat > .env.production.local <<EOF
PAYLOAD_SECRET=${PAYLOAD_SECRET}
DATABASE_URI=postgres://portfolio:${POSTGRES_PASSWORD}@${PG_IP}:5432/portfolio
NEXT_PUBLIC_SERVER_URL=https://${DOMAIN}
S3_BUCKET=${S3_BUCKET}
S3_REGION=us-east-1
S3_ENDPOINT=http://${MINIO_IP}:9000
S3_ACCESS_KEY_ID=${MINIO_ACCESS_KEY}
S3_SECRET_ACCESS_KEY=${MINIO_SECRET_KEY}
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

echo "postgres: ${PG_IP}  minio: ${MINIO_IP}"
echo ".env.production.local geschrieben."
