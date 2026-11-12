/**
 * Polaroids on /about. Add as many as you like; the gallery wraps.
 * `id` lets a phrase in the About copy point at a photo. `colour` tints the
 * lattice when the photo is hovered (optional).
 */

export type Photo = {
  id: string;
  src: string;
  caption: string;
  alt: string;
  colour?: string;
};

export const photos: Photo[] = [
  { id: "kitchen", src: "/kitchen.JPG", caption: "the kitchen", alt: "Cinnamon rolls in a tray", colour: "#ff9b7a" },
  { id: "games", src: "/board-games.jpg", caption: "game night", alt: "A board game mid-play", colour: "#ffe066" },
  { id: "camera", src: "/camera.JPG", caption: "behind the camera", alt: "A lit-up street at night", colour: "#9fdcff" },
  { id: "away", src: "/exploring.JPG", caption: "somewhere new", alt: "Red cliffs under a blue sky", colour: "#d4b8ff" },
];
