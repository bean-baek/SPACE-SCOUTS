// Cloudflare Pages Function — community board API (backed by D1, binding `env.DB`).
//   GET  /api/messages        → newest-first list of placed UFOs
//   POST /api/messages {...}   → validate + insert one, returns the stored row
// Runs on the same origin as the site, so no CORS handling is needed. Schema: schema.sql.

const MAX_TEXT = 80;
const LIST_LIMIT = 200;
const HEX = /^#[0-9a-fA-F]{6}$/;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, text, top, middle, bottom, x, y, created_at " +
      "FROM messages ORDER BY created_at DESC LIMIT ?"
  )
    .bind(LIST_LIMIT)
    .all();
  return json(results ?? []);
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

  const id = crypto.randomUUID();
  const created_at = Date.now();
  await env.DB.prepare(
    "INSERT INTO messages (id, text, top, middle, bottom, x, y, created_at, token) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(id, text, top, middle, bottom, x, y, created_at, token)
    .run();

  // token is never echoed back in listings; the client already holds its own copy.
  return json({ id, text, top, middle, bottom, x, y, created_at }, 201);
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
}
