import { DATA } from "../data.js";
import { go } from "../hooks/useHashRoute.js";
import Tile from "./Tile.jsx";

export default function RewardGrid({ subId }) {
  const items = DATA.items[subId] || [];

  return (
    <section className="grid-view">
      <div className="grid">
        {items.length > 0 ? (
          items.map((item) => (
            <button
              key={item.id}
              className="grid__tile"
              aria-label={item.name}
              onClick={() => go(`#/i/${subId}/${item.id}`)}>
              <Tile src={item.image} alt={item.name} />
            </button>
          ))
        ) : (
          <p className="empty">TODO — no items yet</p>
        )}
      </div>
    </section>
  );
}
