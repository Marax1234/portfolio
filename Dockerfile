FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@9 --activate
# sharp's prebuilt libvips binary is large and its optional-dependency fetch has been
# observed to land incomplete (missing .so) under --frozen-lockfile on this registry —
# verify it loads and force a clean re-fetch on failure instead of shipping a broken image.
RUN for i in 1 2 3; do \
      pnpm install --frozen-lockfile --force && node -e "require('sharp')" && exit 0; \
      echo "sharp failed to load, retrying ($i/3)"; \
    done; \
    node -e "require('sharp')"

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
# Migrations müssen vor dem Build laufen: /arbeiten/[slug] fragt Payload
# (→ Postgres) schon zur Build-Zeit per generateStaticParams ab.
# .env.production.local (siehe deploy.md/.env.prod) liegt im Build-Kontext.
RUN set -a && . ./.env.production.local && set +a && pnpm payload migrate
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# ffmpeg/ffprobe für die HLS-Transkodierungs-Pipeline (src/lib/video) —
# direkt im Image statt per `docker run` (App-Container hat in Produktion
# keinen Zugriff auf den Docker-Daemon).
RUN apk add --no-cache ffmpeg
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
