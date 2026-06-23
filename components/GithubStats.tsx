/**
 * GithubStats component.
 * Displays GitHub profile, activity stats, language usage, and contribution calendar.
 */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Octokit } from "octokit";
import GitHubCalendar from "react-github-calendar";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import AnimateIn from "./AnimateIn";

export default function GithubStats() {
  const [userData, setUserData] = useState<any>(null);
  const [languages, setLanguages] = useState<{ name: string; value: number }[]>([]);
  const [totalCommits, setTotalCommits] = useState<number>(0);
  const [totalPRs, setTotalPRs] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [langLoading, setLangLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  useEffect(() => {
    // Allow unauthenticated requests when no token is provided (public fallback).
    // Octokit works without auth but will be rate-limited by GitHub for unauthenticated requests.
    const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : new Octokit();
    if (!GITHUB_TOKEN) {
      console.warn("GitHub token not found; using unauthenticated requests (rate limits may apply).");
    }

    async function fetchUser() {
      try {
        const res = await octokit.request("GET /users/{username}", {
          username: "KartikPat250905",
        });
        setUserData(res.data);
      } catch (err: any) {
        console.error("User fetch failed:", err);
        setError(`User fetch failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    async function fetchLanguages() {
      try {
        const repos = await octokit.request("GET /users/{username}/repos", {
          username: "KartikPat250905",
          per_page: 100,
          sort: "updated",
        });

        const langTotals: Record<string, number> = {};
        for (const repo of repos.data) {
          try {
            const langRes = await octokit.request("GET /repos/{owner}/{repo}/languages", {
              owner: "KartikPat250905",
              repo: repo.name,
            });

            for (const [lang, bytes] of Object.entries(langRes.data)) {
              langTotals[lang] = (langTotals[lang] || 0) + (Number(bytes) || 0);
            }
          } catch {
            continue;
          }
        }

        const formatted = Object.entries(langTotals)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        setLanguages(formatted);
      } catch (err: any) {
        console.error("Lang fetch failed:", err);
        setError(`Language fetch failed: ${err.message}`);
      } finally {
        setLangLoading(false);
      }
    }

    async function fetchActivityStats() {
      try {
        // Try search API for commits first
        try {
          const commitsSearch = await octokit.request("GET /search/commits", {
            q: `author:KartikPat250905`,
            per_page: 1,
          });
          setTotalCommits(commitsSearch.data.total_count || 0);
        } catch {
          // Fallback: iterate repos and estimate commits (best-effort)
          let allRepos: any[] = [];
          let page = 1;
          let hasMore = true;
          while (hasMore) {
            const reposResponse = await octokit.request("GET /users/{username}/repos", {
              username: "KartikPat250905",
              per_page: 100,
              page,
            });
            allRepos = [...allRepos, ...reposResponse.data];
            if (reposResponse.data.length < 100) hasMore = false;
            else page++;
          }

          let totalCommitCount = 0;
          for (const repo of allRepos) {
            try {
              const commitsResponse = await octokit.request("GET /repos/{owner}/{repo}/commits", {
                owner: repo.owner.login,
                repo: repo.name,
                author: "KartikPat250905",
                per_page: 1,
              });
              const linkHeader = commitsResponse.headers.link;
              if (linkHeader) {
                const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
                if (matches && matches[1]) {
                  totalCommitCount += parseInt(matches[1], 10);
                } else if (commitsResponse.data.length > 0) {
                  totalCommitCount += commitsResponse.data.length;
                }
              } else if (commitsResponse.data.length > 0) {
                totalCommitCount += commitsResponse.data.length;
              }
            } catch {
              continue;
            }
          }
          setTotalCommits(totalCommitCount);
        }

        // PRs via search
        try {
          const prsResponse = await octokit.request("GET /search/issues", {
            q: `author:KartikPat250905 type:pr`,
          });
          setTotalPRs(prsResponse.data.total_count || 0);
        } catch {
          // ignore
        }
      } catch (err: any) {
        console.error("Activity fetch failed:", err);
        setError(`Activity fetch failed: ${err.message}`);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchUser();
    fetchLanguages();
    fetchActivityStats();
  }, [GITHUB_TOKEN]);

  const COLORS = [
    "#f87171", "#facc15", "#34d399", "#60a5fa", "#a78bfa",
    "#f472b6", "#fb923c", "#4ade80", "#2dd4bf", "#38bdf8",
  ];

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setLangLoading(true);
    setStatsLoading(true);
    window.location.reload();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow" style={{backgroundColor: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)'}}>
        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-red-400">Failed to Load GitHub Stats</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-300 max-w-md">{error}</p>
            <p className="text-xs text-gray-400">
              This might be due to API rate limits, token issues, or network problems
            </p>
          </div>

          {!GITHUB_TOKEN && (
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-left max-w-md">
              <p className="font-semibold mb-3 text-yellow-400">Setup Required:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                <li>Create a <code className="bg-gray-700 px-1 rounded text-yellow-300">.env.local</code> file</li>
                <li>Add: <code className="bg-gray-700 px-1 rounded text-yellow-300">NEXT_PUBLIC_GITHUB_TOKEN=your_token_here</code></li>
                <li>Get token from <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">GitHub Settings</a></li>
                <li>Restart your dev server</li>
              </ol>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <button onClick={handleRetry} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Retry
            </button>
            <a href="https://github.com/KartikPat250905" target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
              View Profile
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow" style={{backgroundColor: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)'}}>
        <div className="flex flex-col items-center text-center">
          <Image
            src="https://avatars.githubusercontent.com/u/166979981?v=4"
            alt="GitHub Avatar"
            width={160}
            height={160}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-700 shadow-md"
          />
          {!loading && userData && (
            <>
              <h2 className="mt-4 text-xl font-semibold">{userData.name}</h2>
              <p className="text-gray-400">@{userData.login}</p>
              <a href={`https://github.com/${userData.login}`} target="_blank" rel="noopener noreferrer" className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">
                View on GitHub
              </a>
            </>
          )}
        </div>

        <AnimateIn>
          <motion.div className="flex justify-center w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <GitHubCalendar
              username="KartikPat250905"
              colorScheme="dark"
              showWeekdayLabels
              blockSize={13}
              blockMargin={5}
              fontSize={14}
            />
          </motion.div>
        </AnimateIn>

        {!langLoading && languages.length > 0 && (
          <AnimateIn className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
            <div className="w-full md:w-1/2 h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={languages} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={false}>
                    {languages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ color: "#d1d5db", fontSize: "0.9rem", paddingLeft: "20px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </AnimateIn>
        )}

        <AnimateIn>
          <motion.div className="flex flex-wrap justify-center gap-8 mt-6 border-t border-gray-700 pt-6 w-full max-w-3xl text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <div>
              <h4 className="text-xl font-semibold">{statsLoading ? "..." : totalCommits.toLocaleString()}</h4>
              <p className="text-gray-400 text-sm">Total Commits</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">{statsLoading ? "..." : totalPRs.toLocaleString()}</h4>
              <p className="text-gray-400 text-sm">Total Pull Requests</p>
            </div>
          </motion.div>
        </AnimateIn>
      </div>

      <style jsx>{`
        .stats-strong-shadow {
          /* stronger elevation by default */
          box-shadow: 0 20px 50px rgba(0,0,0,0.18);
        }

        @media (prefers-color-scheme: dark) {
          .stats-strong-shadow {
            box-shadow: 0 25px 60px rgba(255,77,138,0.16);
          }
        }

        :global(.dark) .stats-strong-shadow {
          box-shadow: 0 25px 60px rgba(255,77,138,0.16);
        }
      `}</style>
    </>
  );
}