# Space Scouts — Build Plan

Personal fan **cafe / birthday webpage for NCT WISH's RYO**. Mobile-first, targets iPhone 16/17 (~402px). **React + Vite.**

> Status: all five SPACE SUPPLIES subcategories are live with real content and product
> photos; a canvas mini-game (`#/game`) is wired in. MISSION REPORTS and TRAINING CENTER
> are still placeholders (`#/soon`).

## Stack
- Vite 8 + React 19 (`npm install`, `npm run dev`, `npm run build`)
- No router library — a ~30-line `useHashRoute` hook (`src/hooks/useHashRoute.js`) covers the app's flat route list
- Plain CSS (`src/styles.css`), no CSS-in-JS/Tailwind — kept the hand-authored kawaii styling from the static prototype. The Dodge game and the board each ship their own scoped stylesheet (`src/components/DodgeGame.css`, `src/board/MissionBoard.css`)
- `react-colorful` — the only runtime dependency beyond React; powers the three UFO colour pickers in the board composer
- Cloudflare Pages + D1 for the board backend (`functions/`, `schema.sql`); see DEPLOY.md
- `@playwright/test` (dev only) — visual baseline, see below

## Information architecture
```
#/                 Landing — tap anywhere to enter
#/menu             Menu hub — accordion of categories:
                     SPACE SUPPLIES (expands) → STANDARD REWARD [live], COCKTAIL REWARD [live],
                                                 EARLY-BIRD REWARD [live], LUCKY DRAW [live],
                                                 CAPSULE DRAW [live]
                     MISSION REPORTS  (no subcategories yet → #/soon)
                     TRAINING CENTER  (no subcategories yet → #/soon)
#/c/<subId>        Reward grid — 2-col image tiles
#/i/<subId>/<id>   Item detail — image (or swipeable carousel) + info panel
                   (name, OPTIONS chips, meta, desc). Optional 4th segment = selected option.
#/game             DODGE! — full-canvas survival/boss mini-game
#/board            MISSION REPORT — community board (compose a UFO, drag to place, read, delete)
#/board/admin/<key> Owner unlock — stores the admin key, then strips it from the URL
#/soon             Placeholder for any not-yet-designed link
```
All five SPACE SUPPLIES subcategories have designed items. The appbar mascot icon is a
**home button** on grid pages and a **back-to-list** button on detail pages (not a tab switcher).

## Design system
| Token | Value | Use |
|---|---|---|
| `--ink` | `#3a39ff` | titles, headings, all outlines |
| `--pink` | `#ffb0d3` | STANDARD REWARD theme |
| `--blue` | `#80cfff` | COCKTAIL REWARD theme |
| `--yellow` | `#ffffab` | EARLY-BIRD REWARD theme |
| `--lime` | `#cbff88` | LUCKY DRAW theme + outer backdrop behind the phone frame |
| `--khaki` | `#bfbca9` | CAPSULE DRAW theme (estimated from reference — adjust if off) |
| `--grey` | `#e5e5e5` | app surface background / placeholder tiles |

Each subcategory carries a `color` field in `src/data.js` (`"pink" | "blue" | "yellow" | "lime" | "khaki"`).
`App.jsx` reads it and passes it to the reusable `ThemedSurface.jsx` wrapper, which applies a
`theme-{color}` class. Two consumers style that class directly in `styles.css`: the appbar
(`.appbar.theme-<name>`, detail pages only) and the item-detail panel
(`.theme-<name>.panel--themed`). To add a new color you therefore edit **three** places: a
`--<name>` token in `:root`, an `.appbar.theme-<name>` rule, and a `.theme-<name>.panel--themed`
rule. Kawaii, rounded, thick blue outlines, chunky radii (16–24px), flat "pressed" shadows
that vanish on `:active`.

## Assets
- `public/images/` (served at `/images/...`) — UI/landing art: `landing.png`, `title.svg`,
  `character.png`, `sparkle.png`, `toggle_*[_colored].svg` (appbar/toggle icon), `bg_*`, `Star.svg`,
  plus `public/images/game/` sprites for the Dodge game.
- `public/items/` (served at `/items/...`) — **real product photos**, named `<id>.png`,
  `<id>_<option>.png`, or `<id>_<option>_front/back.png` for carousels.
- `Tile.jsx` falls back to a grey placeholder on any missing/404 image, and picks the real
  photo up automatically once a matching file lands in `public/items/` — no code change needed.

## Files
```
index.html          Vite entry, mounts #root
src/
  main.jsx           ReactDOM root
  App.jsx            route → view switch, appbar wiring (incl. #/game, #/board)
  data.js            content model — EDIT THIS to add real content (5 live subcategories, ~19 items)
  styles.css         design tokens + all view styles
  hooks/
    useHashRoute.js  hash parsing + `go(hash)` navigation helper
  components/
    Appbar.jsx  Landing.jsx  Menu.jsx  RewardGrid.jsx  ItemDetail.jsx  Soon.jsx  Tile.jsx
    Carousel.jsx       swipeable multi-photo slider w/ dots (used by ItemDetail)
    ThemedSurface.jsx  applies .theme-<color> wrapper
    ToggleIcon.jsx     appbar/toggle SVG button with hover-colored state
    DodgeGame.jsx      React shell for the canvas game (owns lifecycle, no per-frame state)
    DodgeGame.css      scoped styles for the game HUD/overlays
  game/
    dodgeEngine.js     imperative 60fps loop, physics, boss phase (BOSS_HP, PHASE1_END)
    dodgeAssets.js     sprite preloader (preloadAssets, ASSETS)
  board/             community board (#/board) — colocated feature
    MissionBoard.jsx   board surface: starfield, placed UFOs, modal, admin badge
    MissionBoard.css   scoped styles for the board, composer, placing layer, modal
    Ufo.jsx            recolorable UFO (inlined SVG paths + static line-art overlay)
    UfoComposer.jsx    two-phase compose → fly-up → drag-to-place flow
    boardApi.js        data client: /api/messages, with a localStorage fallback for `vite dev`
functions/
  api/messages.js    Cloudflare Pages Function — GET/POST/DELETE, backed by D1 (binding `DB`)
schema.sql           D1 table + index for the board
design/              source art referenced only by comments; never served
docs/                internal notes (item_list.md); never served
tests/               Playwright visual baseline — `npx playwright test`
```

## Verifying a change didn't move pixels
The design is finished, so refactors must be visually inert. `tests/baseline.spec.js`
captures 26 screenshots across every route, theme, and board state:
```bash
npx playwright test                     # assert nothing moved
npx playwright test --update-snapshots  # re-record, only after an intended visual change
```
It stubs `Math.random` (RewardGrid shuffles tiles per load; the dodge engine seeds its
starfield), seeds the board's localStorage, and disables CSS animations — otherwise no two
runs would match. The game canvas is masked, since its rAF loop is timing-dependent.

## Content model (`src/data.js`)
- `categories[].subcategories[]` each carry `{ id, label, live, color }`.
- `items['<subId>']` is an array of `{ id, name, options[], meta, image, images?, desc }`.
  - `options` → chips in the detail panel.
  - `images` maps each option label to a photo path (per-option variants). A value that is an
    **array** (e.g. `[front, back]`) renders a swipeable `Carousel` for that option instead of a
    single photo; falls back to `image` for options without their own photo.
  - `desc` is a string or array of strings — each array entry is its own paragraph; `\n` = line
    break within a paragraph.

## Adding real content
1. Drop item photos into `public/items/` (e.g. `postcard_person.png`).
2. In `src/data.js`, set the item's `image` / `images` paths and fill in `desc`.
3. To bring a new subcategory live: set `live: true` on it, then add an array under
   `DATA.items['<subId>']` with the same item shape.
4. To theme a new category: set its `color` to an existing key, or add a `--<name>` token +
   `.theme-<name>` rule in `styles.css` for a new color.

## Run / verify
```bash
npm install       # first time only
npm run dev       # http://localhost:5173
npm run build     # production bundle → dist/
```
Click through: Landing → tap → Menu → SPACE SUPPLIES expands → any of the 5 rewards → grid →
tap a tile → detail with themed panel + chips (switch options; multi-photo items swipe). Back and
home (appbar mascot / grid FAB) both work. Expand MISSION REPORTS / TRAINING CENTER → land on
`#/soon`. Visit `#/game` → DODGE!: steer, survive to the boss phase, land `BOSS_HP` hits to clear.
No horizontal scroll at 402px.

## Continue with the agent
The custom subagent `space-scouts` (`.claude/agents/space-scouts.md`) knows this IA, the React
structure, and the design system — invoke it for new components, routes, or content wiring.
