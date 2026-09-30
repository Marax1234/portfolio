import { describe, expect, it } from "vitest";

import { contentType } from "./s3";

describe("contentType (HLS-Ausgaben)", () => {
  it.each([
    ["master.m3u8", "application/vnd.apple.mpegurl"],
    ["seg_001.ts", "video/mp2t"],
    ["poster.jpg", "image/jpeg"],
    ["poster.jpeg", "image/jpeg"],
    ["thumb.png", "image/png"],
    ["notes.txt", "application/octet-stream"],
  ])("%s → %s", (file, expected) => {
    expect(contentType(file)).toBe(expected);
  });
});
