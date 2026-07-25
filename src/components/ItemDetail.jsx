import { DATA } from "../data.js";
import Tile from "./Tile.jsx";
import ThemedSurface from "./ThemedSurface.jsx";

export default function ItemDetail({ subId, itemId, color }) {
  const items = DATA.items[subId] || [];
  const item = items.find((i) => i.id === itemId);

  if (!item) {
    return (
      <section className="detail">
        <p className="empty">Item not found</p>
      </section>
    );
  }

  const paragraphs = Array.isArray(item.desc) ? item.desc : [item.desc];

  return (
    <section className="detail">
      <div className="detail__image">
        <Tile src={item.image} alt={item.name} />
      </div>

      <ThemedSurface color={color} className="panel panel--themed">
        <h2 className="panel__title">{item.name}</h2>
        <div className="panel__label">OPTIONS</div>
        <div className="chips">
          {item.options.map((o) => (
            <span key={o} className="chip">
              {o}
            </span>
          ))}
        </div>
        <p className="panel__meta">{item.meta}</p>

        {paragraphs.map((p, i) => (
          <p className="panel__desc" key={i}>
            {p.split("\n").map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
      </ThemedSurface>
    </section>
  );
}
