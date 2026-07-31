import { useState } from "react";
import { DATA, resolveImages } from "../data.js";
import Carousel from "./Carousel.jsx";
import ThemedSurface from "./ThemedSurface.jsx";

// Picks a chip-row width that divides the option count evenly (3 columns for
// 3 or 6 options, 2 columns for 2 or 4), so rows fill up instead of leaving a
// lone chip dangling on the last row. Falls back to 3 when neither fits.
function chipColumns(count) {
  if (count % 3 === 0) return 3;
  if (count % 2 === 0) return 2;
  return 3;
}

// `desc` is authored as either one string or an array of paragraphs.
const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export default function ItemDetail({ subId, itemId, option, color }) {
  const items = DATA.items[subId] || [];
  const item = items.find((i) => i.id === itemId);
  const [selected, setSelected] = useState(
    item?.options?.includes(option) ? option : item?.options?.[0]
  );

  if (!item) {
    return (
      <section className="detail">
        <p className="empty">Item not found</p>
      </section>
    );
  }

  const paragraphs = toArray(item.desc);
  const images = resolveImages(item, selected);
  const alt = selected ? `${item.name} – ${selected}` : item.name;

  return (
    <section className="detail">
      <div className="detail__image">
        <Carousel key={selected} images={images} alt={alt} />
      </div>

      <ThemedSurface color={color} className="panel panel--themed">
        <h2 className="panel__title">{item.name}</h2>
        <div className="panel__label">OPTIONS</div>
        <div
          className="chips"
          style={{ "--chip-cols": chipColumns(item.options.length) }}
        >
          {item.options.map((o) => (
            <button
              key={o}
              type="button"
              className={`chip${o === selected ? " chip--selected" : ""}`}
              aria-pressed={o === selected}
              onClick={() => setSelected(o)}
            >
              {o}
            </button>
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
