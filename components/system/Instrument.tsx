"use client";

import Link from "next/link";
import TextTunnel, { type TunnelRows } from "@/components/system/TextTunnel";
import { links, visibleWork } from "@/data/work";

const ROWS: TunnelRows = [
  ["Hello", "Hola", "Bonjour", "Ciao", "Hallo", "Olá", "Merhaba", "Salaam", "Szia", "Ahoj", "Hej", "Bok"],
  ["design systems", "prototyping", "interaction", "front-end", "motion", "research"],
  ["Latent", "Nvidia", "Groq", "Phia", "Klarify", "Waterloo"],
  ["climbing", "cooking for friends", "board games", "photography", "a good movie"],
  ["product designer", "design engineer", "systems thinker", "prototyper"],
  ["GroqCloud", "LoRA management", "dashboards", "AI search", "onboarding", "A/B tests"],
];

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
            className="text-sys-dim transition-colors duration-150 ease-out hover:text-sys-fg"
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}

export default function Instrument() {
  return (
    <main className="relative isolate flex min-h-[100svh] flex-col font-neue-machina text-sys-fg">
      <TextTunnel rows={ROWS} />
      {/* On phones the copy sits over the tunnel; fade the tunnel out behind it. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-[5] h-[70svh] bg-[linear-gradient(to_top,var(--sys-bg)_55%,transparent)] md:hidden"
      />

      <header className="flex items-baseline justify-between gap-6 px-6 py-6 text-[14px] md:px-10 md:py-8">
        <span>Yousuf Zia</span>
        <ExternalLinks className="hidden gap-6 md:flex" />
      </header>

      <section className="grid flex-1 content-end gap-14 px-6 pb-10 pt-[46vh] md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] md:items-end md:gap-10 md:px-10 md:pb-12 md:pt-0">
        <div className="max-w-[520px]" data-no-drag>
          <h1 className="font-neue-machina text-[clamp(26px,2.8vw,38px)] font-normal leading-[1.12] tracking-[-0.02em] [text-wrap:balance]">
            Product designer and engineer, currently at Latent.
          </h1>
          <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.6] text-sys-dim">
            Previously at Nvidia, and at Groq, where I built the GroqCloud design system from the ground up. Before
            that, growth at Phia and every flow of Klarify. Waterloo Engineering, class of &apos;26.
          </p>
        </div>

        <div data-no-drag>
          <h2 className="sys-label mb-3 text-sys-faint">Selected work</h2>
          <ul className="border-t border-sys-line">
            {visibleWork.map((w) => (
              <li key={w.slug} className="border-b border-sys-line">
                <Link
                  href={`/projects/${w.slug}`}
                  className="group flex items-baseline justify-between gap-4 py-3 outline-none"
                >
                  <span className="text-[15px] transition-colors duration-150 ease-out group-hover:text-signal group-focus-visible:text-signal">
                    {w.title}
                  </span>
                  <span className="tnum text-[13px] text-sys-faint">{w.dateRange}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <ExternalLinks className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] md:hidden" />
      </section>
    </main>
  );
}
