import { useEffect, useState } from "react";
import { go } from "../hooks/useHashRoute.js";
import Ufo from "./Ufo.jsx";
import UfoComposer from "./UfoComposer.jsx";
import {
  getMessages,
  getMineIds,
  deleteMessage,
  isAdmin,
  setAdminKey,
  clearAdminKey,
} from "./boardApi.js";
import "./MissionBoard.css";

// Fixed scatter for the decorative background stars — {left, top, size, rotate},
// eyeballed from the reference so the board reads the same on every load.
const STARS = [
  { left: 62, top: 4, size: 46, rot: -12 },
  { left: 8, top: 12, size: 34, rot: 8 },
  { left: 82, top: 20, size: 26, rot: 20 },
  { left: 4, top: 30, size: 22, rot: -6 },
  { left: 88, top: 40, size: 30, rot: 14 },
  { left: 70, top: 56, size: 24, rot: -18 },
  { left: 12, top: 52, size: 28, rot: 10 },
  { left: 84, top: 70, size: 20, rot: 0 },
  { left: 22, top: 74, size: 18, rot: 16 },
];

export default function MissionBoard({ adminKey }) {
  const [ufos, setUfos] = useState([]);
  const [composing, setComposing] = useState(false);
  const [active, setActive] = useState(null); // placed UFO whose message modal is open
  const [mine, setMine] = useState(() => getMineIds()); // ids this browser can delete
  const [admin, setAdmin] = useState(() => isAdmin()); // owner moderation mode

  useEffect(() => {
    let alive = true;
    getMessages().then((list) => {
      if (alive) setUfos(Array.isArray(list) ? list : []);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Owner unlock: a #/board/admin/<key> link stores the key, flips admin on, then strips
  // the key back out of the URL so it isn't left in the address bar / history.
  useEffect(() => {
    if (!adminKey) return;
    setAdminKey(adminKey);
    setAdmin(true);
    go("#/board");
  }, [adminKey]);

  const exitAdmin = () => {
    clearAdminKey();
    setAdmin(false);
  };

  const handlePlaced = (row) => {
    setUfos((prev) => [row, ...prev]);
    setMine(getMineIds());
    setComposing(false);
  };

  const handleDelete = async (id) => {
    const ok = await deleteMessage(id);
    if (ok) {
      setUfos((prev) => prev.filter((u) => u.id !== id));
      setMine(getMineIds());
    }
    setActive(null);
  };

  return (
    <section className="board">
      {admin && (
        <button type="button" className="board__admin" onClick={exitAdmin}>
          ADMIN · tap to exit
        </button>
      )}

      <div className="board__stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <img
            key={i}
            src="/images/community/bg_star.svg"
            alt=""
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              transform: `rotate(${s.rot}deg)`,
            }}
          />
        ))}
      </div>

      <img
        className="board__decor"
        src="/images/community/bg_character_mission_report.svg"
        alt=""
        aria-hidden="true"
      />

      {ufos.map((u) => (
        <button
          key={u.id}
          type="button"
          className="board__ufo"
          style={{ left: `${u.x * 100}%`, top: `${u.y * 100}%` }}
          onClick={() => setActive(u)}
          aria-label="Read this mission report">
          <Ufo
            colors={{ top: u.top, middle: u.middle, bottom: u.bottom }}
            size={52}
          />
        </button>
      ))}

      {!composing && (
        <button
          type="button"
          className="board__cta"
          onClick={() => setComposing(true)}>
          HOW WAS YOUR MISSION?
          <img src="/images/message_character.svg" alt="" aria-hidden="true" />
        </button>
      )}

      {composing && (
        <UfoComposer
          onPlaced={handlePlaced}
          onCancel={() => setComposing(false)}
        />
      )}

      {active && (
        <div
          className="board-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}>
          <div
            className="board-modal__card"
            onClick={(e) => e.stopPropagation()}>
            <Ufo
              colors={{
                top: active.top,
                middle: active.middle,
                bottom: active.bottom,
              }}
              size={92}
            />
            <p className="board-modal__text">{active.text}</p>
            <img
              className="board-modal__char"
              src="/images/message_character.svg"
              alt=""
              aria-hidden="true"
            />
            <div className="board-modal__actions">
              {(admin || mine.has(active.id)) && (
                <button
                  type="button"
                  className="board-modal__delete"
                  onClick={() => handleDelete(active.id)}>
                  DELETE
                </button>
              )}
              <button
                type="button"
                className="board-modal__close"
                onClick={() => setActive(null)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
