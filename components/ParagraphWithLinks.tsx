"use client";

import Link from "next/link";
import CenterUnderline from "@/components/fancy/text/underline-center";

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
  
  return <>{text}</>;
}
