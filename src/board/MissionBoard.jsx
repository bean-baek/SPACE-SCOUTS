import { useState } from "react";
import Ufo from "./Ufo.jsx";
import UfoComposer from "./UfoComposer.jsx";
import BoardModal from "./BoardModal.jsx";
import { useBoardMessages, useAdminMode } from "./useBoard.js";
import { deleteMessage } from "./boardApi.js";
import "./MissionBoard.css";

// Star positions, extracted from the design SVGs and expressed as % of the board
// (center-anchored) + width as % of board width. Placing individual star.svg copies this
// way lands them exactly like the reference at any size — unlike a full-bleed field, which
// object-fit:cover would crop and shift. Top group = design/bg_star.svg, lower group =
// design/more_stars.svg (kept as design references only; neither is loaded at runtime).
const STARS = [
  { left: 18, top: 15, w: 28 }, // big, upper-left
  { left: 76, top: 6, w: 16 }, // upper-right (below title)
  { left: 95, top: 20, w: 15 }, // right edge, upper-mid
  { left: 5, top: 30, w: 8 }, // left edge, mid
  { left: 92, top: 34, w: 10 }, // right, mid-lower
  { left: 7, top: 40, w: 15 }, // center-left (by the headline)
  { left: 88, top: 60, w: 24 }, // big, lower-right
  { left: 8, top: 66, w: 8 }, // big, lower-right
  { left: 30, top: 53, w: 10 }, // lower-left
];

/** @param {{ adminKey?: string }} props */
export default function MissionBoard({ adminKey }) {
  const { ufos, loadFailed, mine, addUfo, removeUfo } = useBoardMessages();
  const { admin, exitAdmin } = useAdminMode(adminKey);

  const [composing, setComposing] = useState(false);
  // placed UFO whose message modal is open
  const [active, setActive] = useState(
    /** @type {import('./boardApi.js').BoardMessage | null} */ (null)
  );
  const [deleteFailed, setDeleteFailed] = useState(false);

  const handlePlaced = (row) => {
    addUfo(row);
    setComposing(false);
  };

  const handleDelete = async (id) => {
    const ok = await deleteMessage(id);
    if (ok) {
      removeUfo(id);
      setActive(null);
      return;
    }
    // The row is still on the server. Keep the modal open and say so, rather than
    // closing it as if the delete had worked.
    setDeleteFailed(true);
  };

  const openMessage = (u) => {
    setDeleteFailed(false);
    setActive(u);
  };

  return (
    <section className="board">
      {admin && (
        <button type="button" className="board__admin" onClick={exitAdmin}>
          ADMIN · tap to exit
        </button>
      )}

      {/* Only rendered when the fetch actually failed, so an empty board still reads
          as "nobody has posted yet" rather than as an error. */}
      {loadFailed && (
        <p className="board__error" role="alert">
          Couldn't load the board — pull down to refresh.
        </p>
      )}

      {STARS.map((s, i) => (
        <img
          key={i}
          className="board__star"
          src="/images/community/star.svg"
          alt=""
          aria-hidden="true"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.w}%`,
            animationDelay: `${i * 0.06}s`, // gentle cascade as they drop in
          }}
        />
      ))}

      {/* Two layers, one CSS box. bg_character_mission_report.svg draws the character as
          an unfilled blue outline; the fill is a separate file padded into that same
          374×228 viewBox, so identical positioning keeps them registered at any size.
          Fill first — the linework has to sit on top of it. */}
      <img
        className="board__decor"
        src="/images/community/bg_character_fill.svg"
        alt=""
        aria-hidden="true"
      />
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
          onClick={() => openMessage(u)}
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
        <BoardModal
          message={active}
          canDelete={admin || mine.has(active.id)}
          deleteFailed={deleteFailed}
          onDelete={handleDelete}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}
