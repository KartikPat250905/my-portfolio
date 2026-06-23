"use client";
import React, { useEffect, useRef, PropsWithChildren } from "react";

type AnimateInProps = PropsWithChildren<{
  className?: string;
  threshold?: number;
}>;

/**
 * AnimateIn - wraps children and adds "in-view" class when visible.
 * Accepts optional className and threshold.
 */
export default function AnimateIn({ children, className = "", threshold = 0.12 }: AnimateInProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            o.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const combinedClass = `${className ? className + " " : ""}animate-in-wrapper opacity-0 translate-y-4`;

  return <div ref={ref} className={combinedClass}>{children}</div>;
}