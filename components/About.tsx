"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import ScrambleIn, { ScrambleInHandle } from "@/components/fancy/text/scramble-in";
import HoverableTextWithImage from "@/components/fancy/blocks/hoverable-text-with-image";

export default function About() {
  const scrambleRef = useRef<ScrambleInHandle | null>(null);

  useEffect(() => {
    // Start the scramble animation after a short delay
    const timer = setTimeout(() => {
      scrambleRef.current?.start();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="about" className="pt-8 md:pt-12 pb-8 md:pb-12 mb-16 md:mb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-[clamp(1.6875rem,1.35rem+1.6875vw,2.25rem)] font-normal mb-4 tracking-tight">
          <ScrambleIn
            ref={scrambleRef}
            text="About"
            scrambleSpeed={25}
            scrambledLetterCount={5}
            autoStart={false}
          />
        </h1>
        <motion.p
          className="mb-0 whitespace-break-spaces"
          style={{ fontSize: "16px", color: "var(--foreground)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          I appreciate you taking the time to have a gander at my little corner of the internet :){"\n\n"}To introduce myself, I&apos;m Yousuf, a (soon to be) engineer graduating from the University of Waterloo in April 2026. I&apos;ve been designing since 2019, though the good stuff only really started in 2022.{"\n\n"}I&apos;ve had the immense privilege of working at some of the most incredible companies, surrounded by some of the most talented people. And although the world of design takes up most of my waking (and sleeping) hours, that&apos;s not all there is to me.
        </motion.p>
        <motion.p
          className="mb-0 whitespace-break-spaces mt-4"
          style={{ fontSize: "16px", color: "var(--foreground)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Outside of Figma, you&apos;ll likely find me{" "}
          <span style={{ color: "var(--accent)" }}>
            <HoverableTextWithImage
              text="cheffing something up in the kitchen"
              imageUrl="/kitchen.JPG"
            />
          </span>
          , or{" "}
          <span style={{ color: "var(--accent)" }}>
            <HoverableTextWithImage
              text="playing board games with friends"
              imageUrl="/board-games.JPG"
            />
          </span>
          . If that doesn't cut it, I'll probably be out{" "}
          <span style={{ color: "var(--accent)" }}>
            <HoverableTextWithImage
              text="taking some shots with my camera"
              imageUrl="/camera.JPG"
            />
          </span>
          {" "}or{" "}
          <span style={{ color: "var(--accent)" }}>
            <HoverableTextWithImage
              text="exploring a new country"
              imageUrl="/exploring.JPG"
            />
          </span>
          .
        </motion.p>
      </motion.div>
    </section>
  );
}
