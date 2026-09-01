"use client";

/**
 * ProjectCard.js
 * Displays a single project card with title, description, and GitHub link.
 * Sized by its parent carousel item (see ProjectSection.js) rather than a
 * grid, so it stays a fixed, compact footprint regardless of project count.
 * Hover: cursor-tracked tilt + glow, as a single restrained interaction.
 */

import { indieflower, lato, spaceGrotesk } from "/app/font";
import { useEffect, useRef } from "react";

export default function ProjectCard({ title, desc, github, index = 0 }) {
  const ref = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.14 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handlePointerMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    card.style.setProperty("--tilt-x", `${(py - 0.5) * -5}deg`);
    card.style.setProperty("--tilt-y", `${(px - 0.5) * 5}deg`);
    card.style.setProperty("--mx", `${px * 100}%`);
    card.style.setProperty("--my", `${py * 100}%`);
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={ref}
      className={`project-card h-full ${indieflower.className}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="project-tilt group relative flex h-full flex-col overflow-hidden rounded-lg border border-[var(--border-color)] p-5"
        style={{ backgroundColor: "var(--background)" }}
      >
        <span className="project-glow" aria-hidden="true" />

        <h2 className={`relative text-xl mb-2 tracking-tight ${spaceGrotesk.className} text-theme-primary`}>
          {title}
        </h2>
        <p className={`relative project-desc-clamp text-sm mb-4 ${lato.className} text-theme-secondary`}>
          {desc}
        </p>
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link relative mt-auto inline-flex items-center gap-1.5 text-base text-pink-600 font-medium"
        >
          See more on GitHub
          <svg
            className="project-link-arrow"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.5 12.5L12.5 3.5M12.5 3.5H5.5M12.5 3.5V10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}