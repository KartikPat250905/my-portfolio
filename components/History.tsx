"use client";
import Globe from "./globe";
import { GlobeSideBar } from "./GlobeSideBar";
import { useState } from "react";

export function History()
{
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    return (
        <div className="flex items-start">
        <Globe selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}/>
        <GlobeSideBar
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
        />
        </div>
    );
}