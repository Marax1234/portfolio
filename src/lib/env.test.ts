import { describe, expect, it } from "vitest";
import { REQUIRED_SERVER_ENV, isBuildPhase, missingEnv, readServerEnv } from "./env";

const complete = Object.fromEntries(REQUIRED_SERVER_ENV.map((name) => [name, `wert-${name}`]));

describe("readServerEnv", () => {
  it("liefert alle Pflichtwerte, wenn sie gesetzt sind", () => {
    expect(readServerEnv(complete).PAYLOAD_SECRET).toBe("wert-PAYLOAD_SECRET");
  });

  it("nennt alle fehlenden bzw. leeren Variablen in der Fehlermeldung", () => {
    const env = { ...complete, PAYLOAD_SECRET: undefined, S3_BUCKET: "  " };
    expect(() => readServerEnv(env)).toThrow(/PAYLOAD_SECRET, S3_BUCKET/);
  });

  it("wirft während next build nicht (Build ohne Secrets)", () => {
    const env = { NEXT_PHASE: "phase-production-build" };
    expect(readServerEnv(env).DATABASE_URI).toBe("");
  });

  it("wirft zur Laufzeit auch mit NEXT_PHASE eines anderen Modus", () => {
    expect(() => readServerEnv({ NEXT_PHASE: "phase-production-server" })).toThrow(/DATABASE_URI/);
  });
});

describe("Hilfsfunktionen", () => {
  it("missingEnv behält die Reihenfolge der Namen", () => {
    expect(missingEnv(["A", "B", "C"], { B: "x" })).toEqual(["A", "C"]);
  });

  it("isBuildPhase erkennt nur den Produktions-Build", () => {
    expect(isBuildPhase({ NEXT_PHASE: "phase-production-build" })).toBe(true);
    expect(isBuildPhase({})).toBe(false);
  });
});
