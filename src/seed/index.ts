/**
 * Seed-Skript (Sprint 4, erweitert in Sprint 5) — idempotent über die Local API.
 *
 * Legt einen Admin-User, mehrere Beispiel-Projekte (je 1–2 pro Kategorie —
 * Grid/Filter/Prev-Next auf /arbeiten vorführbar), Beispiel-Journalbeiträge,
 * AboutPage-Defaults und sinnvolle SiteConfig-Defaults an (Hero/Intro/Facts/
 * CTAs aus den Sprint-3-Platzhaltertexten). Mehrfaches Ausführen (`pnpm seed`)
 * dupliziert nichts — vor jedem `create` wird per `find`/Existenzprüfung
 * gegengeprüft.
 *
 * Ergänzt, ersetzt aber nicht die manuelle No-Code-Pflege im Admin-Panel
 * (Akzeptanzkriterium Sprint 4: Inhalte lassen sich ohne Code anlegen).
 */
import path from "path";
import { fileURLToPath } from "url";
import config from "@payload-config";
import { getPayload } from "payload";
import sharp from "sharp";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const PLACEHOLDER_IMAGE_PATH = path.resolve(
  dirname,
  "../../public/media/placeholder.svg",
);

/** Minimale, gültige Lexical-Editor-State-JSON für `richText`-Felder im Seed. */
function lexicalParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: "root",
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        direction: "ltr" as const,
        format: "" as const,
        indent: 0,
        version: 1,
        children: [
          { type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 },
        ],
      })),
    },
  };
}

async function seed() {
  const payload = await getPayload({ config });

  // 0. Platzhalter-Medium — dient dazu, die `required`-Upload-Felder der
  // Beispiel-Inhalte zu erfüllen; echte Bilder kommen über den Admin oder
  // Sprint 5.
  //
  // Sprint 7: Das CMS-Original muss ein Rasterbild sein, kein SVG — sonst
  // erzeugt Sharp keine sinnvollen `imageSizes`-Varianten (thumbnail/card/
  // hero) und next/image würde die Optimierung umgehen. Das Platzhalter-SVG
  // (gleiche Quelle wie der manifest-`id`-Zweig, siehe
  // src/lib/media/object-storage-provider.ts) wird daher mit dem ohnehin
  // konfigurierten `sharp` zu PNG gerendert und als Buffer hochgeladen — das
  // S3-Storage-Plugin schreibt Original und Varianten dann nach MinIO.
  let placeholderMedia = (
    await payload.find({
      collection: "media",
      where: { alt: { equals: "Seed-Platzhalter" } },
      limit: 1,
    })
  ).docs[0];

  if (!placeholderMedia) {
    const placeholderBuffer = await sharp(PLACEHOLDER_IMAGE_PATH)
      .resize(1600, 1200)
      .png()
      .toBuffer();

    placeholderMedia = await payload.create({
      collection: "media",
      data: { alt: "Seed-Platzhalter" },
      file: {
        data: placeholderBuffer,
        mimetype: "image/png",
        name: "placeholder.png",
        size: placeholderBuffer.length,
      },
    });
    payload.logger.info("Seed: Platzhalter-Medium angelegt.");
  } else if (!placeholderMedia.sizes?.thumbnail?.filename) {
    // Migration (Sprint-7-Akzeptanzkriterium „Bestehende Beispielbilder
    // migrieren"): Dieser Datensatz stammt noch aus Sprint 1–6 (lokaler
    // SVG-Upload ohne `imageSizes`-Varianten). `url`/`sizes.*.url` werden vom
    // S3-Plugin zur Lesezeit aus dem gespeicherten `filename` berechnet —
    // unabhängig davon, ob die Bytes tatsächlich im Bucket liegen. Ohne
    // Migration wäre dieser Eintrag im Storage nicht vorhanden (404). Re-
    // Upload über dieselbe ID, damit alle bestehenden Referenzen
    // (Projekte/Journal/AboutPage/SiteConfig) gültig bleiben.
    const placeholderBuffer = await sharp(PLACEHOLDER_IMAGE_PATH)
      .resize(1600, 1200)
      .png()
      .toBuffer();

    placeholderMedia = await payload.update({
      collection: "media",
      id: placeholderMedia.id,
      data: {},
      file: {
        data: placeholderBuffer,
        mimetype: "image/png",
        name: "placeholder.png",
        size: placeholderBuffer.length,
      },
      context: { disableRevalidate: true },
    });
    payload.logger.info(
      "Seed: Platzhalter-Medium aus Sprint 1–6 nach Object Storage migriert.",
    );
  } else {
    payload.logger.info("Seed: Platzhalter-Medium existiert bereits — übersprungen.");
  }

  // 1. Admin-User
  const { totalDocs: userCount } = await payload.find({
    collection: "users",
    limit: 0,
  });

  if (userCount === 0) {
    const email = process.env.SEED_ADMIN_EMAIL ?? "admin@kilian-siebert.de";
    const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

    await payload.create({
      collection: "users",
      data: { email, password, roles: ["admin"] },
    });
    payload.logger.info(`Seed: Admin-User angelegt (${email}).`);
  } else {
    payload.logger.info("Seed: Admin-User existiert bereits — übersprungen.");
  }

  // 2. Beispiel-Projekt (featured)
  const existingProject = await payload.find({
    collection: "projects",
    where: { slug: { equals: "triathlon-em-2024-hamburg" } },
    limit: 1,
  });

  if (existingProject.totalDocs === 0) {
    await payload.create({
      collection: "projects",
      data: {
        title: "Triathlon EM 2024 — Hamburg",
        slug: "triathlon-em-2024-hamburg",
        category: "sport",
        cover: placeholderMedia.id,
        excerpt: "Drei Disziplinen, ein Tag, ein Team vor Ort.",
        location: "Hamburg",
        client: "Triathlon Hamburg e.V.",
        gallery: [
          { image: placeholderMedia.id, caption: "Start — Alster" },
          { image: placeholderMedia.id, caption: "Zieleinlauf" },
        ],
        featured: true,
        ctaLabel: "Projekt ansehen",
        ctaHref: "/arbeiten/triathlon-em-2024-hamburg",
        order: 0,
        publishedAt: new Date("2024-06-01").toISOString(),
      },
      // Standalone-Skript läuft außerhalb eines Next.js-Request-Kontexts —
      // revalidatePath/revalidateTag (src/hooks/revalidate.ts) hätten hier
      // keinen Static-Generation-Store. Im Admin/Frontend bleiben die Hooks aktiv.
      context: { disableRevalidate: true },
    });
    payload.logger.info("Seed: Beispiel-Projekt angelegt.");
  } else {
    const existing = existingProject.docs[0];
    // Sprint-4-Seed kannte `location`/`client`/`gallery` noch nicht (Sprint-5-
    // Felder) — bei bereits angelegtem Projekt hier nachpflegen, statt nur
    // die Existenzprüfung zu loggen.
    if (!existing.location) {
      await payload.update({
        collection: "projects",
        id: existing.id,
        data: {
          location: "Hamburg",
          client: "Triathlon Hamburg e.V.",
          gallery: [
            { image: placeholderMedia.id, caption: "Start — Alster" },
            { image: placeholderMedia.id, caption: "Zieleinlauf" },
          ],
        },
        context: { disableRevalidate: true },
      });
      payload.logger.info("Seed: Beispiel-Projekt um Sprint-5-Felder ergänzt.");
    } else {
      payload.logger.info("Seed: Beispiel-Projekt existiert bereits — übersprungen.");
    }
  }

  // 2b. Weitere Demo-Projekte — je 1 pro übriger Kategorie + ein zweites
  // Sport-Projekt, damit Filter-Tabs und Prev/Next auf /arbeiten vorführbar
  // sind (Sprint 5).
  const additionalProjects = [
    {
      title: "Hochzeit Lisa & Max — Toskana",
      slug: "hochzeit-lisa-max-toskana",
      category: "hochzeiten" as const,
      excerpt: "Ein Tag, zwei Familien, ein langer Sommerabend.",
      location: "Toskana, Italien",
      client: "Lisa & Max",
      order: 1,
      publishedAt: "2024-07-12",
    },
    {
      title: "Porträt-Serie — Lokale Macher",
      slug: "portraet-serie-lokale-macher",
      category: "menschen" as const,
      excerpt: "Fünf Porträts, fünf Werkstätten, eine Stadt.",
      location: "Hamburg",
      client: "Eigenprojekt",
      order: 2,
      publishedAt: "2024-04-20",
    },
    {
      title: "Marokko Roadtrip — 14 Tage",
      slug: "marokko-roadtrip-14-tage",
      category: "reisen" as const,
      excerpt: "2.400 km zwischen Atlas und Atlantik.",
      location: "Marokko",
      client: "Eigenprojekt",
      order: 3,
      publishedAt: "2024-03-01",
    },
    {
      title: "Mitteldistanz #3 — Roth",
      slug: "mitteldistanz-3-roth",
      category: "sport" as const,
      excerpt: "Drittes Rennen, dritte Lektion.",
      location: "Roth",
      client: "Eigenprojekt",
      order: 4,
      publishedAt: "2024-05-15",
    },
    {
      title: "Sponsoring-Recap — Outdoor-Marke",
      slug: "sponsoring-recap-outdoor-marke",
      category: "commercial" as const,
      excerpt: "Content-Paket für eine Saison Outdoor-Sponsoring.",
      location: "Allgäu",
      client: "Outdoor-Marke (NDA)",
      order: 5,
      publishedAt: "2024-09-02",
    },
  ];

  for (const demo of additionalProjects) {
    const existing = await payload.find({
      collection: "projects",
      where: { slug: { equals: demo.slug } },
      limit: 1,
    });

    if (existing.totalDocs === 0) {
      await payload.create({
        collection: "projects",
        data: {
          title: demo.title,
          slug: demo.slug,
          category: demo.category,
          cover: placeholderMedia.id,
          excerpt: demo.excerpt,
          location: demo.location,
          client: demo.client,
          gallery: [{ image: placeholderMedia.id }],
          order: demo.order,
          publishedAt: new Date(demo.publishedAt).toISOString(),
        },
        context: { disableRevalidate: true },
      });
      payload.logger.info(`Seed: Demo-Projekt „${demo.title}“ angelegt.`);
    } else {
      payload.logger.info(`Seed: Demo-Projekt „${demo.title}“ existiert bereits — übersprungen.`);
    }
  }

  // 3. Beispiel-Journalbeiträge (Sprint 5: 3 statt 1, damit der
  // Journal-Teaser auf der Startseite gefüllt vorführbar ist; Sprint 6:
  // `excerpt` + `layout` ergänzt, damit Feed und Detailseite vorführbar sind).
  const journalPosts = [
    {
      title: "Durch Marokko — 14 Tage, 2.400 km",
      slug: "marokko-2024",
      category: "reise" as const,
      publishedAt: "2024-03-01",
      excerpt: "Von der Küste bis in die Dünen — zwei Wochen, ein Auto, viel zu wenig Schlaf.",
      layout: [
        {
          blockType: "text" as const,
          content: lexicalParagraphs([
            "14 Tage, 2.400 Kilometer, drei Klimazonen. Geplant war wenig — genau das war der Plan.",
            "Die besten Bilder entstehen nicht am geplanten Aussichtspunkt, sondern fünf Minuten davor oder danach.",
          ]),
        },
        { blockType: "image" as const, image: placeholderMedia.id, caption: "Erg Chebbi, kurz vor Sonnenaufgang" },
        {
          blockType: "quote" as const,
          quote: "Man plant die Route. Die Geschichte schreibt die Straße.",
          attribution: "Notiz, Tag 6",
        },
      ],
    },
    {
      title: "Mitteldistanz #3 — was beim dritten Mal anders war",
      slug: "mitteldistanz-3",
      category: "sport" as const,
      publishedAt: "2024-05-01",
      excerpt: "Drittes Rennen, erstmals ohne Krise auf der Laufstrecke — was sich verändert hat.",
      layout: [
        {
          blockType: "text" as const,
          content: lexicalParagraphs([
            "Beim dritten Mal kennt man die Strecke nicht — aber man kennt sich selbst etwas besser.",
          ]),
        },
        { blockType: "image" as const, image: placeholderMedia.id, caption: "Wechselzone, kurz vor dem Lauf" },
      ],
    },
    {
      title: "Hinter der Kamera bei Lisa & Max",
      slug: "bts-lisa-max",
      category: "behind-the-scenes" as const,
      publishedAt: "2024-07-13",
      excerpt: "Ein Blick auf die Momente zwischen den Momenten — Behind-the-Scenes einer Hochzeit.",
      layout: [
        {
          blockType: "text" as const,
          content: lexicalParagraphs([
            "Die schönsten Momente passieren oft, während alle noch auf das nächste Foto warten.",
          ]),
        },
        {
          blockType: "gallery" as const,
          images: [
            { image: placeholderMedia.id, caption: "Vorbereitung" },
            { image: placeholderMedia.id, caption: "Zwischen den Aufnahmen" },
          ],
        },
      ],
    },
  ];

  for (const post of journalPosts) {
    const existing = await payload.find({
      collection: "journal",
      where: { slug: { equals: post.slug } },
      limit: 1,
    });

    if (existing.totalDocs === 0) {
      await payload.create({
        collection: "journal",
        data: {
          title: post.title,
          slug: post.slug,
          category: post.category,
          cover: placeholderMedia.id,
          excerpt: post.excerpt,
          layout: post.layout,
          order: 0,
          publishedAt: new Date(post.publishedAt).toISOString(),
        },
        context: { disableRevalidate: true },
      });
      payload.logger.info(`Seed: Journalbeitrag „${post.title}“ angelegt.`);
    } else {
      const existingDoc = existing.docs[0];
      // Sprint-5-Seed kannte `excerpt`/`layout` noch nicht (Sprint-6-Felder) —
      // bei bereits angelegtem Beitrag hier nachpflegen.
      if (!existingDoc.layout || existingDoc.layout.length === 0) {
        await payload.update({
          collection: "journal",
          id: existingDoc.id,
          data: {
            excerpt: post.excerpt,
            layout: post.layout,
          },
          context: { disableRevalidate: true },
        });
        payload.logger.info(`Seed: Journalbeitrag „${post.title}“ um Sprint-6-Felder ergänzt.`);
      } else {
        payload.logger.info(`Seed: Journalbeitrag „${post.title}“ existiert bereits — übersprungen.`);
      }
    }
  }

  // 4. AboutPage-Defaults (nur setzen, falls noch leer)
  const aboutPage = await payload.findGlobal({ slug: "about-page" });

  if (!aboutPage.milestones || aboutPage.milestones.length === 0) {
    await payload.updateGlobal({
      slug: "about-page",
      data: {
        hero: {
          eyebrow: "Über mich",
          headline: "Kilian Siebert",
          image: placeholderMedia.id,
        },
        story: lexicalParagraphs([
          "Ich bin Kilian — seit 2021 mit der Kamera unterwegs, seit länger auf dem Rad.",
          "Triathlon hat mir gezeigt, wie weit man kommt, wenn man dranbleibt. Genau das suche ich auch hinter der Kamera: keine gestellten Momente, sondern das, was wirklich passiert.",
          "Hochzeit, Wettkampf oder 14 Länder unterwegs — am Ende geht es immer um dasselbe: festhalten, was sich zu erleben lohnt.",
        ]),
        milestones: [
          { year: "2019", title: "Erster Triathlon", description: "Mitteldistanz, ohne Ahnung, mit Begeisterung." },
          { year: "2021", title: "Erste Hochzeit hinter der Kamera" },
          { year: "2022", title: "Erstes Auslandsprojekt — 14 Länder seither" },
          { year: "2024", title: "Dritte Mitteldistanz, erstes Commercial-Projekt" },
        ],
        whatDefinesMe: [
          { point: "Ausdauer", description: "Auf dem Rad wie hinter der Kamera." },
          { point: "Direktheit", description: "Zeigen statt behaupten." },
          { point: "Neugier", description: "14 Länder, noch lange nicht genug." },
        ],
        backstage: [{ image: placeholderMedia.id }, { image: placeholderMedia.id }, { image: placeholderMedia.id }],
      },
      context: { disableRevalidate: true },
    });
    payload.logger.info("Seed: AboutPage-Defaults gesetzt.");
  } else {
    payload.logger.info("Seed: AboutPage bereits befüllt — übersprungen.");
  }

  // 5. SiteConfig-Defaults (nur setzen, falls noch leer)
  //
  // Hinweis: `hero.name` ist über das Feld-`defaultValue` bereits beim
  // ersten Lesen des Globals befüllt (auch ohne diesen Seed) — als
  // Idempotenz-Marker dient deshalb `whatIDoTiles`, das kein
  // Feld-`defaultValue` trägt und nur durch dieses Skript gesetzt wird.
  const siteConfig = await payload.findGlobal({ slug: "site-config" });

  if (!siteConfig.whatIDoTiles || siteConfig.whatIDoTiles.length === 0) {
    await payload.updateGlobal({
      slug: "site-config",
      data: {
        hero: {
          eyebrow: "Fotograf & Videograf",
          name: "Kilian Siebert",
          tagline:
            "Ich filme das, was sich zu erleben lohnt — auf dem Rad genauso wie auf einer Hochzeit.",
          scrollHint: "↓ Scrollen",
          poster: placeholderMedia.id,
        },
        intro: {
          eyebrow: "Über mich",
          portrait: placeholderMedia.id,
        },
        whatIDoTiles: [
          { label: "Menschen", href: "/arbeiten", media: placeholderMedia.id },
          { label: "Reisen", href: "/arbeiten", media: placeholderMedia.id },
          { label: "Sport", href: "/arbeiten", media: placeholderMedia.id },
        ],
        facts: [
          { value: "3×", label: "Mitteldistanz" },
          { value: "14", label: "Länder" },
          { value: "seit 2021", label: "unterwegs" },
          { value: "∞", label: "Geschichten zu erzählen" },
        ],
        ctaLeft: {
          headline: "Projekt anfragen.",
          buttonLabel: "Kontakt",
          buttonHref: "/kontakt",
        },
        ctaRight: {
          headline: "Zusammenarbeiten.",
          buttonLabel: "Kooperationen",
          buttonHref: "/kooperationen",
        },
      },
      context: { disableRevalidate: true },
    });
    payload.logger.info("Seed: SiteConfig-Defaults gesetzt.");
  } else {
    payload.logger.info("Seed: SiteConfig bereits befüllt — übersprungen.");
  }

  payload.logger.info("Seed abgeschlossen.");
  process.exit(0);
}

await seed();
