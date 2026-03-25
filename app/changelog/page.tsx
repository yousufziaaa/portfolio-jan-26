import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

type ChangelogEntry = {
  date: string;
  title: string;
  description: string;
};

const entries: ChangelogEntry[] = [
  {
    date: "03/24/26",
    title: "New sections added",
    description:
      "I added sections for Writing, Playground, and this Changelog.",
  },
  {
    date: "03/14/26",
    title: "Background color change + new nav",
    description:
      "Moved from a colder background to a warmer one (#F5F5F4). Also replaced the scroll timeline with a new clock-style nav — bars sit at five angles mimicking clock positions and rotate to indicate which section you're in.",
  },
  {
    date: "03/14/26",
    title: "Site title update",
    description:
      "Updated the page title and Open Graph metadata to reflect my current focus — now reads 'Yousuf Zia | Product Designer x Engineer'.",
  },
  {
    date: "01/24/26",
    title: "Resume added + project page polish",
    description:
      "Added my resume as a downloadable PDF via the social links. Also added text highlighting on project pages to call out key phrases, and refreshed the copy across project write-ups.",
  },
  {
    date: "01/22/26",
    title: "Theme toggle + metadata improvements",
    description:
      "Moved the theme toggle into the table of contents sidebar so it's always accessible while reading. Also cleaned up OpenGraph and siteName metadata for better sharing previews.",
  },
  {
    date: "01/20/26",
    title: "Project pages built out",
    description:
      "Fully scaffolded the project case study pages — added a fixed table of contents sidebar, structured sections with images, preface and conclusion blocks, and a back-to-top button.",
  },
  {
    date: "01/16/26",
    title: "Site launched",
    description:
      "First version of the portfolio is live. Includes the homepage with physics-based social links, project grid, and about section. Fixed up mobile responsiveness, footer layout, and broken links before shipping.",
  },
];

export default function Changelog() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 sm:px-12 md:px-16 lg:px-20 py-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-sm font-departure-mono transition-opacity hover:opacity-70"
          style={{ color: "var(--foreground)" }}
        >
          ← Go back home
        </Link>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20 py-32">

        {/* Header */}
        <h1
          className="font-departure-mono mb-8 max-w-[400px]"
          style={{ fontSize: "32px", fontWeight: "400", color: "var(--header)" }}
        >
          Changelog
        </h1>
        <p
          className="font-neue-machina mb-8"
          style={{ fontSize: "16px", color: "var(--foreground)", lineHeight: "1.6" }}
        >
          I've always been a huge fan of changelogs, and wanted to add one for myself :)
        </p>

        {/* Divider */}
        <div
          className="mb-12"
          style={{ borderTop: "1px solid var(--foreground)", opacity: 0.4 }}
        />

        {/* Entries */}
        <div className="flex flex-col gap-10">
          {entries.map((entry, i) => (
            <div key={i}>
              {/* Title row with date right-aligned */}
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h2
                  className="font-neue-machina"
                  style={{ fontSize: "16px", fontWeight: "400", color: "var(--header)" }}
                >
                  {entry.title}
                </h2>
                <span
                  className="font-neue-machina shrink-0"
                  style={{ fontSize: "14px", color: "var(--foreground)", opacity: 0.5 }}
                >
                  {entry.date}
                </span>
              </div>
              <p
                className="font-neue-machina"
                style={{ fontSize: "15px", color: "var(--foreground)", lineHeight: "1.6", opacity: 0.7 }}
              >
                {entry.description}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Footer pinned to bottom */}
      <div className="mt-auto mx-auto w-full max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20">
        <Footer />
      </div>
    </main>
  );
}
