import { supabase } from '@/lib/supabase'
import { InvitationToken, TokenType, User, Business } from '@/types'

export class TokenAuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'TokenAuthError'
  }
}

// Validate token and get token data
export async function validateToken(token: string): Promise<InvitationToken | null> {
  try {
    const { data, error } = await supabase
      .from('invitation_tokens')
      .select('*')
      .eq('token', token)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return null
    }

    // Check if token is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      await markTokenExpired(token)
      return null
    }

    return data
  } catch (error) {
    console.error('Error validating token:', error)
    return null
  }
}

// Mark token as used after successful registration
export async function markTokenAsUsed(tokenId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('invitation_tokens')
    .update({
      status: 'used',
      used_by: userId,
      used_at: new Date().toISOString()
    })
    .eq('id', tokenId)

  if (error) {
    throw new TokenAuthError('Failed to mark token as used', 'TOKEN_UPDATE_ERROR')
  }
}

// Mark token as expired
export async function markTokenExpired(token: string): Promise<void> {
  const { error } = await supabase
    .from('invitation_tokens')
    .update({ status: 'expired' })
    .eq('token', token)

  if (error) {
    console.error('Error marking token as expired:', error)
  }
}

// Generate a new invitation token
export async function generateInvitationToken(
  type: TokenType,
  createdBy: string,
  businessId?: string,
  expiresInDays?: number
): Promise<string> {
  const token = generateRandomToken()
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { error } = await supabase
    .from('invitation_tokens')
    .insert({
      token,
      type,
      created_by: createdBy,
      business_id: businessId,
      expires_at: expiresAt
    })

  if (error) {
    throw new TokenAuthError('Failed to generate invitation token', 'TOKEN_CREATION_ERROR')
  }

  return token
}

// Check if user already exists for a token (for final clients using NFC)
export async function getUserByToken(token: string): Promise<User | null> {
  try {
    // First get the token data
    const tokenData = await validateToken(token)
    if (!tokenData) return null

    // For final client tokens, check if someone already registered with this token
    if (tokenData.type === 'final_client' && tokenData.used_by) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', tokenData.used_by)
        .single()

      if (error || !data) return null
      return data
    }

    return null
  } catch (error) {
    console.error('Error getting user by token:', error)
    return null
  }
}

// Get business associated with a final client token
export async function getBusinessByToken(token: string): Promise<Business | null> {
  try {
    const { data, error } = await supabase
      .from('invitation_tokens')
      .select(`
        business_id,
        businesses (
          *
        )
      `)
      .eq('token', token)
      .eq('type', 'final_client')
      .single()

    if (error || !data?.businesses) return null
    return data.businesses as unknown as Business
  } catch (error) {
    console.error('Error getting business by token:', error)
    return null
  }
}

// Generate random token string
function generateRandomToken(): string {
  return Math.random().toString(36).substring(2) +
         Math.random().toString(36).substring(2) +
         Date.now().toString(36)
}

// Token URL generators
export function generateBusinessAdminTokenUrl(token: string, baseUrl: string = ''): string {
  return `${baseUrl}/a/${token}`
}

export function generateFinalClientTokenUrl(token: string, baseUrl: string = ''): string {
  return `${baseUrl}/c/${token}`
}