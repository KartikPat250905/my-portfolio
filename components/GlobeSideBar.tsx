"use client";
import { useState, useEffect, useRef } from "react";
import { indieflower } from "/app/font";

const locations = ["Helsinki", "Anand", "Toronto"];

export function GlobeSideBar({selectedLocation, setSelectedLocation}) {
  return (
    <div className="flex flex-col h-full">
      {/* Top menu with city buttons */}
      <div className="flex gap-2 p-2 w-65 bg-gray-100 rounded mb-4">
        {locations.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedLocation(city)}
            className={`px-3 py-1 rounded ${
              selectedLocation === city
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 p-2">
        {selectedLocation ? (
          <div>
            <h2 className="text-lg font-semibold">{selectedLocation}</h2>
            <p>
              {selectedLocation === "Helsinki" &&
                "Studied in Helsinki, Finland..."}
              {selectedLocation === "Anand" &&
                "Studied in Anand, India..."}
              {selectedLocation === "Toronto" &&
                "Studied in Toronto, Canada..."}
            </p>
          </div>
        ) : (
          <p>Please select a location from the globe or the navigation bar.</p>
        )}
      </div>
    </div>
  );
}