'use client';

import React, { useEffect, useState } from 'react';

export const ClientThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const initialTheme = savedTheme || systemPreference;
      setTheme(initialTheme);
      setMounted(true);
    } catch (error) {
      // Fallback for SSR
      setTheme('light');
      setMounted(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch (error) {
      // Handle localStorage errors gracefully
      console.warn('Could not save theme preference:', error);
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="w-14 h-8" />; // Placeholder with same dimensions
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      style={{ 
        backgroundColor: theme === 'dark' ? '#374151' : '#d1d5db',
        '--tw-ring-offset-color': 'var(--bg-primary)' 
      } as React.CSSProperties}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Moving Circle */}
      <div
        className={`relative flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${
          theme === 'dark' ? 'translate-x-3' : '-translate-x-3'
        }`}
      >
        {/* Icons */}
        {theme === 'light' ? (
          <svg
            className="w-4 h-4 text-yellow-500 transition-opacity duration-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-blue-400 transition-opacity duration-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </div>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <svg
          className={`w-3 h-3 text-yellow-400 transition-opacity duration-300 ${
            theme === 'light' ? 'opacity-100' : 'opacity-30'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
        <svg
          className={`w-3 h-3 text-blue-300 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-30'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    </button>
  );
};