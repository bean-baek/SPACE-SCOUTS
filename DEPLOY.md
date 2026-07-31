# Deploy — Space Scouts (Cloudflare Pages + D1)

The site is a static Vite build (`dist/`) plus one Pages Function (`functions/api/messages.js`)
backed by a D1 database (the community board). These are the steps **you** run — they need
your Cloudflare account and can't be scripted from here.

## 1. Log in
```bash
npx wrangler login
```

## 2. Create the D1 database
```bash
npx wrangler d1 create space-scouts-board
```
Copy the `database_id` it prints into **`wrangler.toml`** (replace `REPLACE_WITH_YOUR_D1_DATABASE_ID`).

## 3. Create the table
```bash
# remote (production DB):
npx wrangler d1 execute space-scouts-board --remote --file=./schema.sql
# local (for `wrangler pages dev`):
npx wrangler d1 execute space-scouts-board --local --file=./schema.sql
```

### 3b. If your database already existed — REQUIRED before deploying
The POST handler now writes an `ip_hash` column for rate limiting. `schema.sql` only
creates a *new* table, so an existing database needs the migration or **every post will
fail with a 500**:
```bash
npx wrangler d1 execute space-scouts-board --remote --file=./migrations/0001_add_ip_hash.sql
npx wrangler d1 execute space-scouts-board --local  --file=./migrations/0001_add_ip_hash.sql
```
Re-running it errors with `duplicate column name: ip_hash`, which just means you already
have it. Check what you've got with:
```bash
npx wrangler d1 execute space-scouts-board --remote --command="PRAGMA table_info(messages)"
```

## 4. Run locally with the API + DB
Plain `npm run dev` has no Functions — the board silently falls back to `localStorage`.
To exercise the real API/D1 locally:
```bash
npm run build
npx wrangler pages dev
```

## 5. Deploy
Either connect the Git repo in the Cloudflare **Pages** dashboard (build command
`npm run build`, output dir `dist`) and bind the D1 database as **`DB`** under
Settings → Functions → D1 bindings — or push directly:
```bash
npm run build
npx wrangler pages deploy dist
```

## Admin moderation (delete any UFO)
Deletion is normally poster-only (each UFO carries a random secret token). To let **you**
delete anything, set an `ADMIN_KEY` secret — pick a long random string:

```bash
# production (encrypted, never in the repo):
npx wrangler pages secret put ADMIN_KEY
# local dev: create .dev.vars (gitignored) with one line:
#   ADMIN_KEY=your-long-random-string
```

Then unlock admin mode in the browser by visiting once:
```
https://YOUR-SITE/#/board/admin/your-long-random-string
```
The key is saved to this browser and stripped from the URL; an **ADMIN · tap to exit**
badge appears, and every UFO's modal now shows **DELETE**. Tap the badge to leave.
The server only honours the key if it matches `ADMIN_KEY`, so a wrong/absent key can never
delete other people's UFOs.

## Rate limiting (spam protection)
`POST /api/messages` is public and unauthenticated, so it caps each poster at **5 messages
per 10 minutes**. Posters are identified by a salted SHA-256 of their IP — the address
itself is never stored, and the salt is what stops the hash being brute-forced back into
one (there are only ~4 billion IPv4 addresses, so an unsalted hash is reversible in
minutes). Set the salt to any long random string:

```bash
npx wrangler pages secret put RATE_SALT
# local dev: add a second line to .dev.vars
#   RATE_SALT=another-long-random-string
```

It works without `RATE_SALT`, but falls back to a constant salt that is public in the
repo — set it. To change the limits, edit `RATE_MAX` / `RATE_WINDOW_MS` at the top of
`functions/api/messages.js`.

## Notes
- The API validates every field (text ≤ 80 chars, colours `#RRGGBB`, x/y in `0..1`) and
  rejects bad input with `400`, so the DB only ever holds well-formed rows.
- The board holds the newest 200 messages (`LIST_LIMIT`); older ones stay in the database
  but stop being listed.
- No CORS config needed — the Function is same-origin with the site.
- Direct DB moderation is also possible any time:
  `npx wrangler d1 execute space-scouts-board --remote --command="DELETE FROM messages WHERE id='...'"`
