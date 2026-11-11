export type Work = {
  slug: string;
  title: string;
  role: string;
  dateRange: string;
  /** Months on the project, used for the process meter. */
  months: number;
  description: string;
  hidden?: boolean;
};

export const work: Work[] = [
  {
    slug: "groq",
    title: "Groq",
    role: "Product designer",
    dateRange: "May '25 – Dec '25",
    months: 8,
    description:
      "Built a comprehensive design system for GroqCloud, reducing 30 color conventions to 14, and designed platform features including LoRA management, dashboards, and AI search, all while contributing to the codebase.",
  },
  {
    slug: "phia",
    title: "Phia",
    role: "Growth designer",
    dateRange: "Sep '25 – Dec '25",
    months: 4,
    description:
      "Growth design for a fashion browser extension: redesigned onboarding, optimized activation through A/B testing, and shipped a number of new features.",
  },
  {
    slug: "klarify",
    title: "Klarify",
    role: "Sole designer",
    dateRange: "Sep '24 – Sep '25",
    months: 13,
    description:
      "Designed the web application for a therapy product built to support therapists, not replace them. As the sole designer, contributed to every feature and flow in the platform.",
  },
  {
    slug: "bronco-ai",
    title: "Bronco AI",
    role: "Product designer",
    dateRange: "Jan '24 – Aug '24",
    months: 8,
    description:
      "Product design for an AI-powered platform, focused on intuitive experiences for complex AI interactions and workflows.",
    hidden: true,
  },
  {
    slug: "modulize",
    title: "Modulize",
    role: "Designer and developer",
    dateRange: "Jun '23 – Dec '23",
    months: 7,
    description:
      "Designed and developed modular components and systems for a scalable design platform, working closely with engineering on reusable patterns and component libraries.",
    hidden: true,
  },
];

export const visibleWork = work.filter((w) => !w.hidden);

export const links = [
  { label: "Resume", href: "/resume.pdf" },
  { label: "Email", href: "mailto:yousuf.zephyr@gmail.com" },
  { label: "LinkedIn", href: "https://linkedin.com/in/zia-yousuf" },
  { label: "X", href: "https://twitter.com/yousufziaaa" },
  { label: "Research", href: "https://pubmed.ncbi.nlm.nih.gov/?term=Islam+YZ&cauthor_id=41027339" },
];
