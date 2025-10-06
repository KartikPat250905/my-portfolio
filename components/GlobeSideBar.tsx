"use client";
import { useState } from "react";
import { indieflower, lato } from "/app/font";

const locations = ["Anand", "Helsinki", "Toronto"];

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
      "Later, I moved to Finland to study at Metropolia University of Applied Sciences, where I got in through my SAT results. I also joined Hive Helsinki, a coding program by Supercell and part of School 42 Paris. I finished my first year with a 5/5 GPA and two hackathon wins.",
    Toronto:
      "I’m now continuing my studies at Toronto Metropolitan University, focusing on technology, creativity, and innovation.",
  };

  return (
    <div className="flex flex-col h-full w-[300px] bg-white rounded-xl shadow-md p-4 mt-20">
      {/* Top menu */}
      <div className="flex justify-around mb-4">
        {locations.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedLocation(city)}
            className={`px-3 py-1 rounded transition-all ${selectedLocation === city
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
            <h2 className="text-lg font-semibold mb-2">
              {selectedLocation}
            </h2>
            <p className="text-sm leading-relaxe text-gray-600">{info[selectedLocation]}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Select a location from the menu or click a label on the globe to
            learn more.
          </p>
        )}
      </div>
    </div>
  );
}
