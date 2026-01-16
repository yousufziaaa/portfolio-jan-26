"use client";

import Link from "next/link";
import CenterUnderline from "@/components/fancy/text/underline-center";

export default function Footer() {
  return (
    <footer className="py-12 pb-2 md:pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 md:gap-16">
        {/* Left Text Block */}
        <div className="font-departure-mono uppercase flex flex-col justify-end" style={{ color: "var(--accent)" }}>
          <div className="leading-relaxed text-[12px] md:text-[14px]">
            <div>MADE WITH LOVE BY</div>
            <div>YOUSUF (AND CURSOR)</div>
          </div>
        </div>

        {/* Right Text Block */}
        <div className="font-departure-mono uppercase text-right md:text-left flex flex-col justify-end" style={{ color: "var(--foreground)" }}>
          <div className="leading-relaxed whitespace-normal break-words text-[8px] md:text-[10px]">
            <div>YOU CAN FIND ME [AT] YOUSUFZIAAA</div>
            <div>ON ALL PLATFORMS OR BY WRITING</div>
            <div>
              TO ME AT{" "}
              <Link href="mailto:yousuf.zephyr@gmail.com" className="inline-block">
                <CenterUnderline>
                  YOUSUF.ZEPHYR@GMAIL.COM
                </CenterUnderline>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
