// Board data client. In production it talks to the Cloudflare Pages Function at
// /api/messages (backed by D1). Under plain `vite dev` there is no Function, so every
// call uses localStorage instead — the compose → place → read → delete flow stays fully
// testable locally, and the same code hits the real shared board once deployed.
//
// The localStorage path is a DEV SUBSTITUTE, not a production safety net. A failed
// write in production reports failure; it does not quietly succeed against this
// browser's own storage. Writing locally and returning success is indistinguishable
// from working, right up until the visitor reloads and their message is gone.
//
// "Mine" tracking: there are no accounts, so each post carries a client-generated secret
// token. We remember {id: token} in localStorage; a UFO is deletable by this browser only
// if we hold its token, and the server requires that token to delete. That gives
// "delete your own" without a login.

/**
 * One placed UFO, exactly as the `messages` table stores it (see schema.sql) and as
 * GET /api/messages returns it. `token` and `ip_hash` exist server-side but are never
 * echoed back, so they are absent here on purpose.
 *
 * @typedef {object} BoardMessage
 * @property {string} id
 * @property {string} text        <= 80 chars, validated server-side
 * @property {string} top         #RRGGBB — dome
 * @property {string} middle      #RRGGBB — saucer disc
 * @property {string} bottom      #RRGGBB — underside
 * @property {number} x           0..1 fraction of board width
 * @property {number} y           0..1 fraction of board height
 * @property {number} created_at  epoch ms
 */

/** @typedef {Pick<BoardMessage, "text"|"top"|"middle"|"bottom"|"x"|"y">} NewBoardMessage */

const API = "/api/messages";
const LS_KEY = "spacescouts:board";
const MINE_KEY = "spacescouts:mine";
const ADMIN_KEY = "spacescouts:admin";

// `vite dev` (npm run dev) has no Pages Function — every /api call would 404, and the
// browser logs those at the network layer no matter how we catch them. So in dev we skip
// the network entirely and use localStorage. Production builds (including
// `wrangler pages dev dist`) set import.meta.env.DEV = false and use the real API.
const USE_API = !import.meta.env.DEV;

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") || null;
  } catch {
    return null;
  }
}
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

/** @returns {BoardMessage[]} */
const readLocal = () => readJson(LS_KEY) || [];
const writeLocal = (list) => writeJson(LS_KEY, list);
const readMine = () => readJson(MINE_KEY) || {};
const writeMine = (map) => writeJson(MINE_KEY, map);

function randomToken() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `t-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function rememberMine(id, token) {
  const map = readMine();
  map[id] = token;
  writeMine(map);
}

function forgetMine(id) {
  const map = readMine();
  delete map[id];
  writeMine(map);
}

// The set of ids this browser posted (and can therefore delete).
/** @returns {Set<string>} */
export function getMineIds() {
  return new Set(Object.keys(readMine()));
}

// ---- admin (owner moderation) ----
// The admin key is a shared secret the owner holds; the server validates it against its
// ADMIN_KEY env secret. Stored here only so the owner's browser can send it. It is never
// validated client-side (the client can't) — a wrong key simply gets a 403 from the API.
export function getAdminKey() {
  try {
    return localStorage.getItem(ADMIN_KEY) || null;
  } catch {
    return null;
  }
}
export function setAdminKey(key) {
  try {
    localStorage.setItem(ADMIN_KEY, key);
  } catch {
    /* ignore */
  }
}
export function clearAdminKey() {
  try {
    localStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}
export const isAdmin = () => Boolean(getAdminKey());

// Dev-only write to the localStorage stand-in.
/**
 * @param {NewBoardMessage} msg
 * @param {string} token
 * @returns {BoardMessage}
 */
function saveLocal(msg, token) {
  const id = randomToken();
  const row = { ...msg, id, created_at: Date.now() };
  const list = readLocal();
  list.unshift(row);
  writeLocal(list);
  rememberMine(id, token);
  return row;
}

// → { rows, degraded }. `degraded` means the API was meant to answer and didn't, so
// `rows` is whatever this browser had rather than the real board. Callers use it to
// tell "nobody has posted yet" apart from "we couldn't reach the board".
/** @returns {Promise<{rows: BoardMessage[], degraded: boolean}>} */
export async function getMessages() {
  if (!USE_API) return { rows: readLocal(), degraded: false };
  try {
    const res = await fetch(API, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`GET ${res.status}`);
    const rows = await res.json();
    return { rows: Array.isArray(rows) ? rows : [], degraded: false };
  } catch {
    return { rows: readLocal(), degraded: true };
  }
}

// msg: { text, top, middle, bottom, x, y }.
// → { ok: true, row } | { ok: false, reason: "rate-limit" | "server" | "network" }
// A production failure is reported, never mirrored locally: a UFO that exists only in
// the poster's own browser looks identical to a posted one until they reload.
/**
 * @param {NewBoardMessage} msg
 * @returns {Promise<{ok: true, row: BoardMessage} | {ok: false, reason: "rate-limit"|"server"|"network"}>}
 */
export async function postMessage(msg) {
  const token = randomToken();
  if (!USE_API) return { ok: true, row: saveLocal(msg, token) };

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...msg, token }),
    });
    if (res.status === 429) return { ok: false, reason: "rate-limit" };
    if (!res.ok) return { ok: false, reason: "server" };
    const row = await res.json();
    rememberMine(row.id, token);
    return { ok: true, row };
  } catch {
    return { ok: false, reason: "network" };
  }
}

// Removes a UFO. Authority is either the per-UFO token (poster) or the admin key (owner).
// Returns true ONLY when the row is really gone, so a failure leaves the UFO on screen
// instead of vanishing it locally and letting it return on the next reload.
/**
 * @param {string} id
 * @returns {Promise<boolean>} true only when the row is really gone
 */
export async function deleteMessage(id) {
  const token = readMine()[id];
  const admin = getAdminKey();
  if (!token && !admin) return false;

  if (!USE_API) {
    writeLocal(readLocal().filter((m) => m.id !== id));
    forgetMine(id);
    return true;
  }

  const headers = {};
  if (token) headers["x-edit-token"] = token;
  if (admin) headers["x-admin-key"] = admin; // server prefers admin when it matches
  try {
    const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    // 404 means it was already gone — the caller's intent is satisfied. Anything else
    // that isn't a 2xx (403 rejected, 500 broken) means the row is still there.
    if (!res.ok && res.status !== 404) return false;
  } catch {
    return false; // never reached the server; the row is almost certainly still there
  }

  writeLocal(readLocal().filter((m) => m.id !== id));
  forgetMine(id);
  return true;
}
