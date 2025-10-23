"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  acceptanceRate: number;
  contributionPoints: number;
}

export default function LeetCodeStats() {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const username = "KartikPat25094";

  useEffect(() => {
    async function fetchLeetCodeStats() {
      try {
        // Use a proxy API to avoid CORS issues
        const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);

        if (!response.ok) {
          throw new Error("User not found or API error");
        }

        const data = await response.json();

        setStats({
          totalSolved: data.totalSolved,
          totalQuestions: data.totalQuestions,
          easySolved: data.easySolved,
          mediumSolved: data.mediumSolved,
          hardSolved: data.hardSolved,
          ranking: data.ranking || 0,
          acceptanceRate: parseFloat(data.acceptanceRate) || 0,
          contributionPoints: data.contributionPoints || 0,
        });
      } catch (err: any) {
        console.error("Failed to fetch LeetCode stats:", err);
        setError(err.message || "Failed to load LeetCode stats");
      } finally {
        setLoading(false);
      }
    }

    fetchLeetCodeStats();
  }, [username]);

  const COLORS = {
    easy: "#00b8a3",
    medium: "#ffc01e",
    hard: "#ef4743",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 bg-[#1a1a1a] text-white rounded-2xl shadow-xl m-10 w-full">
        <div className="text-gray-400">Loading LeetCode stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 bg-[#1a1a1a] text-white rounded-2xl shadow-xl m-10 w-full">
        <div className="text-red-400 text-center">
          <h3 className="text-xl font-semibold mb-2">Error Loading LeetCode Stats</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs text-gray-400 mt-2">
            Make sure to update the username in the component
          </p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: "Easy", value: stats.easySolved, color: COLORS.easy },
    { name: "Medium", value: stats.mediumSolved, color: COLORS.medium },
    { name: "Hard", value: stats.hardSolved, color: COLORS.hard },
  ];

  const progressPercentage = ((stats.totalSolved / stats.totalQuestions) * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-10 p-8 bg-[#1a1a1a] text-white rounded-2xl shadow-xl m-10 w-[67%]">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold">LeetCode Stats</h2>
        <p className="text-gray-400 mt-1">@{username}</p>
        <a
          href={`https://leetcode.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          View Profile
        </a>
      </div>

      {/* Progress Bar - Full Width Section */}
      <motion.div
        className="flex justify-center w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Problems Solved</span>
            <span className="text-gray-300">
              {stats.totalSolved} / {stats.totalQuestions}
            </span>
          </div>
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Difficulty Breakdown */}
      <motion.div
        className="w-full flex flex-col md:flex-row items-center justify-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="w-full md:w-1/2 h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2d2d2d",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend
                wrapperStyle={{
                  color: "#d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-1/2">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-semibold">Easy</span>
              <span className="text-2xl font-bold">{stats.easySolved}</span>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 font-semibold">Medium</span>
              <span className="text-2xl font-bold">{stats.mediumSolved}</span>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-red-400 font-semibold">Hard</span>
              <span className="text-2xl font-bold">{stats.hardSolved}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="flex flex-wrap justify-center gap-8 mt-6 border-t border-gray-700 pt-6 w-full text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div>
          <h4 className="text-2xl font-semibold text-blue-400">
            #{stats.ranking.toLocaleString()}
          </h4>
          <p className="text-gray-400 text-sm mt-1">Global Ranking</p>
        </div>
        <div>
          <h4 className="text-2xl font-semibold text-green-400">{stats.acceptanceRate}%</h4>
          <p className="text-gray-400 text-sm mt-1">Acceptance Rate</p>
        </div>
      </motion.div>
    </div>
  );
}