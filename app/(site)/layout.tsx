import Shell from "@/components/site/Shell";

// One shell for every public page, so the ground, lattice and nav stay
// mounted while you move between pages.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
