/**
 * GithubStats component.
 * Displays GitHub profile, activity stats, language usage, and contribution calendar for KartikPat250905.
 */
"use client";

/**
 * GithubStats component.
 * Fetches and displays GitHub statistics for a user, including contributions and repositories.
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Octokit } from "octokit";
import GitHubCalendar from "react-github-calendar";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

/**
 * Main GithubStats React component.
 * Handles fetching, error states, and rendering of GitHub stats.
 */
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
        if (!GITHUB_TOKEN) {
            setError("GitHub token not found. Please add NEXT_PUBLIC_GITHUB_TOKEN to your .env.local file");
            setLoading(false);
            setLangLoading(false);
            setStatsLoading(false);
            return;
        }

        const octokit = new Octokit({ auth: GITHUB_TOKEN });

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
                
                // Use search API to get total commit count
                try {
                    const commitsSearch = await octokit.request("GET /search/commits", {
                        q: `author:KartikPat250905`,
                        per_page: 1,
                    });
                    
                    const totalCommitCount = commitsSearch.data.total_count;
                    setTotalCommits(totalCommitCount);
                } catch (searchError: any) {
                    let allRepos: any[] = [];
                    let page = 1;
                    let hasMore = true;
                    
                    while (hasMore) {
                        const reposResponse = await octokit.request("GET /users/{username}/repos", {
                            username: "KartikPat250905",
                            per_page: 100,
                            page: page,
                        });
                        
                        allRepos = [...allRepos, ...reposResponse.data];
                        
                        if (reposResponse.data.length < 100) {
                            hasMore = false;
                        } else {
                            page++;
                        }
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
                                    const count = parseInt(matches[1], 10);
                                    totalCommitCount += count;
                                }
                            } else if (commitsResponse.data.length > 0) {
                                totalCommitCount += commitsResponse.data.length;
                                
                            }
                        } catch (error) {
                            continue;
                        }
                    }

                    setTotalCommits(totalCommitCount);
                }

                // Fetch PRs
                try {
                    const prsResponse = await octokit.request("GET /search/issues", {
                        q: `author:KartikPat250905 type:pr`,
                    });
                    setTotalPRs(prsResponse.data.total_count);
                } catch (error: any) {
                    console.error("Failed to fetch PRs:", error);
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
        // Re-trigger the useEffect by refreshing the page or manually calling the functions
        window.location.reload();
    };

    if (error) {
        return (
            <div className="flex flex-col items-center gap-6 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow" style={{backgroundColor: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)'}}>
                {/* Error Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                
                {/* Error Content */}
                <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold text-red-400">Failed to Load GitHub Stats</h3>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-300 max-w-md">{error}</p>
                        <p className="text-xs text-gray-400">
                            This might be due to API rate limits, token issues, or network problems
                        </p>
                    </div>
                    
                    {/* Setup Instructions for missing token */}
                    {!GITHUB_TOKEN && (
                        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-left max-w-md">
                            <p className="font-semibold mb-3 text-yellow-400">Setup Required:</p>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                                <li>Create a <code className="bg-gray-700 px-1 rounded text-yellow-300">.env.local</code> file in project root</li>
                                <li>Add: <code className="bg-gray-700 px-1 rounded text-yellow-300">NEXT_PUBLIC_GITHUB_TOKEN=your_token_here</code></li>
                                <li>Get token from <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">GitHub Settings</a></li>
                                <li>Restart your development server</li>
                            </ol>
                        </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry
                        </button>
                        <a
                            href="https://github.com/KartikPat250905"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            View Profile
                        </a>
                    </div>
                    
                    {/* Additional Help */}
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-700 max-w-md">
                        <p>If the issue persists, check your GitHub token permissions or try again later due to API rate limits.</p>
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
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-700 shadow-md hover:scale-105 transition-transform"
                />
                {!loading && userData && (
                    <>
                        <h2 className="mt-4 text-xl font-semibold">{userData.name}</h2>
                        <p className="text-gray-400">@{userData.login}</p>
                        <a
                            href={`https://github.com/${userData.login}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            View on GitHub
                        </a>
                    </>
                )}
            </div>

            <motion.div
                className="flex justify-center w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <GitHubCalendar
                    username="KartikPat250905"
                    colorScheme="dark"
                    showWeekdayLabels
                    blockSize={13}
                    blockMargin={5}
                    fontSize={14}
                />
            </motion.div>

            {!langLoading && languages.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
                    <div className="w-full md:w-1/2 h-72">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={languages}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    labelLine={false}
                                    label={false}
                                >
                                    {languages.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    wrapperStyle={{
                                        color: "#d1d5db",
                                        fontSize: "0.9rem",
                                        paddingLeft: "20px",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <motion.div
                className="flex flex-wrap justify-center gap-8 mt-6 border-t border-gray-700 pt-6 w-full max-w-3xl text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
            >
                <div>
                    <h4 className="text-xl font-semibold">
                        {statsLoading ? "..." : totalCommits.toLocaleString()}
                    </h4>
                    <p className="text-gray-400 text-sm">Total Commits</p>
                </div>
                <div>
                    <h4 className="text-xl font-semibold">
                        {statsLoading ? "..." : totalPRs.toLocaleString()}
                    </h4>
                    <p className="text-gray-400 text-sm">Total Pull Requests</p>
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
