/**
 * SectionHeader.tsx
 * Renders a stylized section header with a title and optional subtitle.
 */

import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  id?: string;
  className?: string;
};

/**
 * SectionHeader component for displaying section titles and subtitles.
 * @param {string} title - The main title text.
 * @param {string} [subtitle] - Optional subtitle text.
 * @param {string} [id] - Optional id for the container div.
 * @param {string} [className] - Optional additional class names.
 */
export default function SectionHeader({ title, subtitle, id, className }: Props) {
  return (
    <div id={id} className={`w-full flex flex-col items-center my-6 ${className ?? ""}`}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold cloud-border drop-shadow-[0_4px_8px_rgba(255,77,138,0.3)] dark:drop-shadow-[0_6px_12px_rgba(255,77,138,0.4)]">
        <span className="bg-gradient-to-r to-[#ff10e7] via-[#ff6fa3] from-[#f806f0] bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
      {subtitle && <p className="mt-2 text-sm text-white/60">{subtitle}</p>}
    </div>
  );
}
