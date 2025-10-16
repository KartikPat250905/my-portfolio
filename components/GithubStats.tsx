"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Octokit } from "octokit";
import GitHubCalendar from "react-github-calendar";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

// ADD YOUR GITHUB TOKEN HERE
const GITHUB_TOKEN = "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"; // Paste your token here

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

    useEffect(() => {
        if (!GITHUB_TOKEN) {
            setError("Please add your GitHub token at the top of the file");
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
                
                const reposResponse = await octokit.request("GET /users/{username}/repos", {
                    username: "KartikPat250905",
                    per_page: 100,
                });

                console.log(`Found ${reposResponse.data.length} repositories`);

                let totalCommitCount = 0;
                
                for (const repo of reposResponse.data) {
                    if (repo.fork) continue;
                    
                    try {
                        const commitsResponse = await octokit.request("GET /repos/{owner}/{repo}/commits", {
                            owner: repo.owner.login,
                            repo: repo.name,
                            per_page: 1,
                        });
                        
                        const linkHeader = commitsResponse.headers.link;
                        
                        if (linkHeader) {
                            const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
                            if (matches && matches[1]) {
                                const count = parseInt(matches[1], 10);
                                totalCommitCount += count;
                                console.log(`Repo ${repo.name}: ${count} commits`);
                            }
                        } else if (commitsResponse.data.length > 0) {
                            totalCommitCount += commitsResponse.data.length;
                            console.log(`Repo ${repo.name}: ${commitsResponse.data.length} commits (no pagination)`);
                        }
                    } catch (error) {
                        console.log(`Failed to fetch commits for ${repo.name}:`, error);
                        continue;
                    }
                }

                console.log(`Total commits: ${totalCommitCount}`);
                setTotalCommits(totalCommitCount);

                try {
                    const prsResponse = await octokit.request("GET /search/issues", {
                        q: `author:KartikPat250905 type:pr`,
                    });
                    console.log(`Total PRs: ${prsResponse.data.total_count}`);
                    setTotalPRs(prsResponse.data.total_count);
                } catch (error: any) {
                    console.error("Failed to fetch PRs:", error);
                    setError(`PR fetch failed: ${error.message}`);
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
    }, []);

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
                        <p className="mt-4 text-gray-300">
                            Please add your GitHub Personal Access Token to the component.
                        </p>
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
                                        backgroundColor: "#111827",
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