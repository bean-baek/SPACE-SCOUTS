import { useEffect, useState } from "react";

// `src` can be pre-wired to a path that doesn't have a file on disk yet
// (see data.js's id-matched naming convention) — falls back to the grey
// placeholder until that file actually shows up, instead of a broken-image icon.
export default function Tile({ src, alt }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) return <img src={src} alt={alt} onError={() => setFailed(true)} />;
  return (
    <span className="placeholder-label">
      TODO
      <br />
      image
    </span>
  );
}
