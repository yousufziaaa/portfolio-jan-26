"use client";

import { useCallback, useRef, useState } from "react";

interface ScrambleHoverProps {
  text: string;
  scrambleSpeed?: number;
  maxIterations?: number;
  useOriginalCharsOnly?: boolean;
  className?: string;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

export default function ScrambleHover({
  text,
  scrambleSpeed = 50,
  maxIterations = 8,
  useOriginalCharsOnly = false,
  className = "",
}: ScrambleHoverProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iterationCountRef = useRef<number>(0);
  const isHoveringRef = useRef<boolean>(false);

  const getRandomChar = useCallback(() => {
    if (useOriginalCharsOnly) {
      // Only use characters that exist in the original text
      const uniqueChars = Array.from(new Set(text.split(""))).filter((char) => char !== " ");
      if (uniqueChars.length > 0) {
        return uniqueChars[Math.floor(Math.random() * uniqueChars.length)];
      }
    }
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }, [text, useOriginalCharsOnly]);

  const scramble = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    iterationCountRef.current = 0;

    intervalRef.current = setInterval(() => {
      if (!isHoveringRef.current || iterationCountRef.current >= maxIterations) {
        // Restore original text
        setDisplayText(text);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      // Scramble the text
      const scrambled = text
        .split("")
        .map((char) => {
          if (char === " ") return " ";
          return getRandomChar();
        })
        .join("");

      setDisplayText(scrambled);
      iterationCountRef.current++;
    }, scrambleSpeed);
  }, [text, scrambleSpeed, maxIterations, getRandomChar]);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    scramble();
  }, [scramble]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayText(text);
    iterationCountRef.current = 0;
  }, [text]);

  return (
    <span
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText}
    </span>
  );
}
