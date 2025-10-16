"use client";

import { useEffect, useState } from "react";
import { Octokit } from "octokit";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

// Colors for each language segment
const COLORS = [
  "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#14B8A6",
  "#EC4899", "#84CC16", "#06B6D4", "#F97316"
];

export default function GithubLanguages() {
  const [languageData, setLanguageData] = useState([]);
  const [totalLines, setTotalLines] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage cache first
    const cached = localStorage.getItem("githubLangCache");
    if (cached) {
      const parsed = JSON.parse(cached);
      setLanguageData(parsed.data);
      setTotalLines(parsed.total);
      setLoading(false);
      return;
    }

    const octokit = new Octokit();

    async function fetchLanguages() {
      try {
        const { data: repos } = await octokit.request("GET /users/KartikPat250905/repos", {
          username: "KartikPat250905",
          per_page: 100,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        const totals = {};

        // Loop through all repos
        for (const repo of repos) {
          const { data: langs } = await octokit.request(
            `GET /repos/${repo.owner.login}/${repo.name}/languages`
          );
          for (const [lang, bytes] of Object.entries(langs)) {
            totals[lang] = (totals[lang] || 0) + bytes;
          }
        }

        // Convert bytes → lines (approximation)
        // Assuming ~50 bytes per line (average estimate)
        const totalBytes = Object.values(totals).reduce((a, b) => a + b, 0);
        const estimatedLines = Math.round(totalBytes / 50);

        // Format for Recharts
        const formatted = Object.entries(totals).map(([name, value]) => ({
          name,
          value,
        }));

        // Save results
        setLanguageData(formatted);
        setTotalLines(estimatedLines);
        localStorage.setItem(
          "githubLangCache",
          JSON.stringify({ data: formatted, total: estimatedLines })
        );
      } catch (error) {
        console.error("Error fetching language data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLanguages();
  }, []);

  return (
    <div className="flex flex-col items-center bg-[#0d1117] text-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-2">Language Usage</h2>

      {loading ? (
        <p>Loading language stats...</p>
      ) : (
        <>
          <motion.p
            className="text-gray-400 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Total Lines of Code:{" "}
            <span className="text-white font-semibold">
              {totalLines.toLocaleString()}
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-[300px] md:h-[400px]"
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {languageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value) =>
                    `${Math.round(value / 50).toLocaleString()} lines`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}
