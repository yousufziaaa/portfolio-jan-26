"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * next/image that fades in over a blurred preview once it has loaded,
 * instead of snapping in. The parent must be `relative overflow-hidden`;
 * the preview fills it and is dropped once the fade has finished.
 */
export default function FadeImage({
  preview,
  className = "",
  onLoad,
  ...props
}: ImageProps & { preview?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [settled, setSettled] = useState(false);

  // An image can finish loading before React hydrates and misses onLoad.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <>
      {preview && !settled && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-[14px]"
        />
      )}
      <Image
        {...props}
        ref={ref}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onTransitionEnd={() => loaded && setSettled(true)}
        className={`${className} relative transition-opacity duration-300 ease-out motion-reduce:duration-150 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}
