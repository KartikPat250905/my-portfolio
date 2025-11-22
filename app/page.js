import Hero from "../components/Hero";
import NavBar from "/components/NavBar";
import ProjectsSection from "/components/ProjectSection";
import SectionHeader from "/components/SectionHeader";
import { History } from "/components/History";
import Stats from "/components/Stats";
import ScrollIndicator from "/components/ScrollIndicator";
import Comments from "/components/comments";
import WorkExperience from "/components/work";

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <Hero />
        <SectionHeader title="Work Experience" id="work" />
        <div className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <WorkExperience />
        </div>
        <SectionHeader title="Projects" id="projects" />
        <ProjectsSection />
        <SectionHeader title="History" id="history" />
        <History />
        <SectionHeader title="Stats" id="stats" />
        <Stats/>
        <ScrollIndicator />
        <SectionHeader title="Feedback" id="feedback" />
        <div className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <Comments />
        </div>
      </div>
    </>
  );
}
