import { useId, type CSSProperties } from "react";

/** Eight-pointed star, sharp enough to read at 11px. */
const STAR_POINTS = Array.from({ length: 16 }, (_, i) => {
  const r = i % 2 === 0 ? 10 : 5.2;
  const a = (i * Math.PI) / 8 - Math.PI / 2;
  return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
}).join(" ");

export function StarMark({ colour, size = 11 }: { colour: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-10 -10 20 20" aria-hidden className="shrink-0">
      <polygon points={STAR_POINTS} style={{ fill: colour }} />
    </svg>
  );
}

/** A row of stars, one every STAR_PITCH px: the nav's underline. */
export const STAR_PITCH = 8;
const STAR_ROW_H = 5;
const STAR_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-10 -10 20 20'><polygon points='${STAR_POINTS}'/></svg>`,
)}")`;
export function starRowStyle(colour: string): CSSProperties {
  return {
    height: STAR_ROW_H,
    backgroundColor: colour,
    WebkitMaskImage: STAR_MASK,
    maskImage: STAR_MASK,
    WebkitMaskSize: `${STAR_PITCH}px ${STAR_ROW_H}px`,
    maskSize: `${STAR_PITCH}px ${STAR_ROW_H}px`,
    WebkitMaskRepeat: "repeat-x",
    maskRepeat: "repeat-x",
  };
}

const HEM_COLOURS = ["#d9432b", "#ef9a2a", "#ffe066", "#2f4fd1", "#ff8fc1", "#6e2c43"];

/**
 * Truck-art hem: a dotted black band with a row of bright triangles hanging
 * off it. `flip` turns it over for the bottom edge.
 */
export function TruckHem({ flip = false }: { flip?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`block h-[18px] w-full shrink-0 ${flip ? "-scale-y-100" : ""}`} aria-hidden>
      <defs>
        <pattern id={`${id}-tri`} width={HEM_COLOURS.length * 12} height="12" patternUnits="userSpaceOnUse">
          {HEM_COLOURS.map((c, i) => (
            <path key={c} d={`M${i * 12} 0 h12 l-6 12 z`} fill={c} />
          ))}
        </pattern>
        <pattern id={`${id}-dot`} width="8" height="6" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="3" r="1.4" fill="#f5f0e4" />
        </pattern>
      </defs>
      <rect width="100%" height="6" fill="#121212" />
      <rect width="100%" height="6" fill={`url(#${id}-dot)`} />
      <rect y="6" width="100%" height="12" fill={`url(#${id}-tri)`} />
    </svg>
  );
}
