import { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import Ufo, { UFO_DEFAULT } from "./Ufo.jsx";
import { postMessage } from "./boardApi.js";
import { clampX, clampY } from "./placement.js";

const MAX = 80;
const SEGMENTS = ["top", "middle", "bottom"];

// Shown in place of the drag hint when a save fails. Reuses that element rather than
// adding one, so the placing bar's layout is untouched.
const SAVE_ERRORS = {
  "rate-limit": "Too many reports just now — wait a moment, then try again.",
  server: "Couldn't reach the board. Tap PLACE HERE to try again.",
  network: "You seem to be offline. Tap PLACE HERE to try again.",
};


// Two-phase flow:
//   compose  — write the message + tint the three UFO sections
//   placing  — the UFO flies up automatically, then the visitor drags it home
/**
 * @param {{
 *   onPlaced: (row: import('./boardApi.js').BoardMessage) => void,
 *   onCancel: () => void,
 * }} props
 */
export default function UfoComposer({ onPlaced, onCancel }) {
  const [step, setStep] = useState("compose");
  const [text, setText] = useState("");
  const [colors, setColors] = useState(UFO_DEFAULT);
  const [openSeg, setOpenSeg] = useState(/** @type {string | null} */ (null));

  const [pos, setPos] = useState({ x: 0.5, y: 1.25 }); // starts below the board
  const [flying, setFlying] = useState(true); // fly-up transition on; off while dragging
  const [grabbed, setGrabbed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(/** @type {string | null} */ (null));

  /** @type {import('react').RefObject<HTMLDivElement | null>} */
  const layerRef = useRef(null);
  const draggingRef = useRef(false);
  const grabOffsetRef = useRef({ x: 0, y: 0 });

  const setSeg = (seg, value) => setColors((c) => ({ ...c, [seg]: value }));

  const launch = () => {
    setStep("placing");
    // Two rAFs: mount at y=1.25, then commit the resting spot so the CSS transition runs.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setPos({ x: 0.5, y: 0.4 }))
    );
  };

  const pointerFrac = (e) => {
    // Callers all guard on layerRef.current; this runs only while the layer is up.
    const r = /** @type {HTMLDivElement} */ (layerRef.current).getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  // Grab the UFO wherever it's touched and keep that point under the finger — no
  // jump-to-centre — so dragging feels like moving a physical object.
  const onPointerDown = (e) => {
    if (!layerRef.current) return;
    const p = pointerFrac(e);
    grabOffsetRef.current = { x: pos.x - p.x, y: pos.y - p.y };
    draggingRef.current = true;
    setGrabbed(true);
    setFlying(false);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current || !layerRef.current) return;
    const p = pointerFrac(e);
    const off = grabOffsetRef.current;
    const layerH = layerRef.current.getBoundingClientRect().height;
    setPos({ x: clampX(p.x + off.x), y: clampY(p.y + off.y, layerH) });
  };

  const onPointerUp = (e) => {
    draggingRef.current = false;
    setGrabbed(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const confirm = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await postMessage({
        text: text.trim(),
        top: colors.top,
        middle: colors.middle,
        bottom: colors.bottom,
        x: pos.x,
        y: pos.y,
      });
      // Only hand the row up on a real save. On failure the UFO stays where the
      // visitor put it, so PLACE HERE simply retries — nothing is lost.
      if (result.ok) onPlaced(result.row);
      else setSaveError(SAVE_ERRORS[result.reason] ?? SAVE_ERRORS.server);
    } finally {
      // Always releases the button; a stuck "…" was the old failure mode.
      setSaving(false);
    }
  };

  if (step === "placing") {
    return (
      <div className="placing" ref={layerRef}>
        <div
          className={`placing__ufo${flying ? " is-flying" : ""}${
            grabbed ? " is-grabbed" : ""
          }`}
          style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}>
          <Ufo colors={colors} size={68} />
        </div>

        <div className="placing__bar">
          <span className="placing__hint" role={saveError ? "alert" : undefined}>
            {saveError ?? "Drag your UFO into place"}
          </span>
          <button
            type="button"
            className="placing__done"
            disabled={saving}
            onClick={confirm}>
            {saving ? "…" : "PLACE HERE"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="composer" role="dialog" aria-modal="true" aria-label="New mission report">
      <div className="composer__sheet">
        <button
          type="button"
          className="composer__x"
          onClick={onCancel}
          aria-label="Cancel">
          ✕
        </button>

        <div className="composer__preview">
          <Ufo colors={colors} size={128} />
        </div>

        <div className="composer__swatches">
          {SEGMENTS.map((seg) => (
            <div className="swatch" key={seg}>
              <button
                type="button"
                className="swatch__dot"
                style={{ background: colors[seg] }}
                aria-label={`Pick ${seg} colour`}
                aria-expanded={openSeg === seg}
                onClick={() => setOpenSeg(openSeg === seg ? null : seg)}
              />
              <span className="swatch__label">{seg}</span>
              {openSeg === seg && (
                <div className="swatch__pop">
                  <HexColorPicker
                    color={colors[seg]}
                    onChange={(v) => setSeg(seg, v)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <label className="composer__field">
          <textarea
            className="composer__text"
            maxLength={MAX}
            rows={3}
            placeholder="How was your mission?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <span className="composer__count">
            {text.length}/{MAX}
          </span>
        </label>

        <button
          type="button"
          className="composer__launch"
          disabled={!text.trim()}
          onClick={launch}>
          LAUNCH
        </button>
      </div>
    </div>
  );
}
