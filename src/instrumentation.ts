/**
 * Läuft einmal beim Serverstart, bevor Requests angenommen werden (B25 S-04):
 * Fehlt Pflicht-Env, beendet sich der Prozess mit Exit 1, statt halb gestartet
 * weiterzulaufen (Next fängt Fehler aus `register` ab). Compose startet neu,
 * `deploy.sh` rollt zurück, `health-check` meldet den Container.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { readServerEnv } = await import("./lib/env");
  try {
    readServerEnv();
  } catch (err) {
    console.error(`[env] ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
