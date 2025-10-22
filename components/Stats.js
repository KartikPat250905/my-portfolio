import GithubStats from "./GithubStats.tsx";
import LeetCodeStats from "./LeetCodeStats.tsx";

export default function Stats() {
    return (
        <div className="w-full flex flex-col items-center">
            <GithubStats/>
            <LeetCodeStats/>
        </div>
    );
}