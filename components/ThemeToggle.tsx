"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    // The handler will check if there's a manual preference and ignore if there is
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = () => {
      // Check if user has manually set a preference
      const currentSavedTheme = localStorage.theme;
      if (currentSavedTheme === "dark" || currentSavedTheme === "light") {
        // User has manually set a preference, ignore system changes
        return;
      }
      
      // No manual preference, follow system preference
      // Re-query the media query to get current state
      const newIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      
      setIsDark(newIsDark);
      if (newIsDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Also check on visibility change (when tab becomes visible)
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
      localStorage.theme = "dark"; // Save user's manual preference
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light"; // Save user's manual preference
    }
  };

  if (!mounted) {
    return (
      <div className="fixed top-6 right-6 w-6 h-6" />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-7 right-6 lg:top-6 lg:right-[44px] w-4 h-4 lg:w-6 lg:h-6 flex items-center justify-center focus:outline-none rounded-full z-[100]"
      aria-label="Toggle dark mode"
      whileHover={{ scale: 1.1 }}
      whileTap={{ 
        scale: 0.95,
        backgroundColor: "rgba(80, 80, 80, 0.2)",
      }}
      style={{
        backgroundColor: "transparent",
      }}
      transition={{
        backgroundColor: { duration: 0.1 },
      }}
    >
      {isDark ? (
        <svg
          className="w-4 h-4 lg:w-6 lg:h-6"
          fill="none"
          stroke="var(--timeline-bar)"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          style={{ opacity: 0.9 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 lg:w-6 lg:h-6"
          fill="none"
          stroke="var(--timeline-bar)"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          style={{ opacity: 0.7 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
    </motion.button>
  );
}
