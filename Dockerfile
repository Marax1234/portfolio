# Node 24 LTS (B22), Tag + Digest gepinnt (alle drei Stages gleich; Dependabot „docker“
# hebt beide an, Majors nur zusammen mit .nvmrc und @types/node).
FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS deps
WORKDIR /app
# pnpm-Version kommt aus `packageManager` in package.json (inkl. sha512, Corepack prüft ihn).
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && corepack install
# sharp's prebuilt libvips binary is large and its optional-dependency fetch has been
# observed to land incomplete (missing .so) under --frozen-lockfile on this registry —
# verify it loads and force a clean re-fetch on failure instead of shipping a broken image.
# node-linker=hoisted (nur im Image): flaches node_modules ohne Symlinks. Turbopack
# (Next >= 16.3) bricht beim standalone-Tracing ab, sobald ein
# outputFileTracingIncludes-Glob einen Symlink auf ein Verzeichnis trifft
# ("reading file …/@img/sharp-libvips-*: Is a directory", vercel/next.js#97507) —
# im isolierten pnpm-Layout sind sharps Plattform-Pakete genau solche Symlinks.
# Kein `--force`: das installierte zusätzlich alle Fremdplattform-Binaries
# (darwin/win32). Bei Fehlschlag Store + node_modules leeren → Re-Fetch.
# O-07: pnpm-Store als BuildKit-Cache-Mount, landet in keiner Schicht und überlebt
# Builds (nur geänderte Pakete werden neu geladen).
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    for i in 1 2 3; do \
      pnpm install --frozen-lockfile --config.node-linker=hoisted --store-dir=/pnpm/store && node -e "require('sharp')" && exit 0; \
      echo "sharp failed to load, retrying with clean store ($i/3)"; \
      rm -rf node_modules /pnpm/store/*; \
    done; \
    node -e "require('sharp')"

FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS builder
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
# Begrenzt den Node-Heap von migrate/build, damit der Build auf hillerhome
# (11 GB RAM, laufender Stack daneben) nicht den Host auslastet.
ENV NODE_OPTIONS=--max-old-space-size=3072
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack install
# Migrations müssen vor dem Build laufen: /arbeiten/[slug] fragt Payload
# (→ Postgres) schon zur Build-Zeit per generateStaticParams ab.
# .env.production.local (siehe deploy.md/.env.prod) liegt im Build-Kontext.
RUN set -a && . ./.env.production.local && set +a && pnpm payload migrate
RUN pnpm build

FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS runner
WORKDIR /app
ENV NODE_ENV=production
# ffmpeg/ffprobe für die HLS-Transkodierungs-Pipeline (src/lib/video) —
# direkt im Image statt per `docker run` (App-Container hat in Produktion
# keinen Zugriff auf den Docker-Daemon).
RUN apk add --no-cache ffmpeg
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# B23: Next schreibt zur Laufzeit in .next (Bild-Cache unter .next/cache/images, ISR-Seiten,
# Fetch-Cache). Vorher gehörte alles root → EACCES, jedes Bild wurde bei jedem Request neu
# optimiert. Wie im offiziellen Next-Docker-Beispiel gehört der Output dem App-User.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Mountpunkt für das Volume `next-image-cache` (E2: nur der Bild-Cache überlebt ein Deploy,
# HTML/ISR startet frisch). Ein neues Named Volume übernimmt Eigentümer und Rechte von hier.
RUN mkdir -p .next/cache/images && chown -R nextjs:nodejs .next/cache
# Build-Gate: sharp (Payload-Bildgrößen, next/image) muss im standalone-Output
# vollständig sein (Binary, libvips, detect-libc, semver) — sonst Build abbrechen.
RUN node -e "require('sharp')"
USER nextjs
EXPOSE 3000
# server.js bindet an $HOSTNAME; Docker setzt dort die Container-ID (= nur die Container-IP).
# 0.0.0.0, damit der Healthcheck 127.0.0.1 erreicht. Nach außen gilt weiter nur das
# Port-Mapping auf 10.10.0.2 (docker-compose.prod.yml).
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
