/**
 * Health-Endpoint (B25 Session 7, D-05/H-04) für den Compose-Healthcheck, den Smoke-Test
 * beim Deploy und das Monitoring. 200 nur, wenn Payload initialisiert ist (beim ersten Aufruf
 * inkl. `prodMigrations`) und Postgres antwortet. Die Antwort enthält bewusst keine Details.
 * Liegt als statisches Segment vor dem Payload-Catch-all `api/[...slug]`.
 */
import config from "@payload-config";
import { sql, type PostgresAdapter } from "@payloadcms/db-postgres";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const payload = await getPayload({ config });
    await (payload.db as unknown as PostgresAdapter).drizzle.execute(sql`select 1`);
    return Response.json({ ok: true }, { headers });
  } catch (err) {
    console.error(`[health] nicht bereit: ${String(err)}`);
    return Response.json({ ok: false }, { status: 503, headers });
  }
}
