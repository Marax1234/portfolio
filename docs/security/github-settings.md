# GitHub-Settings & Security-Status

Stand: 2026-09-30 · Repo: `Marax1234/portfolio` · Sichtbarkeit: **public**

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
| B25 C-01 | Zusätzliche Required Checks `Lint` (Job `lint`), `Test` (Job `test`, Vitest) und `Build` (Job `build`, Image ohne DB/Secrets + Trivy-Gate), trägt Max ein (Befehl unten) | ⏳ offen |
| B25 C-04 | Optional als Required Check: `DAST (ZAP baseline, Image)` (läuft seit Session 16 auch in PRs) | ⏳ Entscheidung Max |
| B25 A1/A2 | GHCR-Package `ghcr.io/marax1234/portfolio-app` **öffentlich** (erbt beim ersten Push die Sichtbarkeit des Repos, prüfen) | ⏳ nach erstem Push prüfen |
| B25 A1 | Environment-Secret `DEPLOY_SSH_KEY` in `production`, Variablen `TS_OAUTH_CLIENT_ID`/`TS_AUDIENCE`, Tailscale-ACL + Federated Identity (Abschnitt „Auto-Deploy“) | ⏳ Max |
| **§1.2.5** | „Allow force pushes" deaktiviert | ✅ aktiv |
| **§1.2.6** | „Require linear history" | ✅ aktiv |
| §1.2.x | „Include administrators" (enforce_admins) | ✅ aktiv |
| **§2.7** | Secret Scanning **+ Push Protection** (public → kostenlos) | ✅ aktiv |
| §3.4/§5.2 | Dependabot Alerts + Security Updates | ✅ aktiv |
| **§8.1** | Environment `production` mit **Required Reviewer** (@Marax1234) + Branch-Policy nur `main` | ✅ aktiv |
| **§5.3.3** | CodeQL-SARIF-Upload in Security → Code Scanning (public → kostenlos) | ✅ aktiv (beim ersten Workflow-Lauf) |
| – | „Automatically delete head branches" (`delete_branch_on_merge`) | ✅ aktiv (2026-09-29) |
| – | Nur Squash-Merge erlaubt (Merge-Commit und Rebase aus) | ✅ aktiv (2026-09-29) |
| – | Environment `staging` gelöscht (war leer, ohne Schutzregeln, kein Staging-Stack) | ✅ 2026-09-29 |

Reproduzierbare Befehle stehen am Ende dieser Datei.

---

## ⚠️ Bewusste Abstriche (Solo-Maintainer / Heim-Infra)

| Punkt | Abstrich | Begründung & Workaround |
|---|---|---|
| **§1.2.2** „≥1 Review, kein Self-Approval" | Required Approvals = **0** (statt 1) | Als einziger Maintainer kannst du eigene PRs nicht selbst approven — bei „≥1" könntest du gar nicht mehr mergen. Die **Required Status Checks bleiben hart** (kein Merge ohne grüne Gates). Wenn ein zweiter Reviewer dazukommt: `required_approving_review_count` auf 1 setzen. |
| **§8.1** Self-Review beim Deploy | `prevent_self_review = false` | Du bist Reviewer **und** Deployer in Personalunion. Die Approval wird trotzdem im Environment-Log protokolliert (§9.2), ist aber eine Selbstfreigabe. |
| **§4.2** Self-hosted Runner auf public Repo | **entfällt** | Es ist kein Self-hosted Runner registriert, und es wird keiner kommen (kein dauerhafter Runner mit Docker-Rechten auf dem Prod-Host). `deploy-production.yml` ist gelöscht (B25 Session 15). Deploys: `deploy.yml` (GitHub-Hosted Runner → Tailscale → Deploy-User mit erzwungenem Kommando) oder `scripts/deploy.sh` von Hand. |
| **§2.2** getrennte Secret-Sets `staging`/`production` | **entfällt** | Kein Staging-Stack, daher kein Environment `staging`. Das Environment `production` hat nur `DEPLOY_SSH_KEY` (darf nur den Deploy-Wrapper starten); die Prod-Werte der App liegen nur in `/opt/portfolio/.env.prod` auf hillerhome. |
| **§6.1/§6.2** dauerhafte Staging-Umgebung | ersetzt durch **Ephemer-Umgebung in CI** | Es gibt keine dauerhafte Staging-Umgebung und wird keine geben. Siehe nächster Abschnitt. |

---

## 🔧 Workaround: DAST ohne dauerhaftes Staging (§6/§7)

Statt einer permanenten Staging-Umgebung bootet der Job **`DAST (ZAP baseline, Image)`**
in `ci-security.yml` (PR und Push auf `main`, B25 Session 16) den Stack flüchtig im Runner
und scannt **genau das Image aus dem Build-Job** (PR: Artefakt, `main`: GHCR-Digest):

1. `docker-compose.dev.yml` hoch (Postgres + Garage), `storage-init.sh`,
2. App-Container aus dem Image mit Dummy-Secrets; Migrationen beim Start
   (`prodMigrations`, §6.2/§6.3), Warten auf `/api/health`,
3. `pnpm seed` (§6.1 — repräsentative, **keine echten** Nutzerdaten),
4. **OWASP ZAP Baseline**, `fail_action: true` (§7.3), Ausnahmen in `.zap/rules.tsv` (§7.4),
5. Stack wird wieder abgebaut.

Gate §7 → §8 ist technisch: `deploy.yml` startet nur nach einem **grünen** Lauf von
„CI Security Gates“ auf `main` (inkl. DAST). Ein roter DAST auf `main` legt zusätzlich ein
Issue `[dast] ZAP-Baseline auf main fehlgeschlagen` an bzw. kommentiert es (A6, Job `dast-issue`).
Das Image hat die Prod-Werte der `NEXT_PUBLIC_*` eingebacken; Medien-URLs zeigen deshalb im
Scan auf `cdn.kilia-siebert.de`.

## 🚀 Auto-Deploy (B25 A1, Sessions 13–15)

```
PR → Gates (Gitleaks · SCA · CodeQL · tsc · Lint · Test · Build+Trivy · DAST) → Merge
main → Build: ghcr.io/marax1234/portfolio-app:<sha> + SBOM- und SLSA-Attestation (Sigstore)
     → DAST gegen den Digest → deploy.yml: Freigabe Max (Environment production)
     → gh attestation verify → Tailscale (tag:ci, OIDC) → ssh deploy@hillerhome <digest>
     → Wrapper → scripts/deploy.sh (Dump, Rollback-Tag, Smoke-Test, Auto-Rollback, ntfy)
```

Einmalige Einrichtung durch **Max** (der Agent hat Host-Seite und Workflows vorbereitet):

1. **Tailscale-ACL** (Admin-Konsole → Access controls): `tag:ci` anlegen und nur hillerhome:22
   erlauben. Eine bestehende Allow-all-Regel (`"src": ["*"]`) schließt Tag-Geräte ein und muss auf
   `autogroup:member` eingeschränkt werden:
   ```json
   "tagOwners": { "tag:ci": ["autogroup:admin"] },
   "grants": [
     { "src": ["autogroup:member"], "dst": ["*"], "ip": ["*"] },
     { "src": ["tag:ci"], "dst": ["100.88.181.87"], "ip": ["tcp:22"] }
   ]
   ```
2. **Federated Identity** (Settings → Trust credentials → Credential → OpenID Connect):
   Issuer *GitHub*, Subject `repo:Marax1234/portfolio:environment:production`, Scope
   `auth_keys` (write), Tag `tag:ci`. Client-ID und Audience sind keine Secrets:
   `gh variable set TS_OAUTH_CLIENT_ID -R Marax1234/portfolio` und `gh variable set TS_AUDIENCE …`.
3. **SSH-Key** als Environment-Secret (liegt im Tresor, nicht in der Shell-History):
   `scripts/vault stdin portfolio/deploy/ci-ssh-key -- gh secret set DEPLOY_SSH_KEY --env production -R Marax1234/portfolio`
   (im Ops-Repo).
4. Nach dem ersten Push: Package-Sichtbarkeit **öffentlich** prüfen (A2), sonst
   Package → Settings → Change visibility.

Rotation SSH-Key: neuen Key erzeugen, `scripts/vault put portfolio/deploy/ci-ssh-key --from-file …`,
Public Key in `hillerhome/deploy-authorized_keys` (Ops-Repo) + Host, Secret neu setzen.

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

# B25: weitere Required Checks ergänzen (nur Max, nachdem die Jobs auf main gelaufen sind)
gh api -X POST repos/Marax1234/portfolio/branches/main/protection/required_status_checks/contexts \
  -f 'contexts[]=Lint' -f 'contexts[]=Test' -f 'contexts[]=Build'
# optional zusätzlich: -f 'contexts[]=DAST (ZAP baseline, Image)'

# Dependabot Security Updates
gh api -X PUT repos/Marax1234/portfolio/automated-security-fixes

# Head-Branches nach dem Merge automatisch löschen, nur Squash-Merge
gh api -X PATCH repos/Marax1234/portfolio -F delete_branch_on_merge=true \
  -F allow_squash_merge=true -F allow_merge_commit=false -F allow_rebase_merge=false
```
