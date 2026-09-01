"use client";

/**
 * SectionHeading.js
 * Section title with a hand-drawn underline that draws itself in once the
 * heading scrolls into view. This is the section's single signature motion
 * moment — everything else in the section stays quiet.
 */

import { spaceGrotesk } from "/app/font";
import { useEffect, useRef } from "react";

export default function SectionHeading({ title }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            path.style.transition = "stroke-dashoffset 700ms ease";
            path.style.strokeDashoffset = "0";
            io.unobserve(wrap);
          }
        });
      },
      { threshold: 0.6 }
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="mb-8 sm:mb-10">
      <h1
        className={`text-3xl sm:text-4xl tracking-tight ${spaceGrotesk.className} text-theme-primary inline-block`}
      >
        {title}
      </h1>
      <svg
        className="block mt-1"
        width="150"
        height="14"
        viewBox="0 0 150 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d="M2 9 C 32 2, 62 12, 92 5 S 134 9, 148 3"
          stroke="#ff4d8a"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}