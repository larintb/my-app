// Google Maps utility singleton to prevent multiple script loads

interface GoogleMapsLoaderState {
  isLoaded: boolean
  isLoading: boolean
  callbacks: Array<() => void>
  errorCallbacks: Array<(error: string) => void>
}

class GoogleMapsLoader {
  private state: GoogleMapsLoaderState = {
    isLoaded: false,
    isLoading: false,
    callbacks: [],
    errorCallbacks: []
  }

  loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (this.state.isLoaded && window.google && window.google.maps) {
        resolve()
        return
      }

      // Add callbacks to queue
      this.state.callbacks.push(resolve)
      this.state.errorCallbacks.push(reject)

      // If already loading, just wait
      if (this.state.isLoading) {
        return
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        this.state.isLoading = true
        existingScript.addEventListener('load', this.handleLoad.bind(this))
        existingScript.addEventListener('error', this.handleError.bind(this))
        return
      }

      // Create and load script
      this.state.isLoading = true
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.addEventListener('load', this.handleLoad.bind(this))
      script.addEventListener('error', this.handleError.bind(this))

      document.head.appendChild(script)
    })
  }

  private handleLoad() {
    this.state.isLoaded = true
    this.state.isLoading = false

    // Execute all pending callbacks
    this.state.callbacks.forEach(callback => callback())
    this.state.callbacks = []
    this.state.errorCallbacks = []
  }

  private handleError() {
    this.state.isLoading = false
    const errorMessage = 'Failed to load Google Maps'

    // Execute all pending error callbacks
    this.state.errorCallbacks.forEach(callback => callback(errorMessage))
    this.state.callbacks = []
    this.state.errorCallbacks = []
  }

  isReady(): boolean {
    return this.state.isLoaded && window.google && window.google.maps
  }
}

// Export singleton instance
export const googleMapsLoader = new GoogleMapsLoader()

// Utility function for components
export const loadGoogleMaps = (): Promise<void> => {
  return googleMapsLoader.loadScript()
}