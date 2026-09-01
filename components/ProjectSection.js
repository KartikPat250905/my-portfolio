"use client";

/**
 * ProjectSection.js
 * Renders all projects as a horizontal, scroll-snapped carousel instead of
 * a grid — keeps the section compact regardless of project count. Cards
 * scale/dim based on distance from center as you scroll, as the section's
 * single signature motion.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import ProjectCard from "./ProjectCard";
import { ProjectData } from "../data/ProjectData";

export default function ProjectsSection() {
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const [bar, setBar] = useState({ left: 0, width: 100 });

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;

    cardRefs.current.forEach((card) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(center - cardCenter);
      const norm = Math.min(dist / (trackRect.width / 2), 1);
      card.style.transform = `scale(${1 - norm * 0.08})`;
      card.style.opacity = String(1 - norm * 0.45);
    });

    const max = track.scrollWidth - track.clientWidth;
    const widthPct = (track.clientWidth / track.scrollWidth) * 100;
    const leftPct = max > 0 ? (track.scrollLeft / max) * (100 - widthPct) : 0;
    setBar({ left: leftPct, width: widthPct });
  }, []);

  useEffect(() => {
    update();
    const track = trackRef.current;
    if (!track) return;
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [update]);

  const scrollByAmount = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: track.clientWidth * 0.8 * dir, behavior: "smooth" });
  };

  return (
    <section id="projects" className="w-full overflow-x-hidden">
      <div className="relative mx-auto w-full max-w-full overflow-hidden px-2 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-52">
        <button
          type="button"
          aria-label="Scroll projects left"
          onClick={() => scrollByAmount(-1)}
          className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-2 z-10 h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--background)]/70 backdrop-blur-md transition hover:border-pink-500 hover:shadow-[0_0_0_4px_rgba(255,77,138,0.12)]"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="rotate-180" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Scroll projects right"
          onClick={() => scrollByAmount(1)}
          className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-2 z-10 h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--background)]/70 backdrop-blur-md transition hover:border-pink-500 hover:shadow-[0_0_0_4px_rgba(255,77,138,0.12)]"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="project-track-fade">
          <div ref={trackRef} className="project-track" role="list">
            {ProjectData.map((project, index) => (
              <div
                key={project.title}
                role="listitem"
                ref={(el) => (cardRefs.current[index] = el)}
                className="project-track-item"
              >
                <ProjectCard index={index} {...project} />
              </div>
            ))}
          </div>
        </div>

        <div className="project-progress-track" aria-hidden="true">
          <div
            className="project-progress-thumb"
            style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
          />
        </div>
      </div>
    </section>
  );
}