/**
 * S3-Client-Helper für Video-Uploads (Sprint 8).
 *
 * Lädt einzelne Dateien und ganze Verzeichnisbäume (HLS-Segmente) in den
 * Object Storage. Wiederverwendet die S3_*-Env-Vars aus Sprint 7.
 *
 * Kein @payloadcms/storage-s3 hier — das Plugin kümmert sich nur um die
 * Upload-Collection-Originale. Die abgeleiteten HLS-Ausgaben (Segmente,
 * Playlist, Poster) werden direkt über @aws-sdk/client-s3 hochgeladen.
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import path from "node:path";

export function getS3Client(): S3Client {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "us-east-1",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
}

const BUCKET = () => process.env.S3_BUCKET ?? "portfolio-media";
const PUBLIC_BASE = () =>
  process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? "http://localhost:9100/portfolio-media";

/** ContentType-Lookup für HLS-Ausgaben. */
function contentType(filename: string): string {
  if (filename.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
  if (filename.endsWith(".ts")) return "video/mp2t";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  if (filename.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

/**
 * Lädt eine einzelne Datei in den Bucket.
 * @param localPath  Absoluter lokaler Pfad
 * @param s3Key      Schlüssel im Bucket (ohne führenden Slash)
 * @returns          Öffentliche URL der hochgeladenen Datei
 */
export async function uploadFile(localPath: string, s3Key: string): Promise<string> {
  const client = getS3Client();
  const body = await fs.readFile(localPath);
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET(),
      Key: s3Key,
      Body: body,
      ContentType: contentType(path.basename(localPath)),
    }),
  );
  return `${PUBLIC_BASE()}/${s3Key}`;
}

/**
 * Lädt ein gesamtes Verzeichnis rekursiv in den Bucket unter einem Prefix.
 * @param localDir  Absoluter lokaler Verzeichnispfad
 * @param s3Prefix  Prefix im Bucket (z. B. "videos/hls/abc123")
 */
export async function uploadDirectory(localDir: string, s3Prefix: string): Promise<void> {
  const entries = await fs.readdir(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localFull = path.join(localDir, entry.name);
    const s3Key = `${s3Prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      await uploadDirectory(localFull, s3Key);
    } else {
      await uploadFile(localFull, s3Key);
    }
  }
}
