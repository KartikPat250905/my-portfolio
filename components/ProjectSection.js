/**
 * ProjectSection.js
 * Renders a section displaying all project cards using ProjectData.
 */

import ProjectCard from "./ProjectCard";
import { ProjectData } from "../data/ProjectData";

/**
 * ProjectsSection component that displays all projects.
 */
export default function ProjectsSection() {
  return (
    <section id="projects" className="w-full px-2 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-52">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ProjectData.map((project, index) => (
          <ProjectCard key={index} index={index} {...project} />
        ))}
      </div>
    </section>
  );
}
