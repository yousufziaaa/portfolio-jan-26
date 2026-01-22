"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

type TocItem = {
  id: string;
  title: string;
  level: number;
};

interface TableOfContentsProps {
  items: TocItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [indicatorHeight, setIndicatorHeight] = useState(0);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const containerRef = useRef<HTMLUListElement | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Theme toggle logic
  useEffect(() => {
    setMounted(true);
    
    // Check if user has manually set a preference
    const savedTheme = localStorage.theme;
    
    // If no saved preference, use system preference
    let isDarkMode: boolean;
    if (savedTheme === "dark" || savedTheme === "light") {
      // User has manually set a preference, use it
      isDarkMode = savedTheme === "dark";
    } else {
      // No saved preference, detect system preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      isDarkMode = systemPrefersDark;
    }
    
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Always listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = () => {
      // Check if user has manually set a preference
      const currentSavedTheme = localStorage.theme;
      if (currentSavedTheme === "dark" || currentSavedTheme === "light") {
        // User has manually set a preference, ignore system changes
        return;
      }
      
      // No manual preference, follow system preference
      const newIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      
      setIsDark(newIsDark);
      if (newIsDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleSystemThemeChange();
      }
    };

    // Modern browsers - use addEventListener
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    } else if (typeof mediaQuery.addListener === 'function') {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        mediaQuery.removeListener(handleSystemThemeChange);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  useEffect(() => {
    const observerOptions = {
      rootMargin: "-20% 0% -35% 0%",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all section elements
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items]);

  // Update indicator position when activeId changes
  useEffect(() => {
    if (activeId && itemRefs.current[activeId] && containerRef.current) {
      const activeItem = itemRefs.current[activeId];
      const container = containerRef.current;
      
      if (activeItem) {
        const updatePosition = () => {
          const containerRect = container.getBoundingClientRect();
          const itemRect = activeItem.getBoundingClientRect();
          
          const position = itemRect.top - containerRect.top;
          const height = itemRect.height;
          
          setIndicatorPosition(position);
          setIndicatorHeight(height);
        };

        // Use requestAnimationFrame to ensure layout is complete
        requestAnimationFrame(updatePosition);

        // Also update on scroll/resize for smooth tracking
        const handleUpdate = () => requestAnimationFrame(updatePosition);
        window.addEventListener('scroll', handleUpdate, { passive: true });
        window.addEventListener('resize', handleUpdate, { passive: true });

        return () => {
          window.removeEventListener('scroll', handleUpdate);
          window.removeEventListener('resize', handleUpdate);
        };
      }
    }
  }, [activeId]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:block">
      <div className="sticky top-24 w-48">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-neue-machina text-sm"
            style={{ color: "var(--foreground)", opacity: 0.6 }}
          >
            Table of Contents
          </h3>
          {mounted && (
            <motion.button
              onClick={toggleTheme}
              className="flex items-center justify-center focus:outline-none rounded-full"
              aria-label="Toggle dark mode"
              whileHover={{ scale: 1.1 }}
              whileTap={{ 
                scale: 0.95,
                backgroundColor: "rgba(80, 80, 80, 0.2)",
              }}
              style={{
                backgroundColor: "transparent",
                width: "1.25rem", // Match line-height of text-sm (20px)
                height: "1.25rem",
              }}
              transition={{
                backgroundColor: { duration: 0.1 },
              }}
            >
              {isDark ? (
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ opacity: 0.6 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ opacity: 0.6 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                  />
                </svg>
              )}
            </motion.button>
          )}
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-0 top-0 bottom-0"
            style={{
              width: "1px",
              backgroundColor: "var(--foreground)",
              opacity: 0.2,
            }}
          />
          
          {/* Active indicator bar */}
          {activeId && (
            <div
              className="absolute transition-all duration-300 ease-out rounded-full"
              style={{
                width: "3px",
                backgroundColor: "var(--header)",
                top: `${indicatorPosition}px`,
                height: `${indicatorHeight}px`,
                left: "-1px", // Center the 3px bar on the 1px vertical line
              }}
            />
          )}

          {/* List items */}
          <ul ref={containerRef} className="space-y-2 relative pl-4">
            {items.map((item) => (
              <li
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
              >
                <button
                  onClick={() => handleClick(item.id)}
                  className={`text-left w-full transition-colors duration-200 ${
                    activeId === item.id
                      ? "opacity-100 font-medium"
                      : "opacity-50 hover:opacity-75"
                  }`}
                  style={{
                    paddingLeft: `${(item.level - 1) * 12}px`,
                    fontSize: "13px",
                    fontFamily: "var(--font-neue-machina)",
                    color:
                      activeId === item.id
                        ? "var(--header)"
                        : "var(--foreground)",
                  }}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
