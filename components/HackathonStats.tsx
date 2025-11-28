/**
 * HackathonStats component.
 * Displays a summary and interactive cards for hackathon achievements, including stats, technologies, and modal details.
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { sampleHackathons } from "../data/hackathonData.js";

/**
 * Hackathon object type.
 */
interface Hackathon {
  name: string;
  date?: string;
  description: string;
  technologies: string[];
  position?: string; // "1st Place", "2nd Place", "Winner", etc.
  isWinner: boolean;
  category?: string;
}

/**
 * Props for HackathonStats component.
 */
interface HackathonStatsProps {
  hackathons?: Hackathon[];
}

/**
 * Main HackathonStats React component.
 * Renders hackathon stats, technology tags, cards, and modal for details.
 */
export default function HackathonStats({ hackathons }: HackathonStatsProps) {
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [expandedTechCards, setExpandedTechCards] = useState<Set<number>>(new Set());
  const [showAllTechnologies, setShowAllTechnologies] = useState(false);

  // Use sample data if no hackathons provided
  const displayHackathons = hackathons && hackathons.length > 0 ? hackathons : sampleHackathons;

  const totalHackathons = displayHackathons.length;
  const totalWins = displayHackathons.filter(h => h.isWinner).length;
  const winRate = totalHackathons > 0 ? ((totalWins / totalHackathons) * 100).toFixed(1) : "0";
  
  // Get all unique technologies
  const allTechnologies = Array.from(new Set(displayHackathons.flatMap(h => h.technologies)));
  const topTechnologies = allTechnologies;

  // Show empty state if no hackathons
  if (displayHackathons.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow" style={{backgroundColor: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)'}}>
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2ZM8 21L9.5 16.5L15 15L9.5 13.5L8 9L6.5 13.5L1 15L6.5 16.5L8 21Z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hackathon Journey
          </h2>
          <p className="text-gray-400 mt-1">No hackathons added yet</p>
        </div>
      </div>
    );
  }

  /**
   * Returns the appropriate icon for a winner's position.
   */
  const getPositionIcon = (isWinner: boolean, position?: string) => {
    if (!isWinner) return null;

    if (position?.includes("1st") || position?.toLowerCase().includes("winner")) {
      return "🏆";
    } else if (position?.includes("2nd")) {
      return "🥈";
    } else if (position?.includes("3rd")) {
      return "🥉";
    } else {
      return "🏅";
    }
  };

  /**
   * Returns the border class for a hackathon card based on win status and position.
   */
  const getCardBorderClass = (isWinner: boolean, position?: string) => {
    if (!isWinner) return "border-gray-700";

    if (position?.includes("1st") || position?.toLowerCase().includes("winner")) {
      return "border-yellow-400 shadow-yellow-400/20 shadow-lg";
    } else if (position?.includes("2nd")) {
      return "border-gray-300 shadow-gray-300/20 shadow-lg";
    } else if (position?.includes("3rd")) {
      return "border-orange-400 shadow-orange-400/20 shadow-lg";
    } else {
      return "border-green-400 shadow-green-400/20 shadow-lg";
    }
  };

  /**
   * Returns the background gradient for a winner's card.
   */
  const getWinnerGradient = (isWinner: boolean, position?: string) => {
    if (!isWinner) return "";

    if (position?.includes("1st") || position?.toLowerCase().includes("winner")) {
      return "bg-gradient-to-br from-yellow-400/10 to-orange-500/10";
    } else if (position?.includes("2nd")) {
      return "bg-gradient-to-br from-gray-300/10 to-gray-500/10";
    } else if (position?.includes("3rd")) {
      return "bg-gradient-to-br from-orange-400/10 to-red-500/10";
    } else {
      return "bg-gradient-to-br from-green-400/10 to-blue-500/10";
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow" style={{backgroundColor: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)'}}>
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2ZM8 21L9.5 16.5L15 15L9.5 13.5L8 9L6.5 13.5L1 15L6.5 16.5L8 21Z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Hackathon Journey
        </h2>
        <p className="text-gray-400 mt-1">Building innovative solutions</p>
      </div>

      {/* Stats Overview */}
      <motion.div
        className="flex flex-wrap justify-center gap-8 mt-6 border-t border-gray-700 pt-6 w-full text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex flex-col items-center">
          <h4 className="text-3xl font-bold text-purple-400">{totalHackathons}</h4>
          <p className="text-gray-400 text-sm mt-1">Total Hackathons</p>
        </div>
        <div className="flex flex-col items-center">
          <h4 className="text-3xl font-bold text-blue-400">{topTechnologies.length}</h4>
          <p className="text-gray-400 text-sm mt-1">Technologies Used</p>
        </div>
      </motion.div>

      {/* Technology Tags */}
      {topTechnologies.length > 0 && (
        <motion.div
          className="flex flex-wrap justify-center gap-2 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {(showAllTechnologies ? topTechnologies : topTechnologies.slice(0, 5)).map((tech, index) => (
            <span
              key={tech}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700 hover:border-purple-500 transition-colors"
            >
              {tech}
            </span>
          ))}
          {topTechnologies.length > 5 && !showAllTechnologies && (
            <button
              onClick={() => setShowAllTechnologies(true)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-gray-300 rounded-full text-sm border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
            >
              +{topTechnologies.length - 5}
            </button>
          )}
          {showAllTechnologies && topTechnologies.length > 5 && (
            <button
              onClick={() => setShowAllTechnologies(false)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-gray-300 rounded-full text-sm border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
            >
              Show less
            </button>
          )}
        </motion.div>
      )}

      {/* Hackathon Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {displayHackathons.map((hackathon, index) => (
          <motion.div
            key={`${hackathon.name}-${index}`}
            className={`relative bg-gray-900 rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${getCardBorderClass(hackathon.isWinner, hackathon.position)} ${getWinnerGradient(hackathon.isWinner, hackathon.position)}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            onClick={() => setSelectedHackathon(hackathon)}
            whileHover={{ y: -5 }}
          >
            {/* Winner Badge */}
            {hackathon.isWinner && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-xl shadow-lg">
                {getPositionIcon(hackathon.isWinner, hackathon.position)}
              </div>
            )}

            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">
                  {hackathon.name}
                </h3>

                {hackathon.isWinner && hackathon.position && (
                  <div className="mb-3">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-semibold">
                      {hackathon.position}
                    </span>
                  </div>
                )}

                <p className="text-gray-300 text-sm mb-4">
                  {hackathon.description}
                </p>
              </div>

              <div className="space-y-3">
                {/* Technologies */}
                <div className="flex flex-wrap gap-1">
                  {(expandedTechCards.has(index) ? hackathon.technologies : hackathon.technologies.slice(0, 3)).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                  {hackathon.technologies.length > 3 && !expandedTechCards.has(index) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedTechCards(prev => new Set(prev).add(index));
                      }}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-gray-300 rounded text-xs transition-colors cursor-pointer"
                    >
                      +{hackathon.technologies.length - 3}
                    </button>
                  )}
                  {expandedTechCards.has(index) && hackathon.technologies.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedTechCards(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(index);
                          return newSet;
                        });
                      }}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-gray-300 rounded text-xs transition-colors cursor-pointer"
                    >
                      Show less
                    </button>
                  )}
                </div>

                {/* Category */}
                {hackathon.category && (
                  <div className="flex justify-end">
                    <span className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">
                      {hackathon.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal for detailed view */}
      {selectedHackathon && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedHackathon(null)}
        >
          <motion.div
            className={`
              bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2
              ${getCardBorderClass(selectedHackathon.isWinner, selectedHackathon.position)}
              ${getWinnerGradient(selectedHackathon.isWinner, selectedHackathon.position)}
            `}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedHackathon.name}</h2>
              </div>
              <button
                onClick={() => setSelectedHackathon(null)}
                className="text-gray-400 hover:text-white transition-colors ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedHackathon.isWinner && (
              <div className="mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getPositionIcon(selectedHackathon.isWinner, selectedHackathon.position)}</span>
                  <span className="text-yellow-400 font-semibold">{selectedHackathon.position}</span>
                </div>
              </div>
            )}

            <p className="text-gray-300 mb-6">{selectedHackathon.description}</p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHackathon.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {selectedHackathon.category && (
                <div className="text-sm text-gray-400">
                  <span>📁 Category: {selectedHackathon.category}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
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
