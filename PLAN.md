# Space Scouts — Build Plan

Personal fan **cafe / birthday webpage for NCT WISH's RYO**. Mobile-first, targets iPhone 16/17 (~402px). **React + Vite.**

> Status: all five SPACE SUPPLIES subcategories are live with real content and product
> photos; a canvas mini-game (`#/game`) is wired in. MISSION REPORTS and TRAINING CENTER
> are still placeholders (`#/soon`).

## Stack
- Vite 8 + React 19 (`npm install`, `npm run dev`, `npm run build`)
- No router library — a ~30-line `useHashRoute` hook (`src/hooks/useHashRoute.js`) covers the app's flat route list
- Plain CSS (`src/styles.css`), no CSS-in-JS/Tailwind — kept the hand-authored kawaii styling from the static prototype. The Dodge game ships its own scoped stylesheet (`src/components/DodgeGame.css`)

## Information architecture
```
#/                 Landing — tap anywhere to enter
#/menu             Menu hub — accordion of categories:
                     SPACE SUPPLIES (expands) → STANDARD REWARD [live], COCKTAIL REWARD [live],
                                                 EARLY-BIRD REWARD [live], LUCKY DRAW [live],
                                                 CAPSULE DRAW [live]
                     MISSION REPORTS  (no subcategories yet → #/soon)
                     TRAINING CENTER  (no subcategories yet → #/soon)
#/c/<subId>        Reward grid — 2-col image tiles + floating "R" home button
#/i/<subId>/<id>   Item detail — image (or swipeable carousel) + info panel
                   (name, OPTIONS chips, meta, desc). Optional 4th segment = selected option.
#/game             DODGE! — full-canvas survival/boss mini-game
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
`App.jsx`/`Menu.jsx`/`RewardGrid.jsx`/`ItemDetail.jsx` apply a `theme-{color}` class — the reusable
`ThemedSurface.jsx` wrapper does this — which sets a local `--accent` CSS variable. The accordion
header, grid FAB, and detail panel all read `--accent`, so a whole subcategory re-themes itself from
one field. To add a new color: add a `--<name>` token in `:root` **and** a `.theme-<name>` rule in
`styles.css`. Kawaii, rounded, thick blue outlines, chunky radii (16–24px), flat "pressed" shadows
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
  App.jsx            route → view switch, appbar wiring (incl. #/game)
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
```

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
