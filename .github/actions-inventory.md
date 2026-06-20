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
| `pnpm/action-setup` | v4.2.0 | `41ff72655975bd51cab0327fa583b6e92b6d3061` | https://github.com/pnpm/action-setup | 2026-06-20 |
| `github/codeql-action/init` | v4.36.2 | `8aad20d150bbac5944a9f9d289da16a4b0d87c1e` | https://github.com/github/codeql-action | 2026-06-20 |
| `github/codeql-action/analyze` | v4.36.2 | `8aad20d150bbac5944a9f9d289da16a4b0d87c1e` | https://github.com/github/codeql-action | 2026-06-20 |
| `gitleaks/gitleaks-action` | v2.3.9 | `ff98106e4c7b2bc287b24eaf42907196329070c7` | https://github.com/gitleaks/gitleaks-action | 2026-06-20 |

## Noch nicht aktiviert (warten auf Infrastruktur — siehe docs/security/github-settings.md)

Diese Actions sind für die Deploy-/DAST-Gates (§6, §7) vorgesehen und werden
eingetragen, sobald die Staging-Umgebung bereitsteht:

| Action | Version | Gepinnter SHA | Repository |
|---|---|---|---|
| `zaproxy/action-baseline` | v0.15.0 | `de8ad967d3548d44ef623df22cf95c3b0baf8b25` | https://github.com/zaproxy/action-baseline |

## Incident-Response bei kompromittierter Action (§3.3)

1. Betroffene Action sofort auf eine verifizierte, saubere Version (neuer SHA)
   aktualisieren **oder** den Workflow deaktivieren.
2. **Alle** Secrets rotieren, auf die der kompromittierte Workflow Zugriff hatte
   (siehe `security-exceptions.md` → Rotationsplan).
3. GitHub Actions Audit-Log auf verdächtige Runs prüfen (§9.1).
4. **Reaktionszeit: 24 h** für als kritisch eingestufte Actions.
