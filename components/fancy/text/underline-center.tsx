"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CenterUnderlineProps {
  children: ReactNode;
}

export default function CenterUnderline({ children }: CenterUnderlineProps) {
  return (
    <motion.span
      className="relative inline-block"
      initial="rest"
      whileHover="hover"
    >
      {children}
      <motion.span
        className="absolute bottom-0 left-0 right-0 h-px bg-current"
        variants={{
          rest: {
            scaleX: 0,
          },
          hover: {
            scaleX: 1,
          },
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ transformOrigin: "center" }}
      />
    </motion.span>
  );
}
