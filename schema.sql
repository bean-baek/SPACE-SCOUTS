-- Community board schema (Cloudflare D1 / SQLite).
-- Apply with:  npx wrangler d1 execute space-scouts-board --file=./schema.sql
CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  top        TEXT NOT NULL,   -- #RRGGBB, UFO dome
  middle     TEXT NOT NULL,   -- #RRGGBB, UFO disc
  bottom     TEXT NOT NULL,   -- #RRGGBB, UFO underside
  x          REAL NOT NULL,   -- 0..1 fraction of board width
  y          REAL NOT NULL,   -- 0..1 fraction of board height
  created_at INTEGER NOT NULL, -- epoch ms
  token      TEXT NOT NULL DEFAULT '' -- per-message secret; only the poster can delete
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
