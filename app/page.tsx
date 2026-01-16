import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollTimeline from "@/components/ScrollTimeline";
import SocialLinksGravity from "@/components/SocialLinksGravity";

export default function Home() {
  return (
    <main className="min-h-screen">
      <ScrollTimeline />
      <div className="mx-auto max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20">
        <ThemeToggle />
        <Hero />
        <Projects />
        <About />
        <Footer />
      </div>
      <SocialLinksGravity />
    </main>
  );
}
