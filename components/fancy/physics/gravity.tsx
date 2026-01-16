"use client";

import { useEffect, useRef, ReactNode, useState } from "react";

interface GravityProps {
  children: ReactNode;
  gravity?: { x: number; y: number; scale?: number };
  className?: string;
}

interface MatterBodyProps {
  children: ReactNode;
  x: string | number;
  y: string | number;
  angle?: number;
  matterBodyOptions?: {
    friction?: number;
    restitution?: number;
  };
  isDraggable?: boolean;
  shouldAnimate?: boolean;
}

export function MatterBody({
  children,
  x,
  y,
  angle = 0,
  matterBodyOptions = {},
  isDraggable = false,
  shouldAnimate = true,
}: MatterBodyProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const mouseStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const lastMouseTimeRef = useRef(0);
  const dragVelocityRef = useRef({ x: 0, y: 0 });
  const handlersRef = useRef<{
    mouseMove?: (e: MouseEvent) => void;
    mouseUp?: () => void;
    touchMove?: (e: TouchEvent) => void;
    touchEnd?: () => void;
  }>({});

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const parent = element.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const rect = element.getBoundingClientRect();

    // Convert percentage or pixel values to actual coordinates
    let startX: number;
    let startY: number;

    if (typeof x === "string") {
      if (x.includes("%")) {
        const percentX = parseFloat(x) / 100;
        startX = parentRect.width * percentX;
      } else if (x.includes("px")) {
        startX = parseFloat(x);
      } else {
        startX = parseFloat(x) || 0;
      }
    } else {
      startX = x;
    }

    if (typeof y === "string") {
      if (y.includes("%")) {
        const percentY = parseFloat(y) / 100;
        startY = parentRect.height * percentY;
      } else if (y.includes("px")) {
        startY = parseFloat(y);
      } else {
        startY = parseFloat(y) || 0;
      }
    } else {
      startY = y;
    }

    // Set initial position
    positionRef.current = { x: startX, y: startY };
    element.style.position = "absolute";
    element.style.left = `${startX}px`;
    element.style.top = `${startY}px`;
    element.style.transform = `rotate(${angle}deg)`;

    // Physics simulation
    const gravity = 0.5;
    const friction = matterBodyOptions.friction ?? 0.5;
    const restitution = matterBodyOptions.restitution ?? 0.2;

    // Start animation after a brief delay, only if shouldAnimate is true
    let startDelay: NodeJS.Timeout | null = null;
    if (shouldAnimate) {
      startDelay = setTimeout(() => {
        setIsAnimating(true);
        velocityRef.current = { x: (Math.random() - 0.5) * 2, y: 0 };
      }, 100);
    } else {
      // If not animating, keep element hidden
      if (elementRef.current) {
        elementRef.current.style.opacity = '0';
        elementRef.current.style.pointerEvents = 'none';
      }
    }

    const animate = () => {
      if (!elementRef.current || !shouldAnimate) return;

      // Don't apply physics if dragging
      if (!isDraggingRef.current) {
        // Recalculate element dimensions dynamically
        const currentRect = elementRef.current.getBoundingClientRect();
        const elementHeight = currentRect.height;
        const elementWidth = currentRect.width;
        
        const currentY = positionRef.current.y;
        const currentX = positionRef.current.x;
        const parentHeight = parent.offsetHeight;
        const parentWidth = parent.offsetWidth;

        // Apply gravity
        velocityRef.current.y += gravity;

        // Apply friction
        velocityRef.current.x *= 1 - friction * 0.1;
        velocityRef.current.y *= 1 - friction * 0.05;

        // Update position
        positionRef.current.x += velocityRef.current.x;
        positionRef.current.y += velocityRef.current.y;

        // Bounce off bottom - use viewport height with 12px padding
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : parentHeight;
        const bottomBoundary = viewportHeight - elementHeight - 12; // 12px padding from bottom
        
        if (currentY + elementHeight >= bottomBoundary) {
          positionRef.current.y = bottomBoundary;
          velocityRef.current.y *= -restitution;
          velocityRef.current.x *= 0.9; // Damping
        }

        // Bounce off sides
        if (currentX <= 0) {
          positionRef.current.x = 0;
          velocityRef.current.x *= -restitution;
        } else if (currentX + elementWidth >= parentWidth) {
          positionRef.current.x = parentWidth - elementWidth;
          velocityRef.current.x *= -restitution;
        }
      }

      // Update DOM
      if (elementRef.current) {
        elementRef.current.style.left = `${positionRef.current.x}px`;
        elementRef.current.style.top = `${positionRef.current.y}px`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop only if shouldAnimate
    if (shouldAnimate) {
      animationRef.current = requestAnimationFrame(animate);
    }

    // Drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (!isDraggable || !elementRef.current) return;
      e.preventDefault();
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      dragDistanceRef.current = 0;
      mouseStartRef.current = { x: e.clientX, y: e.clientY };
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      lastMouseTimeRef.current = performance.now();
      dragStartRef.current = { ...positionRef.current };
      dragVelocityRef.current = { x: 0, y: 0 };
      velocityRef.current = { x: 0, y: 0 }; // Reset velocity when dragging starts
      
      handlersRef.current.mouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current || !elementRef.current) return;
        
        const now = performance.now();
        const deltaTime = (now - lastMouseTimeRef.current) / 1000; // Convert to seconds
        const deltaX = e.clientX - mouseStartRef.current.x;
        const deltaY = e.clientY - mouseStartRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        dragDistanceRef.current = distance;
        
        // Calculate velocity based on recent movement
        if (deltaTime > 0 && deltaTime < 0.1) { // Only calculate if time delta is reasonable
          const recentDeltaX = e.clientX - lastMousePosRef.current.x;
          const recentDeltaY = e.clientY - lastMousePosRef.current.y;
          // Calculate instant velocity and smooth it
          const instantVelX = recentDeltaX / deltaTime;
          const instantVelY = recentDeltaY / deltaTime;
          // Smooth velocity calculation (weighted average) - more weight on recent movement
          dragVelocityRef.current.x = dragVelocityRef.current.x * 0.5 + instantVelX * 0.5;
          dragVelocityRef.current.y = dragVelocityRef.current.y * 0.5 + instantVelY * 0.5;
        }
        
        // Consider it a drag if moved more than 5 pixels
        if (distance > 5) {
          hasDraggedRef.current = true;
        }
        
        positionRef.current.x = dragStartRef.current.x + deltaX;
        positionRef.current.y = dragStartRef.current.y + deltaY;
        
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        lastMouseTimeRef.current = now;
      };

      handlersRef.current.mouseUp = (e?: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const wasDragging = hasDraggedRef.current;
        isDraggingRef.current = false;
        
        // Apply momentum from drag velocity
        if (wasDragging && dragDistanceRef.current > 5) {
          // The drag velocity is in pixels per second
          // Convert to pixels per frame (assuming ~60fps)
          // Use a smaller multiplier to reduce momentum
          const fps = 60;
          const momentumMultiplier = 0.4; // Reduced momentum for more control
          velocityRef.current.x = (dragVelocityRef.current.x / fps) * momentumMultiplier;
          velocityRef.current.y = (dragVelocityRef.current.y / fps) * momentumMultiplier;
        }
        
        // Prevent click if we dragged - use a flag that the click handler checks
        if (wasDragging && elementRef.current) {
          const linkElement = elementRef.current.querySelector('a');
          if (linkElement) {
            // Set a data attribute to prevent click
            linkElement.setAttribute('data-dragged', 'true');
            const preventClick = (clickEvent: MouseEvent) => {
              if (linkElement.getAttribute('data-dragged') === 'true') {
                clickEvent.preventDefault();
                clickEvent.stopPropagation();
                linkElement.removeAttribute('data-dragged');
                linkElement.removeEventListener('click', preventClick, true);
              }
            };
            linkElement.addEventListener('click', preventClick, true);
            // Clear the flag after a delay
            setTimeout(() => {
              linkElement.removeAttribute('data-dragged');
              linkElement.removeEventListener('click', preventClick, true);
            }, 300);
          }
        }
        
        hasDraggedRef.current = false;
        dragDistanceRef.current = 0;
        
        if (handlersRef.current.mouseMove) {
          document.removeEventListener("mousemove", handlersRef.current.mouseMove);
        }
        if (handlersRef.current.mouseUp) {
          document.removeEventListener("mouseup", handlersRef.current.mouseUp);
        }
        handlersRef.current.mouseMove = undefined;
        handlersRef.current.mouseUp = undefined;
      };
      
      if (handlersRef.current.mouseMove) {
        document.addEventListener("mousemove", handlersRef.current.mouseMove);
      }
      if (handlersRef.current.mouseUp) {
        document.addEventListener("mouseup", handlersRef.current.mouseUp);
      }
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (!isDraggable || !elementRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      dragDistanceRef.current = 0;
      mouseStartRef.current = { x: touch.clientX, y: touch.clientY };
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
      lastMouseTimeRef.current = performance.now();
      dragStartRef.current = { ...positionRef.current };
      dragVelocityRef.current = { x: 0, y: 0 };
      velocityRef.current = { x: 0, y: 0 };
      
      handlersRef.current.touchMove = (e: TouchEvent) => {
        if (!isDraggingRef.current || !elementRef.current) return;
        e.preventDefault();
        const touch = e.touches[0];
        
        const now = performance.now();
        const deltaTime = (now - lastMouseTimeRef.current) / 1000; // Convert to seconds
        const deltaX = touch.clientX - mouseStartRef.current.x;
        const deltaY = touch.clientY - mouseStartRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        dragDistanceRef.current = distance;
        
        // Calculate velocity based on recent movement
        if (deltaTime > 0 && deltaTime < 0.1) { // Only calculate if time delta is reasonable
          const recentDeltaX = touch.clientX - lastMousePosRef.current.x;
          const recentDeltaY = touch.clientY - lastMousePosRef.current.y;
          // Calculate instant velocity and smooth it
          const instantVelX = recentDeltaX / deltaTime;
          const instantVelY = recentDeltaY / deltaTime;
          // Smooth velocity calculation (weighted average) - more weight on recent movement
          dragVelocityRef.current.x = dragVelocityRef.current.x * 0.5 + instantVelX * 0.5;
          dragVelocityRef.current.y = dragVelocityRef.current.y * 0.5 + instantVelY * 0.5;
        }
        
        // Consider it a drag if moved more than 5 pixels
        if (distance > 5) {
          hasDraggedRef.current = true;
        }
        
        positionRef.current.x = dragStartRef.current.x + deltaX;
        positionRef.current.y = dragStartRef.current.y + deltaY;
        
        lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
        lastMouseTimeRef.current = now;
      };

      handlersRef.current.touchEnd = () => {
        if (!isDraggingRef.current) return;
        const wasDragging = hasDraggedRef.current;
        isDraggingRef.current = false;
        
        // Apply momentum from drag velocity
        if (wasDragging && dragDistanceRef.current > 5) {
          // The drag velocity is in pixels per second
          // Convert to pixels per frame (assuming ~60fps)
          // Use a smaller multiplier to reduce momentum
          const fps = 60;
          const momentumMultiplier = 0.4; // Reduced momentum for more control
          velocityRef.current.x = (dragVelocityRef.current.x / fps) * momentumMultiplier;
          velocityRef.current.y = (dragVelocityRef.current.y / fps) * momentumMultiplier;
        }
        
        // Prevent click if we dragged
        if (wasDragging && elementRef.current) {
          const linkElement = elementRef.current.querySelector('a');
          if (linkElement) {
            // Set a data attribute to prevent click
            linkElement.setAttribute('data-dragged', 'true');
            const preventClick = (clickEvent: MouseEvent | TouchEvent) => {
              if (linkElement.getAttribute('data-dragged') === 'true') {
                clickEvent.preventDefault();
                clickEvent.stopPropagation();
                linkElement.removeAttribute('data-dragged');
                linkElement.removeEventListener('click', preventClick as EventListener, true);
              }
            };
            linkElement.addEventListener('click', preventClick as EventListener, true);
            // Clear the flag after a delay
            setTimeout(() => {
              linkElement.removeAttribute('data-dragged');
              linkElement.removeEventListener('click', preventClick as EventListener, true);
            }, 300);
          }
        }
        
        hasDraggedRef.current = false;
        dragDistanceRef.current = 0;
        dragVelocityRef.current = { x: 0, y: 0 };
        
        if (handlersRef.current.touchMove) {
          document.removeEventListener("touchmove", handlersRef.current.touchMove);
        }
        if (handlersRef.current.touchEnd) {
          document.removeEventListener("touchend", handlersRef.current.touchEnd);
        }
        handlersRef.current.touchMove = undefined;
        handlersRef.current.touchEnd = undefined;
      };
      
      if (handlersRef.current.touchMove) {
        document.addEventListener("touchmove", handlersRef.current.touchMove);
      }
      if (handlersRef.current.touchEnd) {
        document.addEventListener("touchend", handlersRef.current.touchEnd);
      }
    };

    // Attach drag listeners
    if (isDraggable && elementRef.current) {
      elementRef.current.addEventListener("mousedown", handleMouseDown);
      elementRef.current.addEventListener("touchstart", handleTouchStart);
      elementRef.current.style.cursor = "grab";
      
      // Update cursor on hover
      const handleMouseEnter = () => {
        if (elementRef.current) {
          elementRef.current.style.cursor = isDraggingRef.current ? "grabbing" : "grab";
        }
      };
      const handleMouseLeave = () => {
        if (elementRef.current && !isDraggingRef.current) {
          elementRef.current.style.cursor = "grab";
        }
      };
      elementRef.current.addEventListener("mouseenter", handleMouseEnter);
      elementRef.current.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (startDelay) {
        clearTimeout(startDelay);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (elementRef.current) {
        elementRef.current.removeEventListener("mousedown", handleMouseDown);
        elementRef.current.removeEventListener("touchstart", handleTouchStart);
      }
      // Cleanup document listeners
      if (handlersRef.current.mouseMove) {
        document.removeEventListener("mousemove", handlersRef.current.mouseMove);
      }
      if (handlersRef.current.mouseUp) {
        document.removeEventListener("mouseup", handlersRef.current.mouseUp);
      }
      if (handlersRef.current.touchMove) {
        document.removeEventListener("touchmove", handlersRef.current.touchMove);
      }
      if (handlersRef.current.touchEnd) {
        document.removeEventListener("touchend", handlersRef.current.touchEnd);
      }
    };
  }, [x, y, angle, matterBodyOptions, isAnimating, isDraggable, shouldAnimate]);

  return (
    <div ref={elementRef} style={{ position: "absolute" }}>
      {children}
    </div>
  );
}

export default function Gravity({
  children,
  gravity = { x: 0, y: 1, scale: 0.001 },
  className = "",
}: GravityProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width: "100%", height: "100%" }}>
      {children}
    </div>
  );
}
