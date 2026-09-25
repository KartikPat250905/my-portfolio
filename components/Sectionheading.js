"use client";

import SectionHeading from "./SectionHeading";
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
        // Not in Simple Icons. Devicon's "-original" variant is a full-color
        // illustration that clashes with the flat style everywhere else, so
        // use the flat "-plain" variant instead — it inverts to white the
        // same way the simple-icons glyphs do.
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

const ACCENT = "#f92ceb";
// jsDelivr serves the canonical simple-icons package directly, so it stays
// in sync with the full slug list.
const SIMPLE_ICONS_BASE = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons";

function iconSrc(item: TechItem): string {
  return item.src ?? `${SIMPLE_ICONS_BASE}/${item.slug}.svg`;
}

export default function TechStack() {
  return (
    <section id="tech-stack" className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
      <AnimateIn
        className="w-full max-w-6xl rounded-2xl p-6 sm:p-8 lg:p-10 m-2 sm:m-4 lg:m-8 tech-stack-shadow"
        style={{
          backgroundColor: "var(--background)",
          border: "1px solid var(--border-color)",
        }}
      >
        <SectionHeading title="Tech Stack" />

        <div className="flex flex-col gap-10">
          {TECH_CATEGORIES.map((category) => (
            <div key={category.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                {category.title}
              </h3>

              <div className="tech-grid">
                {category.items.map((item) => (
                  <div key={item.name} className="tech-tile">
                    <img
                      src={iconSrc(item)}
                      alt={item.name}
                      className="tech-tile-icon"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.display = "none";
                        const fallback = img.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <span className="tech-tile-fallback">{item.name.slice(0, 2).toUpperCase()}</span>
                    <span className="tech-tile-label">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AnimateIn>

      <style jsx>{`
        .tech-stack-shadow {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
        }

        @media (prefers-color-scheme: dark) {
          .tech-stack-shadow {
            box-shadow: 0 0 60px rgba(249, 44, 235, 0.12), 0 25px 60px rgba(0, 0, 0, 0.4);
          }
        }

        :global(.dark) .tech-stack-shadow {
          box-shadow: 0 0 60px rgba(249, 44, 235, 0.12), 0 25px 60px rgba(0, 0, 0, 0.4);
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
          border-radius: 1rem;
          background-color: rgba(249, 44, 235, 0.07);
          border: 1px solid rgba(249, 44, 235, 0.22);
          transition: all 0.2s ease;
        }

        .tech-tile:hover {
          background-color: rgba(249, 44, 235, 0.14);
          border-color: ${ACCENT};
          box-shadow: 0 0 18px rgba(249, 44, 235, 0.5);
          transform: translateY(-3px);
        }

        .tech-tile-icon {
          width: 32px;
          height: 32px;
          /* Simple Icons/Devicon glyphs are flat black shapes with no
             built-in color — invert to white so they're actually visible
             against the dark tile instead of black-on-near-black. */
          filter: invert(1) brightness(1.6);
          opacity: 0.85;
          transition: filter 0.2s ease, opacity 0.2s ease;
        }

        .tech-tile:hover .tech-tile-icon {
          opacity: 1;
          filter: invert(1) brightness(1.6) drop-shadow(0 0 6px ${ACCENT});
        }

        .tech-tile-fallback {
          display: none;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 0.7rem;
          font-weight: 700;
          color: ${ACCENT};
          border: 1px solid rgba(249, 44, 235, 0.5);
        }

        .tech-tile-label {
          font-size: 0.7rem;
          color: var(--text-primary);
          opacity: 0.75;
          text-align: center;
        }
      `}</style>
    </section>
  );
}