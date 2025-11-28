/**
 * History.tsx
 * Displays an interactive globe and sidebar for viewing location-based history.
 * Combines Globe and GlobeSideBar components.
 */

"use client";
import Globe from "./globe";
import { GlobeSideBar } from "./GlobeSideBar";
import { useState } from "react";

/**
 * History component showing a globe and a sidebar for location selection.
 */
export function History()
{
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    return (
        <div className="flex flex-col lg:flex-row items-start w-full overflow-hidden">
        <div className="w-full lg:w-2/3 xl:w-3/4">
            <Globe selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}/>
        </div>
        <div className="w-full lg:w-1/3 xl:w-1/4">
            <GlobeSideBar
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
            />
        </div>
        </div>
    );
}
