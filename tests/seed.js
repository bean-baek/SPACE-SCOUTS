// Determinism shims, injected before any app code runs (page.addInitScript).
//
// Three things in this app are random by design and would otherwise make every
// screenshot differ from the last:
//   1. RewardGrid shuffles its tiles once per page load (RewardGrid.jsx).
//   2. The dodge engine seeds a starfield and rolls obstacle sizes/positions.
//   3. boardApi generates ids via crypto.randomUUID.
// Replacing Math.random with a seeded PRNG pins 1 and 2. The board is seeded
// explicitly with fixed rows instead (see seedBoard below), so 3 doesn't matter.

export const SEED_SCRIPT = () => {
  // mulberry32 — small, fast, good enough distribution for reproducing a shuffle.
  let a = 0x9e3779b9;
  Math.random = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Fixed board contents so #/board renders the same UFOs every run. Mirrors the
// row shape boardApi/D1 use: { id, text, top, middle, bottom, x, y, created_at }.
export const BOARD_ROWS = [
  {
    id: "seed-1",
    text: "료 대장 생일 축하해요!",
    top: "#80CFFF",
    middle: "#CBFF88",
    bottom: "#FFFFAB",
    x: 0.3,
    y: 0.35,
    created_at: 1735689600000,
  },
  {
    id: "seed-2",
    text: "탐사 완료! 오늘도 우주는 평화롭습니다",
    top: "#FFB0D3",
    middle: "#FFFFAB",
    bottom: "#80CFFF",
    x: 0.68,
    y: 0.5,
    created_at: 1735689500000,
  },
  {
    id: "seed-3",
    text: "미션 리포트 제출합니다",
    top: "#CBFF88",
    middle: "#FFB0D3",
    bottom: "#BFBCA9",
    x: 0.45,
    y: 0.66,
    created_at: 1735689400000,
  },
];

// `mine` maps id -> secret token; holding a token is what reveals DELETE in the
// modal. Seeding only seed-1 lets us baseline both modal variants (with and
// without the delete button) without touching admin mode.
export const MINE_MAP = { "seed-1": "seed-token-1" };
