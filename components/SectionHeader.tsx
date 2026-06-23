"use client";
/**
 * SectionHeader.tsx
 * Renders a stylized section header with a title and optional subtitle.
 */
import React, { useEffect, useRef } from "react";

type Props = {
  title: string;
  subtitle?: string;
  id?: string;
  className?: string;
};

/**
 * SectionHeader component for displaying section titles and subtitles.
 * Adds intersection observer to trigger a fade-in when the header scrolls into view.
 */
export default function SectionHeader({ title, subtitle, id, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
          } else {
            el.classList.remove("in-view");
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={id}
      ref={ref}
      className={`section-header w-full flex flex-col items-center my-6 ${className ?? ""}`}
    >
      <h2
        className="section-title text-2xl sm:text-3xl md:text-4xl font-bold cloud-border drop-shadow-[0_4px_8px_rgba(255,77,138,0.3)] dark:drop-shadow-[0_6px_12px_rgba(255,77,138,0.4)]"
      >
        <span className="bg-gradient-to-r to-[#ff10e7] via-[#ff6fa3] from-[#f806f0] bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
      {subtitle && (
        <p className="section-subtitle mt-2 text-sm text-white/60">
          {subtitle}
        </p>
      )}
    </div>
  );
}