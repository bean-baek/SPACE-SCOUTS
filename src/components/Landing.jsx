import { go } from "../hooks/useHashRoute.js";
import Appbar from "./Appbar.jsx";

export default function Landing() {
  return (
    <section className="landing">
      {/* Bar first, photo second: the photo is a flex item that takes whatever
          height is left, so it always starts exactly below the bar — no
          hard-coded offset to drift if the wordmark wraps on a narrow screen. */}
      <Appbar
        title="SPACE SCOUTS"
        iconActive={1}
        iconLabel="Enter Space Scouts"
        onIconClick={() => go("#/menu")}
      />

      <img className="landing__photo" src="/images/landing.png" alt="RYO" />

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
