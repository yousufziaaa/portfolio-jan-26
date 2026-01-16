"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ComesInGoesOutUnderlineProps {
  children: ReactNode;
  direction?: "left" | "right";
}

export default function ComesInGoesOutUnderline({
  children,
  direction = "left",
}: ComesInGoesOutUnderlineProps) {
  return (
    <span className="relative inline-block">
      {children}
      <motion.span
        className="absolute bottom-0 h-px bg-current"
        initial={{
          width: 0,
          left: direction === "left" ? "0%" : "100%",
        }}
        whileHover={{
          width: "100%",
          left: direction === "left" ? "0%" : "0%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </span>
  );
}
