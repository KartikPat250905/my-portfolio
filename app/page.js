import Hero from "../components/Hero";
import NavBar from "/components/NavBar";
import ProjectsSection from "/components/ProjectSection";
import { History } from "/components/History";
import Stats from "/components/Stats"

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <Hero />
        <ProjectsSection />
        <History />
        <Stats/>
      </div>
    </>
  );
}
