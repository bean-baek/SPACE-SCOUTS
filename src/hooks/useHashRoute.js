import { useEffect, useState } from "react";

function parse(hash) {
  const parts = (hash || "#/").replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts.length === 0) return { view: "landing" };
  if (parts[0] === "menu") return { view: "menu" };
  if (parts[0] === "c" && parts[1]) return { view: "grid", subId: parts[1] };
  if (parts[0] === "i" && parts[1] && parts[2])
    return {
      view: "detail",
      subId: parts[1],
      itemId: parts[2],
      option: parts[3] ? decodeURIComponent(parts[3]) : undefined,
    };
  if (parts[0] === "game") return { view: "game" };
  if (parts[0] === "board") {
    // #/board/admin/<key> — owner unlock; the key is captured then stripped from the URL.
    if (parts[1] === "admin" && parts[2]) {
      return { view: "board", adminKey: decodeURIComponent(parts[2]) };
    }
    return { view: "board" };
  }
  if (parts[0] === "soon") return { view: "soon" };
  return { view: "landing" };
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  return route;
}

export function go(hash) {
  window.location.hash = hash;
}
