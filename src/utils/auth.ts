// Authentication utilities for business admin sessions

export interface BusinessAdminUser {
  id: string
  businessId: string
  first_name: string
  last_name: string
  email: string
  businessName: string
}

// Set business admin session (localStorage + cookie)
export function setBusinessAdminSession(user: BusinessAdminUser): void {
  // Store in localStorage for client-side access
  localStorage.setItem('businessAdmin', JSON.stringify(user))

  // Set cookie for middleware authentication (7 days)
  const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds
  document.cookie = `businessAdmin=${JSON.stringify(user)}; path=/; max-age=${maxAge}; secure; samesite=strict`
}

// Get business admin session from localStorage
export function getBusinessAdminSession(): BusinessAdminUser | null {
  try {
    const savedUser = localStorage.getItem('businessAdmin')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (userData.businessId && userData.id) {
        return userData
      }
    }
  } catch (error) {
    console.error('Error parsing business admin session:', error)
  }
  return null
}

// Clear business admin session (localStorage + cookie)
export function clearBusinessAdminSession(): void {
  localStorage.removeItem('businessAdmin')
  document.cookie = 'businessAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

// Check if user is authenticated
export function isBusinessAdminAuthenticated(): boolean {
  return getBusinessAdminSession() !== null
}

// Router interface for type safety
interface Router {
  push: (path: string) => void
}

// Get business by business name
async function getBusinessByName(businessName: string) {
  try {
    const response = await fetch(`/api/businesses/by-name/${encodeURIComponent(businessName)}`)
    const data = await response.json()
    if (data.success) {
      return data.business
    }
  } catch (error) {
    console.error('Error fetching business:', error)
  }
  return null
}

// Redirect to login if not authenticated or user doesn't belong to this business
export async function requireBusinessAdminAuth(businessName: string, router: Router): Promise<BusinessAdminUser | null> {
  const user = getBusinessAdminSession()
  if (!user) {
    clearBusinessAdminSession()
    router.push(`/${businessName}/login`)
    return null
  }

  // Validate that user belongs to this specific business
  const business = await getBusinessByName(businessName)
  if (!business || business.id !== user.businessId) {
    // User doesn't belong to this business - clear session and redirect
    clearBusinessAdminSession()
    router.push(`/${businessName}/login`)
    return null
  }

  return user
}