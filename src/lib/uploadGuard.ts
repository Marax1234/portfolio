/**
 * Upload-Guard für Payloads REST-Route (B25 Session 8; GraphQL ist seit Session 23 aus).
 *
 * Payload liest den Multipart-Body (bis 4 GiB, payload.config.ts `upload`) vollständig
 * nach /tmp, bevor die Zugriffsprüfung der Operation greift. Anonyme Requests wurden also
 * erst nach dem kompletten Upload mit 403 abgelehnt. Dieser Guard prüft bei großen
 * Multipart-Requests zuerst die Anmeldung (nur Header/Cookie, der Body bleibt ungelesen).
 *
 * Kleine Multipart-Requests bleiben anonym erlaubt: Das Admin-Login und „Passwort
 * vergessen“ schicken ihre Formulare als multipart/form-data.
 * Bewusst kein Next-Proxy (proxy.ts): der puffert jeden Body bis `proxyClientMaxBodySize`
 * und schneidet größere Uploads ab.
 */
import config from "@payload-config";
import { getPayload } from "payload";

/** Größer als jedes Login-/Passwort-Formular, kleiner als jeder sinnvolle Datei-Upload. */
const ANONYMOUS_MULTIPART_LIMIT = 1024 * 1024; // 1 MiB

export function guardLargeAnonymousMultipart<A extends unknown[]>(
  handler: (request: Request, ...args: A) => Promise<Response>,
): (request: Request, ...args: A) => Promise<Response> {
  return async (request, ...args) => {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data")) return handler(request, ...args);

    // Ohne Content-Length (chunked) ist die Größe unbekannt → wie ein großer Upload behandeln.
    const rawLength = request.headers.get("content-length");
    const length = rawLength ? Number(rawLength) : Number.NaN;
    if (Number.isFinite(length) && length <= ANONYMOUS_MULTIPART_LIMIT) return handler(request, ...args);

    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: request.headers });
    if (!user) {
      // Gleiche Antwort wie Payloads eigene Zugriffsprüfung.
      return Response.json(
        { errors: [{ message: "You are not allowed to perform this action." }] },
        { status: 403 },
      );
    }
    return handler(request, ...args);
  };
}
