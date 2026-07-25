export default function Tile({ src, alt }) {
  if (src) return <img src={src} alt={alt} />;
  return (
    <span className="placeholder-label">
      TODO
      <br />
      image
    </span>
  );
}
