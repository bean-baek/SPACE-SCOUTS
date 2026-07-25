import { useState } from "react";

export default function ToggleIcon({
  active = 1,
  size = 30,
  onClick,
  ariaLabel = "Toggle",
}) {
  const [hovered, setHovered] = useState(false);

  const src = `/images/toggle_${active}${hovered ? "_colored" : ""}.svg`;

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <button
      type="button"
      className="toggle-icon"
      aria-label={ariaLabel}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <img src={src} alt="" width={size} height={size} />
    </button>
  );
}
