import type { Viewport } from "next";
import Shell from "@/components/site/Shell";

// Edge to edge on notched phones: the Shell pads itself clear of the safe
// areas and paints the strips behind the status bar and toolbar. The
// theme-color starts on the jhalar rail's black (what the top of every
// page shows on load) and Edges.tsx keeps it in step from there.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#121212",
};

// One shell for every public page, so the ground, lattice and nav stay
// mounted while you move between pages.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
