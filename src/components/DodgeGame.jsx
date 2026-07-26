import { useCallback, useEffect, useRef, useState } from "react";
import { preloadAssets, ASSETS } from "../game/dodgeAssets.js";
import { createDodgeGame, BOSS_HP, PHASE1_END } from "../game/dodgeEngine.js";
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
      }
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
      <canvas ref={canvasRef} className="dg-canvas" />

      <div className="dg-hud" ref={hudRef} aria-hidden="true">
        <span className="dg-hud__label" ref={labelRef}>
          SURVIVAL TIME
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
          <img className="dg-board" src={ASSETS.board} alt="" aria-hidden="true" />
          <h2 className="dg-title">DODGE!</h2>
          <p className="dg-hint">
            Steer left and right — arrow keys, A/D, or drag. One hit and it&rsquo;s
            over. The boss arrives at {PHASE1_END}s; your gun opens up on its own,
            and {BOSS_HP} clean hits will bring it down.
          </p>
          <button type="button" className="dg-btn" onClick={play}>
            START
          </button>
        </div>
      )}

      {!error && finished && (
        <div className="dg-overlay" role="alertdialog" aria-label="Result">
          <img className="dg-board" src={ASSETS.board} alt="" aria-hidden="true" />
          <h2 className={`dg-title${cleared ? " dg-title--clear" : ""}`}>
            {cleared ? "STAGE CLEAR!" : "GAME OVER"}
          </h2>
          <p className="dg-score">
            <b>{(result?.time ?? 0).toFixed(1)}s</b> survived
          </p>
          <p className="dg-hint">
            {cleared
              ? "Boss down. Nothing left up there but stars."
              : "So close. One more run?"}
          </p>
          <button type="button" className="dg-btn" onClick={play} autoFocus>
            RESTART
          </button>
        </div>
      )}
    </div>
  );
}
