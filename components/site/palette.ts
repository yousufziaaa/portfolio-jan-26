/** Site palette: poster green, cream lettering, truck-art plates. */

export const GROUND = "#368c53";
export const CREAM = "#f5f0e4";
export const LATTICE = "#2a7344";

// One plate colour per company, in the realm of each brand (Latent's
// lavender, Nvidia's lime, Groq's orange-red, Phia's royal blue lifted,
// Klarify's terracotta pot) and light enough for black lettering (6-9:1).
export const COMPANY: Record<string, string> = {
  latent: "#c3a6ff",
  nvidia: "#8cc63f",
  groq: "#f5603f",
  phia: "#7d9cff",
  klarify: "#f2a27e",
};

export const DEFAULT_PLATE = COMPANY.latent;

// Case-study grounds: a deep, quiet shade from each brand, dark enough for
// long reading (cream text 12:1+). Groq oxblood, Phia royal navy, Klarify
// the teal of its wordmark.
export const CASE_GROUND: Record<string, string> = {
  groq: "#2b1713",
  phia: "#151c3a",
  klarify: "#12302d",
};

/** Blend two #rrggbb colours; t = 0 gives a, t = 1 gives b. */
export function mixHex(a: string, b: string, t: number) {
  const pa = a.replace("#", "");
  const pb = b.replace("#", "");
  return (
    "#" +
    [0, 2, 4]
      .map((i) => {
        const x = parseInt(pa.slice(i, i + 2), 16);
        const y = parseInt(pb.slice(i, i + 2), 16);
        return Math.round(x + (y - x) * t)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
}

/**
 * Section grounds, from the poster palettes. `lattice` is the tone-on-tone
 * stroke colour, `dot` the halftone screen.
 */
export const THEMES = {
  work: { bg: GROUND, ink: CREAM, lattice: LATTICE, dot: "rgba(0,0,0,0.13)" },
  writing: { bg: "#b5d3f4", ink: "#4f1830", lattice: "#7fa3d4", dot: "rgba(79,24,48,0.10)" },
  lab: { bg: "#cf4a7d", ink: "#fff4ea", lattice: "#a32f5c", dot: "rgba(0,0,0,0.11)" },
  about: { bg: "#6b2a42", ink: "#f7efe2", lattice: "#82405a", dot: "rgba(0,0,0,0.18)" },
  // Case studies: a neutral warm charcoal for long reading; the company
  // colour comes through in the lattice and the underlines.
  case: { bg: "#1f1e1b", ink: "#f3efe6", lattice: "#34322d", dot: "rgba(255,255,255,0.035)" },
} as const;

export type Section = keyof typeof THEMES;

/**
 * Lattice pattern per section, all from the same geometric family:
 * 0 star-and-cross, 1 octagons and squares, 2 hexagons and triangles,
 * 3 truck-art lozenges.
 */
export const PATTERN: Record<Section, number> = {
  work: 0,
  case: 0,
  writing: 1,
  lab: 2,
  about: 3,
};

export const PATTERN_NAMES = ["Star and cross", "Octagons", "Hexagons", "Lozenges"] as const;

export function themeFor(path: string): Section {
  if (path.startsWith("/projects")) return "case";
  if (path.startsWith("/writing")) return "writing";
  if (path.startsWith("/lab")) return "lab";
  if (path.startsWith("/about")) return "about";
  return "work";
}
