// Board data client. In production it talks to the Cloudflare Pages Function at
// /api/messages (backed by D1). Under plain `vite dev` there is no Function, so every
// call falls back to localStorage — the compose → place → read → delete flow stays fully
// testable locally, and the same code hits the real shared board once deployed.
//
// "Mine" tracking: there are no accounts, so each post carries a client-generated secret
// token. We remember {id: token} in localStorage; a UFO is deletable by this browser only
// if we hold its token, and the server requires that token to delete. That gives
// "delete your own" without a login.

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
    return JSON.parse(localStorage.getItem(key)) || null;
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

export async function getMessages() {
  if (USE_API) {
    try {
      const res = await fetch(API, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`GET ${res.status}`);
      return await res.json();
    } catch {
      /* fall through to local mirror */
    }
  }
  return readLocal();
}

// msg: { text, top, middle, bottom, x, y }. Returns the stored row (with id + created_at).
export async function postMessage(msg) {
  const token = randomToken();
  if (USE_API) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...msg, token }),
      });
      if (!res.ok) throw new Error(`POST ${res.status}`);
      const row = await res.json();
      rememberMine(row.id, token);
      return row;
    } catch {
      /* fall through to local mirror */
    }
  }
  const id = randomToken();
  const row = { ...msg, id, created_at: Date.now() };
  const list = readLocal();
  list.unshift(row);
  writeLocal(list);
  rememberMine(id, token);
  return row;
}

// Removes a UFO. Authority is either the per-UFO token (poster) or the admin key (owner).
// No-op-safe if this browser has neither.
export async function deleteMessage(id) {
  const token = readMine()[id];
  const admin = getAdminKey();
  if (!token && !admin) return false;

  if (USE_API) {
    const headers = {};
    if (token) headers["x-edit-token"] = token;
    if (admin) headers["x-admin-key"] = admin; // server prefers admin when it matches
    try {
      const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers,
      });
      // A real server 403 means the auth was rejected — keep the UFO, report failure.
      if (res.status === 403) return false;
    } catch {
      /* network error — fall through to the local mirror */
    }
  }

  // Anything else (200 deleted, 404 already-gone, or no API at all) → it's gone for us:
  // drop it from this browser's local board. Harmless no-op when it only lived server-side.
  writeLocal(readLocal().filter((m) => m.id !== id));
  forgetMine(id);
  return true;
}
