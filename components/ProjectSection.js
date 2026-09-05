"use client";

/**
 * ProjectSection.js
 * Renders projects as a 3D "coverflow" on wider screens — one project
 * centered and focused, with one dimmed preview card on either side.
 * Below 800px, the coverflow math causes side previews to overlap the
 * center card, so it switches to a clean slide carousel instead: only the
 * center card is visible, neighbors slide fully off-screen rather than
 * tucking behind it.
 *
 * Navigation:
 * - Left/right arrow keys (any screen size).
 * - Nav arrow buttons — positioned further out from the card on wide
 *   screens, but pulled in close to the card edges on small screens so
 *   they stay on-screen instead of overflowing past the viewport.
 * - Touch swipe (left/right) on the stage, for touch devices.
 * - Clicking a side preview card to bring it to center (wide screens only).
 *
 * Entrance animation: the whole section fades/slides up once via
 * .animate-wrapper when it scrolls into view (triggered by its own
 * IntersectionObserver below). This is intentionally applied at the
 * section level rather than per-card — each card's opacity/transform is
 * already fully driven by inline styles for the coverflow/carousel
 * positioning, and inline styles always take precedence over stylesheet
 * rules, so putting .animate-wrapper directly on the cards had no visible
 * effect.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import ProjectCard from "./ProjectCard";
import { ProjectData } from "../data/ProjectData";

const COMPACT_BREAKPOINT = 800;
const SWIPE_THRESHOLD = 40; // px — minimum horizontal drag to register a swipe

export default function ProjectsSection() {
  const [current, setCurrent] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const total = ProjectData.length;
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);
  const sectionRef = useRef(null); // for the section-level entrance fade only

  useEffect(() => {
    const check = () => setIsCompact(window.innerWidth < COMPACT_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // One-time reveal of the whole projects section on scroll-into-view.
  // Kept separate from the carousel's own per-card opacity/transform logic.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      el.classList.add("in-view");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target); // one-time reveal only
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD) {
      if (touchDeltaX.current < 0) {
        next();
      } else {
        prev();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <section id="projects" className="w-full overflow-x-hidden">
      <div
        ref={sectionRef}
        className="relative mx-auto w-full max-w-full px-2 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-52 animate-wrapper"
      >
        <div className="relative mx-auto w-full max-w-4xl">
          {/* Nav arrows — always visible. On small screens they sit close
              to the card edges (inside the section's safe area); on wider
              screens they move further out for breathing room. */}
          <button
            type="button"
            aria-label="Previous project"
            onClick={prev}
            className="flex absolute top-1/2 -translate-y-1/2 left-0 sm:-left-10 md:-left-16 lg:-left-20 z-30 h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--background)]/80 backdrop-blur-md transition hover:border-pink-500 hover:shadow-[0_0_0_4px_rgba(255,77,138,0.12)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-180" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={next}
            className="flex absolute top-1/2 -translate-y-1/2 right-0 sm:-right-10 md:-right-16 lg:-right-20 z-30 h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--background)]/80 backdrop-blur-md transition hover:border-pink-500 hover:shadow-[0_0_0_4px_rgba(255,77,138,0.12)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Stage: 3D coverflow on wide screens, flat slide carousel on
              narrow ones. overflow is only clipped in compact mode (to hide
              the off-screen slide neighbors) — on wide screens it must stay
              visible or the rotated/scaled coverflow cards get cut off at
              their far edge. Touch handlers enable swipe navigation. */}
          <div
            className="relative w-full h-[440px] sm:h-[420px] flex items-center justify-center touch-pan-y"
            style={{
              perspective: isCompact ? "none" : "1600px",
              overflow: isCompact ? "hidden" : "visible",
            }}
            tabIndex={0}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="relative w-full h-full"
              style={{ transformStyle: isCompact ? "flat" : "preserve-3d" }}
            >
              {ProjectData.map((project, index) => {
                let offset = index - current;
                // shortest wrap-around distance (so it loops both ways)
                if (offset > total / 2) offset -= total;
                if (offset < -total / 2) offset += total;

                const abs = Math.abs(offset);
                const isCenter = offset === 0;

                let transform;
                let opacity;
                let filter;
                let hidden;
                let zIndex;

                if (isCompact) {
                  // Flat slide: only the center card is visible/interactive.
                  // Neighbors slide fully off-screen instead of overlapping.
                  hidden = abs > 1;
                  const slideX = offset === 0 ? 0 : offset > 0 ? 100 : -100;
                  transform = `translateX(${slideX}%)`;
                  opacity = isCenter ? 1 : 0;
                  filter = "none";
                  zIndex = isCenter ? total : 0;
                } else {
                  // 3D coverflow for wider screens.
                  hidden = abs > 1;
                  const translateX = offset * 46; // %
                  const translateZ = -abs * 220; // px
                  const rotateY = offset * -38; // deg
                  const scale = 1 - abs * 0.18;
                  transform = `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
                  opacity = isCenter ? 1 : Math.max(0.15, 0.55 - abs * 0.2);
                  filter = isCenter ? "none" : "grayscale(0.55) blur(0.5px)";
                  zIndex = total - abs;
                }

                return (
                  <div
                    key={project.title}
                    onClick={() => !isCompact && !isCenter && goTo(index)}
                    className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out"
                    style={{
                      transform,
                      opacity: hidden ? 0 : opacity,
                      zIndex,
                      filter,
                      cursor: !isCompact && !isCenter ? "pointer" : "default",
                      pointerEvents: hidden ? "none" : "auto",
                    }}
                  >
                    <div className="w-[80%] sm:w-[62%] md:w-[48%] lg:w-[38%] max-w-[380px] h-[85%]">
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
          <p className="text-xs text-theme-secondary tracking-wide sm:hidden">
            Swipe or use the arrows to browse
          </p>
          <p className="text-xs text-theme-secondary tracking-wide">
            {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}