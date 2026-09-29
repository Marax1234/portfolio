# GitHub-Settings & Security-Status

Stand: 2026-09-29 · Repo: `Marax1234/portfolio` · Sichtbarkeit: **public**

Diese Datei dokumentiert, welche 🔴-Must-Punkte der Security-Checkliste in den
GitHub-Repository-Einstellungen umgesetzt sind (per `gh`-CLI angewendet) und welche
bewussten Abstriche bestehen.

---

## ✅ Per `gh` angewendet (2026-06-20)

| Punkt | Setting | Status |
|---|---|---|
| **§1.2.1** | „Require a pull request before merging" auf `main` | ✅ aktiv |
| **§1.2.3** | „Dismiss stale reviews" | ✅ aktiv |
| **§1.2.4** | Required Status Checks: `Secret Scan (Gitleaks)`, `SCA (pnpm audit)`, `SAST (CodeQL)`, `TypeScript Strict Check` + „strict" (up-to-date) | ✅ aktiv |
| **§1.2.5** | „Allow force pushes" deaktiviert | ✅ aktiv |
| **§1.2.6** | „Require linear history" | ✅ aktiv |
| §1.2.x | „Include administrators" (enforce_admins) | ✅ aktiv |
| **§2.7** | Secret Scanning **+ Push Protection** (public → kostenlos) | ✅ aktiv |
| §3.4/§5.2 | Dependabot Alerts + Security Updates | ✅ aktiv |
| **§8.1** | Environment `production` mit **Required Reviewer** (@Marax1234) + Branch-Policy nur `main` | ✅ aktiv |
| **§5.3.3** | CodeQL-SARIF-Upload in Security → Code Scanning (public → kostenlos) | ✅ aktiv (beim ersten Workflow-Lauf) |
| – | „Automatically delete head branches" (`delete_branch_on_merge`) | ✅ aktiv (2026-09-29) |
| – | Environment `staging` gelöscht (war leer, ohne Schutzregeln, kein Staging-Stack) | ✅ 2026-09-29 |

Reproduzierbare Befehle stehen am Ende dieser Datei.

---

## ⚠️ Bewusste Abstriche (Solo-Maintainer / Heim-Infra)

| Punkt | Abstrich | Begründung & Workaround |
|---|---|---|
| **§1.2.2** „≥1 Review, kein Self-Approval" | Required Approvals = **0** (statt 1) | Als einziger Maintainer kannst du eigene PRs nicht selbst approven — bei „≥1" könntest du gar nicht mehr mergen. Die **Required Status Checks bleiben hart** (kein Merge ohne grüne Gates). Wenn ein zweiter Reviewer dazukommt: `required_approving_review_count` auf 1 setzen. |
| **§8.1** Self-Review beim Deploy | `prevent_self_review = false` | Du bist Reviewer **und** Deployer in Personalunion. Die Approval wird trotzdem im Environment-Log protokolliert (§9.2), ist aber eine Selbstfreigabe. |
| **§4.2** Self-hosted Runner auf public Repo | **entfällt** | Es ist kein Self-hosted Runner registriert, und es wird keiner kommen (kein dauerhafter Runner mit Docker-Rechten auf dem Prod-Host). `deploy-production.yml` ist stillgelegt (nur `workflow_dispatch`). Deploys laufen manuell nach `manual-deploy.md`, später per GHCR-Image + Tailscale-SSH mit Freigabe im Environment `production`. |
| **§2.2** getrennte Secret-Sets `staging`/`production` | **entfällt** | Kein Staging-Stack, daher kein Environment `staging`. Das Environment `production` hat keine Secrets; die Prod-Werte liegen nur in `/opt/portfolio/.env.prod` auf hillerhome. |
| **§6.1/§6.2** dauerhafte Staging-Umgebung | ersetzt durch **Ephemer-Umgebung in CI** | Es gibt keine dauerhafte Staging-Umgebung und wird keine geben. Siehe nächster Abschnitt. |

---

## 🔧 Workaround: DAST ohne dauerhaftes Staging (§6/§7)

Statt einer permanenten Staging-Umgebung bootet der Job **`DAST (ephemeral ZAP
baseline)`** in `ci-security.yml` (nur bei Push auf `main`) den vollen Stack
flüchtig im Runner:

1. `docker-compose.dev.yml` hoch (Postgres + Garage),
2. `pnpm migrate` (§6.2/§6.3 — Migrationen werden vor dem Scan getestet),
3. `pnpm seed` (§6.1 — repräsentative, **keine echten** Nutzerdaten),
4. `pnpm build` + `pnpm start`,
5. **OWASP ZAP Baseline** gegen die laufende App, `fail_action: true` (§7.3 —
   Findings blockieren), Ausnahmen in `.zap/rules.tsv` (§7.4),
6. Stack wird wieder abgebaut.

Deployt wird derzeit manuell und erst nach einem grünen Lauf dieses Workflows auf
`main`. Ein automatisches Gate §7 → §8 kommt mit dem GHCR-/Tailscale-Deploy zurück;
bis dahin ist es eine Regel im Ablauf, keine technische Sperre.

> **Erwartung beim ersten Lauf:** Der Full-Stack-Boot in CI ist der fragilste Teil
> und braucht ggf. eine Iteration (Timeouts, ZAP-Ziel-IP). Findings, die kein
> echtes Risiko sind, kommen als `IGNORE`-Zeile nach `.zap/rules.tsv`.

---

## 🌙 Nightly Scans (§10) — `nightly-scan.yml`

Täglich um 03:17 UTC + manuell (`workflow_dispatch`):

- **§10.1** Voller Dependency-Audit (ohne Level-Filter), JSON-Report als Artefakt
  (30 Tage), Auto-Issue pro neuem High/Critical (Dedup über Advisory-ID).
- **§10.2** Voller SAST-Scan (gesamte Codebasis), SARIF in den Security-Tab.
- **§10.3** ZAP **Full** Scan gegen `https://kilia-siebert.de` (Production),
  nicht-blockierend (`fail_action: false`), pflegt ein Tracking-Issue für neue
  Findings, Report als Artefakt.

---

## Noch offen (deine Aktion)

- [ ] **Bootstrap-PR**: Diese Dateien (`.github/`, `.gitleaks.toml`, `.zap/`,
      `docs/`, `security-exceptions.md`, `package.json`, `pnpm-lock.yaml`) auf einem
      Branch pushen und per **PR** mergen. Die vier Gates laufen auf dem PR und
      müssen grün sein (Required Checks). Direkt-Push auf `main` ist jetzt gesperrt.
- [ ] **§9.5 (Should)** Log-Retention auf ≥ 90 Tage: **Settings → Actions → General
      → Artifact and log retention**.
- [ ] **§5.4 / Kontaktformular**: Nach dem `nodemailer`-Override (8→9) einmal eine
      Test-Mail über das Kontaktformular schicken.

---

## Reproduzierbare `gh`-Befehle

```bash
# §2.7 Secret Scanning + Push Protection
gh api -X PATCH repos/Marax1234/portfolio --input - <<'JSON'
{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}
JSON

# §8.1 Production-Environment + Required Reviewer (User-ID via `gh api user --jq .id`)
gh api -X PUT repos/Marax1234/portfolio/environments/production --input - <<'JSON'
{"wait_timer":0,"prevent_self_review":false,"reviewers":[{"type":"User","id":157790643}],"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}
JSON
gh api -X POST repos/Marax1234/portfolio/environments/production/deployment-branch-policies -f name='main' -f type='branch'

# §1.2 Branch Protection für main
gh api -X PUT repos/Marax1234/portfolio/branches/main/protection --input - <<'JSON'
{"required_status_checks":{"strict":true,"contexts":["Secret Scan (Gitleaks)","SCA (pnpm audit)","SAST (CodeQL)","TypeScript Strict Check"]},"enforce_admins":true,"required_pull_request_reviews":{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":0},"restrictions":null,"allow_force_pushes":false,"allow_deletions":false,"required_linear_history":true}
JSON

# Dependabot Security Updates
gh api -X PUT repos/Marax1234/portfolio/automated-security-fixes

# Head-Branches nach dem Merge automatisch löschen
gh api -X PATCH repos/Marax1234/portfolio -F delete_branch_on_merge=true
```
