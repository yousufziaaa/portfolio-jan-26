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
    "no single source of truth", 
    "14 core values.",
    "hover, active, and disabled states.",
    "consistent user experience",
    "seamless theme switching",
    "creation of a comprehensive design system",
    // Phia phrases
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
    "positioning as an AI company in a field where many therapists were skeptical of the technology.",
    "focusing on clear value proposition communication and understanding the core audience.",
    "cohesive visual language:",
    "stripping away complexity to create intuitive experiences for therapists at all levels of tech proficiency.",
    "command center for each therapy session.",
    "organizing dense information hierarchies",
    "The design needed to balance two competing needs:",
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
