# Sprint-9-Übergabe — Kontakt, Inbox & Kooperationen

**Datum:** 2026-06-18
**Status:** Abgenommen

---

## 1. Was ist jetzt anschaubar / testbar

- **`pnpm db:up` → `pnpm seed` → `pnpm dev`** → `http://localhost:3000`:
  - **`/kontakt`:** Headline "Lass uns reden.", Formular (Name, E-Mail, Dropdown
    "Worum geht's?", Nachricht), direkte Mail-Zeile, Erwartungs-Satz "Ich antworte
    meist innerhalb von 24 h.", Footer-SplitCTA. Honeypot + Timing-Schutz aktiv.
  - **`/kooperationen`:** Headline "Zusammenarbeit.", Einleitung, Services- / Fuer-wen-
    Liste (aus Seed), schlanke Platzhalter-Seite. FactsStrip und bisherige
    Kooperationen erscheinen sobald Daten im Admin befuellt sind. Media-Kit-
    Download-Slot vorhanden (PDF-Datei austauschbar).
  - **Admin → Kontaktanfragen:** Neue Submissions erscheinen hier mit Spalten
    Name, E-Mail, Kategorie, Gelesen, Timestamp. Sortierbar nach Kategorie.
  - **Admin → Kooperationen-Seite:** Inhalte (Intro, Services, Reichweite-Zahlen,
    bisherige Kooperationen, Media-Kit-Upload) editierbar ohne Code-Aenderung.
  - **Admin → Dokumente:** neue Upload-Collection fuer PDFs (Media-Kit);
    Uploads landen via S3-Plugin in MinIO/Object Storage.
  - **E-Mail-Benachrichtigung (Dev):** Der nodemailerAdapter legt beim Start
    automatisch einen Ethereal-Test-Account an — die Preview-URL erscheint in
    den Payload-Logs (`pnpm dev`). Eine Test-Anfrage via Formular → Eintrag in
    Kontaktanfragen + Preview-URL im Log = Akzeptanzkriterium erfuellt.
- **`pnpm build`** erfolgreich; `/kontakt` und `/kooperationen` als `○ (Static)`
  prebuild (SSG, kein externer Datenfetch beim Request).
- **Token-/Hex-Audit:** beide Greps leer. `pnpm check` gruen.

---

## 2. Platzhalter / Fallbacks (und wann sie ersetzt werden)

| Platzhalter | Datei / Stelle | Ersetzt in |
|---|---|---|
| Ethereal-Test-Account (kein echter Versand) | `src/payload.config.ts` `buildEmailAdapter()` — nur wenn `SMTP_HOST` fehlt | Deployment (SMTP-Anbieter konfigurieren, `.env.example` documentiert `SMTP_HOST/PORT/USER/PASS`) |
| `SOCIAL_LINKS` mit `href: "#"` — auf /kontakt nur sichtbar wenn `href !== "#"` | `src/lib/navigation.ts` | Sprint 10 oder manuell befuellbar |
| Kooperationen-Seite ohne Reichweite-Zahlen und bisherige Koops | Seed-Defaults + Admin-Felder sind leer | Per Admin-Pflege, kein Code-Aufwand |
| Media-Kit-Slot ohne PDF | `CooperationsPage.mediaKit` (null) → Download-Button ausgeblendet, Platzhalter-Text | Admin → Dokumente → PDF hochladen → Admin → Kooperationen-Seite verknuepfen |
| Ethereal erzeugt pro Worker-Prozess einen neuen Account (18 beim Build) | nodemailerAdapter ohne transport — erwartet; in Prod: ein Account via SMTP | Deployment |

---

## 3. Schnittstellen / Vertraege (Folge-Sprints docken hier an)

### `ContactSubmissions` — `src/collections/ContactSubmissions.ts`
Felder: `name` (text, req.), `email` (email, req.), `category` (select: hochzeit/reise/marke/sonstiges, req.), `message` (textarea, req.), `read` (checkbox, default false). `access.create: () => true` (oeffentlich). afterChange-Hook: `notifyContactSubmission`. Keine Revalidierung (keine oeffentliche Seite).

### `submitContact` — `src/app/(frontend)/kontakt/actions.ts`
Server Action: `(prevState: ContactFormState, formData: FormData) => Promise<ContactFormState>`. Honeypot-Feld `website`, Timing-Feld `_ts`. Gibt `{ ok: true }` oder `{ ok: false, errors: Record<string, string> }` zurueck. Legt via Local API einen Eintrag an (afterChange → Mail).

### `notifyContactSubmission` — `src/hooks/notify.ts`
`CollectionAfterChangeHook`. Feuert nur bei `operation === "create"` und `!context.disableRevalidate`. Ruft `req.payload.sendEmail(...)` auf. Fehler werden geloggt, nie hochgeworfen.

### `CooperationsPage` (Global) — `src/globals/CooperationsPage.ts`
Slug: `cooperations-page`. Felder: `intro`, `services[]`, `industries[]`, `reachFacts[]` ({value, label}), `priorCooperations[]` ({name, note, logo}), `mediaKit` (upload, relationTo: documents), `mediaKitLabel`. afterChange: `revalidateCooperationsPage` (Tag `cooperations-page`, Pfad `/kooperationen`).

### `Documents` — `src/collections/Documents.ts`
Upload-Collection, `mimeTypes: ["application/pdf"]`, kein `imageSizes`. S3-Plugin routet unter `documents/<file>`. Slug: `documents`. Feld `alt` (text, optional). URL via `generateFileURL` → `NEXT_PUBLIC_S3_PUBLIC_URL/...`.

### `getCooperationsPage()` — `src/lib/payload.ts`
`unstable_cache` mit Tag `cooperations-page`, depth 1 (Logo + Media-Kit populiert). Invalidiert durch `revalidateCooperationsPage`-Hook.

### E-Mail-Konfiguration
`buildEmailAdapter()` in `src/payload.config.ts`: kein `SMTP_HOST` → Ethereal; mit `SMTP_HOST` → nodemailerAdapter `transportOptions`. Env-Keys: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `CONTACT_NOTIFY_TO`.

---

## 4. Verifikation durchgeführt

- **Context7 (§0.3):** Payload Form-Builder + Nodemailer-Adapter (`/payloadcms/payload`) vor der Umsetzung gezogen. `nodemailerAdapter` mit `transportOptions`-Variante verwendet (kein direkter nodemailer-Import noetig).
- **Token-Audit:** beide Greps leer (kein Hardcode). `pnpm check` gruen (tsc + eslint).
- **Build:** `pnpm build` erfolgreich. Beide neuen Routen `/kontakt` + `/kooperationen` als `○ (Static)` gebaut.
- **Token-Abnahmetest:** Beide Seiten verwenden ausschliesslich Tailwind-Utilities aus `@theme inline` (`type-*`, `text-*`, `bg-*`, `border-*`, `rounded-*`). Eine Aenderung an einem `:root`-Token in `globals.css` schlaegt automatisch auf alle Komponenten durch — die Seiten enthalten keine eigenen Werte.
- **Kein visueller Browser-Check** — wie Sprint 3–8, REST/Build-basierte Verifikation (kein Headless-Chromium verfuegbar).

---

## 5. Bekannte offene Punkte / bewusste Auslassungen

- **Ethereal pro Build-Worker:** Beim `pnpm build` erzeugt jeder der 18 Parallelworker (der Payload initialisiert) einen eigenen Ethereal-Account. Das ist rein dev-seitig, kein Problem. In Produktion gibt es nur einen Worker (oder SMTP loest es).
- **Social Links `href="#"`** auf `/kontakt` nur sichtbar wenn ein echter Link gesetzt ist. Navigation.ts bleibt fuer Sprint 10 oder manuelle Pflege.
- **Kooperationen schlanker Stand:** Reichweite-Zahlen, bisherige Kooperationen und Media-Kit sind leer bis sie manuell im Admin befuellt werden. Die Seite zeigt in diesem Zustand die Einleitung, Services/Fuer-wen und den Anfrage-CTA.
- **Kein Browser-Screenshot** — wie Sprint 3–8.
