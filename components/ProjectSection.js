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
    <div className="flex flex-row flex-wrap px-2 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-52" id="projects">
      {ProjectData.map((project, index) => (
        <ProjectCard key={index} {...project} />
      ))}
    </div>
  );
}
