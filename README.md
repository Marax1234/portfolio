# Portfolio – Kilian Siebert

Portfolio-Website für den Foto- und Videografen Kilian Siebert: **Next.js 16** (App Router) mit
**Payload CMS 3** (Admin unter `/admin`), PostgreSQL, S3-kompatiblem Object Storage (Garage) und Umami.
Live: <https://kilia-siebert.de>. Betrieben auf einem Heimserver hinter einem VPS mit Caddy.

## Lokal starten

Voraussetzungen: Node 24 (siehe `Dockerfile`), Corepack (liefert pnpm aus `packageManager`), Docker, für
Videos `ffmpeg` im `PATH`.

```bash
cp .env.example .env
corepack enable && pnpm install
pnpm db:up          # Postgres + Garage aus docker-compose.dev.yml, legt Bucket/Website an
pnpm seed           # Beispielinhalte + Admin aus SEED_ADMIN_* (nur lokal)
pnpm dev            # http://localhost:3000, Admin: /admin
```

Vor jedem PR: `pnpm check` (tsc, ESLint, Vitest). Regeln für Code und UI: [`CLAUDE.md`](CLAUDE.md).

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/app/(frontend)` | Öffentliche Seiten (RSC, ISR mit Tag-Revalidierung) |
| `src/app/(payload)` | Payload-Admin und API-Routen |
| `src/collections`, `src/globals`, `src/blocks` | Payload-Datenmodell |
| `src/lib` | Datenzugriff, Medien-Abstraktion, Video-Transkodierung, Hilfsfunktionen (mit Tests) |
| `src/migrations` | Payload-Migrationen (Pflicht bei jeder Schema-Änderung, Expand/Contract) |
| `src/seed` | Seed für lokale Entwicklung und den DAST-Job, **nicht für Produktion** |
| `scripts/` | `deploy.sh` (einziger Deploy-Weg), `storage-init.sh` (Garage: Website, Alias, CORS) |
| `garage.toml` | Garage-Konfiguration, von beiden Compose-Dateien gemountet |
| `init-db/` | Legt beim ersten Start von Postgres (leeres Volume) die Umami-DB an |
| `docker-compose.dev.yml` / `docker-compose.prod.yml` | Lokale Dienste / Produktions-Stack auf hillerhome |
| `.github/workflows/` | CI-Gates, Image-Build nach GHCR, DAST, Nightly-Scan, Auto-Deploy |
| `skills-lock.json` | Pinnt die Agent-Skills (Design-Skills u. a.), die Agents in diesem Repo nutzen. Kein Laufzeit-Code. |

## Dokumentation

| Datei | Thema |
|---|---|
| [`docs/architecture-deploy.md`](docs/architecture-deploy.md) | Hosting-Architektur, Pipeline, Entscheidungen |
| [`manual-deploy.md`](manual-deploy.md) | Deploy, Rollback, Stolperfallen |
| [`docs/security/github-settings.md`](docs/security/github-settings.md) | Branch-Schutz, Gates, Auto-Deploy-Einrichtung |
| [`Security.md`](Security.md), [`security-exceptions.md`](security-exceptions.md) | CI/CD-Security-Checkliste, begründete Ausnahmen |
| [`design.md`](design.md) | Design-System (verbindlich für UI) |
| [`tech-stack-konfiguration.md`](tech-stack-konfiguration.md), [`docs/portfolio-konzept-kilian-siebert.md`](docs/portfolio-konzept-kilian-siebert.md) | Ursprüngliche Stack-Planung und Inhaltskonzept |
| [`docs/archive/`](docs/archive/README.md) | Historische Sprint-Doku und der alte Deploy-Guide |
