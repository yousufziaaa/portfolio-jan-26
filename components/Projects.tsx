"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

type Project = {
  id: number;
  title: string;
  dateRange: string;
  description: string;
  image: string;
  slug: string;
};

const projects: Project[] = [
  {
    id: 1,
    title: "Groq",
    dateRange: "May '25 - Dec '25",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    image: "/groq-hero.png",
    slug: "groq",
  },
  {
    id: 2,
    title: "Phia",
    dateRange: "Sep '25 - Dec '25",
    description:
      "Product design work for an innovative platform. Focused on creating intuitive user experiences and building scalable design systems.",
    image: "/phia-hero.png",
    slug: "phia",
  },
  {
    id: 3,
    title: "Klarify",
    dateRange: "Sep '24 - Sep '25",
    description:
      "I designed the web application for a startup that helps users track and manage their daily tasks. The application features a clean, intuitive interface with a focus on productivity and user experience.",
    image: "/klarify-hero.png",
    slug: "klarify",
  },
  {
    id: 4,
    title: "Bronco AI",
    dateRange: "Jan '24 - Aug '24",
    description:
      "Product design work for an AI-powered platform. Focused on creating intuitive user experiences for complex AI interactions and workflows.",
    image: "/bronco-hero.png",
    slug: "bronco-ai",
  },
  {
    id: 5,
    title: "Modulize",
    dateRange: "Jun '23 - Dec '23",
    description:
      "Designed and developed modular components and systems for a scalable design platform. Worked closely with engineering to build reusable design patterns and component libraries.",
    image: "/modulize-hero.png",
    slug: "modulize",
  },
];

export default function Projects() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="pt-8 md:pt-12 pb-16 md:pb-24">
      <motion.h2
        className="mb-4"
        style={{ fontSize: "32px", fontWeight: "400" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Work
      </motion.h2>

      <div className="space-y-16">
        {projects.map((project, index) => (
          <motion.article
            key={project.id}
            id={`project-${project.id}`}
            data-section-index={index + 1}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="w-full"
          >
            <div className="flex justify-between items-baseline mb-4">
              <h3 
                className="font-neue-machina"
                style={{ fontSize: "20px", fontWeight: "400" }}
              >
                {project.title}
              </h3>
              <span 
                className="font-departure-mono"
                style={{ fontSize: "18px", fontWeight: "400", color: "var(--foreground)" }}
              >
                {project.dateRange}
              </span>
            </div>
            
            <p className="text-fluid-sm mb-6" style={{ color: "var(--foreground)" }}>
              {project.description}
            </p>

            <Link
              href={`/projects/${project.slug}`}
              data-project-link
              className="block relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={`${project.title} project image`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 650px, 650px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                    <span className="text-white/50 text-sm">Project Image</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {isHovering && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{
            left: cursorPosition.x + 5,
            top: cursorPosition.y + 10,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div 
            className="px-4 py-2 shadow-lg rounded-full"
            style={{
              backgroundColor: "var(--accent)",
              border: "1px solid rgba(0, 0, 0, 0.2)",
            }}
          >
            <span className="text-white font-departure-mono text-sm whitespace-nowrap">
              View Project ↗
            </span>
          </div>
        </motion.div>
      )}
    </section>
  );
}
