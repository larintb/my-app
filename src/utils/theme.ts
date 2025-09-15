import { BusinessTheme } from '@/types'

// Default theme for businesses
export const defaultTheme: BusinessTheme = {
  primary_color: '#3B82F6',      // Blue
  secondary_color: '#1F2937',    // Dark gray
  font_family: 'Inter',
}

// Theme presets for businesses to choose from
export const themePresets = {
  modern: {
    primary_color: '#3B82F6',
    secondary_color: '#1F2937',
    font_family: 'Inter',
  },
  elegant: {
    primary_color: '#7C3AED',
    secondary_color: '#374151',
    font_family: 'Playfair Display',
  },
  warm: {
    primary_color: '#F59E0B',
    secondary_color: '#92400E',
    font_family: 'Poppins',
  },
  professional: {
    primary_color: '#059669',
    secondary_color: '#1F2937',
    font_family: 'IBM Plex Sans',
  },
  creative: {
    primary_color: '#EC4899',
    secondary_color: '#BE185D',
    font_family: 'Nunito',
  }
} as const

// Generate CSS custom properties from theme
export function generateThemeCSS(theme: BusinessTheme): string {
  const {
    primary_color = defaultTheme.primary_color,
    secondary_color = defaultTheme.secondary_color,
    font_family = defaultTheme.font_family,
    custom_css = ''
  } = theme

  return `
    :root {
      --theme-primary: ${primary_color};
      --theme-secondary: ${secondary_color};
      --theme-font-family: "${font_family}", system-ui, sans-serif;
      --theme-primary-rgb: ${hexToRgb(primary_color!)};
      --theme-secondary-rgb: ${hexToRgb(secondary_color!)};
    }

    .theme-primary {
      color: var(--theme-primary);
    }

    .theme-secondary {
      color: var(--theme-secondary);
    }

    .theme-bg-primary {
      background-color: var(--theme-primary);
    }

    .theme-bg-secondary {
      background-color: var(--theme-secondary);
    }

    .theme-bg-primary-light {
      background-color: rgb(var(--theme-primary-rgb) / 0.1);
    }

    .theme-border-primary {
      border-color: var(--theme-primary);
    }

    .theme-font {
      font-family: var(--theme-font-family);
    }

    /* Custom CSS injection */
    ${custom_css}
  `
}

// Convert hex color to RGB values
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  if (!result) {
    return '59, 130, 246' // Default blue RGB
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ].join(', ')
}

// Validate theme colors
export function validateThemeColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

// Get contrast color (black or white) for a given background color
export function getContrastColor(backgroundColor: string): string {
  // Remove # if present
  const hex = backgroundColor.replace('#', '')

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Apply theme to document (for preventing FOUC)
export function applyThemeToDocument(theme: BusinessTheme): void {
  if (typeof window === 'undefined') return

  // Create or update style element
  let styleElement = document.getElementById('business-theme-styles') as HTMLStyleElement

  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = 'business-theme-styles'
    document.head.appendChild(styleElement)
  }

  // Apply theme CSS
  styleElement.textContent = generateThemeCSS(theme)
}