"use client";
// Contact.tsx
import React from "react";
import SectionHeader from "./SectionHeader";
import { FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function Contact() {
  return (
    <section className="w-full flex flex-col items-center my-4 sm:my-6 md:my-8 lg:my-10 xl:my-12">
      <SectionHeader title="Contact" id="contact"/>
      <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 rounded-2xl shadow-xl m-2 sm:m-4 md:m-6 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl stats-strong-shadow"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r to-[#ff10e7] via-[#ff6fa3] from-[#f806f0] bg-clip-text text-transparent mb-1 sm:mb-2 md:mb-4 text-theme-secondary">
          Kartik Patel
        </h3>
        <div className="flex flex-col gap-1 sm:gap-2 md:gap-3 text-base sm:text-lg md:text-xl text-white/80 w-full">
          <div className="flex items-center gap-3">
            <FaPhone className="text-blue-400" />
            <a href="tel:+358403230116" className="hover:underline text-theme-secondary">+1 437 556 2590</a>
          </div>
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-yellow-400" />
            <a href="mailto:kartikpat25@gmail.com" className="hover:underline text-theme-secondary">kartikpat25@gmail.com</a>
          </div>
          <div className="flex items-center gap-3">
            <FaLinkedin className="text-blue-500" />
            <a
              href="https://www.linkedin.com/in/kartik-patel-a042872b6/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-theme-secondary"
            >
              linkedin.com/in/kartik-patel-a042872b6
            </a>
          </div>
          <div className="flex items-center gap-3">
            <FaGithub className="text-gray-300" />
            <a
              href="https://github.com/KartikPat250905"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-theme-secondary"
            >
              github.com/KartikPat250905
            </a>
          </div>
        </div>
      </div>
      <style jsx>{`
        .stats-strong-shadow {
          box-shadow: 0 20px 50px rgba(0,0,0,0.18);
        }
        @media (prefers-color-scheme: dark) {
          .stats-strong-shadow {
            box-shadow: 0 25px 60px rgba(255,77,138,0.16);
          }
        }
        :global(.dark) .stats-strong-shadow {
          box-shadow: 0 25px 60px rgba(255,77,138,0.16);
        }
      `}</style>
    </section>
  );
}
