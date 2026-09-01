
"use client";

/**
 * ProjectCard.js
 * Displays a single project card with title, description, and GitHub link.
 * Sized by its parent coverflow slot (see ProjectSection.js). Hover tilt +
 * glow only apply to the centered card — side cards are inert previews.
 */

import { indieflower, lato, spaceGrotesk } from "/app/font";
import { useRef } from "react";

export default function ProjectCard({
  title,
  desc,
  github,
  index = 0,
  isCenter = true,
}) {
  const cardRef = useRef(null);

  const handlePointerMove = (e) => {
    if (!isCenter) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    card.style.setProperty(
      "--tilt-x",
      `${(py - 0.5) * -5}deg`
    );
    card.style.setProperty(
      "--tilt-y",
      `${(px - 0.5) * 5}deg`
    );
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
    <div className={`project-card h-full w-full ${indieflower.className}`}>
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="project-tilt group relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-[var(--border-color)] p-5 shadow-lg"
        style={{ backgroundColor: "var(--background)" }}
      >
        {isCenter && (
          <span className="project-glow" aria-hidden="true" />
        )}

        <h2
          className={`relative mb-2 text-xl tracking-tight ${spaceGrotesk.className} text-theme-primary`}
        >
          {title}
        </h2>

      <p className={`relative project-desc-clamp text-sm mb-4 flex-1 min-h-0 ${lato.className} text-theme-secondary`}>
        {desc}
      </p>

        {isCenter ? (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link relative mt-auto inline-flex items-center gap-1.5 text-base font-medium text-pink-600"
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
        ) : (
          <span className="relative mt-auto text-base text-theme-secondary/60">
            See more on GitHub
          </span>
        )}
      </div>
    </div>
  );
}
