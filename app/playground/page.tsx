import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

const images = Array.from({ length: 10 }, (_, i) => ({
  src: `/playground-${i + 1}.png`,
  alt: `Playground ${i + 1}`,
}));

export default function Playground() {
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
      <div className="w-full mx-auto max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20 py-32">

        <h1
          className="font-departure-mono mb-8"
          style={{ fontSize: "32px", fontWeight: "400", color: "var(--header)" }}
        >
          Playground
        </h1>
        <p
          className="font-neue-machina mb-8"
          style={{ fontSize: "16px", color: "var(--foreground)", lineHeight: "1.6" }}
        >
          Just some fun shots from some of the work I&apos;ve done over the past few years.
        </p>

        {/* Divider */}
        <div
          className="mb-8"
          style={{ borderTop: "1px solid var(--foreground)", opacity: 0.4 }}
        />

        {/* Image grid */}
        <div className="grid grid-cols-2 gap-2">
          {images.map((img) => (
            <div
              key={img.src}
              className="relative w-full overflow-hidden transition-transform duration-300 ease-out hover:scale-105 cursor-pointer"
              style={{ borderRadius: "8px", aspectRatio: "4/3" }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 650px) 50vw, 300px"
              />
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <div className="mt-auto mx-auto w-full max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20">
        <Footer />
      </div>
    </main>
  );
}
