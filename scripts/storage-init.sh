#!/usr/bin/env bash
# Richtet den Garage-Bucket für die öffentliche Auslieferung ein (idempotent,
# darf bei jedem Start laufen). Garage selbst legt Key + Bucket beim Start an
# (--single-node --default-bucket, siehe garage.toml).
#
#   1. Website-Zugriff: Bucket über den Web-Endpoint (Port 3902) lesbar
#   2. Alias = Hostname aus NEXT_PUBLIC_S3_PUBLIC_URL (Web-Endpoint wählt den
#      Bucket per Host-Header; dev: localhost, prod: cdn.<domain>)
#   3. CORS: GET/HEAD von überall (öffentliche Medien; hls.js lädt per XHR)
#   4. Platzhalter static/placeholder.svg (object-storage-provider.ts)
#
# Dev/CI:  scripts/storage-init.sh          (Defaults passen zu docker-compose.dev.yml)
# Prod (als hillerhome, ohne sudo — sudo verwirft die Env mit den Credentials):
#          set -a; . ./.env.prod; set +a
#          COMPOSE_ENV_FILES=.env.prod COMPOSE_FILE=docker-compose.prod.yml S3_ENDPOINT=http://127.0.0.1:3900 \
#            NEXT_PUBLIC_S3_PUBLIC_URL=https://cdn.$DOMAIN scripts/storage-init.sh
set -euo pipefail
cd "$(dirname "$0")/.."

: "${COMPOSE_FILE:=docker-compose.dev.yml}"
: "${S3_ENDPOINT:=http://localhost:9100}"
: "${S3_BUCKET:=portfolio-media}"
: "${S3_REGION:=us-east-1}"
: "${S3_ACCESS_KEY_ID:=GKdevlocal0000000000000000}"
: "${S3_SECRET_ACCESS_KEY:=dev-local-only-not-a-secret}"
: "${NEXT_PUBLIC_S3_PUBLIC_URL:=http://localhost:9102}"
export COMPOSE_FILE

# </dev/null: `compose exec` liest sonst stdin des Aufrufers leer (bricht `ssh … bash -s`-Heredocs ab).
garage() { docker compose exec -T -e RUST_LOG=warn garage /garage "$@" </dev/null >/dev/null; }

for i in $(seq 1 30); do
  garage bucket info "$S3_BUCKET" 2>/dev/null && break
  [ "$i" = 30 ] && { echo "storage-init: Garage/Bucket nicht bereit" >&2; exit 1; }
  sleep 1
done

host=$(printf '%s' "$NEXT_PUBLIC_S3_PUBLIC_URL" | sed -E 's#^[a-z]+://##; s#[/:].*$##')
garage bucket website --allow "$S3_BUCKET"
garage bucket alias "$S3_BUCKET" "$host"

s3() {
  curl -sS --fail-with-body --aws-sigv4 "aws:amz:${S3_REGION}:s3" \
    --user "${S3_ACCESS_KEY_ID}:${S3_SECRET_ACCESS_KEY}" "$@" >/dev/null
}

cors='<CORSConfiguration><CORSRule><AllowedOrigin>*</AllowedOrigin><AllowedMethod>GET</AllowedMethod><AllowedMethod>HEAD</AllowedMethod><AllowedHeader>*</AllowedHeader><ExposeHeader>Content-Length</ExposeHeader><ExposeHeader>Content-Range</ExposeHeader><ExposeHeader>Content-Type</ExposeHeader><ExposeHeader>ETag</ExposeHeader><ExposeHeader>Accept-Ranges</ExposeHeader><MaxAgeSeconds>3600</MaxAgeSeconds></CORSRule></CORSConfiguration>'
s3 -X PUT --data-binary "$cors" \
  -H "x-amz-content-sha256: $(printf '%s' "$cors" | sha256sum | cut -d' ' -f1)" \
  -H "Content-MD5: $(printf '%s' "$cors" | openssl md5 -binary | base64)" \
  "${S3_ENDPOINT}/${S3_BUCKET}?cors"

ph=public/media/placeholder.svg
s3 -T "$ph" -H 'Content-Type: image/svg+xml' \
  -H "x-amz-content-sha256: $(sha256sum "$ph" | cut -d' ' -f1)" \
  "${S3_ENDPOINT}/${S3_BUCKET}/static/placeholder.svg"

echo "storage-init: Bucket ${S3_BUCKET} öffentlich unter ${NEXT_PUBLIC_S3_PUBLIC_URL} (Host-Alias ${host})"
