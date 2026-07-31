import { useRef, useState } from "react";
import { go } from "../hooks/useHashRoute.js";
import "./VideoPage.css";

// Hidden full-screen video, reached via #/soon. Runs full-bleed inside the phone frame
// like the game does — App.jsx returns it before the appbar chrome.
//
// ON PREVENTING CAPTURE — read before adding more here:
// A web page CANNOT block screenshots or screen recording. There is no browser API for
// it; the native equivalent (Android's FLAG_SECURE) has no web counterpart, and iOS
// gives a page no way to know a recording is running, let alone stop one. The only
// technology that genuinely blocks capture is DRM (EME/Widevine), which needs a licence
// server and still loses to someone pointing a second phone at the screen.
//
// Everything below is a DETERRENT. It stops the accidental save and the casual
// right-click, and nothing more. Do not treat it as protection for anything that would
// actually hurt if it leaked — the file is also fetchable directly at its own URL.
// The original is HEVC (hvc1), which only Safari decodes — on Android Chrome and on
// desktop Chrome/Edge/Firefox it produced a silent black frame (videoWidth stayed 0).
// So it ships alongside an H.264 transcode: Safari picks the untouched original from
// the first <source>, everything else falls through to the second. Regenerate the
// fallback with `npm run build:video`.
const SRC_HEVC = "/KakaoTalk_20260731_114442086.mp4";
const SRC_H264 = "/KakaoTalk_20260731_114442086.h264.mp4";

export default function VideoPage() {
  const videoRef = useRef(/** @type {HTMLVideoElement | null} */ (null));
  // Autoplay is only permitted while muted, so that is the starting state and the
  // visitor opts into sound. Without it the video would simply never start on iOS.
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    // A muted autoplaying video can be paused by the browser's own heuristics; nudge it.
    if (v.paused) v.play().catch(() => {});
  };

  return (
    <div className="vp-root">
      <button
        type="button"
        className="vp-back"
        onClick={() => go("#/menu")}
        aria-label="Back to menu">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>

      <video
        ref={videoRef}
        className="vp-video"
        autoPlay
        loop
        muted
        // playsInline is load-bearing on iOS: without it Safari hands the video to the
        // native full-screen player, which brings its own AirPlay and share controls.
        playsInline
        // Deterrents only — see the note at the top of this file.
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        onContextMenu={(e) => e.preventDefault()}>
        {/* Order matters: the browser takes the first source it can decode. */}
        <source src={SRC_HEVC} type='video/mp4; codecs="hvc1"' />
        <source src={SRC_H264} type='video/mp4; codecs="avc1.640028"' />
      </video>

      <button type="button" className="vp-sound" onClick={toggleSound}>
        {muted ? "🔇 소리 켜기" : "🔊 소리 끄기"}
      </button>
    </div>
  );
}
