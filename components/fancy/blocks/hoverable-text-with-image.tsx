"use client";

import { motion, AnimatePresence, useSpring } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface HoverableTextWithImageProps {
  text: string;
  imageUrl: string;
  className?: string;
}

interface LineInfo {
  y: number;
  wordIndices: number[];
}

export default function HoverableTextWithImage({
  text,
  imageUrl,
  className = "",
}: HoverableTextWithImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [lines, setLines] = useState<LineInfo[]>([]);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const words = text.split(/(\s+)/);
  
  // Use spring for smooth position interpolation
  const springX = useSpring(imagePosition.x, { stiffness: 400, damping: 35 });
  const springY = useSpring(imagePosition.y, { stiffness: 400, damping: 35 });
  
  useEffect(() => {
    springX.set(imagePosition.x);
    springY.set(imagePosition.y);
  }, [imagePosition.x, imagePosition.y, springX, springY]);

  // Detect line breaks by measuring word positions
  useEffect(() => {
    const detectLines = () => {
      if (wordRefs.current.length === 0) return;

      const lineMap = new Map<number, number[]>();
      
      wordRefs.current.forEach((wordEl, wordIndex) => {
        if (!wordEl) return;
        const rect = wordEl.getBoundingClientRect();
        const y = Math.round(rect.top);
        
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)!.push(wordIndex);
      });

      const detectedLines: LineInfo[] = Array.from(lineMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([y, wordIndices]) => ({ y, wordIndices }));

      setLines(detectedLines);
    };

    // Detect after initial render
    const timeout = setTimeout(detectLines, 0);
    
    // Also detect on resize
    window.addEventListener("resize", detectLines);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", detectLines);
    };
  }, [words.length]);

  const updateImagePosition = (clientX: number, clientY: number, wordElement: HTMLElement | null) => {
    requestAnimationFrame(() => {
      const imageHeight = 160; // h-40 = 160px
      const gap = 6; // 6px gap

      // Get the actual current Y position of the word element
      let targetY = 0;
      if (wordElement) {
        const rect = wordElement.getBoundingClientRect();
        targetY = rect.top;
      }

      // Clamp X to container bounds
      let clampedX = clientX;
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        clampedX = Math.max(
          containerRect.left,
          Math.min(clientX, containerRect.right)
        );
      }

      setImagePosition({
        x: clampedX,
        y: targetY - imageHeight - gap,
      });
    });
  };

  const handleLineMouseEnter = () => {
    setIsHovered(true);
  };

  const handleLineMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (isHovered) {
      updateImagePosition(e.clientX, e.clientY, e.currentTarget);
    }
  };

  const handleLineMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (isHovered && containerRef.current) {
      const updatePosition = () => {
        const rect = containerRef.current!.getBoundingClientRect();
        const imageHeight = 160;
        const gap = 6;
        
        setImagePosition({
          x: rect.left + rect.width / 2,
          y: rect.top - imageHeight - gap,
        });
      };
      
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isHovered]);

  // Get word indices for non-whitespace words
  const getWordIndex = (index: number) => {
    return words.slice(0, index).filter(w => w.trim() !== "").length;
  };

  // Render words grouped by line if lines are detected, otherwise render normally
  if (lines.length > 0) {
    // Create a map of word index to line
    const wordToLineMap = new Map<number, number>();
    lines.forEach((line, lineIndex) => {
      line.wordIndices.forEach(wordIndex => {
        wordToLineMap.set(wordIndex, lineIndex);
      });
    });

    // Group words by line for rendering
    const wordsByLine: { wordArrayIndex: number; word: string; wordIndex: number | null }[][] = [];
    lines.forEach(() => wordsByLine.push([]));

    words.forEach((word, wordArrayIndex) => {
      const wordIndex = getWordIndex(wordArrayIndex);
      const isWhitespace = word.trim() === "";
      
      let currentLineIndex: number | null = null;
      if (!isWhitespace && wordIndex !== undefined) {
        currentLineIndex = wordToLineMap.get(wordIndex) ?? null;
      } else {
        // For whitespace, check adjacent words
        const prevWordIndex = wordArrayIndex > 0 ? getWordIndex(wordArrayIndex - 1) : null;
        const nextWordIndex = wordArrayIndex < words.length - 1 ? getWordIndex(wordArrayIndex + 1) : null;
        
        if (prevWordIndex !== null && wordToLineMap.has(prevWordIndex)) {
          currentLineIndex = wordToLineMap.get(prevWordIndex)!;
        } else if (nextWordIndex !== null && wordToLineMap.has(nextWordIndex)) {
          currentLineIndex = wordToLineMap.get(nextWordIndex)!;
        }
      }

      if (currentLineIndex !== null) {
        wordsByLine[currentLineIndex].push({ wordArrayIndex, word, wordIndex: isWhitespace ? null : wordIndex });
      }
    });

    // Create a map of word array index to line info
    const wordArrayToLineMap = new Map<number, { lineY: number; lineIndex: number }>();
    words.forEach((word, wordArrayIndex) => {
      const wordIndex = getWordIndex(wordArrayIndex);
      const isWhitespace = word.trim() === "";
      
      let currentLineIndex: number | null = null;
      if (!isWhitespace && wordIndex !== undefined) {
        currentLineIndex = wordToLineMap.get(wordIndex) ?? null;
      } else {
        const prevWordIndex = wordArrayIndex > 0 ? getWordIndex(wordArrayIndex - 1) : null;
        const nextWordIndex = wordArrayIndex < words.length - 1 ? getWordIndex(wordArrayIndex + 1) : null;
        
        if (prevWordIndex !== null && wordToLineMap.has(prevWordIndex)) {
          currentLineIndex = wordToLineMap.get(prevWordIndex)!;
        } else if (nextWordIndex !== null && wordToLineMap.has(nextWordIndex)) {
          currentLineIndex = wordToLineMap.get(nextWordIndex)!;
        }
      }

      if (currentLineIndex !== null) {
        wordArrayToLineMap.set(wordArrayIndex, { lineY: lines[currentLineIndex].y, lineIndex: currentLineIndex });
      }
    });

    return (
      <>
        <span ref={containerRef} className={className}>
          {words.map((word, wordArrayIndex) => {
            const wordIndex = getWordIndex(wordArrayIndex);
            const lineInfo = wordArrayToLineMap.get(wordArrayIndex);
            const isWhitespace = word.trim() === "";
            
            return (
              <span
                key={wordArrayIndex}
                ref={(el) => {
                  if (!isWhitespace && wordIndex !== undefined) {
                    wordRefs.current[wordIndex] = el;
                  }
                }}
                className="inline-block cursor-pointer"
                onMouseEnter={lineInfo ? handleLineMouseEnter : undefined}
                onMouseMove={lineInfo ? handleLineMouseMove : undefined}
                onMouseLeave={lineInfo ? handleLineMouseLeave : undefined}
              >
                {word}
              </span>
            );
          })}
        </span>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="fixed pointer-events-none z-[100]"
              style={{
                left: springX,
                top: springY,
                x: "-50%",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                opacity: { duration: 0.1 },
                scale: { duration: 0.1 }
              }}
            >
              <div className="w-36 h-40 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={imageUrl}
                  alt=""
                  width={144}
                  height={160}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Initial render - just render words to measure positions
  return (
    <span ref={containerRef} className={className}>
      {words.map((word, index) => {
        const wordIndex = getWordIndex(index);
        return (
          <span
            key={index}
            ref={(el) => {
              if (word.trim() !== "" && wordIndex !== undefined) {
                wordRefs.current[wordIndex] = el;
              }
            }}
            className="inline-block"
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
