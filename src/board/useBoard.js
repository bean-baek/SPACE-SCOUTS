import { useEffect, useState } from "react";
import { go } from "../hooks/useHashRoute.js";
import {
  getMessages,
  getMineIds,
  isAdmin,
  setAdminKey,
  clearAdminKey,
} from "./boardApi.js";

/**
 * Board contents plus which of them this browser is allowed to delete.
 *
 * `loadFailed` is what lets the UI tell "nobody has posted yet" apart from "we
 * couldn't reach the board" — the two used to look identical.
 *
 * @returns {{
 *   ufos: object[],
 *   loadFailed: boolean,
 *   mine: Set<string>,
 *   addUfo: (row: object) => void,
 *   removeUfo: (id: string) => void,
 * }}
 */
export function useBoardMessages() {
  const [ufos, setUfos] = useState([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [mine, setMine] = useState(() => getMineIds()); // ids this browser can delete

  useEffect(() => {
    let alive = true;
    getMessages().then(({ rows, degraded }) => {
      if (!alive) return;
      setUfos(rows);
      setLoadFailed(degraded);
    });
    return () => {
      alive = false;
    };
  }, []);

  const addUfo = (row) => {
    setUfos((prev) => [row, ...prev]);
    setMine(getMineIds());
  };

  const removeUfo = (id) => {
    setUfos((prev) => prev.filter((u) => u.id !== id));
    setMine(getMineIds());
  };

  return { ufos, loadFailed, mine, addUfo, removeUfo };
}

/**
 * Owner moderation mode. A #/board/admin/<key> link stores the key, flips admin on,
 * then strips the key back out of the URL so it isn't left in the address bar or
 * browser history.
 *
 * @param {string} [adminKey] captured from the route, if present
 * @returns {{ admin: boolean, exitAdmin: () => void }}
 */
export function useAdminMode(adminKey) {
  const [admin, setAdmin] = useState(() => isAdmin());

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

  return { admin, exitAdmin };
}
