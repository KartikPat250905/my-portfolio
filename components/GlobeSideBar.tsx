/**
 * GlobeSideBar.tsx
 * Sidebar component for selecting and displaying information about locations.
 * Used in conjunction with a globe visualization.
 * 
 * Props:
 * - selectedLocation: currently selected location (string or null)
 * - setSelectedLocation: function to update the selected location
 */

"use client";
import { useState } from "react";
import { indieflower, lato } from "../app/font";

const locations = ["Anand", "Helsinki", "Toronto"];

/**
 * Sidebar for selecting a location and displaying related information.
 * @param selectedLocation - The currently selected location.
 * @param setSelectedLocation - Function to update the selected location.
 */
export function GlobeSideBar({
  selectedLocation,
  setSelectedLocation,
}: {
  selectedLocation: string | null;
  setSelectedLocation: (loc: string) => void;
}) {
  const info: Record<string, string> = {
    Anand:
      "I grew up in Anand, India, where I completed my schooling through 12th grade with 86%. Along the way, I earned a 1440 on the SAT and a 6.5 on the IELTS. I was also an Abacus Grand Master, winning both national and state-level awards.",
    Helsinki:
      "In Helsinki, Finland, I worked at Cydora as a Junior AI Developer (June 2025–Present) and previously as an AI Intern (May–June 2025), while studying for a Bachelor in IT at Metropolia University of Applied Sciences, where I achieved a 5/5 GPA and won two hackathons. I also attended Hive Helsinki, which is a world-class, free coding school funded by Supercell and part of the global 42 network. In 2025, 42 was ranked the 3rd most innovative educational institution in the world by WURI. Hive Helsinki gave me the chance to learn by building real projects, surrounded by an amazing community.",
    Toronto:
      "I’m now continuing my studies at Toronto Metropolitan University, focusing on technology, creativity, and innovation.",
  };

  return (
    <div className="flex flex-col h-auto lg:h-full w-full lg:w-[300px] rounded-xl shadow-md p-4 mt-4 lg:mt-20 min-h-[200px] lg:min-h-[400px]" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top menu */}
      <div className="flex flex-wrap justify-center lg:justify-around gap-2 mb-4">
        {locations.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedLocation(city)}
            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-all ${selectedLocation === city
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {selectedLocation ? (
          <div className={`${lato.className}`}>
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              {selectedLocation}
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary">{info[selectedLocation]}</p>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-300 text-center lg:text-left text-theme-secondary">
            Select a location from the menu or click a label on the globe to
            learn more.
          </p>
        )}
      </div>
    </div>
  );
}
