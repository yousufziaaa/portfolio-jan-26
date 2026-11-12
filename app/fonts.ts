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

// Instrument Serif (OFL): the name and the odd editorial accent.
export const instrumentSerif = localFont({
  src: [
    { path: "../fonts/InstrumentSerif-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/InstrumentSerif-Italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

// Inter (OFL), variable: quiet body text at small sizes.
export const inter = localFont({
  src: [{ path: "../fonts/Inter-Variable.ttf", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Lab candidates (all OFL). Only the lab page uses these for now.
export const geist = localFont({
  src: [{ path: "../fonts/Geist-Variable.ttf", weight: "100 900", style: "normal" }],
  variable: "--font-geist",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const instrumentSans = localFont({
  src: [{ path: "../fonts/InstrumentSans-Variable.ttf", weight: "400 700", style: "normal" }],
  variable: "--font-instrument-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Fragment Mono: the glyphs in the ASCII field.
export const fragmentMono = localFont({
  src: [{ path: "../fonts/FragmentMono-Regular.ttf", weight: "400", style: "normal" }],
  variable: "--font-fragment-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

// Arabic-script faces for the name (both OFL). Reem Kufi is a geometric
// Kufic with a matching Latin; Noto Nastaliq Urdu is the calligraphic hand.
export const reemKufi = localFont({
  src: [{ path: "../fonts/ReemKufi-Variable.ttf", weight: "400 700", style: "normal" }],
  variable: "--font-kufi",
  display: "swap",
  fallback: ["Geeza Pro", "sans-serif"],
});

export const nastaliq = localFont({
  src: [{ path: "../fonts/NotoNastaliqUrdu-Variable.ttf", weight: "400 700", style: "normal" }],
  variable: "--font-nastaliq",
  display: "swap",
  fallback: ["serif"],
});

// Title candidates (all OFL). Bricolage Grotesque is the default for page
// titles; the type lab compares the others.
export const bricolage = localFont({
  src: [{ path: "../fonts/BricolageGrotesque-Variable.ttf", weight: "200 800", style: "normal" }],
  variable: "--font-bricolage",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const fraunces = localFont({
  src: [{ path: "../fonts/Fraunces-Variable.ttf", weight: "100 900", style: "normal" }],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const gloock = localFont({
  src: [{ path: "../fonts/Gloock-Regular.ttf", weight: "400", style: "normal" }],
  variable: "--font-gloock",
  display: "swap",
  fallback: ["Georgia", "serif"],
});
