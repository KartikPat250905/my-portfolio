/**
 * DownloadCV component.
 * Renders a button to download the CV PDF from the public assets folder.
 * Uses getAssetPath for compatibility with different deployment environments.
 */
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
        className={`inline-flex items-center gap-3 sm:gap-4 px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-lg font-semibold text-xl sm:text-2xl md:text-3xl shadow-[0_15px_35px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(255,77,138,0.25)] border transition-transform active:translate-y-1 border-gray-200 dark:border-white/10 ${className}`}
        style={{ backgroundColor: 'var(--background)' }}
      >
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
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

        <span className="bg-gradient-to-r to-[#ff10e7] via-[#ff6fa3] from-[#f806f0] bg-clip-text text-transparent">
          {label}
        </span>
      </a>

    </div>
  );
};

export default DownloadCV;
