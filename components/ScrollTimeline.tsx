"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type SectionInfo = {
  id: string;
  index: number;
  element: HTMLElement;
};

export default function ScrollTimeline() {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const findSections = (): SectionInfo[] => {
      const sectionList: SectionInfo[] = [];
      let currentIndex = 0;
      
      // Find Hero section
      const heroSection = document.getElementById("hero");
      if (heroSection) {
        sectionList.push({ id: "hero", index: currentIndex++, element: heroSection });
      }

      // Find all individual project sections (sorted by their order in DOM)
      const projectSections = Array.from(
        document.querySelectorAll('[id^="project-"]')
      ) as HTMLElement[];

      // Sort by their project ID (extracted from id attribute) to ensure correct order
      projectSections.sort((a, b) => {
        const idA = parseInt(a.id.replace('project-', '') || '0');
        const idB = parseInt(b.id.replace('project-', '') || '0');
        return idA - idB;
      });

      projectSections.forEach((section) => {
        sectionList.push({
          id: section.id,
          index: currentIndex++,
          element: section,
        });
      });

      // Find About section
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        sectionList.push({ id: "about", index: currentIndex++, element: aboutSection });
      }

      return sectionList;
    };

    const handleScroll = () => {
      const sectionList = findSections();
      if (sectionList.length === 0) return;

      // Update sections state if it's different (to ensure bars are rendered correctly)
      setSections((prevSections) => {
        if (prevSections.length !== sectionList.length) {
          return sectionList;
        }
        // Check if any section IDs changed
        const idsChanged = prevSections.some((prev, idx) => prev.id !== sectionList[idx]?.id);
        return idsChanged ? sectionList : prevSections;
      });

      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let newActiveIndex = 0;
      let closestDistance = Infinity;

      // Find which section's center is closest to the viewport center
      sectionList.forEach((section) => {
        const rect = section.element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementCenter = elementTop + rect.height / 2;
        const distance = Math.abs(scrollPosition - elementCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          newActiveIndex = section.index;
        }
      });

      // Also check if we're at the very top (before first section)
      if (window.scrollY < 100) {
        newActiveIndex = 0;
      }

      setActiveSectionIndex(newActiveIndex);
    };

    // Wait a bit for DOM to be ready, then find sections
    // Use a longer timeout to ensure all content (including images) has loaded
    const timeoutId = setTimeout(() => {
      const sectionList = findSections();
      setSections(sectionList);
      // Also trigger a scroll check to set initial active section
      handleScroll();
    }, 300);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Initial check after a delay to ensure DOM is ready
    setTimeout(handleScroll, 400);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Number of segments matches number of sections
  const segments = Math.max(sections.length, 1);
  const segmentHeight = segments > 0 ? 100 / segments : 0;

  // Calculate bar positions - each bar should be centered where the box will be
  // Bars are evenly distributed with tighter spacing (using 20-80% range instead of 0-100%)
  const getBarPosition = (index: number, isHorizontal: boolean = false) => {
    if (segments === 1) return 50; // Center if only one segment
    const startPercent = 20; // Start at 20%
    const endPercent = 80; // End at 80%
    const range = endPercent - startPercent;
    return startPercent + (index / (segments - 1)) * range;
  };

  // Calculate box position based on active section index
  // Box center should align with the bar center
  const boxCenter = segments > 1 
    ? getBarPosition(activeSectionIndex)
    : 50;
  const boxTop = boxCenter - segmentHeight / 2;
  
  // For horizontal (mobile) layout
  const boxLeft = segments > 1 
    ? getBarPosition(activeSectionIndex, true)
    : 50;
  const boxLeftStart = boxLeft - segmentHeight / 2;

  const handleBarClick = (index: number) => {
    // Find sections dynamically to ensure we have the latest references
    const findSections = (): SectionInfo[] => {
      const sectionList: SectionInfo[] = [];
      let currentIndex = 0;
      
      const heroSection = document.getElementById("hero");
      if (heroSection) {
        sectionList.push({ id: "hero", index: currentIndex++, element: heroSection });
      }

      const projectSections = Array.from(
        document.querySelectorAll('[id^="project-"]')
      ) as HTMLElement[];

      projectSections.sort((a, b) => {
        const idA = parseInt(a.id.replace('project-', '') || '0');
        const idB = parseInt(b.id.replace('project-', '') || '0');
        return idA - idB;
      });

      projectSections.forEach((section) => {
        sectionList.push({
          id: section.id,
          index: currentIndex++,
          element: section,
        });
      });

      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        sectionList.push({ id: "about", index: currentIndex++, element: aboutSection });
      }

      return sectionList;
    };

    const sectionList = findSections();
    const section = sectionList.find((s) => s.index === index);
    if (section) {
      section.element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <>
      {/* Mobile horizontal timeline - at top, aligned with theme toggle */}
      <div className="fixed top-0 left-0 right-0 lg:hidden z-[100] px-6 bg-[var(--background)] py-6">
        <div className="relative h-6 w-full max-w-full mx-auto">
          {/* Timeline lines - positioned at exact centers (vertical bars) - centered on page */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: segments }).map((_, index) => {
              const barPosition = getBarPosition(index, true);
              return (
                <div
                  key={index}
                  className="absolute top-1/2 cursor-pointer flex items-center justify-center"
                  style={{
                    left: `${barPosition}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '24px', // Larger hover target
                    height: '32px', // Larger hover target
                  }}
                  onClick={() => handleBarClick(index)}
                >
                  {/* The actual bar - vertical with modern styling */}
                  <motion.div
                    className="h-3 w-0.5 rounded-full"
                    style={{ 
                      backgroundColor: "var(--timeline-bar)",
                      opacity: 0.4,
                      transformOrigin: 'center' 
                    }}
                    whileHover={{ 
                      scale: 1.5,
                      opacity: 0.8,
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Moving circle indicator - centered on active bar */}
          <motion.div
            className="absolute top-1/2 pointer-events-none rounded-full"
            style={{
              width: '12px', // Same height as bar (h-3 = 12px)
              height: '12px',
              left: `${boxLeft}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: "var(--timeline-bar)",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: isVisible ? 1 : 0,
              left: `${boxLeft}%`,
            }}
            transition={{
              left: { duration: 0.2, ease: "easeOut" },
              opacity: { duration: 0.3 },
            }}
          />
        </div>
      </div>

      {/* Desktop vertical timeline - on right side */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden lg:block z-[100]">
        <div className="relative w-12 h-[400px]">
          {/* Timeline lines - positioned at exact centers */}
          <div className="absolute inset-0">
            {Array.from({ length: segments }).map((_, index) => {
              const barPosition = getBarPosition(index);
              return (
                <div
                  key={index}
                  className="absolute left-1/2 cursor-pointer flex items-center justify-center"
                  style={{
                    top: `${barPosition}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '48px', // Larger hover target
                    height: '24px', // Larger hover target
                  }}
                  onClick={() => handleBarClick(index)}
                >
                  {/* The actual bar - modern styling */}
                  <motion.div
                    className="w-8 h-0.5 rounded-full"
                    style={{ 
                      backgroundColor: "var(--timeline-bar)",
                      opacity: 0.4,
                      transformOrigin: 'center' 
                    }}
                    whileHover={{ 
                      scale: 1.5,
                      opacity: 0.8,
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Moving box indicator - modern rounded */}
          <motion.div
            className="absolute left-0 w-12 pointer-events-none rounded-full"
            style={{
              height: `${segmentHeight * 0.8}%`,
              top: `${boxTop + (segmentHeight * 0.1)}%`,
              backgroundColor: "var(--timeline-bar)",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: isVisible ? 1 : 0,
              top: `${boxTop + (segmentHeight * 0.1)}%`,
            }}
            transition={{
              top: { duration: 0.2, ease: "easeOut" },
              opacity: { duration: 0.3 },
            }}
          />
        </div>
      </div>
    </>
  );
}
