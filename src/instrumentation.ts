/**
 * Läuft einmal beim Serverstart, bevor Requests angenommen werden (B25 S-04):
 * fehlende Pflicht-Env bricht den Start sofort ab, nicht erst beim ersten Request.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { readServerEnv } = await import("./lib/env");
    readServerEnv();
  }
}
