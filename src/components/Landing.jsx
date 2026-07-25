import { go } from "../hooks/useHashRoute.js";
import Appbar from "./Appbar.jsx";

export default function Landing() {
  return (
    <section className="landing">
      <img className="landing__photo" src="/images/landing.png" alt="RYO" />

      <Appbar
        overlay
        title="SPACE SCOUTS"
        iconActive={1}
        iconLabel="Enter Space Scouts"
        onIconClick={() => go("#/menu")}
      />

      <img
        className="hero__logo"
        src="/images/title.svg"
        alt="Space Scouts"
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
