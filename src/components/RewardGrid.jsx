import { DATA } from "../data.js";
import { go } from "../hooks/useHashRoute.js";
import Tile from "./Tile.jsx";

// Shuffled once per subId, then cached for the life of the page load so the
// order stays put as the shopper navigates back and forth into item detail
// and back to the grid.
const shuffleCache = new Map();

function shuffle(arr) {
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// One tile per item+option combo — e.g. SQUISHY (핑크/블루/그린) becomes
// three separate grid tiles, each using that option's own photo.
function buildTiles(subId) {
  const items = DATA.items[subId] || [];
  const tiles = [];
  for (const item of items) {
    const options = item.options?.length ? item.options : [undefined];
    for (const option of options) {
      const raw = option !== undefined ? (item.images?.[option] ?? item.image) : item.image;
      tiles.push({
        key: `${item.id}:${option ?? "default"}`,
        itemId: item.id,
        option,
        src: Array.isArray(raw) ? raw[0] : raw,
        alt: option ? `${item.name} – ${option}` : item.name,
      });
    }
  }
  return tiles;
}

function getTiles(subId) {
  if (!shuffleCache.has(subId)) {
    shuffleCache.set(subId, shuffle(buildTiles(subId)));
  }
  return shuffleCache.get(subId);
}

export default function RewardGrid({ subId }) {
  const tiles = getTiles(subId);

  return (
    <section className="grid-view">
      <div className="grid">
        {tiles.length > 0 ? (
          tiles.map((tile) => (
            <button
              key={tile.key}
              className="grid__tile"
              aria-label={tile.alt}
              onClick={() =>
                go(
                  `#/i/${subId}/${tile.itemId}${tile.option ? `/${encodeURIComponent(tile.option)}` : ""}`
                )
              }>
              <Tile src={tile.src} alt={tile.alt} />
            </button>
          ))
        ) : (
          <p className="empty">TODO — no items yet</p>
        )}
      </div>
    </section>
  );
}
