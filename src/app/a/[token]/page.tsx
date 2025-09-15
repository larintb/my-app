'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessRegistrationForm } from '@/components/forms/BusinessRegistrationForm'
import { Card, CardContent } from '@/components/ui/Card'

interface PageProps {
  params: Promise<{ token: string }>
}

export default function BusinessTokenPage({ params }: PageProps) {
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid' | 'used'>('loading')

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setToken(resolvedParams.token)
      await validateToken(resolvedParams.token)
    }

    getParams()
  }, [params])

  const validateToken = async (tokenValue: string) => {
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
  }

  const handleRegistrationSuccess = (data: any) => {
    // Show success message and redirect to business dashboard
    alert('Registration successful! Redirecting to your dashboard...')

    if (data.business?.slug) {
      router.push(`/${data.business.slug}/dashboard`)
    } else {
      router.push('/a/admin')
    }
  }

  if (tokenStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Validating invitation token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Invalid Token</h2>
              <p className="text-gray-400 mb-4">
                This invitation link is not valid or has expired.
              </p>
              <p className="text-sm text-gray-500">
                Please contact the administrator for a new invitation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenStatus === 'used') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Token Already Used</h2>
              <p className="text-gray-400 mb-4">
                This invitation has already been used to create an account.
              </p>
              <button
                onClick={() => router.push('/a/login')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Go to Login →
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