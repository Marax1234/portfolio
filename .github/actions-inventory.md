# Actions-Inventar (§3.2)

Vollständige Liste aller in `.github/workflows/` eingesetzten externen GitHub
Actions. Alle sind auf einen unveränderlichen 40-Zeichen-Commit-SHA gepinnt (§3.1).
Dependabot hält diese Liste über PRs aktuell (§3.4).

> **Pflege:** Bei jeder Änderung eines `uses:`-SHA in einem Workflow ist diese
> Tabelle mit zu aktualisieren (SHA + Review-Datum).

| Action | Version | Gepinnter SHA | Repository | Letztes Review |
|---|---|---|---|---|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | https://github.com/actions/checkout | 2026-09-29 |
| `actions/setup-node` | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` | https://github.com/actions/setup-node | 2026-09-29 |
| `pnpm/action-setup` | v6.0.9 | `0ebf47130e4866e96fce0953f49152a61190b271` | https://github.com/pnpm/action-setup | 2026-09-29 |
| `github/codeql-action/init` | v4.36.2 | `8aad20d150bbac5944a9f9d289da16a4b0d87c1e` | https://github.com/github/codeql-action | 2026-06-20 |
| `github/codeql-action/analyze` | v4.36.2 | `8aad20d150bbac5944a9f9d289da16a4b0d87c1e` | https://github.com/github/codeql-action | 2026-06-20 |
| `gitleaks/gitleaks-action` | v3.0.0 | `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e` | https://github.com/gitleaks/gitleaks-action | 2026-06-20 |
| `actions/upload-artifact` | v7.0.1 | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | https://github.com/actions/upload-artifact | 2026-09-29 |
| `actions/github-script` | v9.0.0 | `3a2844b7e9c422d3c10d287c895573f7108da1b3` | https://github.com/actions/github-script | 2026-09-29 |
| `zaproxy/action-baseline` | v0.15.0 | `de8ad967d3548d44ef623df22cf95c3b0baf8b25` | https://github.com/zaproxy/action-baseline | 2026-06-20 |
| `zaproxy/action-full-scan` | v0.13.0 | `3c58388149901b9a03b7718852c5ba889646c27c` | https://github.com/zaproxy/action-full-scan | 2026-06-20 |
| `actions/download-artifact` | v8.0.1 | `3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c` | https://github.com/actions/download-artifact | 2026-09-30 |
| `actions/attest` | v4.2.2 | `1e69f48acb82d1966a394da916b4c1698aa569d6` | https://github.com/actions/attest | 2026-09-30 |
| `docker/setup-buildx-action` | v4.4.1 | `f87e5991a6d7451dcb8d9637bfbc97413f497069` | https://github.com/docker/setup-buildx-action | 2026-09-30 |
| `docker/login-action` | v4.6.0 | `dbcb813823bdd20940b903addbd779551569679f` | https://github.com/docker/login-action | 2026-09-30 |
| `docker/build-push-action` | v7.4.0 | `c3c9e263c25d99ce0380d002d59b67737d91b0dc` | https://github.com/docker/build-push-action | 2026-09-30 |
| `tailscale/github-action` | v4.2.0 | `d1b6cd204f8dceda5b3eaad7f1f767be390056cd` | https://github.com/tailscale/github-action | 2026-09-30 |

Kein Action, aber ebenfalls gepinnt (B25 C-03): **Trivy-CLI** v0.74.0 als Release-Binary mit
sha256 in `ci-security.yml` (Job `build`). Bewusst nicht `aquasecurity/trivy-action`/`setup-trivy`:
deren Tags wurden im März 2026 durch Schadcode ersetzt (GHSA-69fq-xp46-6x23). Update: Release ≥ 7 Tage,
sha256 aus `trivy_<v>_checksums.txt` (Release ist immutable), beide Werte im Job anheben.
Tailscale-Client im Deploy: Version aus dem Default der Action (v4.2.0 → 1.94.2).

## Incident-Response bei kompromittierter Action (§3.3)

1. Betroffene Action sofort auf eine verifizierte, saubere Version (neuer SHA)
   aktualisieren **oder** den Workflow deaktivieren.
2. **Alle** Secrets rotieren, auf die der kompromittierte Workflow Zugriff hatte
   (siehe `security-exceptions.md` → Rotationsplan).
3. GitHub Actions Audit-Log auf verdächtige Runs prüfen (§9.1).
4. **Reaktionszeit: 24 h** für als kritisch eingestufte Actions.
