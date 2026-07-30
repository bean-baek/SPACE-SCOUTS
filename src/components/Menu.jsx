import { useState } from "react";
import { DATA } from "../data.js";
import { go } from "../hooks/useHashRoute.js";

export default function Menu() {
  const [openId, setOpenId] = useState(null);
  return (
    <section className="menu">
      {DATA.categories.map((cat) => {
        const hasSubs = cat.subcategories.length > 0;
        const isOpen = openId === cat.id;

        return (
          <div className="menu__category" key={cat.id}>
            <button
              className="menu__heading"
              onClick={() =>
                hasSubs
                  ? setOpenId(isOpen ? null : cat.id)
                  : go(cat.link ?? "#/soon")
              }>
              {cat.label}
            </button>

            {hasSubs && isOpen && (
              <div className="menu__subs">
                {cat.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    className="menu__sub"
                    onClick={() => go(sub.live ? `#/c/${sub.id}` : "#/soon")}>
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
