import type { CSSProperties } from "react";

/**
 * The nav's lettering: the title face at a small optical size, medium,
 * slightly tight. Shared by anything that should read as part of the nav
 * (the site nav, the "Next" link at the foot of a case study).
 */
export const navType = "text-[15px] font-medium tracking-[-0.01em]";
export const navFace: CSSProperties = {
  fontFamily: "var(--site-title, var(--font-bricolage))",
  fontVariationSettings: '"opsz" 14',
  fontSynthesis: "none",
};
