"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Gravity, { MatterBody } from "@/components/fancy/physics/gravity";

interface SocialLink {
  name: string;
  url: string;
  x: string;
  y: string;
  angle?: number;
}

// Social links positioned on left and right sides - spaced out vertically
const socialLinks: SocialLink[] = [
  { name: "LinkedIn", url: "https://linkedin.com/in/yousufziaaa", x: "left", y: "-100px", angle: -5 },
  { name: "Twitter", url: "https://twitter.com/yousufziaaa", x: "right", y: "-200px", angle: 5 },
  { name: "GitHub", url: "https://github.com/yousufziaaa", x: "left", y: "-300px", angle: 3 },
  { name: "Research", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Islam+YZ&cauthor_id=41027339", x: "right", y: "-400px", angle: -3 },
];

export default function SocialLinksGravity() {
  const [isVisible, setIsVisible] = useState(false);
  const [linkPositions, setLinkPositions] = useState<Array<{ x: string; y: string; angle?: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLinkPositions = () => {
      // Find the main content container
      const mainContainer = document.querySelector('main > div.mx-auto');
      if (mainContainer && typeof window !== 'undefined') {
        const rect = mainContainer.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Calculate positions for each link - spaced out horizontally
        const positions = socialLinks.map((link, index) => {
          let xPos: string;
          if (link.x === "left") {
            // Position on the left side of the container, spaced out
            const leftArea = rect.left;
            const spacing = leftArea / (socialLinks.filter(l => l.x === "left").length + 1);
            const leftIndex = socialLinks.slice(0, index).filter(l => l.x === "left").length;
            xPos = `${spacing * (leftIndex + 1)}px`; // Distribute across left area
          } else if (link.x === "right") {
            // Position on the right side of the container, spaced out
            const rightAreaStart = rect.right;
            const rightArea = viewportWidth - rightAreaStart;
            const spacing = rightArea / (socialLinks.filter(l => l.x === "right").length + 1);
            const rightIndex = socialLinks.slice(0, index).filter(l => l.x === "right").length;
            xPos = `${rightAreaStart + spacing * (rightIndex + 1)}px`; // Distribute across right area
          } else {
            xPos = typeof link.x === "string" ? link.x : `${link.x}px`;
          }
          
          return {
            x: xPos,
            y: link.y,
            angle: link.angle,
          };
        });
        
        setLinkPositions(positions);
      }
    };

    const checkScrollEnd = () => {
      if (typeof window === 'undefined') return;
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Check if user has reached the very end of the scroll
      const isAtBottom = scrollTop + windowHeight >= documentHeight - 50;
      
      if (isAtBottom && !isVisible) {
        setIsVisible(true);
        // Update positions when becoming visible
        setTimeout(() => updateLinkPositions(), 100);
      } else if (!isAtBottom && isVisible) {
        // Hide if scrolling back up
        setIsVisible(false);
      }
      
      // Always update positions when visible (for responsive behavior)
      if (isVisible) {
        updateLinkPositions();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", checkScrollEnd, { passive: true });
      window.addEventListener("resize", updateLinkPositions, { passive: true });
      checkScrollEnd(); // Check on mount
      updateLinkPositions();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("scroll", checkScrollEnd);
        window.removeEventListener("resize", updateLinkPositions);
      }
    };
  }, [isVisible]);

  // Don't render anything until visible
  if (!isVisible || linkPositions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full">
        {socialLinks.map((link, index) => {
          const position = linkPositions[index];
          if (!position) return null;
          
          return (
            <MatterBody
              key={link.name}
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x={position.x}
              y={position.y}
              angle={position.angle || 0}
              isDraggable={true}
              shouldAnimate={isVisible}
            >
              <motion.a
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : "_self"}
                rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-lg sm:text-xl md:text-2xl bg-[#EEEEEE] dark:bg-[#222222] text-[#5C5C48] dark:text-[#C0C0C0] border border-[#5C5C48] dark:border-[#C0C0C0] rounded-full hover:cursor-pointer hover:bg-[#5C5C48] dark:hover:bg-[#C0C0C0] hover:text-white dark:hover:text-[#222222] px-6 py-3 md:px-9 md:py-5 pointer-events-auto transition-colors duration-200 whitespace-nowrap shadow-sm"
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => {
                  // Prevent navigation if the element was dragged
                  if (e.currentTarget.getAttribute('data-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                {link.name}
              </motion.a>
            </MatterBody>
          );
        })}
      </Gravity>
    </div>
  );
}
