/**
 * Env-Validierung (B25 S-04): Ohne diese Werte kann der Server nicht sinnvoll laufen.
 * Fehlt einer, bricht der Start mit einer Meldung ab, die alle fehlenden Namen nennt,
 * statt still mit leeren Strings weiterzulaufen (z. B. leeres PAYLOAD_SECRET).
 *
 * Ausnahme `next build`: Das Image entsteht ohne DB und Secrets (B25 D-02/D-03).
 * `NEXT_PUBLIC_*` fehlen hier bewusst, weil Next sie beim Build einbackt und sie zur
 * Laufzeit nicht in der Umgebung stehen müssen.
 */
export const REQUIRED_SERVER_ENV = [
  "PAYLOAD_SECRET",
  "DATABASE_URI",
  "S3_BUCKET",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const;

export type RequiredServerEnv = (typeof REQUIRED_SERVER_ENV)[number];

type Env = Record<string, string | undefined>;

/** Wert von `PHASE_PRODUCTION_BUILD` aus `next/constants`, gesetzt während `next build`. */
export function isBuildPhase(env: Env = process.env): boolean {
  return env.NEXT_PHASE === "phase-production-build";
}

export function missingEnv(names: readonly string[], env: Env = process.env): string[] {
  return names.filter((name) => !env[name]?.trim());
}

export function readServerEnv(env: Env = process.env): Record<RequiredServerEnv, string> {
  const missing = missingEnv(REQUIRED_SERVER_ENV, env);
  if (missing.length > 0 && !isBuildPhase(env)) {
    throw new Error(
      `Fehlende Umgebungsvariablen: ${missing.join(", ")} ` +
        "(lokal: .env nach .env.example, Produktion: .env.prod / docker-compose.prod.yml)",
    );
  }
  return Object.fromEntries(
    REQUIRED_SERVER_ENV.map((name) => [name, env[name] ?? ""]),
  ) as Record<RequiredServerEnv, string>;
}
