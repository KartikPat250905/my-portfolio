/**
 * ThemeToggle.js
 * Button component to toggle between light and dark themes using ThemeProvider context.
 */

"use client";

import { useTheme } from './ThemeProvider';

/**
 * ThemeToggle component renders a button to switch themes.
 * Displays a sun icon for light mode and a moon icon for dark mode.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2.25A.75.75 0 0 1 12.75 3v1.5a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 12 2.25ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.06 1.06a.75.75 0 1 0 1.06 1.06l1.06-1.06ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.5 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H20.25a.75.75 0 0 1-.75-.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM12 18a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.06-1.06l-1.06 1.06a.75.75 0 1 0 1.06 1.06l1.06-1.06ZM4.5 12a.75.75 0 0 1-.75-.75H2.25a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.06 1.06l1.06 1.06Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
