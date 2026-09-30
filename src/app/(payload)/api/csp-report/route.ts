/**
 * Empfänger für CSP-Verstoßmeldungen (B25 Session 21, Report-Only-Phase).
 * Schreibt je Verstoß eine Zeile `[csp-report] {...}` ins Container-Log, auswertbar per
 * `docker logs portfolio-app-1 2>&1 | grep csp-report`. Keine IP, keine Query-Strings.
 * Antwortet immer 204 (außer bei zu großen Bodys), damit Browser nicht wiederholen.
 * Liegt als statisches Segment vor dem Payload-Catch-all `api/[...slug]`.
 */
import { MAX_REPORT_BYTES, WindowLimiter, parseCspReports } from "@/lib/cspReport";

export const dynamic = "force-dynamic";

// Höchstens 60 Meldungen pro Minute ins Log, der Rest wird still verworfen.
const limiter = new WindowLimiter(60, 60_000);

/** Liest höchstens `limit` Bytes; `undefined`, wenn der Body größer ist. */
async function readLimited(request: Request, limit: number): Promise<string | undefined> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function POST(request: Request) {
  const noContent = new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_REPORT_BYTES) return new Response(null, { status: 413 });

  const text = await readLimited(request, MAX_REPORT_BYTES);
  if (text === undefined) return new Response(null, { status: 413 });

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return noContent;
  }
  for (const violation of parseCspReports(data)) {
    if (!limiter.allow()) break;
    console.warn(`[csp-report] ${JSON.stringify(violation)}`);
  }
  return noContent;
}
