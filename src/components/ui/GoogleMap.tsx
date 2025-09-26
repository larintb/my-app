'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'

interface GoogleMapProps {
  address: string
  businessName: string
  className?: string
}

export function GoogleMap({ address, businessName, className = '' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Global script loading state
  const loadGoogleMaps = async () => {
    if ((window as any).google && (window as any).google.maps) {
      return Promise.resolve()
    }

    // Check if script is already being loaded
    if ((window as typeof window & { googleMapsLoading?: Promise<void> }).googleMapsLoading) {
      return (window as typeof window & { googleMapsLoading?: Promise<void> }).googleMapsLoading
    }

    // Check if script is already in the page
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      return new Promise<void>((resolve) => {
        const checkGoogleMaps = () => {
          if ((window as any).google && (window as any).google.maps) {
            resolve()
          } else {
            setTimeout(checkGoogleMaps, 100)
          }
        }
        checkGoogleMaps()
      })
    }

    // Create and store the loading promise
    const loadingPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

      if (!apiKey) {
        reject(new Error('Google Maps API key not found'))
        return
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.onload = () => {
        delete (window as typeof window & { googleMapsLoading?: Promise<void> }).googleMapsLoading
        resolve()
      }
      script.onerror = () => {
        delete (window as typeof window & { googleMapsLoading?: Promise<void> }).googleMapsLoading
        reject(new Error('Failed to load Google Maps'))
      }
      document.head.appendChild(script)
    })

    ;(window as typeof window & { googleMapsLoading?: Promise<void> }).googleMapsLoading = loadingPromise
    return loadingPromise
  }

  useEffect(() => {
    if (!address || !address.trim()) {
      setError(null)
      setIsLoaded(false)
      return
    }

    const initializeMap = async () => {
      try {
        await loadGoogleMaps()

        if (!mapRef.current) return

        const geocoder = new (window as any).google.maps.Geocoder()

        // Geocode the address
        const result = await new Promise<any[]>((resolve, reject) => {
          geocoder.geocode({ address }, (results: any, status: any) => {
            if (status === 'OK' && results) {
              resolve(results)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          })
        })

        if (result.length === 0) {
          throw new Error('No results found for address')
        }

        const location = result[0].geometry.location

        // Create map with null check
        if (!mapRef.current) {
          throw new Error('Map container not found')
        }

        const map = new (window as any).google.maps.Map(mapRef.current, {
          zoom: 15,
          center: location,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        })

        // Create marker
        const marker = new (window as any).google.maps.Marker({
          position: location,
          map: map,
          title: businessName,
        })

        // Create info window
        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${businessName}</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${address}</p>
              <a href="https://www.(window as any).google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}"
                 target="_blank"
                 style="display: inline-block; padding: 4px 8px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">
                Cómo llegar
              </a>
            </div>
          `
        })

        // Show info window when marker is clicked
        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        setIsLoaded(true)
        setError(null)

      } catch (error) {
        console.error('Error initializing map:', error)
        setError('No se pudo cargar el mapa para esta dirección')
        setIsLoaded(false)
      }
    }

    initializeMap()
  }, [address, businessName])

  if (error) {
    return (
      <div className={`${className} h-64 rounded-lg p-6 text-center flex flex-col justify-center bg-gray-50 border-2 border-dashed border-gray-300`}>
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{businessName}</h3>
        <p className="text-sm text-gray-600 mb-4">{address}</p>
        <div className="space-y-2">
          <a
            href={`https://www.(window as any).google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Ver en Google Maps
          </a>
        </div>
      </div>
    )
  }

  if (!address || !address.trim()) {
    return (
      <div className={`${className} h-64 rounded-lg p-6 text-center flex flex-col justify-center bg-gray-50 border-2 border-dashed border-gray-300`}>
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        </div>
        <p className="text-gray-500">No hay dirección para mostrar</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full min-h-[300px] rounded-lg overflow-hidden"
      />
      {!isLoaded && (
        <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}