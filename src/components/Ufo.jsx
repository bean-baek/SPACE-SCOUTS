// Recolorable UFO. The three fill paths come straight from
// public/images/community/ufo_color.svg (viewBox 49×35) — each one is a section the
// visitor can tint. The blue line-art (ufo_lines.svg, viewBox 53×43, with antennae and
// windows) is laid over the top, static. The two source files have different boxes, so
// the fill SVG is inset onto the saucer region of the outline; that inset (in .ufo__fill,
// MissionBoard.css) was tuned visually so no fill colour spills past the linework.
//
// Section → path mapping (confirmed against the artwork):
//   top    = the dome (has the little window marks)
//   middle = the wide saucer disc
//   bottom = the underside sliver
const MIDDLE_PATH =
  "M48.22 22.3706C48.02 24.8106 45.18 26.4206 43.16 27.2506C38.24 29.2706 30.45 29.9706 25.1 30.3106C24.4 30.3506 23.82 30.3506 23.12 30.3106C18.91 30.0406 14.79 29.6706 10.64 28.8406C7.3 28.1706 0.48 26.4806 0 22.3706C0.04 19.7706 2.37 17.3706 4.01 15.3906C6.99 17.2206 10.96 17.8106 14.37 18.3206C17.63 18.6706 20.8 18.9706 24.11 18.9706C27.42 18.9706 30.58 18.6706 33.85 18.3206C37.26 17.8206 41.23 17.2306 44.21 15.3906C45.85 17.3706 48.18 19.7706 48.22 22.3706Z";
const TOP_PATH =
  "M34.36 15.9101C26.74 16.8801 21.52 16.9301 13.88 15.9101C11.37 15.5801 7.41001 14.8301 5.28001 13.4601C5.24001 11.9901 5.74001 10.7101 6.41001 9.42007C8.69001 5.04007 12.6 1.93007 17.43 0.790074C21.91 -0.259926 26.12 -0.249927 30.6 0.740074C35.56 1.84007 39.55 5.01007 41.87 9.49007C42.53 10.7601 43 12.0101 42.96 13.4501C40.88 14.8001 36.81 15.5801 34.35 15.9001L34.36 15.9101ZM17.74 4.96007C18.3 4.92007 18.72 4.37007 18.73 3.92007C18.73 3.38007 18.34 2.92007 17.78 2.82007C16.72 2.63007 15.77 2.97007 14.83 3.41007C13.28 4.14007 11.92 5.24007 11.28 6.84007C11.04 7.46007 11.28 8.10007 11.78 8.37007C12.28 8.64007 13.04 8.43007 13.3 7.85007C14.06 6.16007 15.97 5.09007 17.74 4.96007ZM10.94 11.1901C11.55 10.9601 11.83 10.4301 11.73 9.86007C11.65 9.39007 11.24 9.02007 10.7 8.91007C10.29 8.83007 9.88001 8.91007 9.59001 9.15007C9.11001 9.55007 9.13001 10.7501 9.85001 11.1501C10.16 11.3301 10.53 11.3501 10.94 11.1901Z";
const BOTTOM_PATH =
  "M36.23 31.4805C34.86 32.9805 33.04 33.8505 31.04 34.2705C26.43 35.2205 21.71 35.2205 17.11 34.2505C15.13 33.8305 13.37 32.9605 11.99 31.4805C17.25 32.2605 21.68 32.7605 26.91 32.5205C30.03 32.3305 32.99 31.9705 36.24 31.4905L36.23 31.4805Z";

// Default tri-colour: blue dome / lime disc / yellow underside — the site palette,
// and the top→blue, middle→green, bottom→yellow example the design calls for.
export const UFO_DEFAULT = { top: "#80CFFF", middle: "#CBFF88", bottom: "#FFFFAB" };

export default function Ufo({ colors = UFO_DEFAULT, size = 64, className = "" }) {
  return (
    <span
      className={`ufo ${className}`.trim()}
      style={{ width: size }}
      aria-hidden="true">
      <svg
        className="ufo__fill"
        viewBox="0 0 49 35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path d={MIDDLE_PATH} fill={colors.middle} />
        <path d={TOP_PATH} fill={colors.top} />
        <path d={BOTTOM_PATH} fill={colors.bottom} />
      </svg>
      <img className="ufo__lines" src="/images/community/ufo_lines.svg" alt="" />
    </span>
  );
}
