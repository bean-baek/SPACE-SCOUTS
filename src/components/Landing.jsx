import { go } from "../hooks/useHashRoute.js";
import Appbar from "./Appbar.jsx";
import { useState } from "react";

export default function Landing() {
  const [activeStars, setActiveStars] = useState({});

  const handleStarMouseDown = (starId) => {
    setActiveStars(prev => ({ ...prev, [starId]: true }));
  };

  const handleStarMouseUp = (starId) => {
    setActiveStars(prev => ({ ...prev, [starId]: false }));
  };

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
      <img
        className={`landing__star ${activeStars.left ? "active" : ""}`}
        src="/images/Star.svg"
        alt="Star"
        onMouseDown={() => handleStarMouseDown("left")}
        onMouseUp={() => handleStarMouseUp("left")}
        onMouseLeave={() => handleStarMouseUp("left")}
        onTouchStart={() => handleStarMouseDown("left")}
        onTouchEnd={() => handleStarMouseUp("left")}
      />
      <img
        className={`landing__star ${activeStars.right ? "active" : ""}`}
        src="/images/Star.svg"
        alt="Star"
        onMouseDown={() => handleStarMouseDown("right")}
        onMouseUp={() => handleStarMouseUp("right")}
        onMouseLeave={() => handleStarMouseUp("right")}
        onTouchStart={() => handleStarMouseDown("right")}
        onTouchEnd={() => handleStarMouseUp("right")}
      />

      <img
        className="hero__mascot"
        src="/images/character.png"
        alt=""
        aria-hidden="true"
      />
    </section>
  );
}
