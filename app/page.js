import Hero from "../components/Hero";
import NavBar from "/components/NavBar";
import ProjectsSection from "/components/ProjectSection";
import SectionHeader from "/components/SectionHeader";
import { History } from "/components/History";
import Stats from "/components/Stats";
import ScrollIndicator from "/components/ScrollIndicator";
import DownloadCV from "../components/DownloadCV";
import Comments from "/components/Comments";

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <Hero />
        <SectionHeader title="Projects" id="projects" />
        <ProjectsSection />
        <SectionHeader title="History" id="history" />
        <History />
        <SectionHeader title="Stats" id="stats" />
        <Stats/>
        <ScrollIndicator />
        <DownloadCV />
        <Comments />
      </div>
    </>
  );
}
