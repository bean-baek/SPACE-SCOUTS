# Space Scouts — Build Plan

Personal fan **cafe / birthday webpage for NCT WISH's RYO**. Mobile-first, targets iPhone 16/17 (~402px). **React + Vite.**

## Stack
- Vite + React 19 (`npm install`, `npm run dev`, `npm run build`)
- No router library — a ~30-line `useHashRoute` hook (`src/hooks/useHashRoute.js`) covers the app's flat route list
- Plain CSS (`src/styles.css`), no CSS-in-JS/Tailwind — kept the hand-authored kawaii styling from the static prototype

## Information architecture
```
#/                 Landing — tap anywhere to enter
#/menu             Menu hub — accordion of categories:
                     SPACE SUPPLIES (expands) → STANDARD REWARD [live], COCKTAIL REWARD,
                                                 EARLY-BIRD REWARD, LUCKY DRAW, CAPSULE DRAW
                     MISSION REPORTS  (no subcategories drawn yet)
                     TRAINING CENTER  (no subcategories drawn yet)
#/c/<subId>        Reward grid — 2-col image tiles + floating "R" home button
#/i/<subId>/<id>   Item detail — image + info panel (name, OPTIONS chips, meta, desc)
#/soon             Placeholder for any not-yet-designed link
```
Only `standard-reward` has designed items (POSTCARD, ID CARD, ID PHOTO, STICKERS). The appbar mascot icon is a **home button**, not a tab switcher.

## Design system
| Token | Value | Use |
|---|---|---|
| `--ink` | `#3A39FF` | titles, headings, all outlines |
| `--pink` | `#FFB0D3` | SPACE SUPPLIES theme background |
| `--blue` | `#80CFFF` | MISSION REPORTS theme background |
| `--yellow` | `#FFFFAB` | TRAINING CENTER theme background |
| `--lime` | `#CBFF88` | app / landing / menu background |
| `--grey` | `#E5E5E5` | neutral / placeholder tiles |

Each category carries a `color` field in `src/data.js` (`"pink" | "blue" | "yellow"`). `App.jsx`/`Menu.jsx`/`RewardGrid.jsx`/`ItemDetail.jsx` apply a `theme-{color}` class, which sets a local `--accent` CSS variable — the accordion header, grid FAB, and detail panel all read `--accent`, so a whole category re-themes itself from one field. Kawaii, rounded, thick blue outlines, chunky radii (16–24px), flat "pressed" shadows that vanish on `:active`.

## Assets (`public/images/`, served at `/images/...` by Vite)
- `landing.png`, `title.png`, `character.png`, `sparkle.png` — landing composition
- `toggle_1_colored.svg` — appbar home icon
- Reward item photos are **not supplied yet** — grid tiles and detail images render grey `TODO` placeholders (`Tile.jsx`) until real assets are added.

## Files
```
index.html          Vite entry, mounts #root
src/
  main.jsx           ReactDOM root
  App.jsx            route → view switch, appbar wiring
  data.js            content model — EDIT THIS to add real content
  styles.css         design tokens + all view styles
  hooks/
    useHashRoute.js  hash parsing + `go(hash)` navigation helper
  components/
    Appbar.jsx  Landing.jsx  Menu.jsx  RewardGrid.jsx  ItemDetail.jsx  Soon.jsx  Tile.jsx
```

## Adding real content
1. Drop item photos into `public/images/` (e.g. `postcard.png`).
2. In `src/data.js`, set the item's `image: "/images/postcard.png"` and fill in `desc`.
3. To bring a subcategory live: set `live: true` on it under its category, then add an array under `DATA.items['<subId>']` with the same item shape.
4. To theme a new category: set its `color` to `"pink" | "blue" | "yellow"` (or add a new `.theme-*` rule in `styles.css` for a new color).

## Run / verify
```bash
cd /Users/apple/Desktop/SPACE-SCOUTS
npm install       # first time only
npm run dev       # http://localhost:5173
npm run build     # production bundle → dist/
```
Click through: Landing → tap → Menu → SPACE SUPPLIES expands (pink) → STANDARD REWARD → grid → tap a tile → detail with pink panel + chips. Expand MISSION REPORTS (blue) / TRAINING CENTER (yellow) to see per-category theming. Back and home (appbar mascot / grid FAB) both work. No horizontal scroll at 402px.

## Continue with the agent
The custom subagent `space-scouts` (`.claude/agents/space-scouts.md`) knows this IA, the React structure, and the design system — invoke it for new components, routes, or content wiring.
