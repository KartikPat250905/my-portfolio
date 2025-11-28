/**
 * ScrollIndicator.js
 * Displays a scroll indicator arrow that disappears after scrolling down.
 * Clicking the indicator scrolls smoothly to the projects section.
 */

"use client";

import { useEffect, useState } from 'react';

/**
 * ScrollIndicator component for smooth scroll navigation.
 */
export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const threshold = 100; // Hide after scrolling 100px
      setIsVisible(scrolled < threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 hidden sm:block">
      <div 
        onClick={scrollToProjects}
        className="cursor-pointer group flex flex-col items-center"
      >
        {/* Hand-drawn style arrow with closed center */}
        <div className="relative animate-bounce">
          {/* Outer Circle */}
          <div className="w-12 h-12 border-3 border-blue-500 rounded-full flex items-center justify-center group-hover:border-pink-500 transition-colors duration-300">
            {/* Simple Hand-drawn Arrow */}
            <svg 
              className="w-6 h-6 text-blue-500 group-hover:text-pink-500 transition-colors duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Hand-drawn style arrow pointing down */}
              <path 
                strokeWidth={2.5} 
                d="M12 5v14m-7-7l7 7 7-7"
                style={{
                  filter: 'url(#roughPaper)',
                }}
              />
            </svg>
          </div>
          
          {/* Jumping Animation Circle */}
          <div className="absolute inset-0 w-12 h-12 border-2 border-blue-300 rounded-full animate-ping opacity-75"></div>
        </div>

        {/* Secondary bounce text */}
        <div className="mt-2 animate-pulse">
          <span className="text-xs text-blue-500 group-hover:text-pink-500 transition-colors duration-300 font-medium">
            scroll
          </span>
        </div>

        {/* Floating dots */}
        <div className="flex space-x-1 mt-2">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
