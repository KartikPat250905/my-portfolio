"use client";
/**
 * History.tsx
 * Displays an interactive globe and sidebar for viewing location-based history.
 * Combines Globe and GlobeSideBar components.
 */

import Globe from "./globe";
import { GlobeSideBar } from "./GlobeSideBar";
import { useState, useEffect, useRef } from "react";

/**
 * History component showing a globe and a sidebar for location selection.
 * Adds a simple fade/slide animation when the section scrolls into view.
 */
export function History() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            // run once so the entrance animation is visible
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="history-container flex flex-col lg:flex-row items-start w-full overflow-hidden"
    >
      <div className="history-globe w-full lg:w-2/3 xl:w-3/4">
        <Globe selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
      </div>
      <div className="history-sidebar w-full lg:w-1/3 xl:w-1/4">
        <GlobeSideBar
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
      </div>
    </div>
  );
}
