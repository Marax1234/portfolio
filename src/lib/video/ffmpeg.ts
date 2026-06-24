/**
 * FFmpeg-Wrapper (Sprint 8, überarbeitet)
 *
 * Ruft `ffmpeg`/`ffprobe` direkt als Host-Binary auf — kein `docker run`
 * mehr, da der App-Container in Produktion keinen Zugriff auf den
 * Docker-Daemon hat (kein Docker-CLI, kein gemounteter Socket). Die
 * Binaries werden stattdessen direkt im Image installiert (Alpine-Paket
 * `ffmpeg`, siehe Dockerfile-`runner`-Stage) — enthält auch `ffprobe`.
 */

import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);

/** Führt `ffmpeg <args>` mit `workDir` als cwd aus. */
export async function runFfmpeg(args: string[], workDir: string): Promise<string> {
  const { stdout, stderr } = await execFile(
    "ffmpeg",
    args,
    { cwd: workDir, maxBuffer: 64 * 1024 * 1024 }, // 64 MB stderr buffer
  ).catch((err: NodeJS.ErrnoException & { stdout?: string; stderr?: string }) => {
    // ffmpeg schreibt Fortschritt UND Fehler nach stderr; stdout oft leer.
    throw new Error(`ffmpeg failed:\n${err.stderr ?? ""}\n${err.message}`);
  });
  void stderr; // ffmpeg-Fortschrittsausgabe — wird nicht benötigt
  return stdout;
}

/** Führt `ffprobe <args>` mit `workDir` als cwd aus. */
export async function runFfprobe(args: string[], workDir: string): Promise<string> {
  const { stdout } = await execFile(
    "ffprobe",
    args,
    { cwd: workDir, maxBuffer: 4 * 1024 * 1024 },
  ).catch((err: NodeJS.ErrnoException & { stdout?: string; stderr?: string }) => {
    throw new Error(`ffprobe failed:\n${err.stderr ?? ""}\n${err.message}`);
  });
  return stdout;
}

/** Prüft, ob `ffmpeg` als Binary verfügbar ist. */
export async function isFfmpegAvailable(): Promise<boolean> {
  try {
    await execFile("ffmpeg", ["-version"], { maxBuffer: 1024 * 1024 });
    return true;
  } catch {
    return false;
  }
}
