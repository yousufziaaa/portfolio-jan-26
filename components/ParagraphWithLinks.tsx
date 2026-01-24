"use client";

import Link from "next/link";
import CenterUnderline from "@/components/fancy/text/underline-center";
import { TextHighlighter } from "@/components/fancy/text/text-highlighter";

interface ParagraphWithLinksProps {
  text: string;
}

export default function ParagraphWithLinks({ text }: ParagraphWithLinksProps) {
  // Check if text contains "View the current site here."
  if (text.includes("View the current site here.")) {
    const parts = text.split("View the current site here.");
    return (
      <>
        {parts[0]}
        <Link href="https://klarify.ca" target="_blank" rel="noopener noreferrer" className="inline-block">
          <CenterUnderline>
            View the current site here.
          </CenterUnderline>
        </Link>
        {parts[1]}
      </>
    );
  }
  
  // Handle text highlighting for specific phrases
  const highlightPhrases = [
    // Groq phrases
    "I had the opportunity to design and ship multiple platform features",
    "I broke the design system into two phases:",
    "auditing every color in use across the console",
    "I introduced semantic naming conventions that mapped to the Tailwind palette.",
    "standardized within this system.",
    "multiple variants to cover different use cases.",
    "ship a few of them directly:",
    "all decisions were backed by user requirements and data,",
    "better information hierarchy, improved readability and more succinct charts and data visualizations.",
    "This was the first PR I'd ever shipped, and my search modal still exists on the GroqCloud docs pages today :)",
    "redesigned each of modals to be more responsive",
    "no single source of truth", 
    "14 core values.",
    "hover, active, and disabled states.",
    "consistent user experience",
    "seamless theme switching",
    "creation of a comprehensive design system",
    // Phia phrases
    "contributed to establishing a cohesive design language",
    "I reskinned the existing flow",
    "I built a completely reimagined onboarding experience",
    "a tension between the founders' desire for flashy marketing moments and trying to craft the best possible user experience.",
    "New patterns for typography, color usage, component styling, and interaction design emerged",
    "A/B testing and PostHog session recordings",
    "clearer copy and better visual guidance",
    "Activation then became a P0 priority across the company.",
    "Style Profile:",
    "Outfit Gallery:",
    "Shopping Profile:",
    "creating natural upsell opportunities for more premium features",
    "motion design for key onboarding moments",
    "improve conversion from store page to install.",
    "retention-focused features.",
    "reducing extension churn, increasing user activation, and driving monetization.",
    "failed to set proper expectations for the extension's value.",
    "Progress indicators",
    "Early personalization",
    "Copy optimization",
    "completely reimagined experience",
    "creating inconsistency with the rest of the app.",
    "activation rates were concerningly low.",
    "Each iteration was informed by data",
    "increasing engagement and shareability",
    // Klarify phrases
    "I designed every user-facing screen, established comprehensive brand guidelines, overhauled marketing materials, and built a scalable design system.",
    "positioning itself as an AI company in a field where many therapists were skeptical of the technology.",
    "I led a website redesign",
    "that refined the brand further, and had a more concrete style defined.",
    "every asset followed a consistent structure",
    "a full suite of promotional designs",
    "As the sole designer, I contributed to every feature and flow in the Klarify platform.",
    "refining the experience month over month.",
    "organize dense information hierarchies",
    "the design needed to balance two competing needs:",
    "numerous iterations to reduce friction and handle edge cases",
    "I designed KlarifyGPT, the in-house AI assistant.",
    "The goal was to make AI feel helpful rather than intimidating ",
    "focusing on clear value proposition communication and understanding the core audience.",
    "cohesive visual language:",
    "stripping away complexity to create intuitive experiences for therapists at all levels of tech proficiency.",
    "command center for each therapy session.",
    "a complex multi-role system once we introduced clinic support.",
    "The final design balanced power-user functionality with clarity for less technical users.",
    "I built a comprehensive design system that unified the platform's visual language."
  ];
  let processedText: (string | JSX.Element)[] = [text];
  
  highlightPhrases.forEach((phrase) => {
    const newParts: (string | JSX.Element)[] = [];
    processedText.forEach((part) => {
      if (typeof part === "string" && part.includes(phrase)) {
        const splitParts = part.split(phrase);
        splitParts.forEach((splitPart, index) => {
          if (splitPart) {
            newParts.push(splitPart);
          }
          if (index < splitParts.length - 1) {
            newParts.push(
              <TextHighlighter key={`${phrase}-${index}`} className="rounded-[0.3em] px-px">
                {phrase}
              </TextHighlighter>
            );
          }
        });
      } else {
        newParts.push(part);
      }
    });
    processedText = newParts;
  });
  
  return <>{processedText}</>;
}
