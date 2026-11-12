import Link from "next/link";
import AsciiPoster, { type Poster } from "@/components/fresh/AsciiPoster";
import { links, visibleWork } from "@/data/work";

/**
 * One narrow, centred column. Nothing stretches to the edges; the ASCII
 * poster is the only image and the only real colour on the page.
 */

const POSTERS: Poster[] = [
  { src: "/board-games.jpg", caption: "Board game nights", subject: "Table", bg: "#5865c4", ink: "#f4f4f2", highlight: "#f6b26b", text: "#f4f4f2" },
  { src: "/kitchen.JPG", caption: "Cooking for friends", subject: "Kitchen", bg: "var(--charcoal)", ink: "#e2452b", highlight: "#f4f4f2" },
  { src: "/camera.JPG", caption: "Behind the camera", subject: "Film", bg: "#ebebe9", ink: "#2f4fd1", highlight: "#121212", light: true },
  { src: "/exploring.JPG", caption: "Somewhere new", subject: "Away", bg: "var(--charcoal)", ink: "#5fb97a", highlight: "#f4f4f2" },
];

const PROJECT_COLOUR: Record<string, string> = {
  groq: "var(--tomato)",
  phia: "var(--cobalt)",
  klarify: "var(--leaf)",
};

function Checker() {
  return (
    <svg width="24" height="8" viewBox="0 0 24 8" aria-hidden className="shrink-0">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={i * 4} y={i % 2 === 0 ? 0 : 4} width="4" height="4" fill="var(--ink)" />
      ))}
    </svg>
  );
}

export default function Column() {
  return (
    <main className="min-h-[100svh] bg-paper font-inter text-ink antialiased">
      <div className="mx-auto max-w-[560px] px-6 pb-16 pt-16 md:pt-[14vh]">
        <header className="text-[15px] leading-6">
          <h1 className="font-inter text-[15px] font-medium leading-6 tracking-[-0.01em] text-ink">Yousuf Zia</h1>
          <p className="text-ink-3">Product designer and engineer</p>
        </header>

        <p className="mt-8 text-[15px] leading-[1.65] text-ink-2">
          Now at <span className="text-ink">Latent</span>. Previously at <span className="text-ink">Nvidia</span>, and
          at <span className="text-ink">Groq</span>, where I built the GroqCloud design system from the ground up.
          Before that, growth at <span className="text-ink">Phia</span> and every flow of{" "}
          <span className="text-ink">Klarify</span>.
        </p>

        <AsciiPoster posters={POSTERS} aspect="5 / 4" className="mt-12" />

        <section className="mt-14">
          <h2 className="mb-3 font-inter text-[13px] font-normal tracking-normal text-ink-3">Selected work</h2>
          <ul className="border-t border-rule">
            {visibleWork.map((w) => (
              <li key={w.slug} className="border-b border-rule">
                <Link
                  href={`/projects/${w.slug}`}
                  className="group grid grid-cols-[14px_minmax(0,1fr)_auto] items-baseline gap-2 py-3 text-[15px] outline-none focus-visible:bg-paper-2"
                >
                  <span
                    aria-hidden
                    className="size-[7px] translate-y-[-1px] rounded-[1px]"
                    style={{ background: PROJECT_COLOUR[w.slug] ?? "var(--ink-3)" }}
                  />
                  <span className="truncate">
                    <span className="text-ink">{w.title}</span>
                    <span className="text-ink-3 transition-colors duration-150 ease-out group-hover:text-ink-2">
                      {"  "}
                      {w.role}
                    </span>
                  </span>
                  <span className="tnum text-[13px] text-ink-3">{w.dateRange}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
          {links.map((l) => {
            const external = l.href.startsWith("http") || l.href.endsWith(".pdf");
            return (
              <a
                key={l.label}
                href={l.href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-ink-2 underline decoration-rule decoration-1 underline-offset-[5px] transition-colors duration-150 ease-out hover:text-ink hover:decoration-ink-3"
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        <footer className="mt-24 flex items-center justify-between gap-6 text-[13px] text-ink-3">
          <span className="flex items-center gap-3">
            <Checker />
            Waterloo Engineering, class of &apos;26
          </span>
          <span>© 2026</span>
        </footer>
      </div>
    </main>
  );
}
