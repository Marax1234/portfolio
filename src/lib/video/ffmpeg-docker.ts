/**
 * FFmpeg-Docker-Wrapper (Sprint 8)
 *
 * Kapselt `docker run --rm` für ffmpeg und ffprobe.
 * Kein Host-ffmpeg erforderlich — gepinntes Image läuft in einem
 * kurzlebigen Container. Ein-/Ausgaben laufen über ein gemountetes
 * Temp-Verzeichnis (workDir).
 *
 * Image: FFMPEG_DOCKER_IMAGE (Default: jrottenberg/ffmpeg:6.1-ubuntu2204).
 * Voraussetzung: laufender Docker-Daemon (für `pnpm db:up` ohnehin gegeben).
 *
 * WSL2-Hinweis: /tmp ist vom Docker-Daemon mountbar; bei Problemen
 * TMPDIR auf einen Pfad setzen, der im Docker-Desktop-/Engine-Mount-Scope liegt.
 */

import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);

export const FFMPEG_IMAGE =
  process.env.FFMPEG_DOCKER_IMAGE ?? "jrottenberg/ffmpeg:6.1-ubuntu2204";

/** Führt `docker run --rm -v workDir:workDir -w workDir <image> ...args` aus. */
export async function runFfmpeg(args: string[], workDir: string): Promise<string> {
  const { stdout, stderr } = await execFile(
    "docker",
    [
      "run",
      "--rm",
      "-v", `${workDir}:${workDir}`,
      "-w", workDir,
      FFMPEG_IMAGE,
      ...args,
    ],
    { maxBuffer: 64 * 1024 * 1024 }, // 64 MB stderr buffer
  ).catch((err: NodeJS.ErrnoException & { stdout?: string; stderr?: string }) => {
    // execFile rejects on non-zero exit; ffmpeg writes progress to stderr —
    // eigentliche Fehler sind ebenfalls dort; stdout oft leer.
    throw new Error(`ffmpeg (Docker) failed:\n${err.stderr ?? ""}\n${err.message}`);
  });
  void stderr; // ffmpeg-Fortschrittsausgabe — wird nicht benötigt
  return stdout;
}

/** Führt ffprobe im Container aus (überschreibt ffmpeg-Entrypoint). */
export async function runFfprobe(args: string[], workDir: string): Promise<string> {
  const { stdout } = await execFile(
    "docker",
    [
      "run",
      "--rm",
      "--entrypoint", "ffprobe",
      "-v", `${workDir}:${workDir}`,
      "-w", workDir,
      FFMPEG_IMAGE,
      ...args,
    ],
    { maxBuffer: 4 * 1024 * 1024 },
  ).catch((err: NodeJS.ErrnoException & { stdout?: string; stderr?: string }) => {
    throw new Error(`ffprobe (Docker) failed:\n${err.stderr ?? ""}\n${err.message}`);
  });
  return stdout;
}

/** Prüft, ob Docker verfügbar und das ffmpeg-Image vorhanden ist. */
export async function isFfmpegAvailable(): Promise<boolean> {
  try {
    // docker inspect gibt 0 zurück, wenn das Image lokal vorliegt
    await execFile("docker", ["image", "inspect", FFMPEG_IMAGE, "--format", "{{.Id}}"], {
      maxBuffer: 1024,
    });
    return true;
  } catch {
    return false;
  }
}
