// Asset manifest for the Dodge mini-game. Every file already lives in
// public/images/game/ — the SVGs are drawn straight onto the canvas, so there is
// no build step and no raster conversion.

const BASE = "/images/game";

export const ASSETS = {
  player: `${BASE}/character.svg`,
  boss: `${BASE}/boss.svg`,
  // The boss fires the lime star from the landing page. The player's own weapon is
  // drawn as tracer lines rather than a sprite, so the two can never be confused.
  bullet: "/images/Star.svg",
  // Two result faces: `board` is the star-eyed happy one, shown on the start screen
  // and on a clear; `boardGameOver` is the dizzy one, shown only on a loss.
  board: `${BASE}/result_board.svg`,
  boardGameOver: `${BASE}/result_board_game_over.svg`,
  star: `${BASE}/Dodge2.svg`,
  ob0: `${BASE}/Dodge.svg`,
  ob1: `${BASE}/Dodge1.svg`,
  ob2: `${BASE}/Dodge3.svg`,
  ob3: `${BASE}/Dodge4.svg`,
  ob4: `${BASE}/Dodge5.svg`,
  ob5: `${BASE}/Dodge6.svg`,
};

// The six character sprites that fall as regular obstacles. `star` is handled
// separately — it spawns smaller and faster.
export const OBSTACLE_KEYS = ["ob0", "ob1", "ob2", "ob3", "ob4", "ob5"];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Dodge: failed to load ${src}`));
    img.src = src;
  });
}

// Resolves only once every sprite is decodable, so the first drawn frame is
// never missing art.
export async function preloadAssets() {
  const entries = Object.entries(ASSETS);
  const images = await Promise.all(entries.map(([, src]) => loadImage(src)));
  const out = {};
  entries.forEach(([key], i) => {
    out[key] = images[i];
  });
  return out;
}
