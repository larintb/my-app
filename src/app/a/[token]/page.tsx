'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessRegistrationForm } from '@/components/forms/BusinessRegistrationForm'
import { Card, CardContent } from '@/components/ui/Card'
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle'
import { Business, User } from '@/types'

interface PageProps {
  params: Promise<{ token: string }>
}

export default function BusinessTokenPage({ params }: PageProps) {
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid' | 'used'>('loading')

  const validateToken = useCallback(async (tokenValue: string) => {
    try {
      const response = await fetch('/api/tokens/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenValue, type: 'business_admin' })
      })

      const data = await response.json()

      if (data.success) {
        if (data.token.status === 'active') {
          setTokenStatus('valid')
        } else if (data.token.status === 'used') {
          setTokenStatus('used')
        } else {
          setTokenStatus('invalid')
        }
      } else {
        setTokenStatus('invalid')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setTokenStatus('invalid')
    }
  }, [])

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setToken(resolvedParams.token)
      await validateToken(resolvedParams.token)
    }

    getParams()
  }, [params, validateToken])

  const handleRegistrationSuccess = (data: { business?: Business, user?: User }) => {
    // Show success message and redirect to business dashboard
    alert('¡Registro exitoso! Redirigiendo a tu panel de control...')

    if (data.business?.business_name) {
      // Use business_name to create the slug
      const slug = data.business.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      router.push(`/${slug}/dashboard`)
    } else {
      router.push('/a/admin')
    }
  }

  if (tokenStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="absolute top-4 right-4">
          <ClientThemeToggle />
        </div>
        <Card className="w-full max-w-md feature-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p style={{ color: 'var(--text-secondary)' }}>Validando token de invitación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="absolute top-4 right-4">
          <ClientThemeToggle />
        </div>
        <Card className="w-full max-w-md feature-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Token Inválido</h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Este enlace de invitación no es válido o ha expirado.
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Por favor, contacta al administrador para obtener una nueva invitación.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenStatus === 'used') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="absolute top-4 right-4">
          <ClientThemeToggle />
        </div>
        <Card className="w-full max-w-md feature-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Token Ya Utilizado</h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Esta invitación ya ha sido utilizada para crear una cuenta.
              </p>
              <button
                onClick={() => router.push('/a/login')}
                className="spotify-green-text hover:opacity-80 font-medium transition-opacity duration-300"
              >
                Ir al Login →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenStatus === 'valid') {
    return (
      <BusinessRegistrationForm
        token={token}
        onSuccess={handleRegistrationSuccess}
      />
    )
  }

  return null
}