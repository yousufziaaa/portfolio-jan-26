"use client";

import Link from "next/link";
import CenterUnderline from "@/components/fancy/text/underline-center";

export default function Footer() {
  return (
    <footer className="pb-16 md:pb-12">
      <div style={{ borderTop: "1px solid var(--foreground)", opacity: 0.4 }} className="mb-6" />
      <div className="flex flex-row justify-between items-stretch gap-8 md:gap-16">
        {/* Left: Nav Links */}
        <div className="font-neue-machina flex flex-col gap-3 text-[12px] md:text-[14px]" style={{ color: "var(--foreground)" }}>
          <Link href="/writing"><CenterUnderline>Writing</CenterUnderline></Link>
          <Link href="/playground"><CenterUnderline>Playground</CenterUnderline></Link>
          <Link href="/changelog"><CenterUnderline>Changelog</CenterUnderline></Link>
        </div>

        {/* Right: Contact Info */}
        <div className="font-neue-machina text-right text-[10px] md:text-[12px] leading-relaxed w-[180px] md:w-[180px]" style={{ color: "var(--foreground)" }}>
          you can find me [at] yousufziaaa on all platforms or by writing to me at{" "}
          <Link href="mailto:yousuf.zephyr@gmail.com" className="inline-block">
            <CenterUnderline>yousuf.zephyr@gmail.com</CenterUnderline>
          </Link>
        </div>
      </div>
    </footer>
  );
}
