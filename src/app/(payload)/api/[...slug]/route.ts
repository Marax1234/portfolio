/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
// Ausnahme (B25 Session 8): POST/PATCH laufen durch den Upload-Guard, damit anonyme
// Multipart-Requests > 1 MiB abgelehnt werden, bevor Payload den Body liest.
// Bei einem Payload-Update, das diese Datei neu erzeugt, den Guard wieder einsetzen.
import config from "@payload-config";
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST } from "@payloadcms/next/routes";
import { guardLargeAnonymousMultipart } from "@/lib/uploadGuard";

export const GET = REST_GET(config);
export const POST = guardLargeAnonymousMultipart(REST_POST(config));
export const DELETE = REST_DELETE(config);
export const PATCH = guardLargeAnonymousMultipart(REST_PATCH(config));
export const OPTIONS = REST_OPTIONS(config);
