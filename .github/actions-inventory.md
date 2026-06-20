# Actions-Inventar (§3.2)

Vollständige Liste aller in `.github/workflows/` eingesetzten externen GitHub
Actions. Alle sind auf einen unveränderlichen 40-Zeichen-Commit-SHA gepinnt (§3.1).
Dependabot hält diese Liste über PRs aktuell (§3.4).

> **Pflege:** Bei jeder Änderung eines `uses:`-SHA in einem Workflow ist diese
> Tabelle mit zu aktualisieren (SHA + Review-Datum).

| Action | Version | Gepinnter SHA | Repository | Letztes Review |
|---|---|---|---|---|
| `actions/checkout` | v5.0.0 | `08c6903cd8c0fde910a37f88322edcfb5dd907a8` | https://github.com/actions/checkout | 2026-06-20 |
| `actions/setup-node` | v5.0.0 | `a0853c24544627f65ddf259abe73b1d18a591444` | https://github.com/actions/setup-node | 2026-06-20 |
| `pnpm/action-setup` | v6.0.9 | `008330803749db0355799c700092d9a85fd074e9` | https://github.com/pnpm/action-setup | 2026-06-20 |
| `github/codeql-action/init` | v4.36.2 | `8aad20d150bbac5944a9f9d289da16a4b0d87c1e` | https://github.com/github/codeql-action | 2026-06-20 |
| `github/codeql-action/analyze` | v4.36.2 | `8aad20d150bbac5944a9f9d289da16a4b0d87c1e` | https://github.com/github/codeql-action | 2026-06-20 |
| `gitleaks/gitleaks-action` | v3.0.0 | `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e` | https://github.com/gitleaks/gitleaks-action | 2026-06-20 |
| `actions/upload-artifact` | v4.6.2 | `ea165f8d65b6e75b540449e92b4886f43607fa02` | https://github.com/actions/upload-artifact | 2026-06-20 |
| `actions/github-script` | v8.0.0 | `ed597411d8f924073f98dfc5c65a23a2325f34cd` | https://github.com/actions/github-script | 2026-06-20 |
| `zaproxy/action-baseline` | v0.15.0 | `de8ad967d3548d44ef623df22cf95c3b0baf8b25` | https://github.com/zaproxy/action-baseline | 2026-06-20 |
| `zaproxy/action-full-scan` | v0.13.0 | `3c58388149901b9a03b7718852c5ba889646c27c` | https://github.com/zaproxy/action-full-scan | 2026-06-20 |

## Incident-Response bei kompromittierter Action (§3.3)

1. Betroffene Action sofort auf eine verifizierte, saubere Version (neuer SHA)
   aktualisieren **oder** den Workflow deaktivieren.
2. **Alle** Secrets rotieren, auf die der kompromittierte Workflow Zugriff hatte
   (siehe `security-exceptions.md` → Rotationsplan).
3. GitHub Actions Audit-Log auf verdächtige Runs prüfen (§9.1).
4. **Reaktionszeit: 24 h** für als kritisch eingestufte Actions.
