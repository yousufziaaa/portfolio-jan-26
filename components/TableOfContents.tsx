"use client";

import { useEffect, useState, useRef } from "react";

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
        <h3
          className="font-neue-machina text-sm mb-4"
          style={{ color: "var(--foreground)", opacity: 0.6 }}
        >
          Table of Contents
        </h3>
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
