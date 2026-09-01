"use client";
import React, { useEffect, useState, PropsWithChildren } from "react";

type AnimateInProps = PropsWithChildren<{
  className?: string;
  threshold?: number;
}>;

/**
 * AnimateIn - wraps children and adds "in-view" class when visible.
 * Accepts optional className and threshold.
 */
export default function AnimateIn({ children, className = "", threshold = 0.12 }: AnimateInProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!element) return;

    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            o.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    obs.observe(element);
    return () => obs.disconnect();
  }, [element, threshold]);

  const combinedClass = className || "";
  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0px)" : "translateY(18px)",
    transition: "opacity 900ms ease, transform 900ms cubic-bezier(.2,.9,.2,1)",
    willChange: "opacity, transform",
  } as const;

  return (
    <div ref={setElement} className={combinedClass} style={style}>
      {children}
    </div>
  );
}
