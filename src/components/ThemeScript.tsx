'use client'

import { useEffect } from 'react'

export function ThemeScript() {
  useEffect(() => {
    // Prevent theme flash by applying saved theme immediately
    const applyInitialTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme') || 'light'
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        const initialTheme = savedTheme || systemPreference

        // Apply theme to document immediately
        document.documentElement.setAttribute('data-theme', initialTheme)
      } catch (error) {
        // If localStorage is not available, use system preference
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', systemPreference)
      }
    }

    applyInitialTheme()
  }, [])

  return null // This component doesn't render anything
}

// Inline script that can be injected into the document head to prevent flash
export function getThemeScript(): string {
  return `
    (function() {
      try {
        var savedTheme = localStorage.getItem('theme') || 'light';
        var systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        var initialTheme = savedTheme || systemPreference;
        document.documentElement.setAttribute('data-theme', initialTheme);
      } catch (error) {
        var systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemPreference);
      }
    })();
  `;
}