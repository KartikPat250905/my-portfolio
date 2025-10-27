import ProjectCard from "./ProjectCard";
import { ProjectData } from "../app/ProjectData";

export default function ProjectsSection() {
  return (
    <div className="flex flex-row flex-wrap px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-52" id="projects">
      {ProjectData.map((project, index) => (
        <ProjectCard key={index} {...project} />
      ))}
    </div>
  );
}
