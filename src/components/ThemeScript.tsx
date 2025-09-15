'use client'

import { useEffect } from 'react'

interface ThemeScriptProps {
  businessId: string
}

export function ThemeScript({ businessId }: ThemeScriptProps) {
  useEffect(() => {
    // This script will run immediately when the component mounts
    // to prevent theme flicker
    const applyThemeFromCache = () => {
      try {
        const cachedTheme = localStorage.getItem(`businessTheme_${businessId}`)
        if (cachedTheme) {
          const theme = JSON.parse(cachedTheme)

          // Create or update style element immediately
          let styleElement = document.getElementById('business-theme-styles') as HTMLStyleElement

          if (!styleElement) {
            styleElement = document.createElement('style')
            styleElement.id = 'business-theme-styles'
            document.head.appendChild(styleElement)
          }

          // Apply cached theme CSS immediately
          const css = `
            :root {
              --theme-primary: ${theme.primary_color || '#3B82F6'};
              --theme-secondary: ${theme.secondary_color || '#1F2937'};
              --theme-font-family: "${theme.font_family || 'Inter'}", system-ui, sans-serif;
              --background: ${theme.custom_css?.includes('--background:') ?
                theme.custom_css.match(/--background:\s*([^;]+)/)?.[1]?.trim() || '#0a0a0a' : '#0a0a0a'};
              --text-color: ${theme.custom_css?.includes('--text-color:') ?
                theme.custom_css.match(/--text-color:\s*([^;]+)/)?.[1]?.trim() || '#fafafa' : '#fafafa'};
            }

            .theme-primary { color: var(--theme-primary); }
            .theme-secondary { color: var(--theme-secondary); }
            .theme-bg-primary { background-color: var(--theme-primary); }
            .theme-bg-secondary { background-color: var(--theme-secondary); }
            .theme-font { font-family: var(--theme-font-family); }

            ${theme.custom_css || ''}
          `

          styleElement.textContent = css
        }
      } catch (error) {
        console.error('Error applying cached theme:', error)
      }
    }

    applyThemeFromCache()
  }, [businessId])

  return null // This component doesn't render anything
}

// Inline script that can be injected into the document head
export function getThemeScriptContent(businessId: string): string {
  return `
    (function() {
      try {
        var cachedTheme = localStorage.getItem('businessTheme_${businessId}');
        if (cachedTheme) {
          var theme = JSON.parse(cachedTheme);
          var styleElement = document.createElement('style');
          styleElement.id = 'business-theme-styles-inline';

          var css =
            ':root {' +
              '--theme-primary: ' + (theme.primary_color || '#3B82F6') + ';' +
              '--theme-secondary: ' + (theme.secondary_color || '#1F2937') + ';' +
              '--theme-font-family: "' + (theme.font_family || 'Inter') + '", system-ui, sans-serif;' +
              '--background: ' + (theme.custom_css && theme.custom_css.includes('--background:') ?
                (theme.custom_css.match(/--background:\\s*([^;]+)/)||['','#0a0a0a'])[1].trim() : '#0a0a0a') + ';' +
              '--text-color: ' + (theme.custom_css && theme.custom_css.includes('--text-color:') ?
                (theme.custom_css.match(/--text-color:\\s*([^;]+)/)||['','#fafafa'])[1].trim() : '#fafafa') + ';' +
            '}' +
            '.theme-primary { color: var(--theme-primary); }' +
            '.theme-secondary { color: var(--theme-secondary); }' +
            '.theme-bg-primary { background-color: var(--theme-primary); }' +
            '.theme-bg-secondary { background-color: var(--theme-secondary); }' +
            '.theme-font { font-family: var(--theme-font-family); }' +
            (theme.custom_css || '');

          styleElement.textContent = css;
          document.head.appendChild(styleElement);
        }
      } catch (error) {
        console.error('Error applying inline theme:', error);
      }
    })();
  `;
}