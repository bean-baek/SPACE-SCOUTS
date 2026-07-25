---
name: space-scouts
description: Builds and edits the Space Scouts (NCT WISH RYO birthday cafe) React web app. Use for any UI/route/content work on this site — new categories, reward grids, item detail pages, styling. Knows the React+Vite structure, the ink/pink/blue/yellow/lime/grey design system, the hash-router IA, and the iPhone 16/17 mobile-first target.
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

You build the **Space Scouts** app: a personal fan cafe / birthday webpage for NCT WISH's RYO. **React + Vite** (`npm run dev` / `npm run build`), plain CSS — no Tailwind, no CSS-in-JS, no router library (a small hand-rolled hash router covers it).

## Structure
```
index.html          Vite entry, mounts #root
src/
  main.jsx           ReactDOM root, imports styles.css
  App.jsx            route → view switch, appbar wiring
  data.js            content model — DATA.categories + DATA.items[subId][]
  styles.css         design tokens + all view styles
  hooks/useHashRoute.js   hash parsing (`useHashRoute()`) + `go(hash)` nav helper
  components/
    Appbar.jsx   — back / title / home (mascot icon = home, not a tab switcher)
    Landing.jsx  — splash, tap anywhere → #/menu
    Menu.jsx     — accordion of categories, reads DATA.categories
    RewardGrid.jsx  — #/c/<subId>, 2-col tiles + FAB "R" (home)
    ItemDetail.jsx  — #/i/<subId>/<itemId>, image + themed info panel
    Soon.jsx     — #/soon placeholder for undesigned links
    Tile.jsx     — image-or-grey-placeholder helper
```

## Information architecture (routes in `useHashRoute.js` / `App.jsx`)
```
#/                 Landing
#/menu             Menu hub (accordion)
#/c/<subId>        Reward grid for a subcategory
#/i/<subId>/<id>   Item detail
#/soon             Placeholder for anything not yet designed/live
```
Content lives entirely in **`src/data.js`**: `categories[]` (each with a `color` theme and `subcategories[].live` gating whether it routes to a real grid or `#/soon`) and `items[subId][]` (`{ id, name, options[], meta, image, desc }`). Add a new reward type by adding items under a new key in `DATA.items`, then flipping `live: true` on its subcategory entry. **Don't hardcode content into components** — extend `data.js`.

## Design system (CSS vars in `src/styles.css`)
- `--ink: #3A39FF` — titles, headings, all outlines. Always the text/border color regardless of theme.
- `--pink: #FFB0D3` (SPACE SUPPLIES), `--blue: #80CFFF` (MISSION REPORTS), `--yellow: #FFFFAB` (TRAINING CENTER) — one per category, set via `category.color` in `data.js`.
- `--lime: #CBFF88` — app/landing/menu background. `--grey: #E5E5E5` — neutral/placeholder surfaces (never a category color).
- **Theming pattern**: a `theme-{color}` class (applied in `Menu.jsx`, `RewardGrid.jsx`, `ItemDetail.jsx` based on the item's parent category) sets `--accent`, which the accordion header, grid FAB, and detail panel read via `var(--accent, ...)`. To add a 4th category color, add both the hex to `:root` and a `.theme-newcolor { --accent: var(--newcolor); }` rule — components need no changes.
- Kawaii, rounded, thick blue outlines (`var(--outline)`), chunky radii (`var(--radius)` / `var(--radius-sm)`, 16–24px), flat "pressed" shadows (`var(--shadow)`) that disappear on `:active`.

## Assets in `public/images/`
Vite serves `public/` at the root, so reference images as `/images/...` (not `public/images/...`). Landing composition: `landing.png`, `title.png`, `character.png`, `sparkle.png`. `toggle_1_colored.svg` is the appbar home icon. Reward item photos are not supplied yet — `Tile.jsx` renders a grey `TODO` placeholder whenever `item.image` is `""`.

## Layout target
Mobile-first, design canvas ≈ 402px (iPhone 16 Pro / 17). Content column `max-width: 440px`, centered; on wider screens it becomes a bordered phone-frame card (`@media (min-width: 480px)` in `styles.css`). Respect safe areas (`env(safe-area-inset-*)`); body must never scroll horizontally.

## Rules
- New views: add a `render`-style component + a branch in `App.jsx`'s route switch and `useHashRoute.js`'s `parse()` — don't build a second routing mechanism.
- Don't invent real content (item names beyond `data.js`, prices, dates, addresses, real photos). Leave `TODO` placeholders and ask before filling them in.
- After changes, run `npm run dev` and click through the full route tree at 402px width; check the browser console for errors.
