"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface ScrambleInHandle {
  start: () => void;
}

interface ScrambleInProps {
  text: string;
  scrambleSpeed?: number;
  scrambledLetterCount?: number;
  autoStart?: boolean;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

const ScrambleIn = forwardRef<ScrambleInHandle, ScrambleInProps>(
  ({ text, scrambleSpeed = 50, scrambledLetterCount = 3, autoStart = true }, ref) => {
    const [displayText, setDisplayText] = useState<string>("");
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentIndexRef = useRef<number>(0);

    const getRandomChar = () => {
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    };

    const scramble = useCallback(() => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset the index and completion flag
      currentIndexRef.current = 0;
      setIsComplete(false);

      intervalRef.current = setInterval(() => {
        if (currentIndexRef.current >= text.length) {
          // Ensure final text is set and mark as complete
          setDisplayText(text);
          setIsComplete(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        // Create scrambled version up to current index
        let scrambled = text.slice(0, currentIndexRef.current);
        
        // Add scrambled characters for the remaining part
        const remaining = text.length - currentIndexRef.current;
        const scrambleLength = Math.min(scrambledLetterCount, remaining);
        
        for (let i = 0; i < scrambleLength; i++) {
          scrambled += getRandomChar();
        }

        setDisplayText(scrambled);
        currentIndexRef.current++;
      }, scrambleSpeed);
    }, [text, scrambleSpeed, scrambledLetterCount]);

    useImperativeHandle(ref, () => ({
      start: scramble,
    }));

    useEffect(() => {
      if (autoStart) {
        scramble();
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount for autoStart

    // Always show text if animation is complete, otherwise show displayText
    return <span>{isComplete ? text : displayText}</span>;
  }
);

ScrambleIn.displayName = "ScrambleIn";

export default ScrambleIn;
