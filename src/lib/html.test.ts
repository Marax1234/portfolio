import { describe, expect, it } from "vitest";

import { escapeHtml } from "./html";

describe("escapeHtml", () => {
  it("escaped alle HTML-Sonderzeichen (Mail-Templates, H-17)", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;",
    );
  });

  it("lässt normalen Text unverändert", () => {
    expect(escapeHtml("Hallo Kilian, schöne Grüße")).toBe("Hallo Kilian, schöne Grüße");
  });
});
