'use client';
import React from 'react';
import { getAssetPath } from '../utils/paths';

type Props = {
  fileName?: string;
  label?: string;
  className?: string;
};

/**
 * Tailwind-based Download CV button.
 * - Put your CV at: public/assets/cv.pdf (or pass fileName prop)
 * - Uses getAssetPath so it works on GH Pages and locally
 */
const DownloadCV: React.FC<Props> = ({ fileName = 'cv.pdf', label = 'Download CV', className = '' }) => {
  const href = getAssetPath(`/assets/${fileName}`);

  return (
    <div className={`flex justify-center items-center w-full py-4 ${className}`}>
      <a
        href={href}
        download={fileName}
        role="button"
        aria-label={label}
        className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-lg shadow-lg border transition-transform active:translate-y-1 border-gray-200 dark:border-white/10 download-cv-btn ${className}`}
        style={{ backgroundColor: 'var(--background)' }}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          style={{ color: 'var(--text, currentColor)' }}
        >
          <path d="M12 3v10" stroke="var(--text, currentColor)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 9l4 4 4-4" stroke="var(--text, currentColor)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21H3" stroke="var(--text, currentColor)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <span className="bg-gradient-to-r to-[#ffaccd] via-[#ff6fa3] from-[#f806f0] bg-clip-text text-transparent">
          {label}
        </span>
      </a>

      <style jsx>{`
        .download-cv-btn {
          /* default shadow fallback (light mode) */
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
        }

        /* pinkish shadow for dark mode via preference */
        @media (prefers-color-scheme: dark) {
          .download-cv-btn {
            box-shadow: 0 10px 30px rgba(255,77,138,0.14);
          }
        }

        /* pinkish shadow when using class-based dark mode (e.g. .dark on html) */
        :global(.dark) .download-cv-btn {
          box-shadow: 0 10px 30px rgba(255,77,138,0.14);
        }
      `}</style>
    </div>
  );
};

export default DownloadCV;
