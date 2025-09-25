import ProjectCard from "./ProjectCard";
import { ProjectData } from "../app/ProjectData";

export default function ProjectsSection() {
  return (
    <div className="flex flex-row flex-wrap px-52">
      {ProjectData.map((project, index) => (
        <ProjectCard key={index} {...project} />
      ))}
    </div>
  );
}
