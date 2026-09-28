# Portfolio – Kilian Siebert

Portfolio-Website für den Foto-/Videografen Kilian Siebert, gebaut mit **Next.js** und **Payload CMS**,
containerisiert mit Docker, inklusive CI-Workflows, Security-Scans (gitleaks, OWASP ZAP) und Deploy-Doku.

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d
npm install && npm run dev
```

Weitere Doku: `design.md`, `deploy.md`, `manual-deploy.md`, `Security.md`, `docs/`.
