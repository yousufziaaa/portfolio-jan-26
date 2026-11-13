import type { Viewport } from "next";
import Shell from "@/components/site/Shell";
import { GROUND } from "@/components/site/palette";

// Edge to edge on notched phones: the Shell pads itself clear of the safe
// areas and paints the strips behind the status bar and toolbar. The
// theme-color starts on the home ground and Edges.tsx moves it to each
// section's ground from there.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: GROUND,
};

// One shell for every public page, so the ground, lattice and nav stay
// mounted while you move between pages.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
