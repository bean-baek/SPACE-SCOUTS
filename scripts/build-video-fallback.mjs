// Regenerates the H.264 fallback for the hidden video page (#/soon).
//
// The source KakaoTalk export is HEVC (hvc1). Safari decodes it; Android Chrome and
// desktop Chrome/Edge/Firefox do not, and render a silent black frame instead — a
// live check against the deployed page reported videoWidth: 0 on Chromium. So the
// original ships untouched for Safari and this transcode is the fallback everyone
// else falls through to. VideoPage.jsx lists them in that order.
//
// CRF 20 / preset slow lands within ~0.5% of the source's file size at the same
// 1440x1080 and 30fps, so the fallback is not a visible downgrade. +faststart moves
// the moov atom to the front so playback can begin before the file finishes loading.
//
// Run: npm run build:video

import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import ffmpeg from "@ffmpeg-installer/ffmpeg";

const SRC = "public/KakaoTalk_20260731_114442086.mp4";
const OUT = "public/KakaoTalk_20260731_114442086.h264.mp4";

execFileSync(
  ffmpeg.path,
  [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", SRC,
    "-c:v", "libx264",
    // High profile + yuv420p is the combination every browser and iOS device decodes.
    "-profile:v", "high",
    "-pix_fmt", "yuv420p",
    "-crf", "20",
    "-preset", "slow",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    OUT,
  ],
  { stdio: "inherit" }
);

const kb = (p) => (statSync(p).size / 1024).toFixed(0);
console.log(`${OUT}  ${kb(OUT)} KB  (source ${kb(SRC)} KB)`);
