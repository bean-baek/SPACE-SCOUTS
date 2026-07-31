import { useHashRoute } from "./hooks/useHashRoute.js";
import { viewConfig } from "./viewConfig.jsx";
import Appbar from "./components/Appbar.jsx";
import Landing from "./components/Landing.jsx";
import DodgeGame from "./components/DodgeGame.jsx";
import VideoPage from "./components/VideoPage.jsx";

export default function App() {
  const route = useHashRoute();

  if (route.view === "landing") {
    return (
      <div className="phone">
        <Landing />
      </div>
    );
  }

  // The game runs full-bleed inside the phone frame — no appbar, no #app
  // padding — so it gets its own early return like the landing. Its own
  // floating back button handles navigation out.
  if (route.view === "game") {
    return (
      <div className="phone">
        <DodgeGame />
      </div>
    );
  }

  // "soon" 페이지를 전체 화면 비디오로 대체합니다.
  // 이 페이지도 다른 UI 없이 전체 화면을 사용하므로 여기서 먼저 처리합니다.
  if (route.view === "soon") {
    return (
      <div className="phone">
        <VideoPage />
      </div>
    );
  }

  const { view, ...chrome } = viewConfig(route);

  return (
    <div className="phone">
      {/* The board draws its own starfield (individually placed star.svg copies); skip
          the global sparkle overlay there so the two star layers don't stack. */}
      {route.view !== "board" && (
        <img
          className="sparkles"
          src="/images/sparkle.png"
          alt=""
          aria-hidden="true"
        />
      )}
      <Appbar
        title={chrome.title}
        color={chrome.appbarColor}
        titleBold={chrome.titleBold}
        iconActive={chrome.iconActive}
        iconLabel={chrome.iconLabel}
        onIconClick={chrome.onIconClick}
      />
      <main id="app">{view}</main>
    </div>
  );
}
