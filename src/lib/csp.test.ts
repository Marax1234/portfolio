import { describe, expect, it } from "vitest";
import { CSP_REPORT_PATH, buildCsp } from "./csp";
import { WindowLimiter, parseCspReports, stripUrl } from "./cspReport";

const directive = (csp: string, name: string) =>
  csp.split("; ").find((part) => part.startsWith(`${name} `));

describe("buildCsp", () => {
  const csp = buildCsp({
    mediaUrl: "https://cdn.kilia-siebert.de",
    analyticsUrl: "https://umami.kilia-siebert.de/script.js",
  });

  it("erlaubt CDN für Bilder, Video und fetch, Umami für Skript und Tracking", () => {
    expect(directive(csp, "img-src")).toBe("img-src 'self' data: blob: https://cdn.kilia-siebert.de");
    expect(directive(csp, "media-src")).toBe("media-src 'self' blob: https://cdn.kilia-siebert.de");
    expect(directive(csp, "script-src")).toBe("script-src 'self' 'unsafe-inline' https://umami.kilia-siebert.de");
    expect(directive(csp, "connect-src")).toBe(
      "connect-src 'self' https://cdn.kilia-siebert.de https://umami.kilia-siebert.de",
    );
  });

  it("erlaubt Einbettung nur same-origin (Live-Preview) und meldet an den Endpoint", () => {
    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'self'");
    expect(directive(csp, "report-uri")).toBe(`report-uri ${CSP_REPORT_PATH}`);
    expect(csp).not.toContain("unsafe-eval");
  });

  it("lässt fehlende oder ungültige URLs weg und erlaubt eval nur in dev", () => {
    const dev = buildCsp({ mediaUrl: "kein-url", dev: true });
    expect(directive(dev, "img-src")).toBe("img-src 'self' data: blob:");
    expect(directive(dev, "script-src")).toBe("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
  });
});

describe("parseCspReports", () => {
  it("liest das report-uri-Format und entfernt Query-Strings", () => {
    const [v] = parseCspReports({
      "csp-report": {
        "document-uri": "https://kilia-siebert.de/kontakt?email=a@b.de#x",
        "violated-directive": "img-src",
        "effective-directive": "img-src",
        "blocked-uri": "https://evil.example/pixel.gif?id=1",
        "line-number": 3,
        disposition: "report",
      },
    });
    expect(v).toEqual({
      document: "https://kilia-siebert.de/kontakt",
      directive: "img-src",
      blocked: "https://evil.example/pixel.gif",
      source: undefined,
      line: 3,
      disposition: "report",
    });
  });

  it("liest die Reporting API und ignoriert fremde Einträge", () => {
    const reports = parseCspReports([
      { type: "deprecation", body: { id: "x" } },
      {
        type: "csp-violation",
        body: { documentURL: "https://kilia-siebert.de/", effectiveDirective: "script-src-elem", blockedURL: "inline" },
      },
    ]);
    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({ directive: "script-src-elem", blocked: "inline" });
  });

  it("verwirft Müll ohne Fehler", () => {
    expect(parseCspReports(null)).toEqual([]);
    expect(parseCspReports({ foo: 1 })).toEqual([]);
    expect(parseCspReports([{ type: "csp-violation", body: {} }])).toEqual([]);
  });

  it("kürzt lange Werte", () => {
    expect(stripUrl(`https://x.example/${"a".repeat(500)}`).length).toBe(200);
  });
});

describe("WindowLimiter", () => {
  it("lässt pro Fenster nur max Meldungen durch", () => {
    const limiter = new WindowLimiter(2, 1000);
    expect([limiter.allow(0), limiter.allow(10), limiter.allow(20)]).toEqual([true, true, false]);
    expect(limiter.allow(1000)).toBe(true);
  });
});
