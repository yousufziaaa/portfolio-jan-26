"use client";

import { motion, Variants } from "framer-motion";
import { useState, ReactNode } from "react";
import Image from "next/image";

interface MediaBetweenTextProps {
  firstText: string | ReactNode;
  secondText: string | ReactNode;
  mediaUrl: string;
  mediaType?: "image" | "video";
  triggerType?: "hover" | "click";
  mediaContainerClassName?: string;
  className?: string;
  animationVariants?: Variants;
}

export default function MediaBetweenText({
  firstText,
  secondText,
  mediaUrl,
  mediaType = "image",
  triggerType = "hover",
  mediaContainerClassName = "",
  className = "",
  animationVariants,
}: MediaBetweenTextProps) {
  const [isActive, setIsActive] = useState(false);

  const handleTrigger = () => {
    if (triggerType === "hover") {
      setIsActive(true);
    } else {
      setIsActive(!isActive);
    }
  };

  const handleLeave = () => {
    if (triggerType === "hover") {
      setIsActive(false);
    }
  };

  const defaultVariants: Variants = {
    initial: { width: 0 },
    animate: {
      width: "100px",
      transition: { duration: 0.4, type: "spring", bounce: 0 },
    },
  };

  const variants = animationVariants || defaultVariants;

  return (
    <span
      className={`inline-flex items-center ${className}`}
      onMouseEnter={handleTrigger}
      onMouseLeave={handleLeave}
      onClick={handleTrigger}
    >
      <span>{firstText}</span>
      <motion.span
        className={`inline-block overflow-hidden ${mediaContainerClassName}`}
        initial="initial"
        animate={isActive ? "animate" : "initial"}
        variants={variants}
      >
        {mediaType === "image" && (
          <Image
            src={mediaUrl}
            alt=""
            width={100}
            height={100}
            className="w-full h-full object-cover"
            unoptimized
          />
        )}
        {mediaType === "video" && (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        )}
      </motion.span>
      <span>{secondText}</span>
    </span>
  );
}
