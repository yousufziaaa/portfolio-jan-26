"use client";

import { motion, Transition } from "framer-motion";
import { useEffect, useRef } from "react";
import ScrambleIn, { ScrambleInHandle } from "@/components/fancy/text/scramble-in";
import ScrambleHover from "@/components/fancy/text/scramble-hover";
import { TextHighlighter } from "@/components/fancy/text/text-highlighter";

export default function Hero() {
  const scrambleRef = useRef<ScrambleInHandle | null>(null);

  useEffect(() => {
    // Start the scramble animation after a short delay
    const timer = setTimeout(() => {
      scrambleRef.current?.start();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className="pt-16 md:pt-24 pb-8 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-[clamp(1.6875rem,1.35rem+1.6875vw,2.25rem)] font-normal mb-4 tracking-tight">
          <ScrambleIn
            ref={scrambleRef}
            text="Hey there, "
            scrambleSpeed={25}
            scrambledLetterCount={5}
            autoStart={false}
          />
          <ScrambleHover
            text="I&apos;m Yousuf"
            scrambleSpeed={50}
            maxIterations={8}
            useOriginalCharsOnly={true}
            className="cursor-pointer"
          />
        </h1>
        <motion.p
          className="mb-0 whitespace-break-spaces"
          style={{ fontSize: "16px", color: "var(--foreground)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          I&apos;ve been designing for over 5 years, mainly focusing on product design for web and mobile.
        </motion.p>
        <motion.p
          className="mb-0 whitespace-break-spaces mt-4"
          style={{ fontSize: "16px", color: "var(--foreground)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Most recently, I was working at Groq, where I built the entire{" "}
          <TextHighlighter
            className="rounded-[0.3em] px-px"
            transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 } as Transition}
            useInViewOptions={{ once: true, initial: true, amount: 0.1 }}
          >
            GroqCloud design system from the ground up
          </TextHighlighter>
          .
        </motion.p>
        <motion.p
          className="mb-0 whitespace-break-spaces mt-4"
          style={{ fontSize: "16px", color: "var(--foreground)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Outside of my designer persona, you&apos;ll probably find me at{" "}
          <TextHighlighter
            className="rounded-[0.3em] px-px"
            transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 } as Transition}
            useInViewOptions={{ once: true, initial: true, amount: 0.1 }}
          >
            the climbing gym, cooking for my friends, or watching a
          </TextHighlighter>{" "}
          <TextHighlighter
            className="rounded-[0.3em] px-px"
            transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 } as Transition}
            useInViewOptions={{ once: true, initial: true, amount: 0.1 }}
          >
            movie
          </TextHighlighter>
          .
        </motion.p>
      </motion.div>
    </section>
  );
}
