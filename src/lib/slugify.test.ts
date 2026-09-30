import { describe, expect, it } from "vitest";

import { slugify } from "./slugify";

describe("slugify", () => {
  it("macht aus Titeln mit Satzzeichen einen Slug", () => {
    expect(slugify("Triathlon EM 2024 — Hamburg")).toBe("triathlon-em-2024-hamburg");
  });

  it("entfernt Diakritika und ersetzt ß", () => {
    expect(slugify("Café Straße Über")).toBe("cafe-strasse-uber");
  });

  it("entfernt führende und folgende Trenner", () => {
    expect(slugify("  --Hallo, Welt!--  ")).toBe("hallo-welt");
  });
});
