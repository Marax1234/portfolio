# Security Exceptions & Rotationsplan

Zentrale, versionierte Dokumentation von Risikoacceptances und Secret-Rotation.
Jeder Eintrag braucht **Begründung**, **Verantwortlichen** und **Reviewer**.
Stilles Überschreiben eines Security-Findings ist verboten (§9.4).

---

## 1. SAST-/DAST-Risikoacceptances (§5.3.5, §7.4)

Nicht behebbare High/Critical-Findings, die bewusst akzeptiert werden. Bevorzugt
wird das SARIF-Dismissal im Security-Tab mit Kommentar; größere/dauerhafte
Ausnahmen zusätzlich hier festhalten.

| Finding / Rule-ID | Tool | Begründung | Verantwortlich | Reviewer | Datum | Re-Review fällig |
|---|---|---|---|---|---|---|
| _(keine offen)_ | | | | | | |

---

## 2. Statische Secrets & Rotationsplan (§2.4)

Jedes verbleibende statische Secret (das nicht durch OIDC ersetzt werden kann,
§2.3) braucht ein Ablaufdatum und einen Verantwortlichen. Rotation **mindestens
alle 90 Tage**.

| Secret | Environment | Zweck | Verantwortlich | Letzte Rotation | Nächste fällig |
|---|---|---|---|---|---|
| `PAYLOAD_SECRET` | production | Payload-Verschlüsselung/Sessions | @Marax1234 | _einsetzen_ | _+90 Tage_ |
| `S3_SECRET_ACCESS_KEY` | production | MinIO/Object-Storage | @Marax1234 | _einsetzen_ | _+90 Tage_ |
| `POSTGRES_PASSWORD` | production | DB-Zugang | @Marax1234 | _einsetzen_ | _+90 Tage_ |
| DB-/SMTP-Credentials | production | siehe `.env.prod` | @Marax1234 | _einsetzen_ | _+90 Tage_ |

> Die tatsächlichen Werte liegen ausschließlich als GitHub Environment Secrets
> bzw. in `.env.prod` auf hillerhome (nicht im Repo, §2.1).

---

## 3. False-Positive-Ausnahmen Secret-Scan (§5.1.4)

Werden in `.gitleaks.toml` gepflegt (nicht hier dupliziert). Diese Datei
referenziert sie nur zur Übersicht.

---

## 4. Incident Response — kompromittierte Action (§3.3)

Prozess und Reaktionszeit: siehe `.github/actions-inventory.md`.
