/**
 * ThemeProvider.js
 * Provides a React context for managing and toggling light/dark themes.
 */

"use client";

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider component to wrap the app and provide theme context.
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access the theme context.
 * @returns {{ theme: string, toggleTheme: function }}
 * @throws Error if used outside ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}