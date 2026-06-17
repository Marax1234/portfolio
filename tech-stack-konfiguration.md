# Tech-Stack-Konfiguration — Portfolio Kilian Siebert

**Architektur-Spezifikation.** Dieses Dokument beschreibt den festgelegten Stack, die Konfiguration jeder Komponente und welche Anforderung damit gelöst wird. Es ist als Briefing für die Umsetzung gedacht — bewusst ohne Code.

Festgelegter Kern: **Next.js 16 + Payload 3 in einem Codebase**, selbst gehostet auf einem Hetzner-VPS, Medien über Object Storage + CDN. Rollenverteilung: dein Freund baut, du befüllst später ausschließlich über das Payload-Admin (No-Code).

---

## 1. Architektur auf einen Blick

```
                          Besucher (mobil/desktop)
                                   │
                                   ▼
                        ┌────────────────────┐
                        │   CDN (Bunny/CF)    │  ← liefert Bilder & Video-Segmente
                        └─────────┬──────────┘     schnell und cache-nah
                                   │ (HTML/Anfragen durchgereicht)
                                   ▼
        ┌──────────────────────────────────────────────────┐
        │              Hetzner VPS (Docker)                  │
        │                                                    │
        │   ┌──────────┐   reverse proxy + Auto-HTTPS        │
        │   │  Caddy   │◄──────────────────────────────┐     │
        │   └────┬─────┘                               │     │
        │        ▼                                     │     │
        │   ┌─────────────────────────┐                │     │
        │   │  Next.js 16 + Payload 3 │  (eine App)    │     │
        │   │  - Website (Frontend)    │                │     │
        │   │  - Admin-Panel (CMS)     │                │     │
        │   └───┬───────────┬─────────┘                │     │
        │       │           │                          │     │
        │       ▼           ▼                          │     │
        │  ┌─────────┐  ┌──────────┐   ┌────────────┐  │     │
        │  │PostgreSQL│  │  MinIO   │   │   Umami    │──┘     │
        │  │(Inhalte) │  │(Medien)  │   │(Statistik) │        │
        │  └─────────┘  └────┬─────┘   └────────────┘        │
        └────────────────────┼───────────────────────────────┘
                             │ (CDN zieht Medien von hier)
                             ▲
                    ┌────────┴────────┐
                    │ FFmpeg-Pipeline │  ← wandelt Uploads vorab in HLS um
                    └─────────────────┘
```

Grundprinzip: **Eine App, ein Server, ein Deploy.** Alles Dynamische liegt in einem Container. Medien werden über ein vorgelagertes CDN ausgeliefert, damit Tempo und Bandbreite stimmen. Der VPS muss so nie Video-Bytes direkt an die Masse ausliefern.

---

## 2. Komponenten im Detail

### 2.1 Next.js 16 — Frontend & Rendering

- **Rolle:** Liefert die öffentliche Website (Startseite, Arbeiten, Über mich, Journal, Kontakt, Kooperationen).
- **Konfiguration:** App Router mit React Server Components. Inhaltsseiten werden statisch vorgerendert und bei Änderungen automatisch neu generiert (Incremental Static Regeneration) — d.h. Seiten sind schnell wie statische Dateien, aktualisieren sich aber von selbst, sobald du im Admin etwas änderst. Bildausgabe über die eingebaute Bild-Komponente mit responsiven Größen.
- **Warum:** Schnelligkeit ohne manuelles Neubauen, sauberes Fundament, gleiche Sprache (TypeScript/React) wie das CMS — ein System statt zwei.

### 2.2 Payload 3 — CMS & Admin-Panel

- **Rolle:** Das Content-Management und der gesamte Admin-Bereich, in dem du arbeitest. Läuft im selben Codebase wie Next.js, kein zweiter Server.
- **Konfiguration:**
  - **Datenmodell (Collections):** Projekte, Journal-Beiträge, Medien, Seiten/Seiten-Konfiguration, Kontaktanfragen.
  - **Journal-Layout über Blocks:** Eine großzügige Bibliothek vordefinierter Layout-Bausteine (z.B. Vollbild-Bild, Galerie, Zwei-Spalten, Video, Zitat, Text). Du stapelst und sortierst sie pro Beitrag frei — das ist deine Layout-Freiheit ohne Code.
  - **Live Preview aktiviert:** Beim Befüllen siehst du in Echtzeit, wie der Beitrag auf der echten Seite aussieht.
  - **Rich-Text:** Lexical-Editor für Fließtext innerhalb der Blöcke.
  - **Inbox über Form-Builder:** Kontaktanfragen werden als eigene Collection gespeichert und landen direkt im Admin.
  - **Medien-Anbindung:** Über das Storage-Plugin werden Uploads nicht auf den App-Server, sondern in den Object Storage geschrieben.
  - **Zugriff & Auth:** Admin-Login mit deinem Account; Rollen/Rechte falls später mehr Personen Zugriff brauchen.
- **Warum:** Liefert das fertige No-Code-Admin, du musst nichts davon selbst bauen. Code-first heißt: das Datenmodell lebt im Git-Repo deines Freundes, versioniert und sauber.

### 2.3 PostgreSQL — Datenbank

- **Rolle:** Speichert alle Inhalte, Beiträge, Anfragen und Nutzerdaten.
- **Konfiguration:** Eigener Container mit persistentem Volume; nur intern erreichbar (nicht aus dem Internet); regelmäßige Dumps als Backup.
- **Warum:** Bewährter, langlebiger Standard. Von Payload nativ unterstützt. Keine Vendor-Bindung.

### 2.4 Object Storage (MinIO oder Hetzner Object Storage) — Mediendateien

- **Rolle:** Lagert alle Originaldateien, generierten Bildvarianten und Video-Segmente.
- **Konfiguration:** S3-kompatibler Speicher; getrennte Bereiche (Buckets/Präfixe) für Bilder und Video. Payload schreibt Uploads automatisch hierhin. Das CDN zieht die Dateien von hier.
- **Warum:** Trennt schwere Mediendateien sauber vom App-Server. Bei MinIO selbst gehostet, bei Hetzner Object Storage minimaler Wartungsaufwand — beide bleiben in deiner Kontrolle und in der EU.

### 2.5 Video-Pipeline (FFmpeg → HLS)

- **Rolle:** Bringt Videos in „Top-Qualität und schnell“, ohne den Server bei jedem Aufruf zu belasten.
- **Konfiguration (Ablauf, keine Live-Übertragung):**
  1. Du lädst das fertige Video im Admin hoch.
  2. FFmpeg transkodiert es **vorab** in mehrere Qualitätsstufen (z.B. 1080p / 720p / 480p) — eine adaptive Bitrate-„Ladder“.
  3. Ausgabe als **HLS** in kurzen Segmenten (~6 Sekunden, ~2 Sekunden Keyframe-Abstand); H.264 als kompatibler Standard, optional HEVC/AV1 für bessere Kompression.
  4. Segmente plus Playlist landen im Object Storage; im Frontend spielt ein HLS-Player ab und schaltet je nach Verbindung automatisch die Qualität um.
- **Warum:** HLS ist der Standard für On-Demand-Video über alle Geräte. Adaptive Bitrate = kein Buffern, gestochen scharf bei schneller Leitung, flüssig bei langsamer. Vorab-Transkodierung statt Live spart Rechenlast und Kosten.

### 2.6 CDN (Bunny oder Cloudflare) — Auslieferung

- **Rolle:** Liefert Bilder und Video-Segmente aus dem Cache nah am Besucher aus.
- **Konfiguration:** Als „Pull Zone“ vor den Object Storage gesetzt; Medien werden mit langer Cache-Dauer ausgeliefert (sie ändern sich nicht). HTML-Anfragen werden an den VPS durchgereicht.
- **Warum (ehrlicher Kompromiss):** Das ist der eine Baustein, den du nicht selbst betreibst — aber die Daten bleiben deine, das CDN cacht sie nur. Ohne CDN müsste dein einzelner VPS jedes Video-Byte selbst ausliefern; das wird bei Social-Traffic langsam und bandbreiten-teuer. Das CDN ist der Unterschied zwischen „schnell“ und „nicht skalierbar“.

### 2.7 Hetzner VPS — Host

- **Rolle:** Der Server, auf dem alles läuft.
- **Konfiguration:** Standort Deutschland (niedrige Latenz zu dir in Frankfurt, EU-Datenraum). Ein kleiner bis mittlerer VPS reicht für ein Portfolio lange; wächst bei Bedarf hoch.
- **Warum:** Günstig, deutsch, schnell, DSGVO-freundlich. Auf einem dauerhaft laufenden VPS bleibt das Admin-Panel flüssig — anders als auf serverlosen Hosts, wo seltene Logins durch „Cold Starts“ träge werden.

### 2.8 Docker + Docker Compose — Betrieb

- **Rolle:** Verpackt jede Komponente in einen reproduzierbaren Container und startet sie zusammen.
- **Konfiguration:** Dienste = App (Next.js + Payload), PostgreSQL, MinIO, Umami, Caddy. Interne Vernetzung; nur Caddy ist nach außen offen (Ports 80/443). Benannte Volumes für Daten, damit nichts bei Neustarts verlorengeht.
- **Warum:** Identisches Verhalten in Entwicklung und Produktion, einfache Backups, einfache Updates, ein Befehl zum Hochfahren.

### 2.9 Caddy — Reverse Proxy & HTTPS

- **Rolle:** Nimmt alle Anfragen entgegen, verteilt sie an die App, kümmert sich um Verschlüsselung.
- **Konfiguration:** Automatische TLS-Zertifikate (Let's Encrypt), Weiterleitung an Next.js, sinnvolle Security-Header.
- **Warum:** HTTPS ohne manuelles Zertifikat-Management; minimale Konfiguration.

### 2.10 Umami (oder Plausible) — Statistiken

- **Rolle:** Liefert die Besucherstatistiken für deinen Admin-Bereich.
- **Konfiguration:** Eigener Container; ein leichtes, cookieloses Tracking-Skript auf der Website; Dashboard mit Aufrufen, Quellen, beliebten Inhalten. Die wichtigsten Kennzahlen lassen sich per Schnittstelle auch direkt ins Payload-Admin holen.
- **Warum:** Selbst gehostet, datensparsam, **ohne Cookie-Banner-Pflicht** — in Deutschland praktisch ein Muss. Genau die Statistik-Anforderung, ohne Google-Analytics-Ballast.

### 2.11 E-Mail-Versand (Resend oder SMTP)

- **Rolle:** Verschickt Benachrichtigungen, z.B. wenn eine neue Kontaktanfrage eingeht.
- **Konfiguration:** Payload löst bei neuer Anfrage eine Mail an dich aus; transaktionaler Versand über einen Dienst wie Resend oder eigenen SMTP.
- **Warum:** Du erfährst sofort von Anfragen, ohne ständig ins Admin schauen zu müssen.

---

## 3. Wie welche Anforderung gelöst wird

| Anforderung | Gelöst durch | Wie |
|---|---|---|
| Selbst hosten, volle Kontrolle | Hetzner VPS + Docker, Payload (MIT-Lizenz) | Alles Dynamische läuft auf deinem Server, Schema im Git-Repo, keine Vendor-Bindung |
| State of the art, zukunftssicher | Next.js 16 + Payload 3 | Aktueller Standard-Stack; die Editor-Seite ist Payloads am schnellsten wachsender Bereich |
| Bilder in Top-Qualität + schnell | Payload-Bildverarbeitung + CDN | Automatische responsive AVIF/WebP-Varianten beim Upload, ausgeliefert über den CDN-Cache |
| Videos in Top-Qualität + schnell | FFmpeg → HLS + Object Storage + CDN | Vorab transkodierte adaptive Streams, kein Buffern, edge-nah ausgeliefert |
| Admin-View mit Statistiken | Payload-Admin + Umami | Fertiges Panel; Kennzahlen aus Umami im Admin sichtbar |
| Inbox für Kontaktanfragen | Payload Form-Builder | Anfragen landen als Collection im Admin, plus E-Mail-Benachrichtigung |
| No-Code-Bearbeitung für Nicht-Coder | Payload-Admin + Live Preview | Du pflegst alles in Formularfeldern mit Echtzeit-Vorschau, ohne Code |
| Freiheit des Journal-Layouts | Payload Blocks-System | Frei kombinierbare, vordefinierte Layout-Blöcke pro Beitrag |
| Kein Kompromiss beim Design | Handgecodetes Next.js-Frontend | Optik komplett euer Code, an kein CMS-Template gebunden |
| Alles organisieren & konfigurieren | Payload Collections | Bilder, Beiträge, Seiten, Einstellungen zentral im Admin |
| Deutschland-/DSGVO-tauglich | EU-Hosting + cookielose Statistik | Daten in der EU, kein Cookie-Banner durch Umami/Plausible |

---

## 4. Datenfluss

**Besucher ruft eine Seite auf:** Anfrage trifft das CDN → HTML wird an den VPS durchgereicht → Next.js liefert die vorgerenderte Seite → Bilder und Video-Segmente kommen direkt aus dem CDN-Cache. Ergebnis: schneller erster Eindruck, flüssiges Scrollen, sauberes Video.

**Du befüllst Inhalte:** Login ins Payload-Admin → neuen Journal-Beitrag aus Blöcken zusammenstellen → Bilder/Video hochladen (landen im Object Storage, Video durchläuft die FFmpeg-Pipeline) → Live Preview zeigt das Ergebnis → Veröffentlichen. Next.js generiert die betroffenen Seiten automatisch neu, das CDN holt sich die neue Version.

---

## 5. Betrieb (was dein Freund einmal einrichtet)

- **Backups:** Regelmäßige PostgreSQL-Dumps und Sicherung des Object Storage. Das ist deine Versicherung — ohne Backup ist Self-Hosting fahrlässig.
- **Updates:** Payload und Next.js bewegen sich schnell; Updates am besten zuerst in einer Testumgebung, dann produktiv. Containerisierung macht das berechenbar.
- **Sicherheit:** Nur Caddy nach außen offen, alles andere intern; HTTPS überall; Admin-Login geschützt; Server-Firewall.
- **Monitoring:** Eine einfache Überwachung (erreichbar? Speicher voll?) reicht für den Anfang.
- **Umgebungen:** Getrennte Entwicklungs- und Produktionsumgebung, damit Experimente nichts Live kaputtmachen.

---

## 6. Was bewusst NICHT selbst gehostet wird

- **CDN-Auslieferung:** Auf eine externe Edge ausgelagert, weil ein einzelner VPS Medien für wachsenden Traffic nicht schnell und nicht günstig genug ausliefert. Deine Originaldaten bleiben trotzdem bei dir — das CDN cacht nur Kopien.
- **E-Mail-Versand:** Über einen transaktionalen Dienst, weil eigener Mailversand in der Praxis im Spam landet. Unkritisch, da hier keine Inhalte liegen.

Alles andere — App, CMS, Datenbank, Medien-Speicher, Statistik — läuft auf deinem Server unter deiner Kontrolle.

> Optionaler Sonderfall Video: Falls dir die FFmpeg-Pipeline später zu viel Wartung wird, ist Video die einzige sinnvolle Stelle für einen Managed-Dienst (z.B. Mux/Cloudflare Stream) — der Rest des Stacks bleibt davon unberührt. Fürs Erste ist die Eigenlösung der konsequente Weg.

---

## 7. Versionsstand

Festgelegt auf **Next.js 16** und **Payload 3.x** (samt PostgreSQL, MinIO, Caddy, Umami). Beide Kernkomponenten entwickeln sich schnell — Versionen bewusst dokumentieren und Updates kontrolliert nachziehen, statt blind auf „latest“ zu springen.
