import { go } from "../hooks/useHashRoute.js";
import Appbar from "./Appbar.jsx";
import { useState } from "react";

// Two stars sit on RYO's hair. Order is load-bearing: styles.css positions every
// .landing__star at top:15%/left:55%, then :nth-of-type(3) — the third <img> among
// .landing's children, i.e. the first star — moves it to left:25%. Reordering or
// inserting an <img> before them moves the stars.
const STAR_IDS = ["left", "right"];

export default function Landing() {
  const [activeStars, setActiveStars] = useState({});

  const setStarActive = (starId, active) =>
    setActiveStars((prev) => ({ ...prev, [starId]: active }));

  return (
    <section className="landing">
      <Appbar
        title="SPACE SCOUTS"
        iconActive={1}
        iconLabel="Enter Space Scouts"
        onIconClick={() => go("#/menu")}
      />

      <img className="landing__photo" src="/images/landing.png" alt="RYO" />
      <img
        className="landing__logo"
        src="/images/title.svg"
        alt="SPACE SCOUTS"
      />

      {/* Stars on hair */}
      {STAR_IDS.map((id) => (
        <img
          key={id}
          className={`landing__star ${activeStars[id] ? "active" : ""}`}
          src="/images/Star.svg"
          alt="Star"
          onMouseDown={() => setStarActive(id, true)}
          onMouseUp={() => setStarActive(id, false)}
          onMouseLeave={() => setStarActive(id, false)}
          onTouchStart={() => setStarActive(id, true)}
          onTouchEnd={() => setStarActive(id, false)}
        />
      ))}

      <img
        className="hero__mascot"
        src="/images/character.png"
        alt=""
        aria-hidden="true"
      />
    </section>
  );
}
