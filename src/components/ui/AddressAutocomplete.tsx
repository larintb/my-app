'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '@/utils/googleMaps'

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
  darkMode?: boolean
  countries?: string[] // Array de códigos de país ISO (ej: ['us', 'mx'])
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Ingresa la dirección de tu negocio...",
  className = "",
  initialValue = "",
  disabled = false,
  darkMode = false,
  countries = ['us', 'mx'] // Por defecto USA y México
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState(initialValue)

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        await loadGoogleMaps()

        if (!window.google || !window.google.maps || !window.google.maps.places) {
          throw new Error('Google Places API not available')
        }

        if (!inputRef.current) return

        // Create autocomplete instance with multiple countries
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: countries }, // Soporte para múltiples países
          fields: [
            'address_components',
            'formatted_address',
            'geometry',
            'place_id',
            'name'
          ]
        })

        autocompleteRef.current = autocomplete

        // Add listener for place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()

          if (!place.geometry || !place.geometry.location) {
            setError('No se pudo obtener la ubicación de esta dirección')
            return
          }

          // Parse address components
          const addressDetails: AddressDetails = {
            fullAddress: place.formatted_address || '',
            placeId: place.place_id,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          }

          // Extract address components
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

          setInputValue(addressDetails.fullAddress)
          onAddressSelect(addressDetails)
          setError(null)
        })

        setIsLoaded(true)
        setError(null)

      } catch (error) {
        console.error('Error initializing address autocomplete:', error)
        setError('Error loading address search')
      }
    }

    initializeAutocomplete()

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onAddressSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (error) setError(null)
  }

  const handleClear = () => {
    setInputValue('')
    onAddressSelect({
      fullAddress: '',
      placeId: undefined,
      latitude: undefined,
      longitude: undefined
    })
  }


  if (error) {
    return (
      <div className={className}>
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              darkMode
                ? 'border-red-400 bg-red-950/20 text-gray-100 placeholder:text-gray-400'
                : 'border-red-300 bg-red-50 text-gray-900 placeholder:text-gray-500'
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <p className={`mt-1 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Puedes escribir manualmente la dirección si hay problemas con la búsqueda.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={isLoaded ? placeholder : "Cargando búsqueda de direcciones..."}
          disabled={disabled || !isLoaded}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            !isLoaded
              ? darkMode
                ? 'bg-gray-800 border-gray-600 text-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-500'
              : darkMode
                ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
          } ${disabled ? (darkMode ? 'bg-gray-900 cursor-not-allowed opacity-50' : 'bg-gray-100 cursor-not-allowed opacity-50') : ''}`}
        />

        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Clear button */}
        {isLoaded && inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute inset-y-0 right-0 flex items-center pr-3 rounded-r-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <svg className={`w-5 h-5 transition-colors ${
              darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search icon */}
        {isLoaded && !inputValue && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Helper text */}
      {isLoaded && (
        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Comienza escribiendo y selecciona de las sugerencias para mayor precisión.
        </p>
      )}
    </div>
  )
}

// Type definitions for Google Places API
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete
        }
        event?: {
          clearInstanceListeners: (instance: any) => void
        }
      }
    }
  }
}

export type { AddressDetails }