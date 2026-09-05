/**
 * work.tsx
 * Displays work experience cards and summary stats.
 * Theme: pulls from the app's CSS variables (--background, --text-primary,
 * --text-secondary, --border-color, --shadow-color) so it follows the
 * light/dark toggle instead of a fixed palette.
 *
 * Note: the page already renders a <SectionHeader title="Work Experience" />
 * above this component, so no title/subtitle is repeated here — just the
 * icon, which keeps its own small signature animation (drawn on, like a
 * sketch) rather than duplicating text.
 *
 * Animation concept: cards behave like notes pinned to a corkboard — they
 * settle into place with a slight rotation on entrance (staggered, so it
 * reads as pinning them up one at a time) and lift/straighten slightly on
 * hover, like picking one up. This ties into the notebook/sketch aesthetic
 * already used elsewhere (grid background, sketch-border) instead of a
 * generic fade-and-slide.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { WorkData } from "../data/WorkData.js";

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

// Cards enter with a slight, alternating tilt — like being pinned up by
// hand — then settle flat. Odd/even alternation avoids everything leaning
// the same way, which would read as a mistake rather than a choice.
const cardVariants = (tilt: number): Variants => ({
    hidden: { opacity: 0, y: 18, rotate: tilt, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }
    }
});

const statContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const statItemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// Draw-on timing for each stroke of the briefcase, run once when the icon
// enters view.
const drawPath = (delay: number): Variants => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: { pathLength: { duration: 0.5, ease: "easeInOut", delay }, opacity: { duration: 0.1, delay } }
    }
});

// Small performant number counter.
function NumberCounter({ value, duration = 500 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);

    useEffect(() => {
        startRef.current = null;
        const animate = (time: number) => {
            if (!startRef.current) startRef.current = time;
            const elapsed = time - startRef.current;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(eased * value));
            if (t < 1) frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [value, duration]);

    return <>{count}</>;
}

export default function WorkExperience() {
    const totalTech = WorkData.experience.reduce((acc, exp) => acc + exp.technologies.length, 0);

    return (
        <>
            <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl work-panel">
                {/* Icon — small signature moment, no repeated title/subtitle */}
                <motion.div
                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center work-icon-badge"
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <motion.svg
                        className="w-7 h-7 md:w-8 md:h-8"
                        fill="none"
                        stroke="#ffffff"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.6 }}
                    >
                        <motion.rect x="4" y="7" width="16" height="14" rx="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" variants={drawPath(0)} />
                        <motion.path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" variants={drawPath(0.35)} />
                        <motion.rect x="11.5" y="13" width="1" height="2" strokeWidth="1.5" strokeLinecap="round" variants={drawPath(0.55)} />
                        <motion.path d="M4 14h16" strokeWidth="1" strokeLinecap="round" variants={drawPath(0.6)} />
                    </motion.svg>
                </motion.div>

                {/* Experience Cards */}
                <motion.div
                    className="w-full space-y-6 md:space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {WorkData.experience.map((exp, index) => (
                        <motion.div
                            key={index}
                            className="rounded-xl p-4 sm:p-6 work-card"
                            variants={cardVariants(index % 2 === 0 ? -1.4 : 1.4)}
                            whileHover={{
                                rotate: 0,
                                y: -5,
                                transition: { type: "spring", stiffness: 260, damping: 20 }
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
                                        <span key={techIndex} className="px-2 py-1 text-xs rounded-lg work-tech-pill">
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
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.div className="flex flex-col" variants={statItemVariants}>
                        <h4 className="text-xl font-semibold work-stat-number">
                            <NumberCounter value={WorkData.experience.length} />
                        </h4>
                        <p className="text-sm work-subtext">Positions</p>
                    </motion.div>

                    <motion.div className="flex flex-col" variants={statItemVariants}>
                        <h4 className="text-xl font-semibold work-stat-number">
                            <NumberCounter value={totalTech} />
                        </h4>
                        <p className="text-sm work-subtext">Technologies</p>
                    </motion.div>

                    <motion.div className="flex flex-col" variants={statItemVariants}>
                        <h4 className="text-xl font-semibold work-stat-number">1+</h4>
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
                    transition: box-shadow 0.2s ease;
                }

                .work-card:hover {
                    box-shadow: 2px 2px 0px var(--shadow-color), -2px -2px 0px var(--border-color),
                        0 14px 28px var(--shadow-color);
                }

                .work-tech-pill {
                    background: color-mix(in srgb, var(--border-color) 25%, var(--background));
                    color: #f92ceb;
                    border: 1px solid var(--border-color);
                    transition: background-color 0.2s ease, transform 0.2s ease;
                }

                .work-tech-pill:hover {
                    background: color-mix(in srgb, var(--border-color) 50%, var(--background));
                    transform: translateY(-1px);
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