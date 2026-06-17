/**
 * Seed-Skript (Sprint 4) — idempotent über die Local API.
 *
 * Legt einen Admin-User, ein Beispiel-Projekt, einen Beispiel-Journalbeitrag
 * und sinnvolle SiteConfig-Defaults an (Hero/Intro/Facts/CTAs aus den
 * Sprint-3-Platzhaltertexten). Mehrfaches Ausführen (`pnpm seed`) dupliziert
 * nichts — vor jedem `create` wird per `find`/Existenzprüfung gegengeprüft.
 *
 * Ergänzt, ersetzt aber nicht die manuelle No-Code-Pflege im Admin-Panel
 * (Akzeptanzkriterium Sprint 4: Inhalte lassen sich ohne Code anlegen).
 */
import path from "path";
import { fileURLToPath } from "url";
import config from "@payload-config";
import { getPayload } from "payload";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const PLACEHOLDER_IMAGE_PATH = path.resolve(
  dirname,
  "../../public/media/placeholder.svg",
);

async function seed() {
  const payload = await getPayload({ config });

  // 0. Platzhalter-Medium (gleiches SVG wie der lokale Media-Fallback aus
  // Sprint 1 — dient hier nur dazu, die `required`-Upload-Felder der
  // Beispiel-Inhalte zu erfüllen; echte Bilder kommen über den Admin oder
  // Sprint 5/7).
  let placeholderMedia = (
    await payload.find({
      collection: "media",
      where: { alt: { equals: "Seed-Platzhalter" } },
      limit: 1,
    })
  ).docs[0];

  if (!placeholderMedia) {
    placeholderMedia = await payload.create({
      collection: "media",
      data: { alt: "Seed-Platzhalter" },
      filePath: PLACEHOLDER_IMAGE_PATH,
    });
    payload.logger.info("Seed: Platzhalter-Medium angelegt.");
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
        featured: true,
        ctaLabel: "Projekt ansehen",
        ctaHref: "/arbeiten/triathlon-em-2024-hamburg",
        order: 0,
        publishedAt: new Date().toISOString(),
      },
    });
    payload.logger.info("Seed: Beispiel-Projekt angelegt.");
  } else {
    payload.logger.info("Seed: Beispiel-Projekt existiert bereits — übersprungen.");
  }

  // 3. Beispiel-Journalbeitrag
  const existingJournalPost = await payload.find({
    collection: "journal",
    where: { slug: { equals: "marokko-2024" } },
    limit: 1,
  });

  if (existingJournalPost.totalDocs === 0) {
    await payload.create({
      collection: "journal",
      data: {
        title: "Durch Marokko — 14 Tage, 2.400 km",
        slug: "marokko-2024",
        category: "reise",
        cover: placeholderMedia.id,
        order: 0,
        publishedAt: new Date("2024-03-01").toISOString(),
      },
    });
    payload.logger.info("Seed: Beispiel-Journalbeitrag angelegt.");
  } else {
    payload.logger.info("Seed: Beispiel-Journalbeitrag existiert bereits — übersprungen.");
  }

  // 4. SiteConfig-Defaults (nur setzen, falls noch leer)
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
    });
    payload.logger.info("Seed: SiteConfig-Defaults gesetzt.");
  } else {
    payload.logger.info("Seed: SiteConfig bereits befüllt — übersprungen.");
  }

  payload.logger.info("Seed abgeschlossen.");
  process.exit(0);
}

await seed();
