import { describe, expect, it } from "vitest";

import { formatMeta, PROJECT_CATEGORIES } from "./format";

describe("formatMeta", () => {
  it("zeigt Kategorie und Monat/Jahr", () => {
    expect(formatMeta("reise", "2024-03-15T10:00:00.000Z")).toBe("Reise · März 2024");
  });

  it("zeigt ohne Datum nur die Kategorie", () => {
    expect(formatMeta("behind-the-scenes", null)).toBe("Behind-the-Scenes");
    expect(formatMeta("hochzeiten")).toBe("Hochzeiten");
  });

  it("fällt bei unbekannter Kategorie auf den Rohwert zurück", () => {
    expect(formatMeta("unbekannt" as never)).toBe("unbekannt");
  });
});

describe("PROJECT_CATEGORIES", () => {
  it("enthält jede Projekt-Kategorie mit Label", () => {
    expect(PROJECT_CATEGORIES.map((c) => c.value)).toEqual([
      "hochzeiten",
      "menschen",
      "reisen",
      "sport",
      "commercial",
    ]);
  });
});
