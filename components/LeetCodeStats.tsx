"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
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

  // Segment widths are proportional to each other (share of *solved*, not
  // the total question bank), so the bar is always full and reads as an
  // achievement rather than a small slice of a huge denominator.
  const difficultyTotal =
    stats.easySolved + stats.mediumSolved + stats.hardSolved || 1;
  const segments = [
    { label: "Easy", value: stats.easySolved, color: COLORS.easy },
    { label: "Medium", value: stats.mediumSolved, color: COLORS.medium },
    { label: "Hard", value: stats.hardSolved, color: COLORS.hard },
  ];

  return (
    <>
      <div
        className="flex flex-col items-center gap-8 sm:gap-10 lg:gap-12 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow"
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

        {/* Hero number — the achievement itself, with nothing diluting it */}
        <AnimateIn className="flex flex-col items-center text-center">
          <span className="text-6xl sm:text-7xl font-bold leading-none tracking-tight">
            <AnimatedNumber value={stats.totalSolved} duration={600} />
          </span>
          <span className="text-gray-400 text-sm sm:text-base mt-3 tracking-wide">
            Problems Solved
          </span>
        </AnimateIn>

        {/* Proportional difficulty breakdown — segments sum to the solved
            total, so the bar is always full and legible at any solve count */}
        <AnimateIn className="w-full max-w-2xl">
          <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: "var(--border-color)" }}>
            {segments.map((seg, i) => (
              <motion.div
                key={seg.label}
                className="h-full"
                style={{ backgroundColor: seg.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(seg.value / difficultyTotal) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.15 * i, ease: "easeOut" }}
              />
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-6">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-sm text-gray-400">{seg.label}</span>
                <span className="text-sm font-semibold" style={{ color: seg.color }}>
                  <AnimatedNumber value={seg.value} duration={600} />
                </span>
              </div>
            ))}
          </div>
        </AnimateIn>

        {/* Single supporting metric — dropped global ranking since a rank in
            the hundreds of thousands undersells the work rather than showing it off */}
 <AnimateIn className="flex flex-col items-center text-center border-t w-full pt-8">
          <h4 className="text-3xl font-semibold text-green-400">
            <AnimatedNumber value={stats.acceptanceRate} duration={600} />%
          </h4>
          <p className="text-gray-400 text-sm mt-1">Acceptance Rate</p>
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