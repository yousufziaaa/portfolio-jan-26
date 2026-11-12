import type { ReactNode } from "react";

/**
 * Remounts on every navigation (unlike the layout), so each page's content
 * fades up into place while the shell's ground colour crossfades around it.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>;
}
