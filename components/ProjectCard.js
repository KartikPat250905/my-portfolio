/**
 * ProjectCard.js
 * Displays a single project card with title, description, and GitHub link.
 */

import { indieflower, lato, patrick } from "/app/font";

/**
 * ProjectCard component for showing project details.
 * @param {Object} props
 * @param {string} props.title - Project title
 * @param {string} props.desc - Project description
 * @param {string} props.github - GitHub repository URL
 */
export default function ProjectCard({ title, desc, github }) {
    return (
        <div className={`p-3 sm:p-6 lg:p-8 w-full sm:w-1/2 lg:w-1/3 ${indieflower.className} `}>
            <div className={`p-5 rounded-lg border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(255,77,138,0.16)]`} style={{backgroundColor: 'var(--background)'}}>
                <h2 className={`text-2xl mb-2 ${patrick.className} text-theme-primary`}>{title}</h2>
                <p className={`text-md mb-4 ${lato.className} text-theme-secondary`}>{desc}</p>
                <a href={github} target="_blank" className="text-xl text-pink-600 hover:underline font-medium">See more on GitHub</a>
            </div>
        </div>
    )
}
