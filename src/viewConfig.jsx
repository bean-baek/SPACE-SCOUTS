import { go } from "./hooks/useHashRoute.js";
import { findSubcategory } from "./data.js";
import Menu from "./components/Menu.jsx";
import RewardGrid from "./components/RewardGrid.jsx";
import ItemDetail from "./components/ItemDetail.jsx";
import Soon from "./components/Soon.jsx";
import MissionBoard from "./board/MissionBoard.jsx";

/**
 * Everything the chrome needs for one route, resolved in one place.
 *
 * @typedef {object} ViewConfig
 * @property {string}   title       Appbar heading. Empty string means no heading.
 * @property {string}  [appbarColor] Theme name; only detail pages tint the bar.
 * @property {boolean}  titleBold
 * @property {number}   iconActive  Which toggle_<n>.svg the appbar button shows.
 * @property {string}   iconLabel   Accessible name for that button.
 * @property {()=>void}[onIconClick] Defaults to "go home" inside Appbar.
 * @property {import("react").ReactNode} view
 */

/**
 * @param {{view: string, subId?: string, itemId?: string, option?: string, adminKey?: string}} route
 * @returns {ViewConfig}
 */
export function viewConfig(route) {
  // "grid" and "detail" both live inside a subcategory, so both need its label +
  // theme colour — resolved once here rather than in each branch below.
  const found = route.subId ? findSubcategory(route.subId) : null;
  const subTitle = found ? found.sub.label : route.subId;
  // An unknown subId still renders (the grid shows its empty state), so it needs a
  // colour too — pink is the default theme.
  const pageColor = found ? found.sub.color : route.subId ? "pink" : undefined;

  const base = {
    title: "SPACE SCOUTS",
    appbarColor: undefined,
    titleBold: false,
    iconActive: 2,
    iconLabel: "Home",
    onIconClick: undefined,
  };

  switch (route.view) {
    case "menu":
      return { ...base, title: "", view: <Menu /> };

    case "grid":
      return {
        ...base,
        title: subTitle ?? "",
        titleBold: true,
        onIconClick: () => go("#/menu"),
        view: <RewardGrid subId={route.subId} />,
      };

    case "detail":
      return {
        ...base,
        title: subTitle ?? "",
        // The bar picks up the subcategory colour so it reads as one surface with
        // the themed panel below it.
        appbarColor: pageColor,
        iconActive: 0,
        iconLabel: "Back to list",
        onIconClick: () => go(`#/c/${route.subId}`),
        view: (
          <ItemDetail
            // Remounts on item change so the selected option resets.
            key={route.itemId}
            subId={route.subId}
            itemId={route.itemId}
            option={route.option}
            color={pageColor}
          />
        ),
      };

    case "board":
      return {
        ...base,
        title: "MISSION REPORT",
        titleBold: true,
        onIconClick: () => go("#/menu"),
        view: <MissionBoard adminKey={route.adminKey} />,
      };

    case "soon":
    default:
      return { ...base, title: "", view: <Soon /> };
  }
}
