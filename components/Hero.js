"use client";

import { useEffect, useState } from "react";
import { patrick } from "../app/font";
import { Typewriter } from "react-simple-typewriter";
import Image from "next/image";
import { getAssetPath } from "../utils/paths";
import DownloadCV from "./DownloadCV";

export default function Hero() {
  const [greeting, setGreeting] = useState("Hello!");

  useEffect(() => {
    const hours = new Date().getHours();
    let nextGreeting;

    if (hours >= 5 && hours < 12) {
      nextGreeting = "Good morning!";
    } else if (hours >= 12 && hours < 18) {
      nextGreeting = "Good afternoon!";
    } else if (hours >= 18 && hours < 22) {
      nextGreeting = "Good evening!";
    } else {
      nextGreeting = "Good night!";
    }

    setGreeting(nextGreeting);
  }, []);

  return (
    <div
      className="h-[calc(100vh-80px)] lg:h-[85vh] w-full flex flex-col lg:flex-row justify-center items-center text-theme-secondary mb-20"
      id="home"
    >
      <div className="flex justify-center items-center p-2 sm:p-4 mb-4 sm:mb-6 lg:mb-0 lg:mr-8 animate-fade-in">
        <Image
          src={getAssetPath("/assets/images/memoji.webp")}
          alt="Kartik memoji"
          width={450}
          height={450}
          className="hero-image rounded-lg w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-cover"
          priority
        />
      </div>

      <div className="hero-content flex flex-col justify-center items-center lg:items-start text-center lg:text-left p-2 sm:p-4">
        <h1
          className={`hero-title text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-7xl ${patrick.className} p-3 sm:p-4 lg:p-4 tracking-wide`}
        >
          Hello, {greeting} 👋
        </h1>

        <h1
          className={`hero-subtitle text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl ${patrick.className} p-3 sm:p-4 lg:p-4 tracking-wide`}
        >
          I'm Kartik, currently{" "}
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

          <div className="mt-6 lg:mt-8">
            <DownloadCV className="hero-cta lg:justify-start justify-center" />
          </div>
      </div>
    </div>
  );
}