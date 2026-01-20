import { projectContents, type ProjectContent } from "@/data/projects";
import TableOfContents from "@/components/TableOfContents";
import BackToTop from "@/components/BackToTop";
import Image from "next/image";
import Link from "next/link";

export default function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = projectContents[params.slug];

  if (!project) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20 py-16">
          <h1 className="text-fluid-4xl font-bold mb-8">Project not found</h1>
          <Link href="/" className="text-fluid-base" style={{ color: "var(--accent)" }}>
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  // Build TOC items
  const tocItems = [
    ...(project.preface && project.preface.length > 0
      ? [{ id: "preface", title: "Preface", level: 1 }]
      : []),
    ...project.sections.flatMap((section) => [
      {
        id: section.id,
        title: section.title,
        level: section.level,
      },
      ...(section.subsections || []).map((subsection) => ({
        id: subsection.id,
        title: subsection.title,
        level: section.level + 1,
      })),
    ]),
    ...(project.conclusion
      ? [{ id: "conclusion", title: "Conclusion", level: 1 }]
      : []),
  ];

  return (
    <main className="min-h-screen">
      <div className="relative">
        {/* Table of Contents - positioned on the right */}
        <div className="hidden lg:block fixed right-8 top-24 z-10">
          <TableOfContents items={tocItems} />
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20 py-16">
          {/* Header */}
          <header className="mb-16">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-block mb-6 text-sm font-departure-mono transition-opacity hover:opacity-70"
              style={{ color: "var(--header)" }}
            >
              ← Back
            </Link>
          </div>
          <h1
            className="font-departure-mono mb-4"
            style={{ fontSize: "32px", fontWeight: "400", color: "var(--header)" }}
          >
            {project.title}
          </h1>
          <p
            className="font-departure-mono text-sm"
            style={{ color: "var(--foreground)", opacity: 0.6 }}
          >
            {project.dateRange}
          </p>
        </header>

        {/* Preface */}
        {project.preface && project.preface.length > 0 && (
          <section id="preface" className="mb-12">
            {project.preface.map((paragraph, index) => (
              <p
                key={index}
                className="mb-4"
                style={{ 
                  fontSize: "16px",
                  color: "var(--foreground)", 
                  lineHeight: "1.6",
                  fontFamily: "var(--font-neue-machina)"
                }}
              >
                {paragraph}
              </p>
            ))}
          </section>
        )}

        {/* Sections */}
        {project.sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-12 scroll-mt-24">
            {section.level === 2 ? (
              <h3
                className="font-departure-mono mb-3"
                style={{
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "var(--header)",
                }}
              >
                {section.title}
              </h3>
            ) : (
              <h2
                className="font-departure-mono mb-6"
                style={{
                  fontSize: "18px",
                  fontWeight: "400",
                  color: "var(--header)",
                }}
              >
                {section.title}
              </h2>
            )}
            {section.content.map((paragraph, index) => (
              <p
                key={index}
                className="mb-4"
                style={{ 
                  fontSize: "16px",
                  color: "var(--foreground)", 
                  lineHeight: "1.6",
                  fontFamily: "var(--font-neue-machina)"
                }}
              >
                {paragraph}
              </p>
            ))}
            {section.subsections && section.subsections.map((subsection) => (
              <div key={subsection.id} id={subsection.id} className="mb-8 scroll-mt-24">
                <h3
                  className="font-departure-mono mb-3"
                  style={{
                    fontSize: "16px",
                    fontWeight: "400",
                    color: "var(--header)",
                  }}
                >
                  {subsection.title}
                </h3>
                {subsection.content.map((paragraph, index) => (
                  <p
                    key={index}
                    className="mb-4"
                    style={{ 
                      fontSize: "16px",
                      color: "var(--foreground)", 
                      lineHeight: "1.6",
                      fontFamily: "var(--font-neue-machina)"
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
                {subsection.images && subsection.images.length > 0 && (
                  <div className="mt-8 space-y-6">
                    {subsection.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative w-full rounded-lg overflow-hidden"
                        style={{ backgroundColor: "var(--background)" }}
                      >
                        <Image
                          src={image}
                          alt={`${subsection.title} image ${index + 1}`}
                          width={1200}
                          height={675}
                          className="w-full h-auto"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {section.images && section.images.length > 0 && (
              <div className="mt-8 space-y-6">
                {section.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-full rounded-lg overflow-hidden"
                    style={{ backgroundColor: "var(--background)" }}
                  >
                    <Image
                      src={image}
                      alt={`${section.title} image ${index + 1}`}
                      width={1200}
                      height={675}
                      className="w-full h-auto"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Conclusion */}
        {project.conclusion && (
          <section id="conclusion" className="mb-12 scroll-mt-24">
            <h2
              className="font-departure-mono mb-6"
              style={{ fontSize: "18px", fontWeight: "400", color: "var(--header)" }}
            >
              Conclusion
            </h2>
            {project.conclusion.map((paragraph, index) => (
              <p
                key={index}
                className="mb-4"
                style={{ 
                  fontSize: "16px",
                  color: "var(--foreground)", 
                  lineHeight: "1.6",
                  fontFamily: "var(--font-neue-machina)"
                }}
              >
                {paragraph}
              </p>
            ))}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-32 pt-8" style={{ opacity: 0.7 }}>
          <div className="border-t mb-8" style={{ borderColor: "var(--foreground)", opacity: 0.571 }}></div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Link
              href="/"
              className="text-sm font-departure-mono transition-opacity hover:opacity-70"
              style={{ color: "var(--foreground)" }}
            >
              ← Back to home
            </Link>
            <BackToTop />
          </div>
        </footer>
        </div>
      </div>
    </main>
  );
}
