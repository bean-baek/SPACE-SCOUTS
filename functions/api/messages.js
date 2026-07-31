// Cloudflare Pages Function — community board API (backed by D1, binding `env.DB`).
//   GET    /api/messages        → newest-first list of placed UFOs
//   POST   /api/messages {...}  → validate + insert one, returns the stored row
//   DELETE /api/messages?id=…   → poster (x-edit-token) or owner (x-admin-key)
// Runs on the same origin as the site, so no CORS handling is needed. Schema: schema.sql.
//
// Every handler catches its own D1 errors. Without that, a database fault surfaces as a
// Workers HTML error page, which the client can only read as "the board is empty" —
// indistinguishable from a working board nobody has posted to yet.

const MAX_TEXT = 80;
const LIST_LIMIT = 200;
const HEX = /^#[0-9a-fA-F]{6}$/;

// Write throttle. The endpoint is public and unauthenticated, so without this one
// script can fill the board faster than it can be moderated by hand. Generous enough
// that a visitor posting for themselves and a friend never notices.
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

// Rate limiting needs to recognise a repeat poster without storing who they are.
// Hashing the IP with a server-side salt gives a stable key that cannot be reversed
// into an address, and RATE_SALT being a secret is what stops it being brute-forced
// (the IPv4 space is small enough to enumerate against an unsalted hash).
async function clientKey(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const salt = env.RATE_SALT || "space-scouts-unsalted";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, text, top, middle, bottom, x, y, created_at " +
        "FROM messages ORDER BY created_at DESC LIMIT ?"
    )
      .bind(LIST_LIMIT)
      .all();
    return json(results ?? []);
  } catch {
    return json({ error: "db" }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const { top, middle, bottom } = body;
  const x = Number(body.x);
  const y = Number(body.y);
  // Client-generated secret; whoever holds it may delete this row later.
  const token = typeof body.token === "string" ? body.token.slice(0, 64) : "";

  if (!text || text.length > MAX_TEXT) return json({ error: "text" }, 400);
  if (![top, middle, bottom].every((c) => typeof c === "string" && HEX.test(c))) {
    return json({ error: "color" }, 400);
  }
  if (!Number.isFinite(x) || x < 0 || x > 1 || !Number.isFinite(y) || y < 0 || y > 1) {
    return json({ error: "position" }, 400);
  }
  if (!token) return json({ error: "token" }, 400);

  try {
    const ipHash = await clientKey(request, env);
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM messages WHERE ip_hash = ? AND created_at > ?"
    )
      .bind(ipHash, Date.now() - RATE_WINDOW_MS)
      .first();
    if ((recent?.n ?? 0) >= RATE_MAX) return json({ error: "rate limit" }, 429);

    const id = crypto.randomUUID();
    const created_at = Date.now();
    await env.DB.prepare(
      "INSERT INTO messages (id, text, top, middle, bottom, x, y, created_at, token, ip_hash) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(id, text, top, middle, bottom, x, y, created_at, token, ipHash)
      .run();

    // token and ip_hash are never echoed back; the client already holds its own token.
    return json({ id, text, top, middle, bottom, x, y, created_at }, 201);
  } catch {
    return json({ error: "db" }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const token = request.headers.get("x-edit-token") || "";
  const adminKey = request.headers.get("x-admin-key") || "";
  if (!id) return json({ error: "id" }, 400);

  // Admin override: the owner sets ADMIN_KEY as an encrypted env secret (never in the
  // repo). When present and matching, it authorises deleting ANY row — that's moderation.
  const isAdmin = Boolean(env.ADMIN_KEY) && adminKey === env.ADMIN_KEY;

  try {
    if (!isAdmin) {
      // Otherwise fall back to poster ownership: must present this row's own secret token.
      const row = await env.DB.prepare("SELECT token FROM messages WHERE id = ?")
        .bind(id)
        .first();
      if (!row) return json({ error: "not found" }, 404);
      if (!token || token !== row.token) return json({ error: "forbidden" }, 403);
    }

    await env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
    return json({ ok: true });
  } catch {
    return json({ error: "db" }, 500);
  }
}
