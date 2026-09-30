import { describe, expect, it } from "vitest";
import { isLocalDatabaseUri } from "./seedGuard";

describe("isLocalDatabaseUri", () => {
  it("erlaubt die lokale Dev- bzw. CI-Datenbank", () => {
    expect(isLocalDatabaseUri("postgres://portfolio:portfolio@localhost:5432/portfolio")).toBe(true);
    expect(isLocalDatabaseUri("postgres://u:p@127.0.0.1:5432/db")).toBe(true);
    expect(isLocalDatabaseUri("postgres://u:p@[::1]:5432/db")).toBe(true);
  });

  it("lehnt entfernte Hosts und den Compose-Dienst der Produktion ab", () => {
    expect(isLocalDatabaseUri("postgres://portfolio:x@postgres:5432/portfolio")).toBe(false);
    expect(isLocalDatabaseUri("postgres://u:p@10.10.0.2:5432/db")).toBe(false);
    expect(isLocalDatabaseUri("postgres://u:p@localhost.evil.example:5432/db")).toBe(false);
  });

  it("lehnt fehlende oder kaputte Werte ab", () => {
    expect(isLocalDatabaseUri(undefined)).toBe(false);
    expect(isLocalDatabaseUri("")).toBe(false);
    expect(isLocalDatabaseUri("kein-uri")).toBe(false);
  });
});
