import { indieflower, lato, patrick } from "/app/font";

export default function ProjectCard({ title, desc, github }) {
    return (
        <div className={`p-8 w-full sm:w-1/2 lg:w-1/3 ${indieflower.className} `}>
            <div className={`p-5 rounded-lg border-2 sketch-border bg-white`}>
                <h2 className={`text-2xl mb-2 ${patrick.className}`}>{title}</h2>
                <p className={`text-md mb-4 ${lato.className} text-gray-500`}>{desc}</p>
                <a href={github} target="_blank" className="text-xl text-pink-600 hover:underline font-medium">See more on GitHub</a>
            </div>
        </div>
    )
}