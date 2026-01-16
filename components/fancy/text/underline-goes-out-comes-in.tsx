"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GoesOutComesInUnderlineProps {
  children: ReactNode;
  direction?: "left" | "right";
}

export default function GoesOutComesInUnderline({
  children,
  direction = "left",
}: GoesOutComesInUnderlineProps) {
  return (
    <motion.span
      className="relative inline-block"
      initial="rest"
      whileHover="hover"
    >
      {children}
      <motion.span
        className="absolute bottom-0 h-px bg-current"
        variants={{
          rest: {
            width: 0,
            left: direction === "left" ? "0%" : "100%",
          },
          hover: {
            width: "100%",
            left: "0%",
          },
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </motion.span>
  );
}
