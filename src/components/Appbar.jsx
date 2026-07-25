import { go } from "../hooks/useHashRoute.js";
import ToggleIcon from "./ToggleIcon.jsx";
import StarIcon from "./StarIcon.jsx";
import ThemedSurface from "./ThemedSurface.jsx";

export default function Appbar({
  title,
  color,
  overlay = false,
  star = false,
  iconActive = 2,
  iconLabel = "Home",
  onIconClick,
}) {
  const handleIconClick = onIconClick ?? (() => go("#/"));

  return (
    <ThemedSurface
      as="header"
      color={color}
      className={`appbar ${overlay ? "appbar--overlay" : ""}`.trim()}
    >
      <h1 className="appbar__title">{title}</h1>
      {star ? (
        <button type="button" className="toggle-icon" aria-label={iconLabel} onClick={handleIconClick}>
          <StarIcon size={30} />
        </button>
      ) : (
        <ToggleIcon active={iconActive} size={30} ariaLabel={iconLabel} onClick={handleIconClick} />
      )}
    </ThemedSurface>
  );
}
