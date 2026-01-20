"use client";

export default function BackToTop() {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      className="text-sm font-departure-mono transition-opacity hover:opacity-70"
      style={{ color: "var(--foreground)" }}
    >
      Back to top ↑
    </button>
  );
}
