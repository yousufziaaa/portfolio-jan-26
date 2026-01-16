"use client";

import { useEffect, useState } from "react";

interface ScreenSize {
  width: number;
  height: number;
  lessThan: (breakpoint: string) => boolean;
  greaterThan: (breakpoint: string) => boolean;
}

const breakpoints: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export default function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    lessThan: (breakpoint: string) => {
      const width = typeof window !== "undefined" ? window.innerWidth : 0;
      return width < (breakpoints[breakpoint] || 0);
    },
    greaterThan: (breakpoint: string) => {
      const width = typeof window !== "undefined" ? window.innerWidth : 0;
      return width > (breakpoints[breakpoint] || 0);
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        lessThan: (breakpoint: string) => {
          return window.innerWidth < (breakpoints[breakpoint] || 0);
        },
        greaterThan: (breakpoint: string) => {
          return window.innerWidth > (breakpoints[breakpoint] || 0);
        },
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenSize;
}
