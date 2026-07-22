import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";
import { ValidationError } from "payload";

import { revalidateMedia, revalidateMediaDelete } from "../hooks/revalidate";

/**
 * Mindestbreite für Bild-Uploads (px). Verhindert, dass komprimierte
 * Freigabe-Ableitungen (z.B. Apple-Fotos-Share-Sheet, Dateiname-Muster
 * `<UUID>_1_105_c.jpeg`, typischerweise ~1200px) versehentlich statt des
 * hochauflösenden Originals hochgeladen werden — sichtbar u.a. als
 * unscharfes Cover im Full-Bleed-Hero auf `/arbeiten/[slug]` (Konzept §4.2).
 * Liegt deutlich über der größten Payload-`imageSizes`-Variante (`hero`,
 * 1600px), damit auch bei 100vw-Darstellung auf breiten/hochauflösenden
 * Displays nicht hochskaliert werden muss.
 */
const MIN_UPLOAD_WIDTH = 2000;

const ensureMinResolution: CollectionBeforeValidateHook = async ({ data, operation }) => {
  if (operation !== "create" && operation !== "update") return data;
  // Kein neuer Datei-Upload in diesem Request (z.B. nur Alt-Text bearbeitet) —
  // Payload befüllt `width`/`mimeType` in `data` nur, wenn eine Datei mitkommt.
  if (!data?.mimeType?.startsWith("image/") || !data.width) return data;
  // Bewusste Ausnahme (z.B. Icon, Textur, Screenshot) — Redakteur:in hat das
  // Häkchen im Admin gesetzt, Sperre greift nicht.
  if (data.allowLowResolution) return data;

  if (data.width < MIN_UPLOAD_WIDTH) {
    throw new ValidationError({
      errors: [
        {
          message: `Bild zu klein (${data.width}×${data.height}px) — mindestens ${MIN_UPLOAD_WIDTH}px Breite nötig. Vermutlich eine komprimierte Freigabe-Kopie statt des Originals — bitte über "Original exportieren" erneut hochladen. Falls die niedrige Auflösung beabsichtigt ist, unten „Niedrige Auflösung akzeptieren" aktivieren und erneut speichern.`,
          path: "allowLowResolution",
        },
      ],
    });
  }

  return data;
};

/**
 * Media — Datenmodell für die Medien-Abstraktion (Sprint 1: src/lib/media/).
 *
 * Uploads landen seit Sprint 7 im Object Storage (MinIO lokal, siehe
 * docker-compose.dev.yml) statt im lokalen `staticDir` — der S3-Storage-
 * Adapter wird in `payload.config.ts` (`plugins: [s3Storage(...)]`)
 * registriert und setzt `disableLocalStorage` automatisch. Collection-
 * Schema und Feldnamen bleiben dabei stabil (`staticDir` ist nur noch der
 * lokale Schema-Defaultwert, wird zur Laufzeit nicht mehr beschrieben).
 *
 * `imageSizes` erzeugt die responsiven Bildvarianten, die das S3-Plugin
 * zusammen mit dem Original in den Bucket schreibt.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Medien",
  },
  hooks: {
    beforeValidate: [ensureMinResolution],
    afterChange: [revalidateMedia],
    afterDelete: [revalidateMediaDelete],
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "video/*"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 800, height: 600, position: "centre" },
      { name: "hero", width: 1600, height: 900, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt-Text",
      admin: {
        description: "Beschreibender Alt-Text — Pflichtfeld für Barrierefreiheit.",
      },
    },
    {
      name: "allowLowResolution",
      type: "checkbox",
      defaultValue: false,
      label: "Niedrige Auflösung akzeptieren",
      admin: {
        description:
          `Umgeht die Mindestbreite von ${MIN_UPLOAD_WIDTH}px (z.B. für Icons, Texturen, Screenshots ` +
          "— bewusst kein hochauflösendes Foto). Für Projekt-Cover/Galeriebilder nicht aktivieren.",
      },
    },
  ],
};
