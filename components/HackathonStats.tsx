/**
 * HackathonStats component (clean rebuild).
 * Keeps original text/content but simplified structure to avoid JSX/template issues.
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { sampleHackathons } from "../data/hackathonData.js";

interface Hackathon {
  name: string;
  date?: string;
  description: string;
  technologies: string[];
  position?: string;
  isWinner: boolean;
  category?: string;
}

interface HackathonStatsProps {
  hackathons?: Hackathon[];
}

export default function HackathonStats({ hackathons }: HackathonStatsProps) {
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [expandedTechCards, setExpandedTechCards] = useState<Set<number>>(new Set());
  const [showAllTechnologies, setShowAllTechnologies] = useState(false);

  const displayHackathons = hackathons && hackathons.length > 0 ? hackathons : sampleHackathons;
  const totalHackathons = displayHackathons.length;
  const totalWins = displayHackathons.filter(h => h.isWinner).length;
  const allTechnologies = Array.from(new Set(displayHackathons.flatMap(h => h.technologies)));

  const getPositionIcon = (isWinner: boolean, position?: string) => {
    if (!isWinner) return null;
    if (position?.includes("1st") || position?.toLowerCase().includes("winner")) return "🏆";
    if (position?.includes("2nd")) return "🥈";
    if (position?.includes("3rd")) return "🥉";
    return "🏅";
  };

  const getCardBorderClass = (isWinner: boolean, position?: string) => {
    if (!isWinner) return "border-gray-700";
    if (position?.includes("1st") || position?.toLowerCase().includes("winner")) return "border-yellow-400 shadow-yellow-400/20";
    if (position?.includes("2nd")) return "border-gray-300 shadow-gray-300/20";
    if (position?.includes("3rd")) return "border-orange-400 shadow-orange-400/20";
    return "border-green-400 shadow-green-400/20";
  };

  const getWinnerGradient = (isWinner: boolean, position?: string) => {
    if (!isWinner) return "";
    if (position?.includes("1st") || position?.toLowerCase().includes("winner")) return "from-yellow-400/10 to-orange-500/10";
    if (position?.includes("2nd")) return "from-gray-300/10 to-gray-500/10";
    if (position?.includes("3rd")) return "from-orange-400/10 to-red-500/10";
    return "from-green-400/10 to-blue-500/10";
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl"
      style={{ backgroundColor: "var(--background)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2ZM8 21L9.5 16.5L15 15L9.5 13.5L8 9L6.5 13.5L1 15L6.5 16.5L8 21Z" />
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Hackathon Journey
        </h2>
        <p className="text-gray-400 mt-1">Building innovative solutions</p>
      </div>

      <motion.div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="flex flex-col items-center">
          <h4 className="text-3xl font-bold text-purple-400">{totalHackathons}</h4>
          <p className="text-gray-400 text-sm mt-1">Total Hackathons</p>
        </div>
        <div className="flex flex-col items-center">
          <h4 className="text-3xl font-bold text-blue-400">{allTechnologies.length}</h4>
          <p className="text-gray-400 text-sm mt-1">Technologies Used</p>
        </div>
      </motion.div>

      {allTechnologies.length > 0 && (
        <motion.div className="mt-4 flex flex-wrap justify-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          {(showAllTechnologies ? allTechnologies : allTechnologies.slice(0, 5)).map((tech) => (
            <span key={tech} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
              {tech}
            </span>
          ))}
          {allTechnologies.length > 5 && !showAllTechnologies && (
            <button onClick={() => setShowAllTechnologies(true)} className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-sm border border-gray-700">
              +{allTechnologies.length - 5}
            </button>
          )}
          {showAllTechnologies && (
            <button onClick={() => setShowAllTechnologies(false)} className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-sm border border-gray-700">
              Show less
            </button>
          )}
        </motion.div>
      )}

      <motion.div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        {displayHackathons.map((h, idx) => (
          <motion.article
            key={`${h.name}-${idx}`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03, y: -4 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
            className={`relative rounded-xl p-6 border-2 bg-gray-900`}
            style={{ borderColor: h.isWinner ? undefined : "rgba(107,114,128,0.6)" }}
            onClick={() => setSelectedHackathon(h)}
          >
            {h.isWinner && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-xl">
                {getPositionIcon(h.isWinner, h.position)}
              </div>
            )}

            <h3 className="text-lg font-semibold mb-2 text-white">{h.name}</h3>
            {h.isWinner && h.position && <div className="mb-3"><span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-semibold">{h.position}</span></div>}
            <p className="text-gray-300 text-sm mb-4">{h.description}</p>

            <div className="flex flex-wrap gap-1">
              {(expandedTechCards.has(idx) ? h.technologies : h.technologies.slice(0, 3)).map((t) => (
                <span key={t} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700">{t}</span>
              ))}
              {h.technologies.length > 3 && !expandedTechCards.has(idx) && (
                <button onClick={(e) => { e.stopPropagation(); setExpandedTechCards(prev => new Set(prev).add(idx)); }} className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">+{h.technologies.length - 3}</button>
              )}
              {expandedTechCards.has(idx) && h.technologies.length > 3 && (
                <button onClick={(e) => { e.stopPropagation(); setExpandedTechCards(prev => { const s = new Set(prev); s.delete(idx); return s; }); }} className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">Show less</button>
              )}
            </div>
          </motion.article>
        ))}
      </motion.div>

      {selectedHackathon && (
        <div onClick={() => setSelectedHackathon(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2">
            <div className="flex justify-between items-start mb-4">
              <div><h2 className="text-2xl font-bold text-white mb-2">{selectedHackathon.name}</h2></div>
              <button onClick={() => setSelectedHackathon(null)} className="text-gray-400 hover:text-white ml-4">Close</button>
            </div>
            {selectedHackathon.isWinner && selectedHackathon.position && (
              <div className="mb-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPositionIcon(selectedHackathon.isWinner, selectedHackathon.position)}</span>
                  <span className="text-yellow-400 font-semibold">{selectedHackathon.position}</span>
                </div>
              </div>
            )}
            <p className="text-gray-300 mb-6">{selectedHackathon.description}</p>
            <div className="flex flex-wrap gap-2">
              {selectedHackathon.technologies.map(t => <span key={t} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">{t}</span>)}
            </div>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}