# Sprintplan — Portfolio Kilian Siebert (Entwicklung)

**Dokumenttyp:** Entwicklungs-Sprintplan, ausgerichtet auf KI-agentische Umsetzung.
**Scope dieses Dokuments:** Reine Entwicklung. Jeder Sprint erzeugt ein testbares, anschaubares Inkrement. Deployment/Produktivbetrieb ist hier bewusst **out of scope** und nur im Ausblick (Abschnitt „Ausblick: Post-Development“) skizziert.
**Form:** Kein Code. Nur Anforderungen, Akzeptanzkriterien, In-/Out-of-Scope und Übergabe-Hinweise.

---

## 0. Arbeitsregeln für den umsetzenden Agenten

Diese Regeln gelten in **jedem** Sprint und stehen über den Einzelanforderungen.

### 0.1 Design ist die zentrale Wissensbasis
- Die Datei `design.md` (Design-System „Tonal Serenity“ / „Synesthetic Light“) liegt im Repository und ist die **verbindliche Quelle** für Farben, Typografie, Radien, Spacing, Elevation, Shapes und Komponentenverhalten.
- Der Agent liest `design.md` **vor jeder UI-Arbeit** erneut ein und leitet keine Werte aus dem Gedächtnis ab.
- Ebenfalls verbindliche Wissensbasis: `portfolio-konzept-kilian-siebert.md` (Seitenstruktur, UX, Tone of Voice) und `tech-stack-konfiguration.md` (Architektur). Bei Konflikten gilt: Architektur aus dem Tech-Stack-Dokument, Optik aus dem Design-Dokument, Inhalt/UX aus dem Konzept-Dokument.

### 0.2 Design wird zentral gesteuert (harte Anforderung, sprintübergreifend)
- **Single Source of Truth für Design-Tokens.** Alle Werte aus `design.md` werden **einmalig** in eine zentrale Token-/Theme-Quelle überführt (Farben, Typo-Skala, Radien, Spacing, Elevation). Komponenten, Seiten, Blöcke und Widgets greifen **ausschließlich** auf diese Tokens zu.
- **Keine Hardcodes.** Kein Hex-Wert, keine px-Schriftgröße, kein Radius darf direkt in einer Komponente stehen. Ausnahmen sind nicht erlaubt und gelten in jeder Sprint-Abnahme als Fehler.
- **Appweit änderbar an einem Ort.** Eine Änderung in der zentralen Token-Quelle muss sich automatisch auf die gesamte App auswirken (alle Seiten, alle Komponenten, Admin-nahe UI soweit zutreffend).
- **Token-Abnahmetest in jedem UI-Sprint:** Ein/zwei Token-Werte testweise ändern → die Änderung schlägt überall durch → zurücksetzen. Ist das nicht der Fall, gilt der Sprint als nicht abgenommen.

### 0.3 Dokumentations-Beschaffung über Context7 (Docs-Skill)
- Bei **Unsicherheit über eine API**, bei **neuer Tool-Integration** oder bei **Versionsfragen** lädt der Agent zuerst die aktuelle Dokumentation über die **Context7 CLI** (Docs-Skill) herunter und arbeitet gegen diese — nicht gegen Trainingswissen.
- Pflicht-Trigger für Context7: erster Kontakt mit Next.js 16 App Router / RSC, Payload 3 (Collections, Blocks, Live Preview, Storage-Plugin, Form-Builder), HLS-Player, Object-Storage-/S3-Anbindung, FFmpeg-Parameter.
- Jeder Sprint, der ein neues Tool einführt, beginnt mit dem Schritt: „Aktuelle Doku via Context7 ziehen, Versionsstand notieren.“

### 0.4 Versionsdisziplin
- Festgelegt: **Next.js 16**, **Payload 3.x**, PostgreSQL, S3-kompatibler Storage. Versionen werden dokumentiert; Updates kontrolliert nachgezogen, nicht blind auf „latest“.

### 0.5 Modularität & Vorausschau (zukünftige Sprints mitdenken)
- Jede Komponente wird so gebaut, dass ihre **Datenquelle austauschbar** ist (Schnittstelle statt fester Anbindung). Konkret: was in frühen Sprints aus lokalem Mock/Fallback kommt, wird später ohne UI-Umbau gegen die echte Quelle getauscht.
- **Medien-Beispiel (durchgängiger roter Faden):** Ab Sprint 1 werden Bilder über eine **Medien-Abstraktion** angesprochen. Frühe Sprints nutzen einen **lokalen Datei-Fallback-Speicher**; ein späterer Sprint ersetzt diesen durch den echten Object-Storage/Media-Server — **ohne** dass aufrufende Komponenten geändert werden müssen.
- Jeder Sprint endet mit einer **kurzen Übergabe** (siehe 0.7), die explizit benennt, welche Platzhalter/Fallbacks später ersetzt werden.

### 0.6 Definition of Done (gilt für jeden Sprint)
- Inkrement ist **lokal startbar** und im Browser **anschaubar**.
- Alle neuen UI-Elemente beziehen Design ausschließlich aus den zentralen Tokens (0.2).
- Akzeptanzkriterien des Sprints erfüllt und manuell durchgeklickt.
- Responsive geprüft: **mobil zuerst**, dann Desktop (Konzept ist Mobile-First).
- Keine offensichtlichen Konsolen-/Build-Fehler.
- Übergabe-Notiz geschrieben (0.7).

### 0.7 Übergabe-Notiz pro Sprint (Pflichtartefakt)
Am Ende jedes Sprints ein kurzer Abschnitt mit:
1. Was ist jetzt anschaubar/testbar (1–3 Sätze).
2. Welche Platzhalter/Fallbacks existieren und in welchem Sprint sie ersetzt werden.
3. Welche Schnittstellen/Verträge neu definiert wurden (damit Folge-Sprints daran andocken).
4. Bekannte offene Punkte / bewusste Auslassungen.

---

## 1. Sprint-Überblick

| Sprint | Titel | Inkrement (anschaubar) |
|---|---|---|
| 1 | Fundament & Design-System-Kern | Leere App mit zentralem Theme, Token-Demoseite, Medien-Abstraktion mit lokalem Fallback |
| 2 | Globale Bausteine & Navigation | Sticky-Nav, Footer, Layout-Grid, Kernkomponenten (Karte, Button, Fakten-Strip) als Galerie |
| 3 | Statische Startseite | Komplette Startseite mit Platzhalterinhalten, alle Module sichtbar |
| 4 | Payload-Datenmodell & Admin | Admin-Panel läuft, Collections angelegt, Inhalte pflegbar (No-Code) |
| 5 | Datengetriebene Seiten + ISR | Start/Arbeiten/Über/Detailseiten ziehen echte Inhalte aus Payload, Auto-Aktualisierung |
| 6 | Journal mit Blocks & Live Preview | Frei baubare Journal-Beiträge per Block-System, Echtzeit-Vorschau |
| 7 | Bild-Pipeline & Object Storage | Lokaler Fallback wird durch echten Object-Storage + responsive Bildvarianten ersetzt |
| 8 | Video-Loops & HLS-Wiedergabe | Hero-Loop und Video-Blöcke, adaptive Wiedergabe, Poster-Fallback |
| 9 | Kontakt, Inbox & Kooperationen | Kontaktformular → Inbox-Collection + Mail-Benachrichtigung, Kooperationen-Seite |
| 10 | Politur, Statistik-Hook, Härtung | Statistik-Anbindung (UI-seitig), Performance, A11y, Konsistenz-Endabnahme |

> Reihenfolge richtet sich nach dem Konzept (Abschnitt 8: „Phase 1 kundentauglich“ zuerst). Journal und Kooperationen kommen bewusst später, bleiben aber technisch vorbereitet.

---

## 2. Die Sprints im Detail

---

### Sprint 2 — Globale Bausteine & Navigation

**Ziel:** Die wiederkehrenden Bausteine aus dem Konzept (Abschnitt 5) existieren als zentrale, design-konforme Komponenten.

**Anforderungen**
- **Layout-Grid** gemäß Design: 12-Spalten-Logik, Margins (mobil 20px / Desktop 64px), Gutter 24px, Section-Gap 120px, „Breathable Spacing“.
- **Sticky-Nav:** Name links, vier Links rechts; schrumpft beim Scrollen; mobil Hamburger oder Bottom-Bar. Reduziert, ruhig.
- **Footer:** Kontakt, Social-Links, Sitemap-Kurzversion, **Impressum & Datenschutz** (DE-Pflicht, gehört in Footer, nicht in Hauptnav).
- **Kernkomponenten** (alle token-basiert):
  - Buttons: Primary (Sage, Cream-Text), Secondary (Ghost, Mist-Blue-Border).
  - Story-/Projekt-Karte (gemeinsames Bauteil für Journal & Arbeiten): Cover + Titel + Mini-Info, Hover-Verhalten.
  - Fakten-Strip (3–4 Zahlen, wiederverwendbar).
  - Geteilter CTA-Block („Anfragen“ vs. „Zusammenarbeiten“).
  - Glassmorphism-Card (frosted, 16px Blur, 1px-Border statt Schatten).
- **Komponenten-Galerie** (interne Route): zeigt alle Bausteine in mobil/Desktop.

**Akzeptanzkriterien**
- Jede Komponente bezieht 100% ihres Stylings aus den Tokens (kein Hardcode).
- Nav-Schrumpfverhalten und mobile Variante funktionieren.
- Footer enthält Impressum/Datenschutz-Platzhalterlinks.
- **Zentralitäts-Test** erneut bestanden (Radius- oder Farbänderung schlägt galerieweit durch).

**Out of Scope**
- Reale Inhalte, CMS-Anbindung, echte Seiten.

**Context7-Pflicht:** nur falls neue UI-Bibliothek eingeführt wird.

**Übergabe-Hinweis:** Karte und CTA-Block sind die wiederverwendeten Bauteile für Start/Arbeiten/Journal — Folge-Sprints bauen darauf auf, nicht neu.

---

## 3. Querschnittliche Akzeptanz (gilt für die gesamte Entwicklung)

- **Design-Zentralität:** In jeder Abnahme wird der Token-Wechsel-Test gemacht. Hardcodes sind ein Abnahme-Blocker.
- **Mobile-First:** Jede Seite zuerst mobil, dann Desktop.
- **Keine Sackgassen:** Jede Detailseite verlinkt sinnvoll weiter.
- **Modularität:** Datenquellen sind hinter Schnittstellen austauschbar (belegt durch Sprint 7).
- **Context7 zuerst:** Bei jeder Unsicherheit/neuen Integration aktuelle Doku ziehen, bevor gebaut wird.
- **Übergabe-Notiz:** Pflichtartefakt am Ende jedes Sprints.

---

## 4. Ausblick: Post-Development (NICHT Teil dieses Plans)

Nur zur Orientierung, bewusst nicht ausgearbeitet:

- **Deployment/Betrieb:** Hetzner-VPS, Docker Compose (App, PostgreSQL, MinIO, Umami, Caddy), Caddy als Reverse Proxy mit Auto-HTTPS.
- **CDN:** Pull-Zone vor den Object Storage (der einzige bewusst nicht selbst betriebene Auslieferungs-Baustein).
- **Statistik produktiv:** Umami/Plausible-Container scharf schalten, Kennzahlen ins Admin holen.
- **E-Mail produktiv:** transaktionaler Anbieter konfigurieren.
- **Betrieb:** Backups (PostgreSQL-Dumps + Storage), Updates (erst Test-, dann Prod-Umgebung), Monitoring, getrennte Dev-/Prod-Umgebungen.
- **Optionaler Sonderfall Video:** Falls FFmpeg-Pipeline zu wartungsintensiv wird, Managed-Video-Dienst — ohne Eingriff in den restlichen Stack.

---

*Grundlage: `portfolio-konzept-kilian-siebert.md`, `design.md`, `tech-stack-konfiguration.md`. Festgelegter Stack: Next.js 16 + Payload 3.x, PostgreSQL, S3-kompatibler Storage. Design-System „Tonal Serenity / Synesthetic Light“ ist die zentrale, im Repo liegende Wissensbasis.*
