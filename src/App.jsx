import { useHashRoute, go } from "./hooks/useHashRoute.js";
import { findSubcategory } from "./data.js";
import Appbar from "./components/Appbar.jsx";
import Landing from "./components/Landing.jsx";
import Menu from "./components/Menu.jsx";
import RewardGrid from "./components/RewardGrid.jsx";
import ItemDetail from "./components/ItemDetail.jsx";
import Soon from "./components/Soon.jsx";

export default function App() {
  const route = useHashRoute();

  if (route.view === "landing") {
    return (
      <div className="phone">
        <Landing />
      </div>
    );
  }

  // "grid" and "detail" both live inside a subcategory, so both need its
  // label + theme color for the appbar — resolved once here instead of
  // twice in the switch below.
  const found = route.subId ? findSubcategory(route.subId) : null;

  let title = "SPACE SCOUTS";
  let pageColor; // single source of truth — flows to both the appbar and the page body
  let iconActive = 2;
  let iconLabel = "Home";
  let onIconClick;
  let view;

  if (found) {
    title = found.sub.label;
    pageColor = found.sub.color;
  } else if (route.subId) {
    title = route.subId;
    pageColor = "pink";
  }

  switch (route.view) {
    case "menu":
      title = "";
      view = <Menu />;
      break;
    case "grid":
      onIconClick = () => go("#/menu");
      view = <RewardGrid subId={route.subId} />;
      break;
    case "detail":
      iconActive = 0;
      iconLabel = "Back to list";
      onIconClick = () => go(`#/c/${route.subId}`);
      view = (
        <ItemDetail
          key={route.itemId}
          subId={route.subId}
          itemId={route.itemId}
          option={route.option}
          color={pageColor}
        />
      );
      break;
    case "soon":
    default:
      title = "";
      view = <Soon />;
  }

  return (
    <div className="phone">
      <img className="sparkles" src="/images/sparkle.png" alt="" aria-hidden="true" />
      <Appbar
        title={title}
        color={pageColor}
        iconActive={iconActive}
        iconLabel={iconLabel}
        onIconClick={onIconClick}
      />
      <main id="app">{view}</main>
    </div>
  );
}
