'use client'

import { useEffect, useRef, useState } from 'react'

// Google Maps types
interface GoogleMapsPlace {
  formatted_address?: string
  address_components?: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  geometry?: {
    location: {
      lat: () => number
      lng: () => number
    }
  }
  place_id?: string
}

interface GoogleMapsAutocomplete {
  addListener: (event: string, callback: () => void) => void
  getPlace: () => GoogleMapsPlace
}

interface GoogleMapsAutocompleteOptions {
  types?: string[]
  componentRestrictions?: {
    country?: string | string[]
  }
}

interface WindowWithGoogleMaps extends Window {
  google?: {
    maps?: {
      places?: {
        Autocomplete: new (input: HTMLInputElement, options?: GoogleMapsAutocompleteOptions) => GoogleMapsAutocomplete
      }
      event?: {
        clearInstanceListeners: (instance: GoogleMapsAutocomplete) => void
      }
    }
  }
  googleMapsLoading?: Promise<void>
}


interface AddressDetails {
  fullAddress: string
  streetNumber?: string
  route?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  placeId?: string
  latitude?: number
  longitude?: number
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressDetails) => void
  placeholder?: string
  className?: string
  initialValue?: string
  disabled?: boolean
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Ingresa la dirección...",
  className = "",
  initialValue = "",
  disabled = false
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const autocompleteRef = useRef<GoogleMapsAutocomplete | null>(null)

  // Global script loading state
  const loadGoogleMaps = async () => {
    const windowWithMaps = window as WindowWithGoogleMaps
    if (windowWithMaps.google?.maps?.places) {
      return Promise.resolve()
    }

    // Check if script is already being loaded
    const windowWithLoading = window as WindowWithGoogleMaps
    if (windowWithLoading.googleMapsLoading) {
      return windowWithLoading.googleMapsLoading
    }

    // Check if script is already in the page
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      return new Promise<void>((resolve) => {
        const checkGoogleMaps = () => {
          const windowWithMaps = window as WindowWithGoogleMaps
          if (windowWithMaps.google?.maps?.places) {
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
        const windowWithLoading = window as WindowWithGoogleMaps
        delete windowWithLoading.googleMapsLoading
        resolve()
      }
      script.onerror = () => {
        const windowWithLoading = window as WindowWithGoogleMaps
        delete windowWithLoading.googleMapsLoading
        reject(new Error('Failed to load Google Maps'))
      }
      document.head.appendChild(script)
    })

    ;(window as WindowWithGoogleMaps).googleMapsLoading = loadingPromise
    return loadingPromise
  }

  // Parse address components
  const parseAddressComponents = (place: GoogleMapsPlace): AddressDetails => {
    const addressDetails: AddressDetails = {
      fullAddress: place.formatted_address || '',
      placeId: place.place_id,
      latitude: place.geometry?.location?.lat(),
      longitude: place.geometry?.location?.lng()
    }

    if (place.address_components) {
      for (const component of place.address_components) {
        const componentType = component.types[0]
        switch (componentType) {
          case 'street_number':
            addressDetails.streetNumber = component.long_name
            break
          case 'route':
            addressDetails.route = component.long_name
            break
          case 'locality':
          case 'administrative_area_level_3':
            addressDetails.city = component.long_name
            break
          case 'administrative_area_level_1':
            addressDetails.state = component.short_name
            break
          case 'country':
            addressDetails.country = component.long_name
            break
          case 'postal_code':
            addressDetails.postalCode = component.long_name
            break
        }
      }
    }

    return addressDetails
  }

  // Initialize autocomplete (using legacy API for stability)
  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await loadGoogleMaps()

        if (!inputRef.current) return

        const windowWithMaps = window as WindowWithGoogleMaps
        const autocomplete = new windowWithMaps.google!.maps!.places!.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: ['us', 'mx'] }
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()

          if (!place.geometry) {
            setError('No se encontró información para esta dirección')
            return
          }

          const addressDetails = parseAddressComponents(place)
          onAddressSelect(addressDetails)
          setError(null)
        })

        autocompleteRef.current = autocomplete
        setIsLoaded(true)

      } catch (error) {
        console.error('Error loading autocomplete:', error)
        setError('Error cargando el autocompletado')
      }
    }

    initAutocomplete()

    return () => {
      if (autocompleteRef.current) {
        const windowWithMaps = window as WindowWithGoogleMaps
        if (windowWithMaps.google?.maps?.event?.clearInstanceListeners) {
          windowWithMaps.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        }
      }
    }
  }, [onAddressSelect])

  if (error) {
    return (
      <div className={className}>
        <input
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 border border-red-300 bg-red-50 text-app rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        placeholder={isLoaded ? placeholder : "Cargando..."}
        defaultValue={initialValue}
        disabled={disabled || !isLoaded}
        className="w-full px-4 py-3 border border-gray-300 text-app bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {!isLoaded && (
        <p className="mt-1 text-xs text-gray-500">Cargando autocompletado...</p>
      )}
    </div>
  )
}

export type { AddressDetails }