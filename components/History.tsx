"use client";
import Globe from "./globe";
import { GlobeSideBar } from "./GlobeSideBar";
import { useState } from "react";

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
