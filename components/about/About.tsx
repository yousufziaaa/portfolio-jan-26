"use client";

import { useState, type ReactNode } from "react";
import { useTintHandlers } from "@/components/site/Shell";
import PageTitle from "@/components/site/PageTitle";
import FadeImage from "@/components/site/FadeImage";
import { photos } from "@/data/about";
import { DEFAULT_PLATE } from "@/components/site/palette";

/**
 * About. Off-hours photos are a gallery of old polaroids, each set at a
 * slight angle. Hovering a phrase in the copy, or a polaroid itself,
 * straightens it and lights the lattice in its colour.
 */

// A repeating set of small tilts, so any number of photos looks hand-placed.
const TILTS = [-2.4, 1.6, -1.1, 2.2, -1.7, 1.1, -2.8, 0.8];

const colourOf = (id: string) => photos.find((p) => p.id === id)?.colour ?? DEFAULT_PLATE;

function Phrase({ id, onShow, children }: { id: string; onShow: (id: string | null) => void; children: ReactNode }) {
  const h = useTintHandlers()(colourOf(id));
  return (
    <span
      tabIndex={0}
      className="cursor-default text-ink underline decoration-2 underline-offset-[5px] outline-none focus-visible:rounded-[2px] focus-visible:ring-2 focus-visible:ring-ink"
      style={{ textDecorationColor: colourOf(id) }}
      onMouseEnter={() => {
        onShow(id);
        h.onMouseEnter();
      }}
      onMouseLeave={() => {
        onShow(null);
        h.onMouseLeave();
      }}
      onFocus={() => {
        onShow(id);
        h.onFocus();
      }}
      onBlur={() => {
        onShow(null);
        h.onBlur();
      }}
    >
      {children}
    </span>
  );
}

function Polaroid({ index, active, preview }: { index: number; active: boolean; preview?: string }) {
  const p = photos[index];
  const tint = useTintHandlers();
  return (
    <figure
      {...tint(p.colour ?? DEFAULT_PLATE)}
      tabIndex={0}
      className="group bg-[#f4efe3] p-[6%] pb-0 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_24px_-12px_rgba(0,0,0,0.5)] outline-none transition-transform duration-300 ease-out hover:z-10 hover:![transform:rotate(0deg)_scale(1.04)] focus-visible:z-10 focus-visible:![transform:rotate(0deg)_scale(1.04)]"
      style={{
        transform: active ? "rotate(0deg) scale(1.04)" : `rotate(${TILTS[index % TILTS.length]}deg)`,
        zIndex: active ? 10 : undefined,
        position: "relative",
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-[#2a2622]">
        <FadeImage
          src={p.src}
          alt={p.alt}
          fill
          sizes="(max-width: 640px) 45vw, 230px"
          // The first row sits near the fold; fetch it straight away.
          priority={index < 3}
          preview={preview}
          className="object-cover"
          style={{ filter: "sepia(0.22) saturate(0.85) contrast(0.94) brightness(1.04)" }}
        />
      </div>
      <figcaption
        className="py-[9%] text-center text-[15px] italic leading-none text-[#3a332c]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {p.caption}
      </figcaption>
    </figure>
  );
}

export default function About({ previews = [] }: { previews?: (string | undefined)[] }) {
  const [shown, setShown] = useState<string | null>(null);

  return (
    <>
      <PageTitle urdu="تعارف">About</PageTitle>

      <div className="mt-9 space-y-5 text-[15px] leading-[1.65] text-ink-2">
        <p>Thanks for taking the time to have a gander at my little corner of the internet :)</p>
        <p>
          I&apos;m Yousuf, a designer and engineer, and I studied engineering at the University of Waterloo. I&apos;ve
          been designing since 2019, though the good stuff only really started in 2022. I&apos;ve had the immense
          privilege of working at some incredible companies, surrounded by some of the most talented people.
        </p>
        <p>
          Design takes up most of my waking (and sleeping) hours, but that&apos;s not all there is. Outside of Figma,
          you&apos;ll likely find me{" "}
          <Phrase id="kitchen" onShow={setShown}>
            cheffing something up in the kitchen
          </Phrase>{" "}
          or{" "}
          <Phrase id="games" onShow={setShown}>
            playing board games with friends
          </Phrase>
          . If not, I&apos;m probably out{" "}
          <Phrase id="camera" onShow={setShown}>
            taking shots with my camera
          </Phrase>{" "}
          or{" "}
          <Phrase id="away" onShow={setShown}>
            exploring a new country
          </Phrase>
          .
        </p>
      </div>

      {/* Runs a little wider than the column on large screens. */}
      <div className="relative left-1/2 mt-12 w-[min(720px,calc(100vw-48px))] -translate-x-1/2">
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3">
          {photos.map((p, i) => (
            <Polaroid key={p.id} index={i} active={shown === p.id} preview={previews[i]} />
          ))}
        </div>
      </div>
    </>
  );
}
