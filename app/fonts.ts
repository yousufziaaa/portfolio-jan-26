import localFont from "next/font/local";

// Departure Mono font configuration
export const departureMono = localFont({
  src: [
    {
      path: "../fonts/DepartureMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-departure-mono",
  display: "swap",
  fallback: ["monospace"],
});

// Neue Machina font configuration
export const neueMachina = localFont({
  src: [
    {
      path: "../fonts/PPNeueMachina-PlainRegular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-neue-machina",
  display: "swap",
  fallback: ["sans-serif"],
});
