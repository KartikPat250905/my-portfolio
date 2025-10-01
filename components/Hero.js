"use client";

import { patrick } from "@/app/font";
import { Typewriter } from 'react-simple-typewriter';
import Image from "next/image";

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
        <div className="h-[87vh] w-full flex flex-row text-gray-500" id="home">
            <div className="w-1/2 h-full flex justify-center items-center pl-35">
            <Image
                src="/images/memoji.webp"
                alt="My App Screenshot"
                width={450}
                height={450}
                className="rounded-lg"
                priority
            />
            </div>
            <div className="flex flex-col w-1/2 h-full justify-center items-start text-left p-8 m-0">
                <h1 className={`text-6xl ${patrick.className} p-4 tracking-wide`}>Hello, {greeting} 👋</h1>
                <h1 className={`text-5xl ${patrick.className} p-4 tracking-wide`}>
                    I'm Kartik, currently{' '}
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