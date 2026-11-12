import Image from "next/image";
import Link from "next/link";
import AsciiPoster, { type Poster } from "@/components/fresh/AsciiPoster";

/**
 * The work hung like prints on a wall: a few pieces, deliberately placed at
 * different sizes and heights, each matted and given a small museum-style
 * label. One personal piece hangs among them.
 */

type Piece = {
  slug: string;
  title: string;
  work: string;
  /** The "medium" line on a gallery label. */
  medium: string;
  credit: string;
  colour: string;
  src: string;
  /** Placement on the 12-column wall at lg and up. */
  place: string;
};

const PIECES: Piece[] = [
  {
    slug: "groq",
    title: "Groq",
    work: "GroqCloud design system",
    medium: "Design system, dashboards, and AI search",
    credit: "Product designer, 2025",
    colour: "var(--tomato)",
    src: "/groq-hero.png",
    place: "lg:col-start-1 lg:col-span-7",
  },
  {
    slug: "phia",
    title: "Phia",
    work: "Onboarding and activation",
    medium: "Growth design, A/B tests, new features",
    credit: "Growth designer, 2025",
    colour: "var(--cobalt)",
    src: "/phia-hero.png",
    place: "lg:col-start-9 lg:col-span-4 lg:mt-48",
  },
  {
    slug: "klarify",
    title: "Klarify",
    work: "A web app for therapists",
    medium: "Every feature and flow, as the sole designer",
    credit: "Product designer, 2024–25",
    colour: "var(--leaf)",
    src: "/klarify-hero.png",
    place: "lg:col-start-6 lg:col-span-7 lg:mt-20",
  },
];

const POSTERS: Poster[] = [
  { src: "/board-games.jpg", caption: "Board game nights", subject: "Table", bg: "#5865c4", ink: "#f4f1ea", highlight: "#f6b26b", text: "#f4f1ea" },
  { src: "/kitchen.JPG", caption: "Cooking for friends", subject: "Kitchen", bg: "var(--charcoal)", ink: "#e2452b", highlight: "#f4f1ea" },
  { src: "/camera.JPG", caption: "Behind the camera", subject: "Film", bg: "#e8e2d5", ink: "#2f4fd1", highlight: "#1d1b18", light: true },
  { src: "/exploring.JPG", caption: "Somewhere new", subject: "Away", bg: "var(--charcoal)", ink: "#5fb97a", highlight: "#f4f1ea" },
];

const NAV = [
  { label: "Work", href: "/", current: true },
  { label: "Playground", href: "/playground" },
  { label: "Resume", href: "/resume.pdf", external: true },
  { label: "Email", href: "mailto:yousuf.zephyr@gmail.com" },
];

const ELSEWHERE = [
  { label: "LinkedIn", href: "https://linkedin.com/in/zia-yousuf" },
  { label: "X", href: "https://twitter.com/yousufziaaa" },
  { label: "Research", href: "https://pubmed.ncbi.nlm.nih.gov/?term=Islam+YZ&cauthor_id=41027339" },
];

function Label({ n, piece }: { n: number; piece: Pick<Piece, "title" | "work" | "medium" | "credit" | "colour"> }) {
  return (
    <div className="mt-4 grid grid-cols-[2.25rem_minmax(0,1fr)] font-inter text-[13px] leading-[1.45]">
      <span className="tnum text-ink-3">{String(n).padStart(2, "0")}</span>
      <div>
        <p className="flex items-baseline gap-2">
          <span aria-hidden className="size-[7px] shrink-0 translate-y-[-1px] rounded-[1px]" style={{ background: piece.colour }} />
          <span className="text-ink">{piece.title}</span>
          <span className="text-ink-3">{piece.work}</span>
        </p>
        <p className="mt-1 font-serif text-[15px] italic leading-[1.3] text-ink-2">{piece.medium}</p>
        <p className="mt-1 text-ink-3">{piece.credit}</p>
      </div>
    </div>
  );
}

function Checker() {
  return (
    <svg width="24" height="8" viewBox="0 0 24 8" aria-hidden className="shrink-0">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={i * 4} y={i % 2 === 0 ? 0 : 4} width="4" height="4" fill="var(--ink)" />
      ))}
    </svg>
  );
}

export default function Wall() {
  return (
    <main className="min-h-[100svh] bg-paper font-inter text-ink antialiased">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <header className="grid gap-10 pb-20 pt-10 md:grid-cols-12 md:pb-28 md:pt-14">
          <div className="md:col-span-6 lg:col-span-5">
            <h1 className="font-serif text-[30px] font-normal leading-none tracking-[-0.01em] text-ink">Yousuf Zia</h1>
            <p className="mt-5 max-w-[36ch] text-[15px] leading-[1.5] text-ink-2">
              Product designer and engineer, now at Latent. Previously at Nvidia, and at Groq, where I built the
              GroqCloud design system from the ground up.
            </p>
          </div>
          <nav className="flex gap-16 text-[14px] leading-[1.7] md:col-span-6 md:col-start-7 md:justify-end lg:col-span-4 lg:col-start-9">
            <ul>
              {NAV.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-current={l.current ? "page" : undefined}
                    className="group inline-flex items-center gap-2 text-ink-2 transition-colors duration-150 ease-out hover:text-ink aria-[current=page]:text-ink"
                  >
                    <span
                      aria-hidden
                      className={`size-[5px] rounded-full bg-ink ${l.current ? "opacity-100" : "opacity-0"}`}
                    />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul>
              {ELSEWHERE.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-3 transition-colors duration-150 ease-out hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <section aria-label="Selected work" className="grid gap-x-8 gap-y-20 pb-32 lg:grid-cols-12 lg:gap-y-0">
          {PIECES.map((p, i) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className={`group block outline-none ${p.place}`}>
              <div className="rounded-[2px] bg-[#fbfaf6] p-[4.5%] shadow-[0_1px_1px_rgba(29,27,24,0.05),0_18px_36px_-22px_rgba(29,27,24,0.28)] transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:shadow-[0_1px_1px_rgba(29,27,24,0.05),0_26px_44px_-22px_rgba(29,27,24,0.34)] group-focus-visible:ring-2 group-focus-visible:ring-ink group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-paper">
                <Image
                  src={p.src}
                  alt={`${p.title}: ${p.work}`}
                  width={1600}
                  height={900}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="h-auto w-full"
                  priority={i === 0}
                />
              </div>
              <Label n={i + 1} piece={p} />
            </Link>
          ))}

          <div className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:mt-56">
            <AsciiPoster posters={POSTERS} className="w-full" />
            <Label
              n={4}
              piece={{
                title: "Off-hours",
                work: "Photos, retyped",
                medium: "ASCII on paper. Click to change the print",
                credit: "Ongoing",
                colour: "var(--marigold)",
              }}
            />
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-rule py-8 text-[13px] text-ink-3">
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
