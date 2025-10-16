"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Octokit } from "octokit";
import GitHubCalendar from "react-github-calendar";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function GithubStats() {
    const [userData, setUserData] = useState<any>(null);
    const [languages, setLanguages] = useState<{ name: string; value: number }[]>([]);
    const [totalLines, setTotalLines] = useState<number>(0);
    const [totalCommits, setTotalCommits] = useState<number>(0);
    const [totalPRs, setTotalPRs] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [langLoading, setLangLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState<string>("");

    const BYTES_PER_LINE = 50;
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

                const totalBytes = Object.values(langTotals).reduce((a, b) => a + b, 0);
                const estimatedLines = Math.round(totalBytes / BYTES_PER_LINE);

                setLanguages(formatted);
                setTotalLines(estimatedLines);
            } catch (err: any) {
                console.error("Lang fetch failed:", err);
                setError(`Language fetch failed: ${err.message}`);
            } finally {
                setLangLoading(false);
            }
        }

        async function fetchActivityStats() {
            try {
                console.log("Starting to fetch activity stats...");
                
                // Use search API to get total commit count
                try {
                    const commitsSearch = await octokit.request("GET /search/commits", {
                        q: `author:KartikPat250905`,
                        per_page: 1,
                    });
                    
                    const totalCommitCount = commitsSearch.data.total_count;
                    console.log(`Total commits from search API: ${totalCommitCount}`);
                    setTotalCommits(totalCommitCount);
                } catch (searchError: any) {
                    console.log("Search API failed, falling back to repo iteration method");
                    
                    // Fallback: Fetch ALL repositories with pagination
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

                    console.log(`Found ${allRepos.length} repositories`);

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
                                    console.log(`Repo ${repo.name}: ${count} commits ${repo.fork ? '(forked)' : ''}`);
                                }
                            } else if (commitsResponse.data.length > 0) {
                                totalCommitCount += commitsResponse.data.length;
                                console.log(`Repo ${repo.name}: ${commitsResponse.data.length} commits (no pagination) ${repo.fork ? '(forked)' : ''}`);
                            }
                        } catch (error) {
                            console.log(`Failed to fetch commits for ${repo.name}`);
                            continue;
                        }
                    }

                    console.log(`Total commits from repos: ${totalCommitCount}`);
                    setTotalCommits(totalCommitCount);
                }

                // Fetch PRs
                try {
                    const prsResponse = await octokit.request("GET /search/issues", {
                        q: `author:KartikPat250905 type:pr`,
                    });
                    console.log(`Total PRs: ${prsResponse.data.total_count}`);
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

    if (error) {
        return (
            <div className="flex flex-col items-center gap-4 p-8 bg-[#0d1117] text-white rounded-2xl shadow-xl m-10">
                <div className="text-red-400 text-center">
                    <h3 className="text-xl font-semibold mb-2">Error Loading GitHub Stats</h3>
                    <p className="text-sm">{error}</p>
                    {!GITHUB_TOKEN && (
                        <div className="mt-4 text-gray-300 text-left max-w-md">
                            <p className="font-semibold mb-2">Setup Instructions:</p>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Create a <code className="bg-gray-800 px-1 rounded">.env.local</code> file in your project root</li>
                                <li>Add: <code className="bg-gray-800 px-1 rounded">NEXT_PUBLIC_GITHUB_TOKEN=your_token_here</code></li>
                                <li>Restart your development server</li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-10 p-8 bg-[#0d1117] text-white rounded-2xl shadow-xl m-10">
            <div className="flex flex-col items-center text-center">
                <img
                    src="https://avatars.githubusercontent.com/u/166979981?v=4"
                    alt="GitHub Avatar"
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-700 shadow-md hover:scale-105 transition-transform"
                />
                {!loading && userData && (
                    <>
                        <h2 className="mt-4 text-xl font-semibold">{userData.name}</h2>
                        <p className="text-gray-400">@{userData.login}</p>
                        <p className="mt-2 text-sm text-gray-300">
                            {userData.public_repos} Repositories • {userData.followers} Followers
                        </p>
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
                                    label={({ name, percent }) => (percent > 0.08 ? `${name} ${(percent * 100).toFixed(1)}%` : "")}
                                >
                                    {languages.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => {
                                        const lines = Math.round(value / BYTES_PER_LINE);
                                        return [`${lines.toLocaleString()} lines`, "Estimated"];
                                    }}
                                    contentStyle={{
                                        backgroundColor: "#FFFFFF",
                                        border: "none",
                                        color: "#fff",
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                    }}
                                />
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
                <div>
                    <h4 className="text-xl font-semibold">{totalLines.toLocaleString()}</h4>
                    <p className="text-gray-400 text-sm">Total Lines of Code</p>
                </div>
            </motion.div>
        </div>
    );
}