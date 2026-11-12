import Link from "next/link";
import AsciiPoster, { type Poster } from "@/components/fresh/AsciiPoster";
import { links, visibleWork } from "@/data/work";

const POSTERS: Poster[] = [
  {
    src: "/kitchen.JPG",
    caption: "Cooking for friends",
    subject: "Kitchen",
    bg: "var(--charcoal)",
    ink: "#e2452b",
    highlight: "#f4f1ea",
  },
  {
    src: "/board-games.jpg",
    caption: "Board game nights",
    subject: "Table",
    bg: "#5865c4",
    ink: "#f4f1ea",
    highlight: "#f6b26b",
    text: "#f4f1ea",
  },
  {
    src: "/camera.JPG",
    caption: "Behind the camera",
    subject: "Film",
    bg: "#e8e2d5",
    ink: "#2f4fd1",
    highlight: "#1d1b18",
    light: true,
  },
  {
    src: "/exploring.JPG",
    caption: "Somewhere new",
    subject: "Away",
    bg: "var(--charcoal)",
    ink: "#5fb97a",
    highlight: "#f4f1ea",
  },
];

/** One colour per project, like one coloured chair per room. */
const PROJECT_COLOUR: Record<string, string> = {
  groq: "var(--tomato)",
  phia: "var(--cobalt)",
  klarify: "var(--leaf)",
};

function Checker() {
  return (
    <svg width="36" height="12" viewBox="0 0 36 12" aria-hidden className="shrink-0">
      {Array.from({ length: 12 }, (_, i) => {
        const x = (i % 6) * 6;
        const y = Math.floor(i / 6) * 6;
        return (i + Math.floor(i / 6)) % 2 === 0 ? <rect key={i} x={x} y={y} width="6" height="6" fill="var(--ink)" /> : null;
      })}
    </svg>
  );
}

function ExternalLinks({ className }: { className?: string }) {
  return (
    <nav className={className}>
      {links.map((l) => {
        const external = l.href.startsWith("http") || l.href.endsWith(".pdf");
        return (
          <a
            key={l.label}
            href={l.href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="text-ink-2 transition-colors duration-150 ease-out hover:text-ink"
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}

export default function Home() {
  return (
    <main className="min-h-[100svh] bg-paper font-neue-machina text-ink antialiased">
      <div className="mx-auto max-w-[1120px] px-6 md:px-10">
        <header className="flex items-baseline justify-between gap-6 py-6 text-[14px] md:py-8">
          <span>Yousuf Zia</span>
          <ExternalLinks className="hidden gap-6 sm:flex" />
        </header>

        <section className="grid items-end gap-12 pb-20 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-16 md:pb-28 md:pt-[10vh]">
          <div className="max-w-[560px]">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px]"
              style={{
                color: "#b5520f",
                background: "color-mix(in srgb, var(--marigold) 12%, var(--paper))",
                borderColor: "color-mix(in srgb, var(--marigold) 28%, var(--paper))",
              }}
            >
              <span className="size-1.5 rounded-full bg-marigold" aria-hidden />
              Now at Latent
            </span>
            <h1 className="mt-6 font-neue-machina text-[clamp(34px,4.4vw,56px)] font-normal leading-[1.04] tracking-[-0.03em] text-ink [text-wrap:balance]">
              Product designer and engineer.
            </h1>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.55] text-ink-2">
              I design interfaces and build them too. Before Latent I was at Nvidia, and at Groq, where I built the
              GroqCloud design system from the ground up. Waterloo Engineering, class of &apos;26.
            </p>
          </div>

          <AsciiPoster posters={POSTERS} className="w-full max-w-[400px] justify-self-start md:justify-self-end" />
        </section>

        <section className="pb-24">
          <h2 className="mb-4 font-departure-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">Selected work</h2>
          <ul className="border-t border-rule">
            {visibleWork.map((w) => (
              <li key={w.slug} className="border-b border-rule">
                <Link
                  href={`/projects/${w.slug}`}
                  className="group grid grid-cols-[12px_minmax(0,1fr)_auto] items-baseline gap-4 py-5 outline-none transition-colors duration-150 ease-out hover:bg-paper-2/60 focus-visible:bg-paper-2 sm:grid-cols-[12px_minmax(0,220px)_minmax(0,1fr)_auto]"
                >
                  <span
                    aria-hidden
                    className="size-2.5 translate-y-[-1px] rounded-[2px]"
                    style={{ background: PROJECT_COLOUR[w.slug] ?? "var(--ink-3)" }}
                  />
                  <span className="text-[20px] leading-tight tracking-[-0.01em]">{w.title}</span>
                  <span className="hidden truncate text-[15px] text-ink-2 sm:block">{w.role}</span>
                  <span className="flex items-baseline gap-3 text-[14px] text-ink-3">
                    <span className="tnum">{w.dateRange}</span>
                    <span
                      aria-hidden
                      className="text-ink-2 transition-transform duration-200 ease-out group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-rule py-8 text-[14px]">
          <span className="flex items-center gap-3 text-ink-3">
            <Checker />
            Made in my room, mostly at night.
          </span>
          <ExternalLinks className="flex flex-wrap gap-x-6 gap-y-2 sm:hidden" />
          <span className="hidden text-ink-3 sm:block">© 2026</span>
        </footer>
      </div>
    </main>
  );
}
