import { go } from "../hooks/useHashRoute.js";
import ToggleIcon from "./ToggleIcon.jsx";
import ThemedSurface from "./ThemedSurface.jsx";

/**
 * @param {{
 *   title: string,
 *   color?: string,
 *   titleBold?: boolean,
 *   iconActive?: number,
 *   iconLabel?: string,
 *   onIconClick?: () => void,
 * }} props
 */
export default function Appbar({
  title,
  color,
  titleBold = false,
  iconActive = 2,
  iconLabel = "Home",
  onIconClick,
}) {
  const handleIconClick = onIconClick ?? (() => go("#/"));

  return (
    <ThemedSurface as="header" color={color} className="appbar">
      <h1
        className={`appbar__title ${titleBold ? "appbar__title--bold" : ""}`.trim()}
        onClick={() => go("#/")}
        style={{ cursor: "pointer" }}
      >
        {title}
      </h1>
      <ToggleIcon
        active={iconActive}
        size={30}
        ariaLabel={iconLabel}
        onClick={handleIconClick}
      />
    </ThemedSurface>
  );
}
