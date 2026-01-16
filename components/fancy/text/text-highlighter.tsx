"use client";

import { motion, Transition } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface TextHighlighterProps {
  children: ReactNode;
  className?: string;
  transition?: Transition;
  highlightColor?: string;
  useInViewOptions?: {
    once?: boolean;
    initial?: boolean;
    amount?: number;
  };
}

export function TextHighlighter({
  children,
  className = "",
  transition = { type: "spring", duration: 1, delay: 0.4, bounce: 0 },
  highlightColor,
  useInViewOptions = { once: true, initial: true, amount: 0.1 },
}: TextHighlighterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, useInViewOptions);
  
  // Use CSS variable if no highlightColor is provided, otherwise use the provided color
  const backgroundColor = highlightColor || "var(--highlight)";

  return (
    <span ref={ref} className="relative inline-block">
      <motion.span
        className={`absolute inset-0 ${className}`}
        style={{
          backgroundColor: backgroundColor,
          zIndex: -1,
        }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={transition}
        transformOrigin="left"
      />
      <span className="relative z-0">{children}</span>
    </span>
  );
}
