"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type SectionInfo = {
  id: string;
  index: number;
  element: HTMLElement;
};

// Clock-inspired angles: symmetrical around the horizontal middle bar.
// Maps to ~10, 11, 12, 1, 2 o'clock positions relative to 3 o'clock (horizontal).
const BAR_ANGLES = [-45, -22, 0, 22, 45];
const SECTION_LABELS = [".intro", ".groq", ".phia", ".klarify", ".about"];
const BAR_INACTIVE_WIDTH = 20;
const BAR_ACTIVE_WIDTH = 44;
const BAR_THICKNESS = 2.5;

function findSections(): SectionInfo[] {
  const list: SectionInfo[] = [];
  let i = 0;

  const hero = document.getElementById("hero");
  if (hero) list.push({ id: "hero", index: i++, element: hero });

  (Array.from(document.querySelectorAll('[id^="project-"]')) as HTMLElement[])
    .sort(
      (a, b) =>
        parseInt(a.id.replace("project-", "")) -
        parseInt(b.id.replace("project-", ""))
    )
    .forEach((el) => list.push({ id: el.id, index: i++, element: el }));

  const about = document.getElementById("about");
  if (about) list.push({ id: "about", index: i++, element: about });

  return list;
}

export default function ClockNav() {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      const list = findSections();
      if (!list.length) return;

      setSections((prev) => {
        if (prev.length !== list.length) return list;
        return prev.some((p, i) => p.id !== list[i]?.id) ? list : prev;
      });

      const mid = window.scrollY + window.innerHeight / 2;
      let activeIdx = 0;
      let minDist = Infinity;

      list.forEach(({ element, index }) => {
        const rect = element.getBoundingClientRect();
        const center = rect.top + window.scrollY + rect.height / 2;
        const dist = Math.abs(mid - center);
        if (dist < minDist) {
          minDist = dist;
          activeIdx = index;
        }
      });

      if (window.scrollY < 100) activeIdx = 0;
      setActiveSectionIndex(activeIdx);
    };

    const t1 = setTimeout(() => {
      setSections(findSections());
      handleScroll();
    }, 300);
    const t2 = setTimeout(handleScroll, 400);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToSection = (index: number) => {
    const list = findSections();
    list
      .find((s) => s.index === index)
      ?.element.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Mobile: dynamic positioning based on actual section count
  const segments = Math.max(sections.length, 1);
  const getMobileBarPos = (index: number) => {
    if (segments === 1) return 50;
    return 20 + (index / (segments - 1)) * 60;
  };
  const mobileBoxLeft = getMobileBarPos(activeSectionIndex);

  return (
    <>
      {/* Mobile: horizontal timeline at top */}
      <div className="fixed top-0 left-0 right-0 lg:hidden z-[100] px-6 bg-[var(--background)] py-6">
        <div className="relative h-6 w-full mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: segments }).map((_, index) => {
              const pos = getMobileBarPos(index);
              return (
                <div
                  key={index}
                  className="absolute top-1/2 cursor-pointer flex items-center justify-center"
                  style={{
                    left: `${pos}%`,
                    transform: "translate(-50%, -50%)",
                    width: 24,
                    height: 32,
                  }}
                  onClick={() => scrollToSection(index)}
                >
                  <motion.div
                    className="h-3 w-0.5 rounded-full"
                    style={{ backgroundColor: "var(--timeline-bar)", opacity: 0.4 }}
                    whileHover={{ scale: 1.5, opacity: 0.8 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              );
            })}
          </div>
          <motion.div
            className="absolute top-1/2 pointer-events-none rounded-full"
            style={{
              width: 12,
              height: 12,
              left: `${mobileBoxLeft}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: "var(--timeline-bar)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0, left: `${mobileBoxLeft}%` }}
            transition={{
              left: { duration: 0.2, ease: "easeOut" },
              opacity: { duration: 0.3 },
            }}
          />
        </div>
      </div>

      {/* Desktop: left-side clock nav */}
      <nav
        className="fixed left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-5 z-[100]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {BAR_ANGLES.map((angle, index) => {
          const isActive = activeSectionIndex === index;
          const isHovered = hoveredIndex === index;

          const barWidth = isActive
            ? BAR_ACTIVE_WIDTH
            : isHovered
            ? BAR_INACTIVE_WIDTH + 7
            : BAR_INACTIVE_WIDTH;
          const barOpacity = isActive ? 1 : isHovered ? 0.6 : 0.35;

          return (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              aria-label={`Navigate to ${SECTION_LABELS[index]}`}
              style={{
                height: 20,
                background: "none",
                border: "none",
                padding: "2px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Rotation wrapper — bar and label share the same rotated coordinate space */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "left center",
                }}
              >
                <motion.div
                  style={{
                    height: BAR_THICKNESS,
                    backgroundColor: "var(--timeline-bar)",
                    flexShrink: 0,
                  }}
                  animate={{ width: barWidth, opacity: barOpacity }}
                  transition={{
                    width: { type: "spring", stiffness: 280, damping: 28 },
                    opacity: { duration: 0.3, ease: "easeOut" },
                  }}
                />
                <motion.span
                  style={{
                    marginLeft: 7,
                    fontSize: "9px",
                    letterSpacing: "0.08em",
                    color: "var(--timeline-bar)",
                    fontFamily: "var(--font-departure-mono)",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    lineHeight: 1,
                  }}
                  animate={{ opacity: isActive ? 0.9 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {SECTION_LABELS[index]}
                </motion.span>
              </div>
            </button>
          );
        })}
      </nav>
    </>
  );
}
