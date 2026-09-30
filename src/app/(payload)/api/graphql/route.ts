/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
// Ausnahme (B25 Session 8): Auch der GraphQL-Handler liest Multipart-Bodies nach /tmp,
// daher derselbe Upload-Guard wie in api/[...slug]/route.ts.
import config from "@payload-config";
import { GRAPHQL_POST, REST_OPTIONS } from "@payloadcms/next/routes";
import { guardLargeAnonymousMultipart } from "@/lib/uploadGuard";

export const POST = guardLargeAnonymousMultipart(GRAPHQL_POST(config));

export const OPTIONS = REST_OPTIONS(config);
