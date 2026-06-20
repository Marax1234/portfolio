# GitHub-Settings für die CI/CD-Security-Checkliste

Diese Datei dokumentiert die 🔴-Must-Punkte, die **nicht** als Code im Repo
umgesetzt werden können, sondern in den GitHub-Repository-Einstellungen
(Web-UI oder `gh`-CLI) gesetzt werden müssen. Sie brauchen Repo-Admin-Rechte.

> **Warum nicht automatisiert?** Im aktuellen Arbeitsumfeld ist die `gh`-CLI nicht
> installiert und nicht authentifiziert. Die folgenden Schritte müssen daher vom
> Repo-Owner (@Marax1234) ausgeführt werden. Für jeden Punkt sind UI-Pfad **und**
> `gh`-Befehl angegeben.

Repo: `Marax1234/portfolio`

---

## A. Branch Protection für `main` (§1.2, §9.3)

UI: **Settings → Branches → Add branch ruleset** (oder „Branch protection rule") für `main`.

Setzen:

- [ ] **§1.2.1** Direktes Pushen verboten → „Require a pull request before merging".
- [ ] **§1.2.2** `Required approvals ≥ 1` **und** „Require review from Code Owners"
      optional; **Self-Approval deaktivieren** (Rulesets: „Require approval of the
      most recent reviewable push" / in klassischen Rules ist Self-Approval durch
      `Required approvals ≥ 1` + „Dismiss stale" praktisch erzwungen).
- [ ] **§1.2.3** „Dismiss stale pull request approvals when new commits are pushed".
- [ ] **§1.2.4** „Require status checks to pass" → **diese Checks eintragen**:
      - `Secret Scan (Gitleaks)`
      - `SCA (pnpm audit)`
      - `SAST (CodeQL)`
      - `TypeScript Strict Check`
- [ ] **§1.2.5** „Allow force pushes" **deaktiviert**.
- [ ] **§1.2.1 (Admin-Enforcement)** „Do not allow bypassing the above settings"
      (gilt auch für Admins).
- [ ] **§1.2.6 (Should)** „Require linear history".
- [ ] **§9.3** Ergibt sich automatisch: Änderungen an `.github/workflows/` gehen
      nur per PR mit Reviewer durch `main`.

`gh`-CLI (Ruleset per API):

```bash
gh api -X POST repos/Marax1234/portfolio/rulesets \
  -f name='main-protection' -f target='branch' -f enforcement='active' \
  -F 'conditions[ref_name][include][]=refs/heads/main' \
  -F 'rules[][type]=pull_request' \
  -F 'rules[][type]=non_fast_forward' \
  -F 'rules[][type]=required_linear_history'
# Required Status Checks + required approving review count anschließend ergänzen
# (siehe `gh api repos/.../rulesets/<id>` → required_status_checks / pull_request).
```

> Die Status-Check-Namen werden erst auswählbar, **nachdem die Workflows einmal
> gelaufen sind**. Also: erst PR mit diesen Dateien mergen lassen (einmalig ggf.
> mit temporär gelockerter Regel), dann Checks als required eintragen.

---

## B. Secret Scanning & Push Protection (§2.7)

UI: **Settings → Code security and analysis**:

- [x] **§2.7** „Secret scanning" → **blockiert**: `gh api` liefert
      `"Secret scanning is not available for this repository."` — das aktuelle
      Billing-Plan dieses privaten Repos enthält kein GitHub Advanced Security.
- [x] **§2.7** „Push protection" → aus demselben Grund **nicht aktivierbar**
      (PATCH läuft durch, greift aber nicht — `security_and_analysis` bleibt
      `disabled`).
- [x] „Dependabot alerts" → **Enabled** (`PUT /vulnerability-alerts`, 2026-06-20).

`gh`-CLI (zur Doku, schlägt mit diesem Plan fehl):

```bash
gh api -X PATCH repos/Marax1234/portfolio \
  -F security_and_analysis[secret_scanning][status]=enabled \
  -F security_and_analysis[secret_scanning_push_protection][status]=enabled
```

> Für **private** Repos ist Secret Scanning Teil von GitHub Advanced Security.
> Ist das Repo öffentlich, ist es kostenlos verfügbar. **Gleiches Problem trifft
> §5.3 (CodeQL):** Der SARIF-Upload in den Code-Scanning-Tab schlägt mit
> `"Code scanning is not enabled for this repository"` fehl. Der CodeQL-Gate in
> `ci-security.yml` läuft daher mit `upload: never` — die Analyse selbst (CLI)
> braucht kein GHAS, nur der Upload ins Security-Tab tut es. Findings sind im
> Job-Log statt im Security-Tab sichtbar.
>
> **Optionen, um GHAS-Features doch zu bekommen:** (a) Repo öffentlich machen
> (verträgt sich nicht mit §4.2/self-hosted Runner), (b) GitHub Advanced
> Security für private Repos zubuchen (kostenpflichtig), (c) so lassen — Gitleaks
> deckt Secret-Scanning bereits redundant ab (§5.1), CodeQL-Gate bleibt über den
> lokalen SARIF-Check wirksam.

---

## C. GitHub Environments & Secret-Trennung (§2.2, §8.1, §9.2)

UI: **Settings → Environments**.

1. Environment **`production`** — **angelegt** (2026-06-20):
   - [x] **§8.1** „Required reviewers" → **blockiert**: `gh api` liefert
         `"Failed to create the environment protection rule. Please ensure the
         billing plan supports the required reviewers protection rule."` —
         Required Reviewers für Environments sind für private Repos ein
         GitHub-Team/Enterprise-Feature, auf diesem Plan nicht verfügbar.
   - [x] Stattdessen **Deployment-Branch-Policy** gesetzt: nur `main` darf in
         `production` deployen (`custom_branch_policies`, Branch `main`). Das ist
         ohne Zusatzkosten verfügbar und deckt zumindest „kein Deploy von
         Feature-Branches" ab.
   - [ ] **§2.2** Production-Secrets **nur hier** als Environment Secrets hinterlegen
         (`PAYLOAD_SECRET`, `S3_*`, `POSTGRES_PASSWORD`, SMTP …). Beim self-hosted
         Deploy liegen die Werte in `/opt/portfolio/.env.prod` — dann hier nur die
         Secrets, die der Workflow tatsächlich injiziert.
   - [ ] **§9.2** Deployment-Approvals würden automatisch im Environment-Log
         protokolliert — entfällt vorerst, da kein Required-Reviewer-Gate aktiv ist.

2. Environment **`staging`** — **angelegt** (2026-06-20, ohne Branch-Policy,
   da noch keine Staging-Infrastruktur existiert, §6):
   - [ ] **§2.2** Separate Staging-Secrets, **keine** Production-Credentials.

`gh`-CLI:

```bash
gh api -X PUT repos/Marax1234/portfolio/environments/production \
  -F 'reviewers[][type]=User' -F 'reviewers[][id]=<USER_ID>'
gh secret set PAYLOAD_SECRET --env production
```

---

## D. Self-hosted Runner & Repo-Sichtbarkeit (§4.1, §4.2)

- [ ] **§4.1** Production-Deploy läuft auf dem self-hosted Runner (hillerhome);
      PR-Gates laufen auf GitHub-Hosted Runnern ohne Deploy-Secrets — bereits durch
      `ci-security.yml` (GitHub-Hosted) vs. `deploy-production.yml` (self-hosted)
      getrennt.
- [ ] **§4.2** Wenn der self-hosted Runner genutzt wird, muss das Repo **`private`**
      sein (sonst könnten Fork-PRs fremden Code auf dem Runner ausführen).
      Prüfen: **Settings → General → Danger Zone → Change visibility**.
- [ ] Runner registrieren: deploy.md §11, Variante A.

---

## E. Log-Retention (§9.5, Should)

UI: **Settings → Actions → General → Artifact and log retention** → mindestens
**90 Tage** (für Compliance-relevante Deployments 365).

---

## Status der Must-Punkte

### ✅ Als Code im Repo umgesetzt
| Punkt | Wo |
|---|---|
| §1.1.2/§1.1.3/§1.1.4 Permissions, kein pull_request_target | `ci-security.yml`, `deploy-production.yml` |
| §3.1 Actions auf SHA gepinnt | alle Workflows + `.github/actions-inventory.md` |
| §3.5 Script-Injection-Schutz | Workflows (keine `github.event.*`-Interpolation in `run`) |
| §4.1 Runner-Trennung | GitHub-Hosted Gates vs. self-hosted Deploy |
| §5.1 Secret Scan Gate | `ci-security.yml` (Gitleaks) + `.gitleaks.toml` |
| §5.2 SCA Gate | `ci-security.yml` (`pnpm audit --prod --audit-level high`) |
| §5.3 SAST Gate | `ci-security.yml` (CodeQL + SARIF + Severity-Gate) |
| §5.4 TypeScript Strict Gate | `ci-security.yml` (`pnpm typecheck`, strict in tsconfig) |
| §6.3 `payload migrate` statt dev | Dockerfile (builder-Stage) + npm-Scripts |
| §8.2 Deploy hängt an allen Gates | `deploy-production.yml` (workflow_run + success-Gate) |

### ⚙️ Erfordert deine Aktion in GitHub (dieses Dokument, Abschnitte A–E)
§1.2.1–1.2.5 · §2.2 · §2.7 · §8.1 · §9.2 · §9.5 · §4.2

### 🚧 Blockiert auf Infrastruktur-Entscheidung (nicht umsetzbar ohne dich)
| Punkt | Was fehlt |
|---|---|
| **§6.1/§6.2 Staging-Deploy-Gate** | Es existiert keine separate Staging-Umgebung. Der Stack auf hillerhome ist nur Production. Eine produktionsidentische Staging-Umgebung (eigene DB, eigene URL, eigene Secrets) muss erst bereitgestellt werden. |
| **§7.1–§7.3 DAST-Gate** | Hängt an der Staging-URL aus §6. ZAP-Action + `.zap/rules.tsv` sind vorbereitet, aber ohne erreichbare Staging-URL nicht aktivierbar. |
| **§1.2 / §8.1 Aktivierung** | Branch-Ruleset & `production`-Environment-Reviewer müssen einmalig gesetzt werden (Abschnitte A & C). Die Required-Status-Checks lassen sich erst nach dem ersten Workflow-Lauf auswählen. |

### ℹ️ Außerhalb des Scopes
Abschnitt **§10 (Nightly Scheduled Scans)** — laut Kopf der Checkliste explizit
„**Scope: ohne … Scheduled Scans**". Bewusst nicht implementiert. Bei Bedarf
nachziehbar (Cron-Workflow analog `ci-security.yml`).
