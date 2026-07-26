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
      <svg
        className={`landing__star ${activeStars.left ? "active" : ""}`}
        onMouseDown={() => handleStarMouseDown("left")}
        onMouseUp={() => handleStarMouseUp("left")}
        onMouseLeave={() => handleStarMouseUp("left")}
        onTouchStart={() => handleStarMouseDown("left")}
        onTouchEnd={() => handleStarMouseUp("left")}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <svg
        className={`landing__star ${activeStars.right ? "active" : ""}`}
        onMouseDown={() => handleStarMouseDown("right")}
        onMouseUp={() => handleStarMouseUp("right")}
        onMouseLeave={() => handleStarMouseUp("right")}
        onTouchStart={() => handleStarMouseDown("right")}
        onTouchEnd={() => handleStarMouseUp("right")}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>

      <img
        className="hero__mascot"
        src="/images/character.png"
        alt=""
        aria-hidden="true"
      />
    </section>
  );
}
