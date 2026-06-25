/**
 * work.tsx
 * Displays a list of work experiences using animated cards and summary stats.
 * Data is sourced from WorkData and rendered with Framer Motion animations.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { WorkData } from "../data/WorkData.js";

/**
 * WorkExperience component renders professional experience cards and summary stats.
 * Uses Framer Motion for animation and supports multiple periods, technologies, and responsibilities.
 */
export default function WorkExperience() {
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } }
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const iconVariants = {
        hidden: { opacity: 0, y: -6, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } }
    };

        const cardVariants = {
            hidden: { opacity: 0, y: 20, scale: 0.995 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } }
        };

    const statContainerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } }
    };

    const statItemVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.28 } }
    };

    // Small performant number counter (fast fade/slide feel)
    function NumberCounter({ value, duration = 320 }: { value: number; duration?: number }) {
        const [count, setCount] = useState(0);
        const frameRef = useRef<number | null>(null);
        const startRef = useRef<number | null>(null);

        useEffect(() => {
            startRef.current = null;
            const animate = (time: number) => {
                if (!startRef.current) startRef.current = time;
                const elapsed = time - startRef.current;
                const t = Math.min(elapsed / duration, 1);
                const current = Math.round(t * value);
                setCount(current);
                if (t < 1) frameRef.current = requestAnimationFrame(animate);
            };
            frameRef.current = requestAnimationFrame(animate);
            return () => {
                if (frameRef.current) cancelAnimationFrame(frameRef.current);
            };
        }, [value, duration]);

        return <>{count}</>;
    }
    return (
        <>
            <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow" style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>

                {/* Header Section */}
                <motion.div className="flex flex-col items-center text-center" variants={headerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
                    <motion.div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg" variants={iconVariants}>
                        <motion.svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            {/* Main briefcase body - larger dimensions */}
                            <rect x="4" y="7" width="16" height="14" rx="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            {/* Briefcase handle on top */}
                            <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            {/* Briefcase clasp/lock in center */}
                            <rect x="11.5" y="13" width="1" height="2" strokeWidth="1.5" strokeLinecap="round"/>
                            {/* Horizontal dividing line */}
                            <path d="M4 14h16" strokeWidth="1" strokeLinecap="round"/>
                            {/* Corner reinforcements */}
                            <path d="M4 7l1 1M20 7l-1 1M4 21l1-1M20 21l-1-1" strokeWidth="1" strokeLinecap="round"/>
                        </motion.svg>
                    </motion.div>
                    <motion.h3 className="text-xl md:text-2xl font-semibold mb-2" variants={headerVariants}>Work Experience</motion.h3>
                    <motion.p className="text-gray-400 text-sm md:text-base" variants={headerVariants}>Professional journey and achievements</motion.p>
                </motion.div>

                {/* Experience Cards */}
                    <motion.div className="w-full space-y-6 md:space-y-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }}>
                    {WorkData.experience.map((exp, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-800 bg-opacity-50 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg"
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            whileHover={{ scale: 1.02, y: -6, transition: { type: 'spring', stiffness: 300, damping: 24 } }}
                        >
                            {/* Job Title and Company */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                                <div className="flex-1">
                                    <h4 className="text-lg md:text-xl font-semibold text-white mb-1">
                                        {exp.title}
                                    </h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                        <span className="text-blue-400 font-medium">{exp.company}</span>
                                        <span className="text-gray-400 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {exp.location}
                                        </span>
                                    </div>
                                </div>

                                {/* Date/Period Display */}
                                <div className="flex flex-col items-start sm:items-end text-sm text-gray-400">
                                    {exp.periods ? (
                                        exp.periods.map((period, periodIndex) => (
                                            <span key={periodIndex} className="mb-1">{period}</span>
                                        ))
                                    ) : (
                                        <span>{exp.period}</span>
                                    )}
                                </div>
                            </div>

                            {/* Technologies */}
                            <div className="mb-4">
                                <h5 className="text-sm font-semibold text-gray-300 mb-2">Technologies Used:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {exp.technologies.map((tech, techIndex) => (
                                        <span
                                            key={techIndex}
                                            className="px-2 py-1 text-xs bg-blue-900 bg-opacity-50 text-blue-200 rounded-lg border border-blue-700 hover:bg-opacity-70 transition-colors duration-200"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Responsibilities */}
                            <div>
                                <h5 className="text-sm font-semibold text-gray-300 mb-3">Key Responsibilities:</h5>
                                <ul className="space-y-2">
                                    {exp.responsibilities.map((responsibility, respIndex) => (
                                        <li key={respIndex} className="flex items-start gap-3 text-sm md:text-base text-gray-300">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="leading-relaxed">{responsibility}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Summary Stats */}
                <motion.div
                    className="flex flex-wrap justify-center gap-8 mt-6 border-t border-gray-700 pt-6 w-full max-w-3xl text-center"
                    variants={statContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div className="flex flex-col" variants={statItemVariants}>
                        <h4 className="text-xl font-semibold">
                            <NumberCounter value={WorkData.experience.length} duration={260} />
                        </h4>
                        <p className="text-gray-400 text-sm">Positions</p>
                    </motion.div>

                    <motion.div className="flex flex-col" variants={statItemVariants}>
                        <h4 className="text-xl font-semibold">
                            <NumberCounter value={WorkData.experience.reduce((acc, exp) => acc + exp.technologies.length, 0)} duration={320} />
                        </h4>
                        <p className="text-gray-400 text-sm">Technologies</p>
                    </motion.div>

                    <motion.div className="flex flex-col" variants={statItemVariants}>
                        <h4 className="text-xl font-semibold">
                            <span>1+</span>
                        </h4>
                        <p className="text-gray-400 text-sm">Years Experience</p>
                    </motion.div>
                </motion.div>
            </div>

            <style jsx>{`
                .stats-strong-shadow {
                    /* stronger elevation by default */
                    box-shadow: 0 20px 50px rgba(0,0,0,0.18);
                }

                /* pinkish stronger shadow in dark mode (system preference) */
                @media (prefers-color-scheme: dark) {
                    .stats-strong-shadow {
                        box-shadow: 0 25px 60px rgba(255,77,138,0.16);
                    }
                }

                /* pinkish stronger shadow when using class-based dark mode (e.g. .dark on html) */
                :global(.dark) .stats-strong-shadow {
                    box-shadow: 0 25px 60px rgba(255,77,138,0.16);
                }
            `}</style>
        </>
    );
}
