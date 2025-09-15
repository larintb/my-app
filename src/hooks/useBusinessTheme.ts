'use client'

import { useEffect, useState } from 'react'
import { BusinessTheme } from '@/types'
import { defaultTheme, applyThemeToDocument } from '@/utils/theme'

export function useBusinessTheme(businessId?: string) {
  const [theme, setTheme] = useState<BusinessTheme>(() => {
    // Try to load theme from localStorage immediately for faster initial render
    if (typeof window !== 'undefined' && businessId) {
      try {
        const cachedTheme = localStorage.getItem(`businessTheme_${businessId}`)
        if (cachedTheme) {
          const parsedTheme = JSON.parse(cachedTheme)
          // Apply immediately to prevent flash
          setTimeout(() => applyThemeToDocument(parsedTheme), 0)
          return parsedTheme
        }
      } catch (error) {
        console.error('Error loading cached theme:', error)
      }
    }
    return defaultTheme
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false)
      return
    }

    // Fetch theme from database
    fetchBusinessTheme(businessId)
  }, [businessId])

  useEffect(() => {
    // Apply theme to document
    applyThemeToDocument(theme)
  }, [theme])

  async function fetchBusinessTheme(businessId: string) {
    try {
      const response = await fetch(`/api/businesses/${businessId}`)
      const data = await response.json()

      if (data.success && data.business?.theme_settings) {
        const themeSettings = data.business.theme_settings

        // Convert from settings format to BusinessTheme format
        const businessTheme: BusinessTheme = {
          primary_color: themeSettings.primaryColor || defaultTheme.primary_color,
          secondary_color: themeSettings.secondaryColor || defaultTheme.secondary_color,
          font_family: defaultTheme.font_family,
          custom_css: `
            :root {
              --background: ${themeSettings.backgroundColor || '#0a0a0a'};
              --text-color: ${themeSettings.textColor || '#fafafa'};
            }
          `
        }

        setTheme(businessTheme)
        // Cache theme in localStorage for faster subsequent loads
        localStorage.setItem(`businessTheme_${businessId}`, JSON.stringify(businessTheme))
      } else {
        setTheme(defaultTheme)
      }
    } catch (error) {
      console.error('Error fetching business theme:', error)
      setTheme(defaultTheme)
    } finally {
      setIsLoading(false)
    }
  }


  async function updateTheme(newTheme: Partial<BusinessTheme>) {
    if (!businessId) return

    try {
      setIsLoading(true)

      // TODO: Implement API call to update theme
      // await fetch(`/api/businesses/${businessId}/theme`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTheme)
      // })

      const updatedTheme = { ...theme, ...newTheme }
      setTheme(updatedTheme)
    } catch (error) {
      console.error('Error updating theme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    theme,
    isLoading,
    updateTheme,
    refreshTheme: () => businessId && fetchBusinessTheme(businessId)
  }
}