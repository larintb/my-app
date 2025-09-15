'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User } from '@/types'
import { getCurrentUser, logout } from '@/lib/auth/passwordAuth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  function login(userData: User) {
    setUser(userData)
  }

  async function handleLogout() {
    try {
      await logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout: handleLogout,
    isAuthenticated: user !== null
  }

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  )
}

// useAuth Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role-based access helpers
export function useRequireAuth(requiredRole?: string) {
  const { user, isLoading } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setHasAccess(false)
        return
      }

      if (requiredRole && user.role !== requiredRole) {
        setHasAccess(false)
        return
      }

      setHasAccess(true)
    }
  }, [user, isLoading, requiredRole])

  return { hasAccess, isLoading, user }
}