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
    <motion.span 
      ref={ref} 
      className={`relative inline ${className}`}
      style={{
        backgroundImage: `linear-gradient(${backgroundColor}, ${backgroundColor})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 0",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
      initial={{ backgroundSize: "0% 100%" }}
      animate={isInView ? { backgroundSize: "100% 100%" } : { backgroundSize: "0% 100%" }}
      transition={transition}
    >
      {children}
    </motion.span>
  );
}
