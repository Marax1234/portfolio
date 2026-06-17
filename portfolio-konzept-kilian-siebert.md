# Portfolio-Konzept — Kilian Siebert

**Layout- & UX-Konzept für eine persönliche Portfolio-Website**
Foto-/Videografie · Sport (Triathlon) · Reisen · Personal Brand

Fokus dieses Dokuments: Seitenstruktur, Layout-Auslegung und Nutzerführung.
Farben, finale Typografie und konkrete Bildauswahl kommen später — hier geht's um das Gerüst.

---

## 1. Leitidee

Das Problem mit klassischen Foto-/Video-Portfolios: Sie verkaufen eine Dienstleistung und blenden die Person aus. Das Problem mit reinen Personal-Brand-Seiten: Sie wirken inhaltsleer, wenn keine echte Arbeit dahintersteht.

Die Lösung hier ist, beides nicht zu trennen, sondern als **eine Geschichte** zu erzählen:

> Die Kamera ist die Brücke zwischen einem Leben, das man sehen will (Sport, Reisen, Erleben) und der Fähigkeit, genau das festzuhalten.

Konkret heißt das für das Layout: Besucher treffen zuerst auf **dich als Person**, merken im nächsten Schritt, dass du das, was du erlebst, auch außergewöhnlich gut filmst und fotografierst — und finden dann je nach Interesse ihren Pfad (Auftrag, Kooperation, Stöbern).

Die Seite ist also kein Schaufenster für „Hochzeitspakete“, sondern eine Plattform für einen Menschen, der Dinge erlebt und sie in Bilder übersetzt. Das macht sie gleichzeitig kundentauglich, sponsorentauglich und social-tauglich.

---

## 2. Wen die Seite ansprechen muss

Vier Besuchertypen, alle über dieselbe Startseite, danach getrennte Pfade:

- **Privatkunden** (Hochzeiten, Paare, Events) — wollen: Stil sehen, Vertrauen aufbauen, schnell anfragen können.
- **Marken / Sponsoren** — wollen: Persönlichkeit, Reichweite, Content-Qualität, eine professionelle Anlaufstelle und am besten ein Media-Kit.
- **Reise-/Sport-/Commercial-Kunden** — wollen: Range sehen (dass du mehr kannst als Standardkram), Bewegung, Doku-Gefühl.
- **Social-Audience** — landet von Instagram/TikTok/YouTube auf der Seite. Will: tiefer eintauchen, Stories lesen, „den Menschen“ greifen.

Die Startseite muss diese vier Pfade in den ersten 10 Sekunden andeuten, ohne dass irgendwo „Klicke hier wenn du X bist“ steht. Das passiert über die Modul-Reihenfolge (siehe Abschnitt 4).

---

## 3. Informationsarchitektur (Sitemap)

```
Startseite
│
├── Arbeiten            → der Portfolio-Kern, kategorisiert
│   ├── Hochzeiten & Menschen
│   ├── Reisen & Doku
│   ├── Sport & Action
│   ├── Commercial / Marken
│   └── [Projekt-Detailseiten]
│
├── Über mich           → die Person, Story, Erfolge, Alltag
│
├── Journal             → laufende Stories (Reisen, Wettkämpfe, BTS)
│   └── [Beitrags-Detailseiten]
│
├── Kooperationen       → eigene Seite für Marken/Sponsoren (+ Media-Kit)
│
└── Kontakt
```

Bewusst flach. Maximal eine Klicktiefe von Hauptseite zu Detailseite. Niemand soll sich verlaufen, und mobil muss alles mit dem Daumen erreichbar sein.

**Hinweis (DE-spezifisch):** Impressum und Datenschutzerklärung sind in Deutschland Pflicht — gehören in den Footer, nicht in die Hauptnavigation.

---

## 4. Die Seiten im Detail

### 4.1 Startseite

Das ist die wichtigste Seite. Sie macht in einem Scroll-Durchgang den Pitch: Person → Können → Pfade.

```
┌─────────────────────────────────────────────┐
│  [Name/Logo]              Arbeiten  Über  …  │  ← reduzierte Sticky-Nav
├─────────────────────────────────────────────┤
│                                             │
│        VOLLBILD-VIDEO-LOOP (Reel-Cut)       │  ← Hero
│        Bewegung/Sport/Reise gemischt        │
│                                             │
│        Kilian Siebert                       │
│        [1 Satz Positionierung]              │
│                       ↓ (Scroll-Cue)        │
├─────────────────────────────────────────────┤
│  [Portrait]   │   Ich in einem Absatz.      │  ← Intro: Person ZUERST
│               │   Knapp, konkret, ehrlich.  │
├─────────────────────────────────────────────┤
│   WAS ICH MACHE                             │
│   ┌────────┐ ┌────────┐ ┌────────┐          │  ← 3 Kacheln, Hover = Video-Snippet
│   │Menschen│ │ Reisen │ │ Sport  │          │     → führen in „Arbeiten“
│   └────────┘ └────────┘ └────────┘          │
├─────────────────────────────────────────────┤
│        FEATURED — bestes/neuestes Projekt   │  ← ein einzelnes Highlight, großflächig
├─────────────────────────────────────────────┤
│  3× Mitteldistanz · 14 Länder · seit 2021   │  ← Fakten-Strip (Credibility)
├─────────────────────────────────────────────┤
│   AUS DEM JOURNAL                           │  ← 2–3 neueste Stories
│   [Karte] [Karte] [Karte]                   │     signalisiert: hier lebt was
├─────────────────────────────────────────────┤
│   Projekt anfragen   |   Zusammenarbeiten   │  ← geteilter CTA (Kunde / Marke)
├─────────────────────────────────────────────┤
│   Footer: Kontakt · Socials · Impressum     │
└─────────────────────────────────────────────┘
```

**Warum diese Reihenfolge:**
- **Hero als Video, nicht als Slogan.** Der Reel-Cut zeigt sofort Können und Vibe (jung, in Bewegung, draußen). Ein, zwei starke Menschen-/Hochzeitsmomente reinmischen, damit auch Privatkunden sich angesprochen fühlen. Text minimal — das Video macht die Arbeit.
- **Intro vor Portfolio.** Der „Ich in einem Absatz“-Block stellt die Person vor die Dienstleistung. Das ist der ganze Unterschied zu „Hey, ich mache Hochzeitsbilder“.
- **Drei Kacheln** lassen jeden Besuchertyp seinen Bereich finden, ohne Menü-Drilldown.
- **Fakten-Strip** baut Glaubwürdigkeit auf, ohne anzugeben — Zahlen sprechen für sich, kein „leidenschaftlich & passioniert“.
- **Journal-Teaser** ist das Lebendige. Es zeigt: hier ist ein Mensch mit laufendem Output, kein totes Schaufenster. Für Sponsoren das wichtigste Signal.

---

### 4.2 Arbeiten (Portfolio-Kern)

Der klassische Portfolio-Teil — sauber, aber gleichberechtigt zwischen Hochzeiten, Reisen und Sport. Genau diese Gleichberechtigung differenziert.

```
┌─────────────────────────────────────────────┐
│  Alle · Hochzeiten · Reisen · Sport · Comm.  │  ← Filter-Tabs
├─────────────────────────────────────────────┤
│   ┌─────┐ ┌─────────┐ ┌─────┐                │
│   │     │ │         │ │     │                │  ← Grid / Masonry
│   └─────┘ │         │ └─────┘                │     Cover-Bild pro Projekt
│   ┌─────────┐ ┌─────┐ ┌─────────┐            │     Hover: Titel + Kurz-Info
│   │         │ │     │ │         │            │
│   └─────────┘ └─────┘ └─────────┘            │
└─────────────────────────────────────────────┘
```

**Projekt-Detailseite** (eine Klicktiefe tiefer):

```
┌─────────────────────────────────────────────┐
│        HERO (Hauptvideo oder -bild)          │
├─────────────────────────────────────────────┤
│   Titel · Ort · für wen · 2–3 Sätze Kontext  │  ← knapper Kontext, kein Roman
├─────────────────────────────────────────────┤
│   Bild-/Video-Strecke (großflächig,          │
│   wechselnde Layouts, viel Negativraum)      │
├─────────────────────────────────────────────┤
│   ← Vorheriges Projekt | Nächstes Projekt →  │  ← keine Sackgasse
└─────────────────────────────────────────────┘
```

Regel für die Strecken: **Bild ist Hauptsache, Text ist Beilage.** Viel Weißraum, ruhige Anordnung, damit die Aufnahmen wirken. Lieber wenige starke Projekte als 30 mittelmäßige.

---

### 4.3 Über mich

Das Herzstück fürs Personal Branding. Erzählend, aber ohne Pathos. Hier transportierst du Erlebnisse, Erfolge und Alltag.

```
┌─────────────────────────────────────────────┐
│        Großes Portrait- oder Action-Bild     │
├─────────────────────────────────────────────┤
│   Story-Text: wer, woher, warum Kamera,      │  ← erste Person, kurze Sätze,
│   warum Sport. 3–4 kurze Absätze.            │     zeigen statt behaupten
├─────────────────────────────────────────────┤
│   MEILENSTEINE (Timeline)                    │  ← sportlich + kreativ gemischt
│   ●─── erster Triathlon ── erste Hochzeit    │     Erfolge & Erlebnisse
│        ── X Land bereist ── …                │     chronologisch, nüchtern
├─────────────────────────────────────────────┤
│   WAS MICH AUSMACHT                          │  ← Stichworte statt Floskeln
│   [3–5 konkrete Punkte, keine Buzzword-Suppe]│
├─────────────────────────────────────────────┤
│   Alltags-/Backstage-Bilder (lockerer Grid)  │  ← „den Menschen greifen“
├─────────────────────────────────────────────┤
│   → Mehr im Journal   |   → Kontakt          │
└─────────────────────────────────────────────┘
```

Die Mischung aus Meilensteinen (objektiv) und Alltagsbildern (nahbar) ist genau der Balanceakt zwischen Professionalität und Persönlichkeit, den du beschrieben hast. Die Timeline macht Erfolge sichtbar, ohne dass du sie aufzählen und beweihräuchern musst.

---

### 4.4 Journal (Stories)

Der Motor fürs Social- und Sponsoren-Narrativ — und deine **eigene** Plattform, unabhängig von den Algorithmen von Instagram & Co. Hier landen Reiseberichte, Wettkämpfe, Behind-the-Scenes, Gear-Gedanken.

```
┌─────────────────────────────────────────────┐
│   JOURNAL                                    │
├─────────────────────────────────────────────┤
│   ┌──────────────┐  Titel                    │  ← Feed: großes Cover,
│   │  Cover-Bild  │  Datum · Kategorie         │     Titel, Teaser
│   └──────────────┘  2 Zeilen Teaser           │
│   ┌──────────────┐  Titel                    │
│   │  Cover-Bild  │  …                         │
│   └──────────────┘                            │
└─────────────────────────────────────────────┘
```

**Beitrags-Detailseite:** lesbarer Longread, schmale Textspalte für Lesbarkeit, Bilder und Video-Loops in voller Breite eingestreut. Am Ende: verwandte Beiträge + dezenter Hinweis auf Social-Kanäle.

Strategisch: Das ist, was du auf Social anteaserst und hierher verlinkst. Sponsoren sehen hier laufenden, hochwertigen Content — der beste Beweis, dass eine Kooperation sich lohnt.

> Praxis-Hinweis: Das Journal nur starten, wenn du eine realistische Content-Routine hast. Drei tote Einträge von vor einem Jahr schaden mehr, als wenn die Sektion (vorerst) fehlt.

---

### 4.5 Kooperationen (für Marken/Sponsoren)

Eigene Seite, die Sponsoren **direkt und sachlich** anspricht. Hier ist kein Platz für Geschwafel — Marken wollen Fakten.

```
┌─────────────────────────────────────────────┐
│   ZUSAMMENARBEIT                             │
│   1 Satz: was du für Marken machst.          │
├─────────────────────────────────────────────┤
│   WAS ICH BIETE          FÜR WEN             │  ← konkrete Leistungen
│   - Content-Produktion   - Outdoor/Sport     │     + passende Branchen
│   - Social-Formate       - Reise/Travel      │
│   - …                    - …                 │
├─────────────────────────────────────────────┤
│   REICHWEITE / AUDIENCE                      │  ← Zahlen, sobald vorhanden
│   [Follower, Views, Demografie]              │     (ehrlich, nicht geschönt)
├─────────────────────────────────────────────┤
│   BISHERIGE KOOPERATIONEN                    │  ← Logos / kurze Cases
├─────────────────────────────────────────────┤
│   [ Media-Kit herunterladen ]  [ Anfrage ]   │
└─────────────────────────────────────────────┘
```

Diese Seite kommt erst dann nach vorne, wenn du Reichweite hast, mit der du argumentieren kannst. Bis dahin kann sie schlanker sein („Offen für Kooperationen — schreib mir“) oder hinter dem Kontakt mitlaufen.

---

### 4.6 Kontakt

Bewusst minimal. Je weniger Reibung, desto mehr Anfragen.

```
┌─────────────────────────────────────────────┐
│   Lass uns reden.                            │
│                                             │
│   [ Name ] [ E-Mail ]                       │  ← kurzes Formular
│   [ Worum geht's? (Dropdown) ]              │     (Hochzeit / Reise / Marke / …)
│   [ Nachricht ]                             │
│   [ Absenden ]                              │
│                                             │
│   oder direkt: mail@…   ·   Socials          │
│   „Ich antworte meist innerhalb von 24 h.“   │  ← Erwartung setzen
└─────────────────────────────────────────────┘
```

Das Dropdown „Worum geht's?“ sortiert Anfragen automatisch vor und signalisiert dem Besucher, dass du verschiedene Welten bedienst.

---

## 5. Wiederkehrende Bausteine

Damit die Seite konsistent wirkt, ein paar Module, die überall gleich funktionieren:

- **Sticky-Nav** — reduziert (Name links, 4 Links rechts). Schrumpft beim Runterscrollen auf eine schmale Leiste. Mobil: Hamburger oder Bottom-Bar.
- **Footer** — Kontakt, Social-Links, Sitemap-Kurzversion, Impressum & Datenschutz.
- **Video-Loop-Komponente** — kurze, stumme, autoplayende Loops (mit Poster-Frame als Fallback). Das Markenzeichen, das die Seite lebendig macht.
- **Fakten-Strip** — eine Zeile mit 3–4 Zahlen. Wiederholbar auf mehreren Seiten.
- **Story-/Projekt-Karte** — Cover + Titel + Mini-Info. Gleiches Bauteil für Journal und Arbeiten.
- **Geteilter CTA-Block** — „Anfragen“ vs. „Zusammenarbeiten“. Taucht am Ende mehrerer Seiten auf.

---

## 6. UX-Flow & Nutzerführung

- **Mobile-First.** Dein Social-Traffic kommt fast komplett vom Handy. Jedes Layout zuerst für schmale Screens denken, dann auf Desktop hochskalieren — nicht umgekehrt.
- **Performance ist Pflicht.** Videos komprimieren, lazy-loaden, Poster-Frames setzen. Eine schöne Seite, die 6 Sekunden lädt, verliert die Hälfte der Besucher, bevor sie irgendwas sehen.
- **Self-Selection statt Wegweiser.** Die Startseite gibt jedem Typ über die Modul-Reihenfolge seinen Pfad, ohne plumpe „Bist du X?“-Buttons.
- **Keine Sackgassen.** Jede Detailseite verlinkt sinnvoll weiter (nächstes Projekt, verwandte Story, Kontakt). Niemand landet auf einer Seite ohne nächsten Schritt.
- **Ruhe im Layout.** Viel Negativraum, eine zurückhaltende Typografie, wenige Akzente. Die Bilder und Videos sind der Star — das Layout ist der Rahmen, nicht das Bild.
- **Konsistenter Rhythmus.** Wechsel zwischen vollflächigen Bild-/Video-Blöcken und ruhigen Textpassagen. Dieser Atem zieht den Scroll durch.

---

## 7. Tone of Voice

Trocken, selbstbewusst, konkret. Erste Person. Kurze Sätze. **Zeigen statt behaupten.** Englische Buzzwords nur, wo sie wirklich treffen (Reel, Behind-the-Scenes, Commercial) — nicht als Deko.

**So nicht:**
> „Mit Leidenschaft und einem Auge fürs Besondere fange ich die magischen Momente eures großen Tages ein und erzähle eure einzigartige Liebesgeschichte.“

**Sondern eher:**
> „Ich filme das, was sich zu erleben lohnt — auf dem Rad genauso wie auf einer Hochzeit. Seit 2021, in 14 Ländern.“

Keine Yoga-/Achtsamkeits-Sprache, kein „Journey“-Pathos. Die Abenteuerlust transportierst du über die Bilder und über konkrete Geschichten im Journal, nicht über Adjektive im Fließtext.

---

## 8. Was zuerst bauen (Priorisierung)

Nicht alles auf einmal. Sinnvolle Reihenfolge:

1. **Phase 1 — kundentauglich:** Startseite, Arbeiten, Über mich, Kontakt. Damit kannst du sofort Aufträge gewinnen.
2. **Phase 2 — lebendig:** Journal aufsetzen — aber erst, wenn die Content-Routine steht.
3. **Phase 3 — sponsorentauglich:** Kooperationen-Seite + Media-Kit, sobald deine Reichweite echte Argumente liefert.

So steht früh etwas Brauchbares online, und die Personal-Brand-/Sponsoren-Teile wachsen mit, wenn sie auch wirklich Substanz haben.

---

*Nächster sinnvoller Schritt: Bildauswahl und Hero-Reel festlegen — die bestimmen am Ende mehr über die Wirkung als jedes Layout-Detail. Danach Typografie und Farbwelt obendrauf.*
