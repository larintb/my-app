'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '@/utils/googleMaps'

interface GoogleMapProps {
  address: string
  businessName: string
  className?: string
}

export function GoogleMap({ address, businessName, className = '' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAndInitializeMap = async () => {
      try {
        await loadGoogleMaps()
        setIsLoaded(true)
        initializeMap()
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        setError('Error loading Google Maps')
      }
    }

    const initializeMap = async () => {
      if (!mapRef.current || !window.google) return

      try {
        // Initialize geocoder
        const geocoder = new window.google.maps.Geocoder()

        // Geocode the address
        const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results) {
              resolve(results)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          })
        })

        if (results.length === 0) {
          throw new Error('No results found for the address')
        }

        const location = results[0].geometry.location

        // Create map
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 15,
          center: location,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              "featureType": "poi",
              "elementType": "labels",
              "stylers": [{"visibility": "off"}]
            }
          ]
        })

        // Get theme colors from CSS variables
        const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#3B82F6'

        // Add marker
        const marker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: businessName,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0C6.71573 0 0 6.71573 0 15C0 23.2843 15 40 15 40C15 40 30 23.2843 30 15C30 6.71573 23.2843 0 15 0Z" fill="${themeColor}"/>
                <circle cx="15" cy="15" r="8" fill="white"/>
                <circle cx="15" cy="15" r="4" fill="${themeColor}"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(30, 40),
            anchor: new window.google.maps.Point(15, 40)
          }
        })

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #1f2937;">${businessName}</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.4;">${address}</p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}"
                 target="_blank"
                 style="display: inline-block; margin-top: 8px; padding: 4px 8px; background: ${themeColor}; color: white; text-decoration: none; border-radius: 4px; font-size: 11px;">
                Abrir en Google Maps
              </a>
            </div>
          `
        })

        // Open info window when marker is clicked
        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

      } catch (error) {
        console.error('Error initializing map:', error)
        setError('Error loading map location')
      }
    }

    loadAndInitializeMap()
  }, [address, businessName])

  if (error) {
    return (
      <div className={`rounded-lg p-4 text-center ${className}`} style={{ backgroundColor: 'var(--foreground, #f1f5f9)' }}>
        <div className="mb-2" style={{ color: 'var(--text-color, #64748b)' }}>
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-sm mb-3" style={{ color: 'var(--text-color, #64748b)' }}>{error}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 py-2 rounded text-sm transition-colors"
          style={{
            backgroundColor: 'var(--theme-primary, #3b82f6)',
            color: 'var(--background, #ffffff)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-primary-dark, #2563eb)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-primary, #3b82f6)'
          }}
        >
          Ver en Google Maps
        </a>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full min-h-[200px] rounded-lg overflow-hidden"
        style={{ minHeight: '200px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--foreground, #f1f5f9)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderBottomColor: 'var(--theme-primary, #3b82f6)' }}></div>
            <p className="text-sm" style={{ color: 'var(--text-color, #64748b)' }}>Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Extend window object to include google maps types
declare global {
  interface Window {
    google: typeof google
  }
}