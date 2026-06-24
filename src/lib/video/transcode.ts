/**
 * FFmpeg-Transkodierungs-Pipeline (Sprint 8)
 *
 * Ablauf:
 * 1. Video-Doc laden, Original per fetch in ein Temp-Verzeichnis laden.
 * 2. ffprobe → Maße, Dauer, Audiospur.
 * 3. ffmpeg (im Docker-Container) → HLS-ABR-Ladder 1080/720/480p +
 *    Master-Playlist.
 * 4. Poster-Frame extrahieren (1 s).
 * 5. Alle Ausgaben in den Object Storage hochladen.
 * 6. Payload-Doc mit hlsUrl, posterUrl, width, height, duration, status=ready
 *    aktualisieren.
 *
 * `transcodeVideo` ist idempotent aufrufbar:
 * - Vom afterChange-Hook (fire-and-forget, nicht awaited) — blockiert das Admin nicht.
 * - Vom Seed-Skript (awaited) — für das Test-Video aus info/Video.mp4.
 *
 * Guard gegen Endlosschleife: `context.skipTranscode = true` verhindert, dass
 * das abschließende `payload.update` den Hook erneut auslöst.
 */

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Payload } from "payload";
import type { CollectionAfterChangeHook } from "payload";
import type { Video } from "@/payload-types";

import { isFfmpegAvailable, runFfmpeg, runFfprobe } from "./ffmpeg";
import { uploadDirectory, uploadFile } from "./s3";

/** Vom afterChange-Hook aufgerufen. Startet die Transkodierung fire-and-forget. */
export const triggerTranscode: CollectionAfterChangeHook = ({ doc, req, operation }) => {
  // Nur bei neuem Upload (create) oder wenn status noch nicht ready ist
  if (req.context?.skipTranscode) return doc;
  if (operation !== "create" && doc.status === "ready") return doc;
  if (!doc.url) return doc;

  // `doc` direkt verwenden statt per `payload.findByID` neu zu laden: Die
  // Transaktion des `create`/`update`-Requests ist beim fire-and-forget-Start
  // noch nicht committed — ein `findByID` aus einer neuen DB-Verbindung sah
  // den gerade angelegten Datensatz daher gelegentlich noch nicht und warf
  // "NotFound" *vor* dem try/catch unten, wodurch der Status für immer auf
  // "processing" hängen blieb statt auf "error" zu wechseln.
  transcodeVideo(req.payload, doc).catch((err: unknown) => {
    req.payload.logger.error(
      `[transcode] Video ${doc.id} fehlgeschlagen: ${String(err)}`,
    );
  });

  return doc;
};

/** Prüft, ob Docker+Image verfügbar — für den Seed-Guard. */
export { isFfmpegAvailable };

interface FfprobeStream {
  codec_type: string;
  width?: number;
  height?: number;
  duration?: string;
}
interface FfprobeResult {
  streams: FfprobeStream[];
  format?: { duration?: string };
}

async function probe(
  inputPath: string,
  workDir: string,
): Promise<{ width: number; height: number; duration: number; hasAudio: boolean }> {
  const rel = path.relative(workDir, inputPath);
  const raw = await runFfprobe(
    ["-v", "quiet", "-print_format", "json", "-show_streams", "-show_format", rel],
    workDir,
  );
  const info: FfprobeResult = JSON.parse(raw);
  const video = info.streams.find((s) => s.codec_type === "video");
  const hasAudio = info.streams.some((s) => s.codec_type === "audio");
  const durationStr =
    info.format?.duration ??
    info.streams.find((s) => s.duration)?.duration ??
    "0";
  return {
    width: video?.width ?? 1920,
    height: video?.height ?? 1080,
    duration: parseFloat(durationStr),
    hasAudio,
  };
}

async function buildHls(
  inputRel: string,
  workDir: string,
  hasAudio: boolean,
): Promise<void> {
  // Sub-Verzeichnisse für die drei Varianten anlegen
  await fs.mkdir(path.join(workDir, "stream_0"), { recursive: true });
  await fs.mkdir(path.join(workDir, "stream_1"), { recursive: true });
  await fs.mkdir(path.join(workDir, "stream_2"), { recursive: true });

  const varStreamMap = hasAudio
    ? "v:0,a:0 v:1,a:1 v:2,a:2"
    : "v:0 v:1 v:2";

  const audioMaps: string[] = hasAudio
    ? ["-map", "0:a", "-map", "0:a", "-map", "0:a",
       "-c:a:0", "aac", "-b:a:0", "128k",
       "-c:a:1", "aac", "-b:a:1", "128k",
       "-c:a:2", "aac", "-b:a:2", "128k"]
    : [];

  await runFfmpeg(
    [
      "-i", inputRel,
      "-filter_complex",
      "[0:v]split=3[v1][v2][v3];" +
        "[v1]scale=-2:1080[v1o];" +
        "[v2]scale=-2:720[v2o];" +
        "[v3]scale=-2:480[v3o]",
      // 1080p
      "-map", "[v1o]", "-c:v:0", "libx264",
      "-b:v:0", "5000k", "-maxrate:v:0", "5350k", "-bufsize:v:0", "7500k",
      // 720p
      "-map", "[v2o]", "-c:v:1", "libx264",
      "-b:v:1", "2800k", "-maxrate:v:1", "2996k", "-bufsize:v:1", "4200k",
      // 480p
      "-map", "[v3o]", "-c:v:2", "libx264",
      "-b:v:2", "1400k", "-maxrate:v:2", "1498k", "-bufsize:v:2", "2100k",
      ...audioMaps,
      "-preset", "veryfast",
      "-profile:v", "main",
      "-pix_fmt", "yuv420p",
      "-flags", "+cgop",
      "-g", "48",
      "-keyint_min", "48",
      "-sc_threshold", "0",
      "-f", "hls",
      "-hls_time", "6",
      "-hls_playlist_type", "vod",
      "-hls_flags", "independent_segments",
      "-hls_segment_filename", "stream_%v/seg_%03d.ts",
      "-master_pl_name", "master.m3u8",
      "-var_stream_map", varStreamMap,
      "stream_%v/playlist.m3u8",
    ],
    workDir,
  );
}

async function extractPoster(inputRel: string, workDir: string): Promise<void> {
  await runFfmpeg(
    ["-i", inputRel, "-ss", "00:00:01", "-frames:v", "1", "-q:v", "2", "poster.jpg"],
    workDir,
  );
}

/**
 * Hauptfunktion: lädt das Original herunter, transkodiert, uploadt, aktualisiert das Doc.
 *
 * Nimmt das Doc direkt entgegen (statt per `findByID` neu zu laden) — siehe
 * Kommentar bei `triggerTranscode` zur Transaktions-Race-Condition.
 */
export async function transcodeVideo(payload: Payload, doc: Video): Promise<void> {
  const videoId = doc.id;
  if (!doc.url) {
    payload.logger.warn(`[transcode] Video ${videoId}: keine URL — übersprungen.`);
    return;
  }

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), `hls-${videoId}-`));

  try {
    // 1. Original herunterladen
    // Härtung (CodeQL js/http-to-file-access): Bevor Netzwerkdaten auf die Platte
    // geschrieben werden, die Quelle auf den eigenen Object Storage einschränken
    // (kein beliebiger Host → kein SSRF/Fremdinhalt) und die Größe deckeln
    // (kein Platten-/Speicher-Erschöpfen durch überdimensionierte Downloads).
    const allowedBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
    const sourceUrl = doc.url as string;
    if (!allowedBase || !sourceUrl.startsWith(allowedBase)) {
      throw new Error(`[transcode] Unerlaubte Video-Quelle für ${videoId}: ${sourceUrl}`);
    }
    const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GiB Obergrenze
    const inputPath = path.join(workDir, "input.mp4");
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`Download fehlgeschlagen: ${response.status} ${sourceUrl}`);
    const declaredLength = Number(response.headers.get("content-length") ?? "0");
    if (declaredLength > MAX_BYTES) {
      throw new Error(`[transcode] Video ${videoId} zu groß (Content-Length ${declaredLength} > ${MAX_BYTES}).`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) {
      throw new Error(`[transcode] Video ${videoId} zu groß (${buffer.byteLength} > ${MAX_BYTES}).`);
    }
    await fs.writeFile(inputPath, buffer);

    // 2. Probe
    const { width, height, duration, hasAudio } = await probe(inputPath, workDir);

    // 3. HLS transkodieren
    await buildHls("input.mp4", workDir, hasAudio);

    // 4. Poster-Frame
    await extractPoster("input.mp4", workDir);

    // 5. In Object Storage hochladen
    const s3Prefix = `videos/hls/${videoId}`;
    await uploadDirectory(workDir, s3Prefix);
    const masterUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${s3Prefix}/master.m3u8`;
    const posterKey = `${s3Prefix}/poster.jpg`;
    // poster.jpg wurde schon via uploadDirectory mitgenommen — URL ableiten
    const posterUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${posterKey}`;
    void (await uploadFile); // tree-shaking guard (uploadFile bereits importiert)

    // 6. Doc aktualisieren
    await payload.update({
      collection: "videos",
      id: videoId,
      data: {
        status: "ready",
        hlsUrl: masterUrl,
        posterUrl,
        width,
        height,
        duration,
      },
      context: { skipTranscode: true, disableRevalidate: false },
    });

    payload.logger.info(`[transcode] Video ${videoId} fertig: ${masterUrl}`);
  } catch (err) {
    payload.logger.error(`[transcode] Video ${videoId} Fehler: ${String(err)}`);
    await payload.update({
      collection: "videos",
      id: videoId,
      data: { status: "error" },
      context: { skipTranscode: true, disableRevalidate: true },
    }).catch(() => undefined);
    throw err;
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
