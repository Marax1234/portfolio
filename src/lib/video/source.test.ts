import { describe, expect, it } from "vitest";

import { isAllowedSourceUrl } from "./source";

const BASE = "https://cdn.kilia-siebert.de";

describe("isAllowedSourceUrl", () => {
  it("erlaubt Dateien vom eigenen Object Storage", () => {
    expect(isAllowedSourceUrl(`${BASE}/videos/clip.mp4`, BASE)).toBe(true);
    expect(isAllowedSourceUrl("http://localhost:9102/media/a.mp4", "http://localhost:9102")).toBe(true);
  });

  it("lehnt fremde Hosts ab, auch mit gleichem Präfix", () => {
    expect(isAllowedSourceUrl("https://evil.example/clip.mp4", BASE)).toBe(false);
    expect(isAllowedSourceUrl("https://cdn.kilia-siebert.de.evil.example/clip.mp4", BASE)).toBe(false);
  });

  it("lehnt anderes Schema, anderen Port und Zugangsdaten in der URL ab", () => {
    expect(isAllowedSourceUrl("http://cdn.kilia-siebert.de/clip.mp4", BASE)).toBe(false);
    expect(isAllowedSourceUrl("https://cdn.kilia-siebert.de:8443/clip.mp4", BASE)).toBe(false);
    expect(isAllowedSourceUrl("https://user:pw@cdn.kilia-siebert.de/clip.mp4", BASE)).toBe(false);
  });

  it("beachtet einen Pfad in der Basis", () => {
    expect(isAllowedSourceUrl(`${BASE}/bucket/clip.mp4`, `${BASE}/bucket`)).toBe(true);
    expect(isAllowedSourceUrl(`${BASE}/bucket-evil/clip.mp4`, `${BASE}/bucket`)).toBe(false);
  });

  it("lehnt ab, wenn keine Basis konfiguriert ist oder die URL ungültig ist", () => {
    expect(isAllowedSourceUrl(`${BASE}/clip.mp4`, undefined)).toBe(false);
    expect(isAllowedSourceUrl("kein url", BASE)).toBe(false);
  });
});
