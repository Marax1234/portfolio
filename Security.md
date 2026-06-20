Hier ist die vollständige Markdown-Datei — nur Anforderungen und Akzeptanzkriterien, kein Code:

```markdown
# CI/CD Security Checkliste
**Stack:** Next.js · Prisma · PostgreSQL · NextAuth/Auth.js · Vercel · GitHub Actions  
**Scope:** CI/CD Pipeline Security — ohne Pre-Commit und ohne Scheduled Scans  
**Stand:** 2026 | Referenz: OWASP CI/CD Cheat Sheet, GitHub Security Roadmap 2026, ASVS 5.0.0

---

## Legende

| Symbol | Bedeutung |
|---|---|
| 🔴 Must | Blocker — Pipeline darf ohne Erfüllung nicht deployen |
| 🟡 Should | Stark empfohlen — Abweichung erfordert dokumentierte Begründung |
| 🟢 Nice | Reifegradverbesserung — für spätere Iterationen |

---

## 1. Zugangskontrolle zur Pipeline

### 1.1 Repository-Berechtigungen

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 1.1.1 | Nur autorisierte Personen dürfen Workflows erstellen oder ändern | 🔴 Must | Alle Contributor-Rollen sind dokumentiert; kein externer Fork kann Workflow-Änderungen in `main` pushen ohne Review |
| 1.1.2 | Der Standardzugriff des `GITHUB_TOKEN` ist Read-Only | 🔴 Must | `permissions: read-all` auf Workflow-Ebene gesetzt; einzelne Jobs erhalten nur die minimal notwendigen Rechte explizit erteilt |
| 1.1.3 | Schreibende Permissions werden nur auf Job-Ebene und nur wo notwendig vergeben | 🔴 Must | Kein Job hat `write-all`; jedes `permissions`-Feld ist mit dem tatsächlichen Bedarf des Jobs begründbar |
| 1.1.4 | Workflows werden bei Pull Requests von Forks nicht mit privilegierten Secrets ausgeführt | 🔴 Must | `pull_request_target` wird nicht verwendet; Fork-PRs laufen ohne Zugang zu Produktions-Secrets |

### 1.2 Branch Protection (main)

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 1.2.1 | Direktes Pushen auf `main` ist verboten | 🔴 Must | Branch Protection aktiv; kein User — auch kein Admin — kann ohne PR direkt auf `main` pushen |
| 1.2.2 | Mindestens ein Review ist für PRs auf `main` Pflicht | 🔴 Must | `Required reviewers ≥ 1`; Selbst-Approval ist deaktiviert |
| 1.2.3 | Abgelaufene Reviews werden bei neuem Push invalidiert | 🔴 Must | `Dismiss stale reviews` ist aktiviert; ein neuer Commit erfordert erneute Freigabe |
| 1.2.4 | Alle definierten Security-Status-Checks müssen grün sein bevor ein Merge erlaubt ist | 🔴 Must | SAST, SCA und Secret-Scan sind als Required Status Checks eingetragen; kein Merge ohne grüne Checks möglich |
| 1.2.5 | Force-Pushes auf `main` sind deaktiviert | 🔴 Must | `Allow force pushes` deaktiviert; die Commit-History von `main` ist unveränderlich |
| 1.2.6 | Linear history ist erzwungen | 🟡 Should | `Require linear history` aktiviert; Merge-Commits von Feature-Branches sind verboten, nur Squash oder Rebase erlaubt |

---

## 2. Secret Management in der Pipeline

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 2.1 | Alle Secrets werden ausschließlich als GitHub Encrypted Secrets oder über einen Secret-Manager hinterlegt | 🔴 Must | Kein Secret, Token oder Credential steht im Klartext in einem Workflow-File, einer Variable oder einer Umgebungsdatei im Repository |
| 2.2 | Produktions-Secrets sind vom Staging-Secrets getrennt und nur im `production` Environment hinterlegt | 🔴 Must | GitHub Environments mit separaten Secret-Sets für `staging` und `production` sind angelegt; ein Staging-Job kann auf keine Production-Credentials zugreifen |
| 2.3 | Statische Long-Lived-Tokens werden durch OIDC-basierte kurzlebige Tokens ersetzt, wo immer der Provider es unterstützt | 🟡 Should | Für Cloud-Provider und Registry-Zugriffe wird OIDC Federation genutzt; statische Tokens sind auf Systeme beschränkt, die OIDC nicht unterstützen, und sind dokumentiert |
| 2.4 | Verbleibende statische Secrets werden mindestens alle 90 Tage rotiert | 🟡 Should | Rotationsplan ist dokumentiert; für jedes statische Secret gibt es ein Ablaufdatum und einen definierten Verantwortlichen |
| 2.5 | Kein Secret darf in Pipeline-Logs auftauchen | 🔴 Must | Secrets sind in GitHub als Encrypted Secrets hinterlegt und werden automatisch maskiert; Logs werden nach Builds stichprobenartig auf Leaks geprüft |
| 2.6 | Secrets werden nur in dem Job oder Step exponiert, der sie tatsächlich benötigt | 🟡 Should | Secrets sind nicht auf Workflow-Ebene als `env:` gesetzt, wenn sie nur von einem einzigen Step benötigt werden |
| 2.7 | Secret-Scanning (Push Protection) ist auf Repository-Ebene aktiviert | 🔴 Must | GitHub Push Protection ist aktiv; Pushes mit bekannten Secret-Patterns werden automatisch blockiert; Dashboard zeigt Anzahl ausgelöster Events |

---

## 3. Actions-Härtung und Supply-Chain

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 3.1 | Alle externen GitHub Actions werden auf einen unveränderlichen Commit-SHA gepinnt | 🔴 Must | Kein `uses:` Eintrag in Workflows enthält einen Tag oder Branch-Verweis; ausschließlich vollständige 40-Zeichen-SHAs werden verwendet |
| 3.2 | Alle eingesetzten Actions sind inventarisiert | 🟡 Should | Eine aktuelle Liste aller verwendeten externen Actions mit SHA, Repository-URL und letztem Review-Datum wird im Repo gepflegt |
| 3.3 | Actions werden bei bekannt gewordenen Kompromittierungen sofort auf eine verifizierte Version aktualisiert und alle Secrets werden rotiert | 🔴 Must | Es existiert ein dokumentierter Incident-Response-Prozess für kompromittierte Actions; Reaktionszeit ist definiert (z. B. 24h für kritische Actions) |
| 3.4 | Dependabot ist für Actions-Updates aktiviert | 🟡 Should | Dependabot Alerts für Actions sind aktiv; Updates werden als PRs eingereicht und vor Merge reviewed |
| 3.5 | Script-Injection durch unkontrollierte `github.*` Kontext-Werte wird verhindert | 🔴 Must | In `run:`-Steps werden keine `${{ github.event.* }}`-Ausdrücke direkt interpoliert, sondern zunächst in einer Environment-Variable gespeichert |

---

## 4. Runner-Sicherheit

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 4.1 | PR-Builds von untrusted Branches laufen auf isolierten Runners ohne Produktions-Secrets | 🔴 Must | Mindestens zwei Runner-Pools existieren: einer für untrusted PRs (z. B. von Forks) ohne sensible Credentials, einer für `main`-Builds mit Zugang zu Deployment-Secrets |
| 4.2 | Self-Hosted Runner werden nicht für öffentliche Repositories verwendet | 🔴 Must | Falls Self-Hosted Runner eingesetzt werden, ist das Repository auf `private` gesetzt; für öffentliche Repos werden ausschließlich GitHub-Hosted Runner genutzt |
| 4.3 | Runner akkumulieren keinen State über mehrere Builds hinweg | 🟡 Should | Jeder Runner-Job startet in einer frischen, zustandslosen Umgebung; persistente Runner-Daten zwischen Jobs sind dokumentiert und auf das Notwendigste beschränkt |

---

## 5. Security-Gates im CI

### 5.1 Secret Scan Gate

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 5.1.1 | Ein automatisierter Secret-Scan läuft bei jedem PR und bei jedem Push auf `main` | 🔴 Must | Der Secret-Scan-Job ist als Required Status Check eingetragen; er scannt die vollständige Diff des Branches |
| 5.1.2 | Der Secret-Scan deckt mindestens API-Keys, Tokens, Passwörter und Connection Strings ab | 🔴 Must | Das eingesetzte Tool (z. B. Trufflehog oder Gitleaks) ist mit einem regelbasierten Profil konfiguriert, das die genannten Kategorien abdeckt |
| 5.1.3 | Ein Fund im Secret-Scan blockiert den Merge | 🔴 Must | Der Job bricht mit Exit-Code ungleich 0 ab; der PR kann nicht gemergt werden, bis der Fund beseitigt und ein Re-Run erfolgreich ist |
| 5.1.4 | False-Positive-Ausnahmen sind explizit dokumentiert und versioniert | 🟡 Should | Ausnahmen (z. B. Test-Fixtures) werden in einer Konfigurationsdatei des Tools gepflegt, nicht durch Deaktivierung des Checks umgangen; jede Ausnahme enthält einen Kommentar mit Begründung und Verantwortlichen |

### 5.2 SCA Gate (Software Composition Analysis)

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 5.2.1 | Ein automatisierter Dependency-Scan läuft bei jedem PR und bei jedem Push auf `main` | 🔴 Must | Der SCA-Job ist als Required Status Check eingetragen |
| 5.2.2 | Critical- und High-CVEs in Produktions-Dependencies blockieren den Merge | 🔴 Must | Der Job bricht bei `--audit-level=high` ab; kein PR mit offenen High/Critical CVEs in `dependencies` (nicht `devDependencies`) kann gemergt werden |
| 5.2.3 | Medium-Findings erzeugen ein Issue, blockieren aber nicht sofort | 🟡 Should | Medium-Findings werden automatisch als GitHub Issue mit Label `security` und 30-Tage-Fix-Deadline angelegt |
| 5.2.4 | `devDependencies` werden separat bewertet und blockieren nur bei Critical | 🟡 Should | Das Audit-Profil unterscheidet zwischen Production- und Dev-Dependencies; Dev-kritische Findings werden als Issue geöffnet, nicht als Gate |

### 5.3 SAST Gate (Static Application Security Testing)

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 5.3.1 | Ein automatisierter SAST-Scan läuft bei jedem PR und bei jedem Push auf `main` | 🔴 Must | Der SAST-Job ist als Required Status Check eingetragen |
| 5.3.2 | Das SAST-Tool analysiert JavaScript/TypeScript inklusive Next.js-spezifischer Regeln | 🔴 Must | Das Tool (CodeQL oder Semgrep) ist mit einem Regelsatz konfiguriert, der Next.js-, React- und Node.js-Patterns abdeckt |
| 5.3.3 | SAST-Findings werden als SARIF in den GitHub Security Tab hochgeladen | 🟡 Should | Findings sind zentral im Security → Code Scanning Tab sichtbar, nicht nur in Job-Logs |
| 5.3.4 | High- und Critical-SAST-Findings blockieren den Merge | 🔴 Must | Der Job bricht bei High- oder Critical-Findings ab; kein Merge ohne Bereinigung oder dokumentierte Risikoacceptance mit Approval |
| 5.3.5 | Risikoacceptance für nicht behebbare Findings ist dokumentiert | 🟡 Should | Nicht behebbare Findings werden mit Begründung, Verantwortlichem und Reviewer in einer `security-exceptions.md` oder über das SARIF-Dismissal-Feature mit Kommentar festgehalten |

### 5.4 TypeScript Strict Check Gate

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 5.4.1 | Der Build schlägt bei TypeScript-Fehlern fehl | 🔴 Must | `tsc --noEmit --strict` ist als Required Status Check eingetragen; Type-Fehler blockieren den Merge |

---

## 6. Staging-Deploy Gate

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 6.1 | Es existiert eine dedizierte Staging-Umgebung, die produktionsidentisch konfiguriert ist, aber keine echten Nutzerdaten enthält | 🔴 Must | Staging verwendet eigene Secrets, eine eigene Datenbank und eine eigene Vercel-Preview-URL; echte Produktionsdaten sind in Staging nicht vorhanden |
| 6.2 | Prisma Migrations werden auf Staging ausgeführt und geprüft, bevor Production deployed wird | 🔴 Must | Der Deploy-Job für Production hat eine explizite `needs`-Abhängigkeit auf den Staging-Deploy und DAST-Job; ohne erfolgreichen Staging-Deploy kein Production-Deploy |
| 6.3 | `prisma migrate deploy` wird in CI verwendet, niemals `prisma migrate dev` | 🔴 Must | Kein Workflow-File enthält den Befehl `migrate dev`; dieser Befehl ist nur für lokale Entwicklung geeignet |

---

## 7. DAST Gate (Dynamic Application Security Testing)

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 7.1 | Ein automatisierter DAST-Scan läuft gegen die Staging-URL nach jedem Staging-Deploy auf `main` | 🔴 Must | Der DAST-Job ist nach dem Staging-Deploy-Job eingetragen und muss erfolgreich abgeschlossen sein, bevor der Production-Deploy startet |
| 7.2 | Der DAST-Scan prüft mindestens: XSS, SQLi-Patterns, fehlende Security-Header, CSRF-Indikatoren, offene Redirects, unsichere Cookies | 🔴 Must | Das eingesetzte Tool (z. B. OWASP ZAP Baseline Scan) ist mit einem Regelwerk konfiguriert, das die genannten Kategorien abdeckt; der Report weist für jeden Check einen Status aus |
| 7.3 | High- und Critical-DAST-Findings blockieren den Production-Deploy | 🔴 Must | Der DAST-Job bricht bei solchen Findings ab; kein Production-Deploy ohne grünen DAST-Job |
| 7.4 | Known-Informational und akzeptierte Low-Findings sind in einer Konfigurationsdatei explizit ignoriert | 🟡 Should | Eine versionierte Ignore-Liste (z. B. `.zap/rules.tsv`) ist im Repo, enthält nur begründete Ausnahmen und wird regelmäßig reviewed |
| 7.5 | Der DAST-Scan läuft gegen eine authentifizierte Session, wenn die App Login besitzt | 🟡 Should | DAST-Scan nutzt einen dedizierten Test-User mit minimalen Rechten; auch geschützte Routen werden geprüft |

---

## 8. Production-Deploy Gate

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 8.1 | Production-Deploy ist ein eigenes GitHub Environment mit explizitem Required Reviewer | 🔴 Must | Im GitHub Environment `production` ist mindestens ein Required Reviewer eingetragen; kein automatisches Deploy ohne menschliche Approval möglich |
| 8.2 | Der Production-Deploy-Job hat eine explizite Abhängigkeit auf alle Security-Gates | 🔴 Must | Der Deploy-Job listet alle Security-Jobs in `needs:` auf; ein fehlgeschlagener Gate-Job verhindert den Deploy automatisch |
| 8.3 | Production-Deploys auf Prisma-Migrations prüfen vor dem Ausführen | 🟡 Should | Ein Dry-Run oder Migration-Check-Step prüft ausstehende Migrations und gibt sie im Log aus, bevor `migrate deploy` ausgeführt wird |

---

## 9. Audit-Logging und Nachvollziehbarkeit

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 9.1 | Jeder Build-Run ist einem Commit, einem Auslöser (User oder Event) und einem Zeitstempel zuordenbar | 🔴 Must | GitHub Actions Audit Log enthält für jeden Workflow-Run: auslösenden User oder Event, Commit-SHA, Branch und Zeitstempel |
| 9.2 | Jede Approval für Production-Deploy ist protokolliert | 🔴 Must | GitHub Environment-Deployment-Logs zeigen, wer wann die Production-Freigabe erteilt hat |
| 9.3 | Pipeline-Konfigurationsänderungen (Workflow-Files) sind durch Review und Commit-History nachvollziehbar | 🔴 Must | Änderungen an `.github/workflows/` sind nicht direkt auf `main` möglich (Branch Protection); alle Änderungen gehen durch PR mit Reviewer |
| 9.4 | Security-Gate-Overrides sind dokumentiert und genehmigt | 🟡 Should | Wenn ein Security-Finding als Risikoacceptance übergangen wird, ist das im PR mit Reviewer-Approval und Begründung festgehalten; kein stilles Überschreiben |
| 9.5 | Build-Logs werden für mindestens 90 Tage aufbewahrt | 🟡 Should | GitHub Actions Log Retention ist auf mindestens 90 Tage eingestellt; für Compliance-relevante Deployments auf 12 Monate |

---

## 10. Nightly Full Scan (Scheduled)

> Dieser Block gilt für den täglich automatisierten Scan-Lauf, der unabhängig von PRs und Deploys läuft.

### 10.1 Vollständiger Dependency Audit

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 10.1.1 | Der Scan läuft täglich vollständig gegen den aktuellen `main`-Branch | 🔴 Must | Der Cron-Workflow ist konfiguriert und manuell auslösbar (`workflow_dispatch`); er läuft auch ohne aktiven Entwicklungsbetrieb |
| 10.1.2 | Der Scan prüft alle Dependencies ohne Level-Filter und erzeugt einen vollständigen Report | 🔴 Must | Im Gegensatz zum PR-Gate scannt der Nightly-Lauf ohne `--audit-level`-Einschränkung; der vollständige JSON-Report wird als Artefakt archiviert |
| 10.1.3 | Neu entdeckte High/Critical CVEs erzeugen automatisch ein GitHub Issue | 🔴 Must | Der Job öffnet bei neuen Findings automatisch ein Issue mit CVE-ID, betroffener Library, CVSS-Score und einem Link zum Advisory; Duplikate werden verhindert |
| 10.1.4 | Reports werden mindestens 30 Tage als Pipeline-Artefakt aufbewahrt | 🟡 Should | Artefakt-Retention ist auf mindestens 30 Tage gesetzt |

### 10.2 Vollständiger SAST-Scan

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 10.2.1 | Der Nightly-SAST-Scan analysiert die gesamte Codebasis, nicht nur den Diff | 🔴 Must | Der Scan läuft gegen den vollständigen `main`-Branch ohne Diff-Beschränkung |
| 10.2.2 | Ergebnisse werden im Security Tab aggregiert und sind mit PR-Gate-Scans vergleichbar | 🟡 Should | SARIF-Upload ist auch für den Nightly-Lauf aktiv; Trends über Zeit sind im Security Tab sichtbar |

### 10.3 DAST Full Scan

| # | Anforderung | Priorität | Akzeptanzkriterium |
|---|---|---|---|
| 10.3.1 | Ein DAST Full Scan läuft täglich gegen die Produktions-URL | 🔴 Must | Der Nightly-DAST läuft gegen Production (im Gegensatz zum Deploy-Gate, das gegen Staging läuft); er nutzt einen DAST Full Scan statt Baseline Scan |
| 10.3.2 | Neue Findings gegenüber dem letzten Lauf erzeugen ein GitHub Issue | 🔴 Must | Der Job vergleicht Findings mit dem Vorlauf und öffnet nur bei neuen Findings ein Issue; kein Noise durch bereits bekannte und akzeptierte Findings |
| 10.3.3 | Der Nightly-DAST bricht die Pipeline nicht ab, erzeugt aber zwingend einen Report | 🟡 Should | `fail_action: false` für Production-DAST; Findings werden als Issue behandelt, nicht als Deploy-Blocker, da Production bereits deployed ist |
| 10.3.4 | Reports werden als Artefakt archiviert | 🟡 Should | HTML- und JSON-Reports des DAST Full Scans werden als Pipeline-Artefakt mindestens 30 Tage aufbewahrt |

---

## Zusammenfassung: Quality-Gate-Architektur

```
PR erstellt
   │
   ├─ [Gate] Secret Scan         → 🔴 Blocker bei Fund
   ├─ [Gate] SCA npm audit       → 🔴 Blocker bei High/Critical
   ├─ [Gate] SAST CodeQL         → 🔴 Blocker bei High/Critical
   └─ [Gate] TypeScript Strict   → 🔴 Blocker bei Fehler
   │
   ▼ Alle Gates grün → Merge erlaubt
   │
   ▼ Push auf main
   │
   ├─ Build
   ├─ DB Migration (Staging)
   ├─ Deploy Staging
   ├─ [Gate] DAST Baseline Scan  → 🔴 Blocker bei High/Critical
   └─ [Gate] Human Approval      → 🔴 Required Reviewer
   │
   ▼ Approval erteilt
   │
   └─ Deploy Production

Täglich (Cron):
   ├─ Vollständiger Dependency Audit → Issue bei neuen High/Critical
   ├─ Vollständiger SAST-Scan        → SARIF Upload, Issue bei Neuem
   └─ DAST Full Scan gegen Prod      → Report + Issue bei Neuem
```

---

## Referenzen

- OWASP CI/CD Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html
- GitHub Actions Secure Use Reference 2026: https://docs.github.com/en/actions/reference/security/secure-use
- GitHub Actions Security Roadmap 2026: https://github.blog/news-insights/product-news/whats-coming-to-our-github-actions-2026-security-roadmap/
- Trivy Supply Chain Compromise März 2026: https://devoriales.com/trivy-supply-chain-attack-when-your-security-scanner-becomes-the-threat
- OWASP ASVS 5.0.0 (Mai 2025): https://owasp.org/www-project-application-security-verification-standard/
```

Die Datei kannst du direkt als `ci-cd-security-checklist.md` speichern.  Die Gate-Architektur am Ende gibt dir auf einen Blick das Flussdiagramm vom PR bis zum Production-Deploy mit allen Blockern. [safeguard](https://safeguard.sh/resources/blog/ci-cd-audit-pipeline-checklist-2026)