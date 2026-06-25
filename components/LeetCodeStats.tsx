"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import AnimateIn from "./AnimateIn";
import AnimatedNumber from "./AnimatedNumber";

interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  acceptanceRate: number;
}

export default function LeetCodeStats() {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const username = "KartikPat25094";

  const COLORS = {
    easy: "#00b8a3",
    medium: "#ffc01e",
    hard: "#ef4743",
  };

  const fetchLeetCodeStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/leetcode?username=${encodeURIComponent(username)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `API returned non-JSON response (${response.status}): ${text.slice(0, 200)}`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load LeetCode stats");
      }

      setStats(data);
    } catch (err: any) {
      console.error("Failed to fetch LeetCode stats:", err);
      setError(err.message || "Failed to load LeetCode stats");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchLeetCodeStats();
  }, [fetchLeetCodeStats]);

  const handleRetry = () => {
    fetchLeetCodeStats();
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center gap-4 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div className="text-gray-400">Loading LeetCode stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center gap-6 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

          <AnimateIn className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-red-400">Failed to Load LeetCode Stats</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-300 max-w-md">{error}</p>
            <p className="text-xs text-gray-400">
              This might be due to API rate limits, token issues, or network problems
            </p>
          </div>
 
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
            >
              Retry
            </button>
 
            <a
              href={`https://leetcode.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
            >
              View Profile
            </a>
          </div>
        </AnimateIn>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: "Easy", value: stats.easySolved, color: COLORS.easy },
    { name: "Medium", value: stats.mediumSolved, color: COLORS.medium },
    { name: "Hard", value: stats.hardSolved, color: COLORS.hard },
  ];

  const progressPercentage =
    stats.totalQuestions > 0
      ? ((stats.totalSolved / stats.totalQuestions) * 100).toFixed(1)
      : "0.0";

  return (
    <>
      <div
        className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
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

        <AnimateIn className="w-full max-w-6xl">
          <div className="flex justify-center w-full">
            <div className="flex-1 w-full min-w-0 max-w-5xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Problems Solved</span>
                <span className="text-gray-300">
                  <AnimatedNumber value={stats.totalSolved} duration={600} /> / <AnimatedNumber value={stats.totalQuestions} duration={600} />
                </span>
              </div>
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden min-w-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                  style={{ minWidth: 0 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn className="w-full">
          <div
            className="w-full flex flex-col md:flex-row items-center justify-center gap-8"
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
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-semibold">Easy</span>
                  <span className="text-2xl font-bold text-theme-primary"><AnimatedNumber value={stats.easySolved} duration={600} /></span>
                </div>
              </div>
     
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-yellow-600 font-semibold">Medium</span>
                  <span className="text-2xl font-bold text-theme-primary"><AnimatedNumber value={stats.mediumSolved} duration={600} /></span>
                </div>
              </div>
     
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-semibold">Hard</span>
                  <span className="text-2xl font-bold text-theme-primary"><AnimatedNumber value={stats.hardSolved} duration={600} /></span>
                </div>
              </div>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn className="flex flex-wrap justify-center gap-8 mt-6 border-t border-gray-700 pt-6 w-full text-center">
          <div>
            <h4 className="text-2xl font-semibold text-blue-400">
              #<AnimatedNumber value={stats.ranking} duration={600} />
            </h4>
            <p className="text-gray-400 text-sm mt-1">Global Ranking</p>
          </div>
          <div>
            <h4 className="text-2xl font-semibold text-green-400"><AnimatedNumber value={stats.acceptanceRate} duration={600} />%</h4>
            <p className="text-gray-400 text-sm mt-1">Acceptance Rate</p>
          </div>
        </AnimateIn>
      </div>

      <style jsx>{`
        .stats-strong-shadow {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
        }

        @media (prefers-color-scheme: dark) {
          .stats-strong-shadow {
            box-shadow: 0 25px 60px rgba(255, 77, 138, 0.16);
          }
        }

        :global(.dark) .stats-strong-shadow {
          box-shadow: 0 25px 60px rgba(255, 77, 138, 0.16);
        }
      `}</style>
    </>
  );
}