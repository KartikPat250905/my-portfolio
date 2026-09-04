/**
 * work.tsx
 * Displays a list of work experiences using animated cards and summary stats.
 * Data is sourced from WorkData and rendered with Framer Motion animations.
 * Theme: pulls from the app's CSS variables (--background, --text-primary,
 * --text-secondary, --border-color, --shadow-color) so it follows the
 * light/dark toggle instead of a fixed palette.
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
        hidden: { opacity: 0, y: -6, scale: 0.9, rotate: -8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            transition: { duration: 0.5, type: "spring", stiffness: 220, damping: 18 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 24, scale: 0.99 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: "easeOut" } }
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
            <div
                className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl work-panel"
            >
                {/* Header Section */}
                <motion.div
                    className="flex flex-col items-center text-center"
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                >
                    <motion.div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 work-icon-badge" variants={iconVariants}>
                        <motion.svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="#ffffff" viewBox="0 0 24 24" aria-hidden="true">
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
                    <motion.h3 className="text-xl md:text-2xl font-semibold mb-2 work-heading" variants={headerVariants}>Work Experience</motion.h3>
                    <motion.p className="text-sm md:text-base work-subtext" variants={headerVariants}>Professional journey and achievements</motion.p>
                </motion.div>

                {/* Experience Cards */}
                <motion.div
                    className="w-full space-y-6 md:space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.12 }}
                >
                    {WorkData.experience.map((exp, index) => (
                        <motion.div
                            key={index}
                            className="rounded-xl p-4 sm:p-6 work-card"
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            whileHover={{
                                scale: 1.015,
                                y: -6,
                                transition: { type: "spring", stiffness: 300, damping: 24 }
                            }}
                        >
                            {/* Job Title and Company */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                                <div className="flex-1">
                                    <h4 className="text-lg md:text-xl font-semibold work-heading mb-1">
                                        {exp.title}
                                    </h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                        <span className="font-medium work-company">{exp.company}</span>
                                        <span className="text-sm flex items-center gap-1 work-subtext">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {exp.location}
                                        </span>
                                    </div>
                                </div>

                                {/* Date/Period Display */}
                                <div className="flex flex-col items-start sm:items-end text-sm work-subtext">
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
                                <h5 className="text-sm font-semibold mb-2 work-label">Technologies Used:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {exp.technologies.map((tech, techIndex) => (
                                        <span
                                            key={techIndex}
                                            className="px-2 py-1 text-xs rounded-lg work-tech-pill"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Responsibilities */}
                            <div>
                                <h5 className="text-sm font-semibold mb-3 work-label">Key Responsibilities:</h5>
                                <ul className="space-y-2">
                                    {exp.responsibilities.map((responsibility, respIndex) => (
                                        <li key={respIndex} className="flex items-start gap-3 text-sm md:text-base work-subtext">
                                            <div className="work-bullet mt-2 flex-shrink-0"></div>
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
                    className="flex flex-wrap justify-center gap-8 mt-6 pt-6 w-full max-w-3xl text-center work-stats-row"
                    variants={statContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div className="flex flex-col" variants={statItemVariants}>
                        <h4 className="text-xl font-semibold work-stat-number">
                            <NumberCounter value={WorkData.experience.length} duration={260} />
                        </h4>
                        <p className="text-sm work-subtext">Positions</p>
                    </motion.div>

                    <motion.div className="flex flex-col" variants={statItemVariants}>
                        <h4 className="text-xl font-semibold work-stat-number">
                            <NumberCounter value={WorkData.experience.reduce((acc, exp) => acc + exp.technologies.length, 0)} duration={320} />
                        </h4>
                        <p className="text-sm work-subtext">Technologies</p>
                    </motion.div>

                    <motion.div className="flex flex-col" variants={statItemVariants}>
                        <h4 className="text-xl font-semibold work-stat-number">
                            <span>1+</span>
                        </h4>
                        <p className="text-sm work-subtext">Years Experience</p>
                    </motion.div>
                </motion.div>
            </div>

            <style jsx>{`
                .work-panel {
                    background: var(--background);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                    box-shadow: 2px 2px 0px var(--shadow-color), -2px -2px 0px var(--border-color);
                    transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
                }

                .work-icon-badge {
                    background: linear-gradient(135deg, #f92ceb 0%, var(--shadow-color) 100%);
                    box-shadow: 0 0 22px var(--border-color), 0 8px 18px rgba(0, 0, 0, 0.25);
                }

                .work-heading {
                    color: var(--text-primary);
                }

                .work-subtext {
                    color: var(--text-secondary);
                }

                .work-label {
                    color: var(--text-secondary);
                }

                .work-company {
                    color: #f92ceb;
                    text-shadow: 0 0 10px var(--border-color);
                }

                .work-card {
                    background: var(--background);
                    border: 2px solid var(--border-color);
                    box-shadow: 1px 1px 0px var(--shadow-color), -1px -1px 0px var(--border-color);
                    transition: box-shadow 0.3s ease, background-color 0.3s ease;
                }

                .work-card:hover {
                    box-shadow: 2px 2px 0px var(--shadow-color), -2px -2px 0px var(--border-color),
                        0 14px 32px var(--shadow-color);
                }

                .work-tech-pill {
                    background: color-mix(in srgb, var(--border-color) 25%, var(--background));
                    color: #f92ceb;
                    border: 1px solid var(--border-color);
                    transition: background-color 0.2s ease;
                }

                .work-tech-pill:hover {
                    background: color-mix(in srgb, var(--border-color) 50%, var(--background));
                }

                .work-bullet {
                    width: 6px;
                    height: 6px;
                    border-radius: 9999px;
                    background: #f92ceb;
                    box-shadow: 0 0 6px var(--border-color);
                }

                .work-stats-row {
                    border-top: 1px solid var(--border-color);
                }

                .work-stat-number {
                    color: var(--text-primary);
                    text-shadow: 0 0 10px var(--border-color);
                }
            `}</style>
        </>
    );
}