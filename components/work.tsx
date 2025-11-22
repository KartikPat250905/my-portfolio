"use client";

import { motion } from "framer-motion";
import { WorkData } from "../data/WorkData.js";

export default function WorkExperience() {
    return (
        <>
            <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow" style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>

                {/* Header Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        </svg>
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-2">Work Experience</h3>
                    <p className="text-gray-400 text-sm md:text-base">Professional journey and achievements</p>
                </div>

                {/* Experience Cards */}
                <div className="w-full space-y-6 md:space-y-8">
                    {WorkData.experience.map((exp, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-800 bg-opacity-50 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
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
                </div>

                {/* Summary Stats */}
                <motion.div
                    className="flex flex-wrap justify-center gap-8 mt-6 border-t border-gray-700 pt-6 w-full max-w-3xl text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <div>
                        <h4 className="text-xl font-semibold">
                            {WorkData.experience.length}
                        </h4>
                        <p className="text-gray-400 text-sm">Positions</p>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold">
                            {WorkData.experience.reduce((acc, exp) => acc + exp.technologies.length, 0)}
                        </h4>
                        <p className="text-gray-400 text-sm">Technologies</p>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold">
                            1+
                        </h4>
                        <p className="text-gray-400 text-sm">Years Experience</p>
                    </div>
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
