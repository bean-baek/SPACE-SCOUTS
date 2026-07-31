-- Adds the column the POST rate limiter counts against.
-- Run this on any database created before rate limiting existed:
--   npx wrangler d1 execute space-scouts-board --remote --file=./migrations/0001_add_ip_hash.sql
--   npx wrangler d1 execute space-scouts-board --local  --file=./migrations/0001_add_ip_hash.sql
--
-- SQLite has no ADD COLUMN IF NOT EXISTS. Running this twice fails with
-- "duplicate column name: ip_hash", which is harmless — it means you already have it.
ALTER TABLE messages ADD COLUMN ip_hash TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_messages_ip_hash ON messages (ip_hash, created_at);
