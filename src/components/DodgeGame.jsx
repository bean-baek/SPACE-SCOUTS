import { useCallback, useEffect, useRef, useState } from "react";
import { preloadAssets, ASSETS } from "../game/dodgeAssets.js";
import { createDodgeGame, BOSS_HP, PHASE1_END } from "../game/dodgeEngine.js";
import { go } from "../hooks/useHashRoute.js";
import "./DodgeGame.css";

// React owns only the shell: the canvas element, the overlays, and the engine's
// lifecycle. It deliberately holds no per-frame state — the live timer is written
// straight into the DOM from the loop, so a running game triggers zero re-renders.
export default function DodgeGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const timeRef = useRef(null);
  const labelRef = useRef(null);
  const hudRef = useRef(null);

  const [assets, setAssets] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | playing | over | clear
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    preloadAssets().then(
      (loaded) => {
        if (cancelled) return;
        setAssets(loaded);
        setStatus("ready");
      },
      (err) => {
        if (cancelled) return;
        setError(err.message);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Writing through refs keeps the 60fps timer out of React's render path.
  const handleTick = useCallback((t, phase, bossHp) => {
    if (timeRef.current) timeRef.current.textContent = t.toFixed(1);
    if (labelRef.current) {
      labelRef.current.textContent =
        phase === "boss"
          ? `BOSS — ${Math.max(0, bossHp)} HITS LEFT`
          : "SURVIVAL TIME";
    }
    if (hudRef.current) {
      hudRef.current.classList.toggle("dg-hud--boss", phase === "boss");
    }
  }, []);

  const handleEnd = useCallback((r) => {
    setResult(r);
    setStatus(r.status);
  }, []);

  // The engine is created and destroyed entirely inside this effect. destroy() is
  // total, so StrictMode's double-invoke can never leave two loops running.
  useEffect(() => {
    if (!assets || !canvasRef.current) return;
    const game = createDodgeGame(canvasRef.current, {
      assets,
      onTick: handleTick,
      onEnd: handleEnd,
    });
    gameRef.current = game;
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [assets, handleTick, handleEnd]);

  const play = useCallback(() => {
    setResult(null);
    setStatus("playing");
    gameRef.current?.start();
  }, []);

  const cleared = status === "clear";
  const finished = status === "over" || cleared;

  return (
    <div className="dg-root">
      {/* Floating exit — sits above every overlay (z-4) so it stays tappable on the
          start and result screens. Drawn in the game's own white/lime palette rather
          than the site's blue toggle icon, which would vanish on the blue field. */}
      <button
        type="button"
        className="dg-back"
        onClick={() => go("#/menu")}
        aria-label="Back to menu">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>

      <canvas ref={canvasRef} className="dg-canvas" />

      <div className="dg-hud" ref={hudRef} aria-hidden="true">
        <span className="dg-hud__label" ref={labelRef}>
          생존 시간
        </span>
        <span className="dg-hud__time" ref={timeRef}>
          0.0
        </span>
      </div>

      {error && (
        <div className="dg-overlay">
          <h2 className="dg-title">OOPS</h2>
          <p className="dg-error">{error}</p>
        </div>
      )}

      {!error && status === "loading" && (
        <div className="dg-overlay">
          <p className="dg-hint">LOADING…</p>
        </div>
      )}

      {!error && status === "ready" && (
        <div className="dg-overlay">
          <img
            className="dg-board"
            src={ASSETS.board}
            alt=""
            aria-hidden="true"
          />
          <h2 className="dg-title">긴급 탐사 미션!</h2>
          <p className="dg-hint">
            ← → 방향키, A / D 또는 드래그로 대장을 움직여 외계 젤리 괴물을 피해
            주세요. 괴물과 충돌하면 즉시 탐사가 종료됩니다.{PHASE1_END}초 후
            거대 젤리 괴물이 출현합니다. 대장의 무기는 자동으로 발사되며,{" "}
            {BOSS_HP}회 명중 시 임무가 완료됩니다.
          </p>
          <button type="button" className="dg-btn" onClick={play}>
            START
          </button>
        </div>
      )}

      {!error && finished && (
        <div className="dg-overlay" role="alertdialog" aria-label="Result">
          <img
            className="dg-board"
            src={ASSETS.board}
            alt=""
            aria-hidden="true"
          />
          <h2 className={`dg-title${cleared ? " dg-title--clear" : ""}`}>
            {cleared ? "STAGE CLEAR!" : "GAME OVER"}
          </h2>
          <p className="dg-score">
            <b>{(result?.time ?? 0).toFixed(1)}초</b> 동안 생존했습니다!
          </p>
          <p className="dg-hint">
            {cleared
              ? "거대 젤리 괴물 처치 완료!\n우주의 평화는 오늘도 스카우트 대원들이 지켜냈습니다."
              : "아쉽네요!\n다시 탐사를 시작해 볼까요?"}
          </p>
          <button type="button" className="dg-btn" onClick={play} autoFocus>
            다시 탐사하기
          </button>
        </div>
      )}
    </div>
  );
}
