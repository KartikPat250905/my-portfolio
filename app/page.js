import Globe from "@/components/globe";
import Hero from "../components/Hero";
import NavBar from "@/components/NavBar";
import ProjectsSection from "@/components/ProjectSection";

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <Hero />
        <ProjectsSection />
        <Globe />
      </div>
    </>
  );
}
