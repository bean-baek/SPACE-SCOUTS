import { useRef, useState } from "react";
import Tile from "./Tile.jsx";

// Horizontal, swipeable photo slider for the item detail image tile.
// `images` is an array of photo paths (e.g. [front, back]); a single-photo
// array just renders that one photo with no dots.
/** @param {{ images: string[], alt: string }} props */
export default function Carousel({ images, alt }) {
  /** @type {import('react').RefObject<HTMLDivElement | null>} */
  const trackRef = useRef(null);
  const [slide, setSlide] = useState(0);

  const goTo = (i) => {
    setSlide(i);
    const el = trackRef.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (images.length === 0) {
    return (
      <div className="carousel">
        <div className="carousel__slide">
          <Tile src="" alt={alt} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="carousel" ref={trackRef} onScroll={handleScroll}>
        {images.map((src, i) => (
          <div className="carousel__slide" key={src}>
            <Tile src={src} alt={alt} />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="carousel__dots">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`carousel__dot${i === slide ? " is-active" : ""}`}
              aria-label={`Photo ${i + 1} of ${images.length}`}
              aria-current={i === slide}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </>
  );
}
