/**
 * Seed nur lokal (B25 D2): Der Seed legt einen Admin mit bekanntem Passwort und
 * Beispielinhalte an. Er darf nur gegen eine Datenbank auf diesem Rechner laufen
 * (Dev-Compose, DAST-Job im CI-Runner), nie gegen Produktion.
 */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export function isLocalDatabaseUri(uri: string | undefined): boolean {
  if (!uri) return false;
  try {
    return LOCAL_HOSTS.has(new URL(uri).hostname);
  } catch {
    return false;
  }
}
