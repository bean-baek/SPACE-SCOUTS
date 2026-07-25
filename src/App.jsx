import { useHashRoute } from "./hooks/useHashRoute.js";
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

  let title = "SPACE SCOUTS";
  let pageColor; // single source of truth — flows to both the appbar and the page body
  let star = false;
  let view;

  switch (route.view) {
    case "menu":
      title = "";
      view = <Menu />;
      break;
    case "grid":
      view = <RewardGrid subId={route.subId} />;
      break;
    case "detail": {
      const found = findSubcategory(route.subId);
      title = found ? found.sub.label : route.subId;
      pageColor = found ? found.sub.color : "pink";
      star = true;
      view = <ItemDetail subId={route.subId} itemId={route.itemId} color={pageColor} />;
      break;
    }
    case "soon":
    default:
      title = "";
      view = <Soon />;
  }

  return (
    <div className="phone">
      <img className="sparkles" src="/images/sparkle.png" alt="" aria-hidden="true" />
      <Appbar title={title} color={pageColor} star={star} />
      <main id="app">{view}</main>
    </div>
  );
}
