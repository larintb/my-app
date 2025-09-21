import { NextResponse } from 'next/server'
import { validateToken, getTokenWithBusiness, getUserByToken, getTokenByString } from '@/lib/db/tokens'

export async function POST(request: Request) {
  try {
    const { token, type } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // First try to validate as an active token
    let tokenData = await validateToken(token)

    // If not active, check if it's a used token (for returning clients)
    if (!tokenData) {
      const usedTokenData = await getTokenByString(token)
      if (usedTokenData && usedTokenData.status === 'used') {
        tokenData = usedTokenData
        // Note: could track isUsedToken here if needed for future logic
      }
    }

    if (!tokenData) {
      return NextResponse.json({
        success: false,
        error: 'Token is invalid or expired'
      }, { status: 400 })
    }

    // If type is specified, verify it matches
    if (type && tokenData.type !== type) {
      return NextResponse.json({
        success: false,
        error: 'Token type mismatch'
      }, { status: 400 })
    }

    const responseData: { success: boolean; token: { id: string; type: string; status: string; expires_at: string | null }; business?: { id: string; business_name: string; slug: string }; user?: { id: string; first_name?: string; last_name?: string; phone?: string; role?: string }; isRegistered?: boolean } = {
      success: true,
      token: {
        id: tokenData.id,
        type: tokenData.type,
        status: tokenData.status,
        expires_at: tokenData.expires_at || null
      }
    }

    // For final_client tokens, include business information
    if (tokenData.type === 'final_client') {
      const tokenWithBusiness = await getTokenWithBusiness(token)
      if (tokenWithBusiness?.business) {
        responseData.business = {
          id: tokenWithBusiness.business.id,
          business_name: tokenWithBusiness.business.business_name,
          slug: tokenWithBusiness.business.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }
      }

      // Check if user already registered with this token
      const existingUser = await getUserByToken(token)
      if (existingUser) {
        responseData.user = {
          id: existingUser.id,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          phone: existingUser.phone,
          role: existingUser.role as string
        }
        responseData.isRegistered = true
      } else {
        responseData.isRegistered = false
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}