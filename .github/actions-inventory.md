# Actions-Inventar (§3.2)

Vollständige Liste aller in `.github/workflows/` eingesetzten externen GitHub
Actions. Alle sind auf einen unveränderlichen 40-Zeichen-Commit-SHA gepinnt (§3.1).
Dependabot hält diese Liste über PRs aktuell (§3.4).

> **Pflege:** Bei jeder Änderung eines `uses:`-SHA in einem Workflow ist diese
> Tabelle mit zu aktualisieren (SHA + Review-Datum).

| Action | Version | Gepinnter SHA | Repository | Letztes Review |
|---|---|---|---|---|
| `actions/checkout` | v7.0.0 | `9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0` | https://github.com/actions/checkout | 2026-09-29 |
| `actions/setup-node` | v6.4.0 | `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e` | https://github.com/actions/setup-node | 2026-09-29 |
| `pnpm/action-setup` | v6.0.9 | `0ebf47130e4866e96fce0953f49152a61190b271` | https://github.com/pnpm/action-setup | 2026-09-29 |
| `github/codeql-action/init` | v4.36.2 | `8aad20d150bbac5944a9f9d289da16a4b0d87c1e` | https://github.com/github/codeql-action | 2026-06-20 |
| `github/codeql-action/analyze` | v4.36.2 | `8aad20d150bbac5944a9f9d289da16a4b0d87c1e` | https://github.com/github/codeql-action | 2026-06-20 |
| `gitleaks/gitleaks-action` | v3.0.0 | `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e` | https://github.com/gitleaks/gitleaks-action | 2026-06-20 |
| `actions/upload-artifact` | v7.0.1 | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | https://github.com/actions/upload-artifact | 2026-09-29 |
| `actions/github-script` | v9.0.0 | `3a2844b7e9c422d3c10d287c895573f7108da1b3` | https://github.com/actions/github-script | 2026-09-29 |
| `zaproxy/action-baseline` | v0.15.0 | `de8ad967d3548d44ef623df22cf95c3b0baf8b25` | https://github.com/zaproxy/action-baseline | 2026-06-20 |
| `zaproxy/action-full-scan` | v0.13.0 | `3c58388149901b9a03b7718852c5ba889646c27c` | https://github.com/zaproxy/action-full-scan | 2026-06-20 |

## Incident-Response bei kompromittierter Action (§3.3)

1. Betroffene Action sofort auf eine verifizierte, saubere Version (neuer SHA)
   aktualisieren **oder** den Workflow deaktivieren.
2. **Alle** Secrets rotieren, auf die der kompromittierte Workflow Zugriff hatte
   (siehe `security-exceptions.md` → Rotationsplan).
3. GitHub Actions Audit-Log auf verdächtige Runs prüfen (§9.1).
4. **Reaktionszeit: 24 h** für als kritisch eingestufte Actions.
