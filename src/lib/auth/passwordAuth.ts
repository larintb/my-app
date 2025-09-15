import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AuthError'
  }
}

// Login with email and password (for superuser and business_admin)
export async function loginWithPassword(email: string, password: string): Promise<User> {
  try {
    // Use Supabase auth for password authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS')
    }

    if (!data.user) {
      throw new AuthError('Authentication failed', 'AUTH_FAILED')
    }

    // Get user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      throw new AuthError('User not found', 'USER_NOT_FOUND')
    }

    return userData
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    console.error('Login error:', error)
    throw new AuthError('Login failed', 'LOGIN_ERROR')
  }
}

// Register user with password (for business admin during token registration)
export async function registerWithPassword(
  email: string,
  password: string,
  userData: Partial<User>
): Promise<User> {
  try {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      throw new AuthError('Registration failed', 'REGISTRATION_ERROR')
    }

    if (!data.user) {
      throw new AuthError('User creation failed', 'USER_CREATION_FAILED')
    }

    // Create user record in our users table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        ...userData,
        email,
        password_hash: data.user.id // Store Supabase user ID as reference
      })
      .select()
      .single()

    if (insertError || !newUser) {
      // Clean up Supabase user if our insert fails
      await supabase.auth.admin.deleteUser(data.user.id)
      throw new AuthError('Failed to create user profile', 'PROFILE_CREATION_ERROR')
    }

    return newUser
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    console.error('Registration error:', error)
    throw new AuthError('Registration failed', 'REGISTRATION_ERROR')
  }
}

// Get current authenticated user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (userError || !userData) {
      return null
    }

    return userData
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Logout user
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new AuthError('Logout failed', 'LOGOUT_ERROR')
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

// Verify user role
export async function verifyUserRole(requiredRole: string): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === requiredRole
}