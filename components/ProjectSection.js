"use client";


import { useCallback, useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import { ProjectData } from "../data/ProjectData";

export default function ProjectsSection() {
  const [current, setCurrent] = useState(0);
  const total = ProjectData.length;

  const goTo = useCallback(
    (index) => {
      setCurrent(((index % total) + total) % total); // wrap around
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  return (
    <section id="projects" className="w-full overflow-x-hidden">
      <div className="relative mx-auto w-full max-w-full px-2 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-52">
        <div className="relative mx-auto w-full max-w-4xl">
          {/* Nav arrows */}
          <button
            type="button"
            aria-label="Previous project"
            onClick={prev}
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6 z-30 h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--background)]/70 backdrop-blur-md transition hover:border-pink-500 hover:shadow-[0_0_0_4px_rgba(255,77,138,0.12)]"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="rotate-180" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={next}
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 z-30 h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--background)]/70 backdrop-blur-md transition hover:border-pink-500 hover:shadow-[0_0_0_4px_rgba(255,77,138,0.12)]"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* 3D stage */}
          <div
            className="relative w-full h-[440px] sm:h-[420px] flex items-center justify-center [perspective:1600px]"
            tabIndex={0}
          >
            <div className="relative w-full h-full [transform-style:preserve-3d]">
              {ProjectData.map((project, index) => {
                let offset = index - current;
                // shortest wrap-around distance (so it loops both ways)
                if (offset > total / 2) offset -= total;
                if (offset < -total / 2) offset += total;

                const abs = Math.abs(offset);
                const isCenter = offset === 0;
                const hidden = abs > 2; // only render a small window for perf

                const translateX = offset * 46; // %
                const translateZ = -abs * 220; // px
                const rotateY = offset * -38; // deg
                const scale = 1 - abs * 0.18;
                const opacity = isCenter ? 1 : Math.max(0.15, 0.55 - abs * 0.2);

                return (
                  <div
                    key={project.title}
                    onClick={() => !isCenter && goTo(index)}
                    className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out"
                    style={{
                      transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      opacity: hidden ? 0 : opacity,
                      zIndex: total - abs,
                      filter: isCenter ? "none" : "grayscale(0.55) blur(0.5px)",
                      cursor: isCenter ? "default" : "pointer",
                      pointerEvents: hidden ? "none" : "auto",
                    }}
                  >
                    <div className="w-[78%] sm:w-[62%] md:w-[48%] lg:w-[38%] max-w-[380px] h-[85%]">
                      <ProjectCard
                        index={index}
                        isCenter={isCenter}
                        {...project}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Counter + dots */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {ProjectData.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to project ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-6 bg-pink-500"
                    : "w-2 bg-[var(--border-color)] hover:bg-pink-300"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-theme-secondary tracking-wide">
            {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}