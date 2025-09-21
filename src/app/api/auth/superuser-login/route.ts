import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db/users'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await getUserByEmail(email)

    if (!user || user.role !== 'superuser') {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password - for development, we stored plain text, but in production should be bcrypt
    let isValidPassword = false

    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (user.password_hash.startsWith('$2b$')) {
      // Bcrypt hashed password
      isValidPassword = await bcrypt.compare(password, user.password_hash)
    } else {
      // Plain text password (development only)
      isValidPassword = user.password_hash === password
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...userResponse } = user

    return NextResponse.json({
      success: true,
      user: userResponse
    })

  } catch (error) {
    console.error('Superuser login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}