/**
 * Auswertung eingehender CSP-Verstoßmeldungen (B25 Session 21, `/api/csp-report`).
 *
 * Browser senden zwei Formate: `report-uri` (`{"csp-report": {...}}`, Content-Type
 * `application/csp-report`) und die Reporting API (`[{type: "csp-violation", body: {...}}]`,
 * `application/reports+json`). Geloggt werden nur die Felder, die für die Auswertung nötig
 * sind, URLs ohne Query und Fragment (keine personenbezogenen Parameter), gekürzt.
 */

export const MAX_REPORT_BYTES = 8 * 1024;
const MAX_FIELD = 200;
const MAX_REPORTS_PER_REQUEST = 10;

export interface CspViolation {
  document: string;
  directive: string;
  blocked: string;
  source?: string;
  line?: number;
  disposition?: string;
}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

/** Entfernt Query und Fragment; Schlüsselwörter wie `inline`/`eval` bleiben erhalten. */
export function stripUrl(value: string | undefined): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.slice(0, MAX_FIELD);
  } catch {
    return value.split(/[?#]/)[0].slice(0, MAX_FIELD);
  }
}

function toViolation(body: Json, legacy: boolean): CspViolation | undefined {
  const pick = (legacyKey: string, modernKey: string) => body[legacy ? legacyKey : modernKey];
  const directive = str(pick("effective-directive", "effectiveDirective")) ?? str(body["violated-directive"]);
  if (!directive) return undefined;
  const line = pick("line-number", "lineNumber");
  return {
    document: stripUrl(str(pick("document-uri", "documentURL"))),
    directive: directive.slice(0, MAX_FIELD),
    blocked: stripUrl(str(pick("blocked-uri", "blockedURL"))),
    source: str(pick("source-file", "sourceFile")) ? stripUrl(str(pick("source-file", "sourceFile"))) : undefined,
    line: typeof line === "number" && Number.isFinite(line) ? line : undefined,
    disposition: str(body.disposition)?.slice(0, 20),
  };
}

/** Liest beide Formate; Unbekanntes wird ignoriert. */
export function parseCspReports(data: unknown): CspViolation[] {
  if (isObject(data) && isObject(data["csp-report"])) {
    const violation = toViolation(data["csp-report"], true);
    return violation ? [violation] : [];
  }
  if (!Array.isArray(data)) return [];
  return data
    .slice(0, MAX_REPORTS_PER_REQUEST)
    .filter((entry): entry is Json => isObject(entry) && entry.type === "csp-violation" && isObject(entry.body))
    .map((entry) => toViolation(entry.body as Json, false))
    .filter((violation): violation is CspViolation => violation !== undefined);
}

/** Einfaches Fenster-Limit, damit ein Angreifer das Log nicht flutet. */
export class WindowLimiter {
  private windowStart = 0;
  private count = 0;

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  allow(now: number = Date.now()): boolean {
    if (now - this.windowStart >= this.windowMs) {
      this.windowStart = now;
      this.count = 0;
    }
    this.count += 1;
    return this.count <= this.max;
  }
}
