import GithubStats from "./GithubStats.tsx";
import HackathonStats from "./HackathonStats.tsx";
import LeetCodeStats from "./LeetCodeStats.tsx";

export default function Stats() {
    return (
        <div className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8" id="stats">
            <GithubStats />
            <HackathonStats />
            <LeetCodeStats />
        </div>
    );
}
