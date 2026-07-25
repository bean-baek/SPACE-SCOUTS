import { useState } from "react";
import { DATA } from "../data.js";
import Carousel from "./Carousel.jsx";
import ThemedSurface from "./ThemedSurface.jsx";

export default function ItemDetail({ subId, itemId, color }) {
  const items = DATA.items[subId] || [];
  const item = items.find((i) => i.id === itemId);
  const [selected, setSelected] = useState(item?.options?.[0]);

  if (!item) {
    return (
      <section className="detail">
        <p className="empty">Item not found</p>
      </section>
    );
  }

  const paragraphs = Array.isArray(item.desc)
    ? item.desc
    : item.desc
      ? [item.desc]
      : [];
  const rawImages = item.images?.[selected] ?? item.image;
  const images = Array.isArray(rawImages) ? rawImages : rawImages ? [rawImages] : [];
  const alt = selected ? `${item.name} – ${selected}` : item.name;

  return (
    <section className="detail">
      <div className="detail__image">
        <Carousel key={selected} images={images} alt={alt} />
      </div>

      <ThemedSurface color={color} className="panel panel--themed">
        <h2 className="panel__title">{item.name}</h2>
        <div className="panel__label">OPTIONS</div>
        <div className="chips">
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
