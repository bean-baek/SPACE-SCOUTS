import Ufo from "./Ufo.jsx";

/**
 * Reading one mission report. Moved out of MissionBoard verbatim — the markup and
 * class names are unchanged, since the board's styling depends on them.
 *
 * @param {{
 *   message: import('./boardApi.js').BoardMessage,
 *   canDelete: boolean,
 *   deleteFailed: boolean,
 *   onDelete: (id: string) => void,
 *   onClose: () => void,
 * }} props
 */
export default function BoardModal({
  message,
  canDelete,
  deleteFailed,
  onDelete,
  onClose,
}) {
  return (
    <div className="board-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="board-modal__card" onClick={(e) => e.stopPropagation()}>
        <Ufo
          colors={{
            top: message.top,
            middle: message.middle,
            bottom: message.bottom,
          }}
          size={92}
        />
        <p className="board-modal__text">{message.text}</p>
        <img
          className="board-modal__char"
          src="/images/message_character.svg"
          alt=""
          aria-hidden="true"
        />
        {deleteFailed && (
          <p className="board-modal__error" role="alert">
            Couldn't delete — try again.
          </p>
        )}
        <div className="board-modal__actions">
          {canDelete && (
            <button
              type="button"
              className="board-modal__delete"
              onClick={() => onDelete(message.id)}>
              DELETE
            </button>
          )}
          <button type="button" className="board-modal__close" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
