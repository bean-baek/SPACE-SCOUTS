// Where a UFO is allowed to land on the board. Pure and JSX-free so it can be unit
// tested directly — simulating the drag in a browser proved unreliable, and this is
// the part that actually has to be right.

// Keep placed UFOs a little inside the left/right edges so they never clip the frame.
export const clampX = (v) => (v < 0.05 ? 0.05 : v > 0.95 ? 0.95 : v);

// The bottom strip belongs to the CTA pill, which reappears the moment the composer
// closes and paints above the UFOs (z-6 vs z-3). A UFO dropped under it can never be
// opened again. This covers the pill (~52px), its 10px bottom offset, a home-indicator
// inset (~34px — that inset pushes the pill UP, which is why a fixed fraction is not
// safe across devices) and the UFO's own radius.
export const BOTTOM_RESERVED_PX = 118;

export function clampY(v, layerH) {
  const max = layerH
    ? Math.min(0.95, Math.max(0.5, 1 - BOTTOM_RESERVED_PX / layerH))
    : 0.9;
  return v < 0.05 ? 0.05 : v > max ? max : v;
}
