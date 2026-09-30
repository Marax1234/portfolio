/**
 * Temp-Dateien von Uploads aufräumen (B25 Session 8).
 *
 * Mit `upload.useTempFiles` (payload.config.ts) landet jeder Upload zuerst unter
 * /tmp/payload-uploads. Payload löscht die Datei nach der Operation über `req.file`, das
 * Cloud-Storage-Plugin setzt `req.file` nach dem Upload in den Bucket aber auf `undefined`
 * (plugin-cloud-storage afterChange). Die Temp-Datei blieb dadurch bis zum nächsten Deploy
 * liegen, bei einem 1-GB-Video also 1 GB. Deshalb merken wir uns den Pfad vor der Operation
 * und löschen ihn danach selbst.
 */
import fs from "node:fs/promises";
import type { CollectionAfterOperationHook, CollectionBeforeOperationHook } from "payload";

const KEY = "uploadTempFilePath";

export const rememberUploadTempFile: CollectionBeforeOperationHook = ({ args, req }) => {
  const tempFilePath = req.file?.tempFilePath;
  if (tempFilePath) req.context[KEY] = tempFilePath;
  return args;
};

export const removeUploadTempFile: CollectionAfterOperationHook = async ({ req, result }) => {
  const tempFilePath = req.context[KEY];
  if (typeof tempFilePath === "string") {
    delete req.context[KEY];
    await fs.rm(tempFilePath, { force: true });
  }
  return result;
};

/** Für die `hooks` jeder Upload-Collection. */
export const uploadTempFileHooks = {
  beforeOperation: [rememberUploadTempFile],
  afterOperation: [removeUploadTempFile],
};
