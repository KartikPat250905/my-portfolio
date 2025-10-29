"use client";

import { patrick } from "../app/font";
import { Typewriter } from 'react-simple-typewriter';
import Image from "next/image";
import { getAssetPath } from "../utils/paths";

export default function Hero() {
    const hours = new Date().getHours();
    let greeting;
    if (hours >= 5 && hours < 12) {
        greeting = "Good morning!";
    } else if (hours >= 12 && hours < 18) {
        greeting = "Good afternoon!";
    } else if (hours >= 18 && hours < 22) {
        greeting = "Good evening!";
    } else {
        greeting = "Good night!";
    }
    //TODO: add a avatar wavying hands besides it
    return (
        <div className="min-h-[85vh] sm:h-[90vh] w-full flex flex-col lg:flex-row text-gray-500" id="home">
            <div className="w-full lg:w-1/2 h-auto lg:h-full flex justify-center items-center p-2 sm:p-4 lg:pl-20">
            <Image
                src={getAssetPath("/assets/images/memoji.webp")}
                alt="My App Screenshot"
                width={450}
                height={450}
                className="rounded-lg w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[450px] xl:h-[450px] object-cover"
                priority
            />
            </div>
            <div className="flex flex-col w-full lg:w-1/2 h-auto lg:h-full justify-center items-center lg:items-start text-center lg:text-left p-2 sm:p-4 lg:p-6 m-0">
                <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl ${patrick.className} p-3 sm:p-4 lg:p-4 tracking-wide`}>Hello, {greeting} 👋</h1>
                <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl ${patrick.className} p-3 sm:p-4 lg:p-4 tracking-wide`}>
                    I&apos;m Kartik, currently{' '}
                    <span className="text-indigo-500">
                    <Typewriter
                        words={["exploring", "building", "learning"]}
                        loop={true}
                        cursor
                        cursorStyle="|"
                        typeSpeed={70}
                        deleteSpeed={50}
                        delaySpeed={2000}
                    />
                    </span>
                </h1>
            </div>
        </div>
    );
}
