-- Community board schema (Cloudflare D1 / SQLite).
-- Apply with:  npx wrangler d1 execute space-scouts-board --file=./schema.sql
--
-- NOTE: this only creates a table that does not exist yet. A database created before
-- ip_hash was added needs migrations/0001_add_ip_hash.sql instead — CREATE TABLE IF
-- NOT EXISTS silently leaves an older table untouched, and the POST handler will then
-- fail on every insert.
CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  top        TEXT NOT NULL,   -- #RRGGBB, UFO dome
  middle     TEXT NOT NULL,   -- #RRGGBB, UFO disc
  bottom     TEXT NOT NULL,   -- #RRGGBB, UFO underside
  x          REAL NOT NULL,   -- 0..1 fraction of board width
  y          REAL NOT NULL,   -- 0..1 fraction of board height
  created_at INTEGER NOT NULL, -- epoch ms
  token      TEXT NOT NULL DEFAULT '', -- per-message secret; only the poster can delete
  ip_hash    TEXT NOT NULL DEFAULT ''  -- salted SHA-256 of the poster's IP; rate limiting only
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_ip_hash ON messages (ip_hash, created_at);
