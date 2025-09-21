import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes, and auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/' ||
    pathname.startsWith('/a/admin') ||
    pathname.startsWith('/c/') ||
    pathname.includes('/login')
  ) {
    return NextResponse.next()
  }

  // Check if it's a business admin route (format: /[businessname]/...)
  const businessRouteMatch = pathname.match(/^\/([^\/]+)\/(dashboard|services|appointments|clients|hours|settings|reports)/)

  if (businessRouteMatch) {
    const businessName = businessRouteMatch[1]

    // Check for authentication cookie/header
    const authCookie = request.cookies.get('businessAdmin')
    const authHeader = request.headers.get('authorization')

    // If no authentication found, redirect to login
    if (!authCookie && !authHeader) {
      const loginUrl = new URL(`/${businessName}/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    // If cookie exists, verify it's valid (basic check)
    if (authCookie) {
      try {
        const userData = JSON.parse(authCookie.value)
        if (!userData.businessId || !userData.id) {
          const loginUrl = new URL(`/${businessName}/login`, request.url)
          return NextResponse.redirect(loginUrl)
        }
      } catch {
        // Invalid cookie format
        const loginUrl = new URL(`/${businessName}/login`, request.url)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('businessAdmin')
        return response
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}