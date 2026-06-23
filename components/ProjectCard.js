"use client";

/**
 * ProjectCard.js
 * Displays a single project card with title, description, and GitHub link.
 */

import { indieflower, lato, patrick } from "/app/font";
import { useEffect, useRef } from "react";

/**
 * ProjectCard component for showing project details.
 * @param {Object} props
 * @param {string} props.title - Project title
 * @param {string} props.desc - Project description
 * @param {string} props.github - GitHub repository URL
 * @param {number} props.index - index for staggered animation
 */
export default function ProjectCard({ title, desc, github, index = 0 }) {
  const ref = useRef(null);

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

  return (
    <div
      ref={ref}
      className={`project-card p-3 sm:p-6 lg:p-8 w-full ${indieflower.className}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div
        className={`p-5 rounded-lg border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(255,77,138,0.16)] transform transition-all duration-500 hover:-translate-y-1 hover:shadow-lg`}
        style={{ backgroundColor: "var(--background)" }}
      >
        <h2 className={`text-2xl mb-2 ${patrick.className} text-theme-primary`}>{title}</h2>
        <p className={`text-md mb-4 ${lato.className} text-theme-secondary`}>{desc}</p>
        <a href={github} target="_blank" className="text-xl text-pink-600 hover:underline font-medium">
          See more on GitHub
        </a>
      </div>
    </div>
  );
}
