"use client";

import SectionHeader from "./SectionHeader";
import AnimateIn from "./AnimateIn";

type TechItem = {
  name: string;
  slug: string; // simple-icons slug, unless `src` is set explicitly
  src?: string; // overrides the default simple-icons URL (used for Matplotlib)
};

type TechCategory = {
  title: string;
  items: TechItem[];
};

// Pulled from the resume's Technical Skills section. "CI/CD" is left out of
// the logo grid since it's a practice, not a brand with a logo.
const TECH_CATEGORIES: TechCategory[] = [
  {
    title: "Languages",
    items: [
      { name: "Python", slug: "python" },
      { name: "C++", slug: "cplusplus" },
      { name: "C", slug: "c" },
      { name: "C#", slug: "csharp" },
      { name: "TypeScript", slug: "typescript" },
      { name: "JavaScript", slug: "javascript" },
      { name: "Rust", slug: "rust" },
      { name: "R", slug: "r" },
      { name: "MicroPython", slug: "micropython" },
      { name: "HTML", slug: "html5" },
      { name: "CSS", slug: "css3" },
    ],
  },
  {
    title: "Frameworks & Libraries",
    items: [
      { name: "React", slug: "react" },
      { name: "FastAPI", slug: "fastapi" },
      { name: "TensorFlow", slug: "tensorflow" },
      { name: "NumPy", slug: "numpy" },
      { name: "Pandas", slug: "pandas" },
      {
        name: "Matplotlib",
        slug: "matplotlib",
        // Not in Simple Icons — Devicon's flat "-plain" variant matches the
        // single-shape style the mask technique below expects.
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matplotlib/matplotlib-plain.svg",
      },
      { name: "Unity", slug: "unity" },
    ],
  },
  {
    title: "Tools & Platforms",
    items: [
      { name: "Git", slug: "git" },
      { name: "Linux", slug: "linux" },
      { name: "Bash", slug: "gnubash" },
      { name: "Firebase", slug: "firebase" },
      { name: "MariaDB", slug: "mariadb" },
      { name: "Excalidraw", slug: "excalidraw" },
    ],
  },
];

// jsDelivr serves the canonical simple-icons package directly, so it stays
// in sync with the full slug list.
const SIMPLE_ICONS_BASE = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons";

function iconSrc(item: TechItem): string {
  return item.src ?? `${SIMPLE_ICONS_BASE}/${item.slug}.svg`;
}

export default function TechStack() {
  return (
    <>
      <SectionHeader title="Tech Stack" id="tech-stack" />

      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
        <AnimateIn className="w-full max-w-6xl rounded-2xl p-6 sm:p-8 lg:p-10 m-2 sm:m-4 lg:m-8 tech-panel">
          <div className="flex flex-col gap-10">
            {TECH_CATEGORIES.map((category) => (
              <div key={category.title}>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 tech-category-label">
                  {category.title}
                </h3>

                <div className="tech-grid">
                  {category.items.map((item) => (
                    <div key={item.name} className="rounded-xl tech-tile">
                      <span
                        role="img"
                        aria-label={item.name}
                        className="tech-tile-icon"
                        style={{
                          WebkitMaskImage: `url(${iconSrc(item)})`,
                          maskImage: `url(${iconSrc(item)})`,
                        }}
                      />
                      <span className="text-xs tech-tile-label">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>

      <style jsx>{`
        /* Same panel treatment as the Work Experience cards: flat black
           surface, hard offset "sketch" shadow, colors from the theme's own
           variables so this stays in sync with the light/dark toggle. */
        .tech-panel {
          background: var(--background);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          box-shadow: 2px 2px 0px var(--shadow-color), -2px -2px 0px var(--border-color);
        }

        .tech-category-label {
          color: #f92ceb;
          text-shadow: 0 0 10px #f92ceb80;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
          gap: 0.9rem;
        }

        .tech-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 0.5rem;
          background: #0d0d0d;
          border: 1px solid #f92ceb44;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }

        .tech-tile:hover {
          border-color: #f92ceb;
          box-shadow: 0 0 16px #f92ceb55;
          transform: translateY(-2px);
        }

        .tech-tile-icon {
          display: block;
          width: 32px;
          height: 32px;
          background-color: #ffffff;
          filter: drop-shadow(0 0 6px #f92ceb80);
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: contain;
          mask-size: contain;
          -webkit-mask-position: center;
          mask-position: center;
          transition: filter 0.2s ease, background-color 0.2s ease;
        }

        .tech-tile:hover .tech-tile-icon {
          background-color: #2cf9e0;
          filter: drop-shadow(0 0 10px #2cf9e080);
        }

        .tech-tile-label {
          color: #a0a0a0;
          text-align: center;
        }
      `}</style>
    </>
  );
}