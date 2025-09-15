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

// Redirect to login if not authenticated
export function requireBusinessAdminAuth(businessName: string, router: any): BusinessAdminUser | null {
  const user = getBusinessAdminSession()
  if (!user) {
    clearBusinessAdminSession()
    router.push(`/${businessName}/login`)
    return null
  }
  return user
}