/**
 * Lab: experiments and things built for fun. Add an entry here and it shows
 * up on /lab. `href` is optional; entries without one are listed, not linked.
 */

export type Experiment = {
  slug: string;
  title: string;
  year: string;
  description: string;
  /** Plate colour: the star, and the lattice tint on hover. */
  colour: string;
  href?: string;
};

export const experiments: Experiment[] = [
  {
    slug: "star-lattice",
    title: "Star lattice",
    year: "2026",
    description: "An eight-fold star-and-cross pattern drawn in ASCII strokes. It's the ground under this site.",
    colour: "#ffe066",
  },
  {
    slug: "tile-plate",
    title: "Tile plate",
    year: "2026",
    description: "The same geometry as printed tilework, re-laid tile by tile in a shader.",
    colour: "#ff9b7a",
  },
  {
    slug: "ascii-field",
    title: "ASCII field",
    year: "2026",
    description: "Photos and sunlight through blinds, typed out as glyphs in WebGL.",
    colour: "#9fdcff",
  },
];

/** Stills from past work (what used to be /playground). */
export const shots = Array.from({ length: 10 }, (_, i) => ({
  src: `/playground-${i + 1}.png`,
  alt: `Still from past work, ${i + 1} of 10`,
}));
