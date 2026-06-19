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
 
### Sprint 10 — Politur, Statistik-Hook, Härtung
 
**Ziel:** Konsistenz, Performance, Zugänglichkeit und der Admin-seitige Statistik-Hook — das Produkt ist abnahmereif für die Deployment-Phase.
 
**Anforderungen**
- **Statistik-Anbindung (UI-seitig):** cookieloses Tracking vorbereitet; wichtigste Kennzahlen (Aufrufe, Quellen, beliebte Inhalte) als Ansicht im Admin-Bereich vorgesehen. Der Statistik-Dienst selbst (Umami/Plausible) wird im Deployment betrieben; hier nur die App-seitige Integration/Schnittstelle.
- **Performance-Pass:** Bild-/Video-Lazy-Loading, Poster-Frames, keine Layout-Sprünge, schneller erster Eindruck (Konzept: „Performance ist Pflicht“).
- **Accessibility-Pass:** Tastaturbedienung der Nav/Formulare, Fokuszustände, ausreichende Kontraste (im Rahmen des Designs), Alt-Texte aus dem Medienmodell.
- **Design-Konsistenz-Endabnahme:** vollständiger Durchgang aller Seiten gegen `design.md`; finaler **Zentralitäts-Test** (globaler Token-Wechsel schlägt appweit durch).
- **Tone-of-Voice-Check** aller Platzhaltertexte gegen Konzept Abschnitt 7.
- Saubere 404/Leerzustände (z.B. leeres Journal), keine Sackgassen.
**Akzeptanzkriterien**
- Statistik-Ansicht im Admin sichtbar (auch wenn Datenquelle erst im Deployment scharf geschaltet wird).
- Performance- und A11y-Checkliste durchlaufen und dokumentiert.
- Globaler Token-Wechsel verändert die gesamte App konsistent.
- Alle Seiten aus dem Konzept vorhanden, verlinkt, ohne Sackgassen.
**Out of Scope**
- Produktiver Betrieb von Statistik-Dienst, CDN, Domain, Backups, Monitoring (alles Deployment).
**Übergabe-Hinweis:** Übergang zur Deployment-Phase. Liste der Dev-Platzhalter, die produktiv ersetzt werden, ist vollständig dokumentiert.
 
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
