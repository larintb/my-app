'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { LoginForm } from '@/types'
import { useBusinessTheme } from '@/hooks/useBusinessTheme'

interface BusinessLoginProps {
  businessName: string
  businessId: string
  onSuccess: (user: any) => void
}

export function BusinessLoginForm({ businessName, businessId, onSuccess }: BusinessLoginProps) {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<LoginForm & { general: string }>>({})

  // Apply business theme
  const { isLoading: themeLoading } = useBusinessTheme(businessId)

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/business-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessId: businessId
        })
      })

      const data = await response.json()

      if (data.success) {
        // Include business information in the user data
        const userData = {
          ...data.user,
          businessId: businessId,
          businessName: businessName
        }
        onSuccess(userData)
      } else {
        setErrors({ general: data.error || 'Login failed. Please try again.' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'An error occurred during login. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (themeLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-font" style={{ backgroundColor: 'var(--background, #0a0a0a)' }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-3xl font-bold theme-primary" style={{ color: 'var(--theme-primary, #3b82f6)' }}>
              {businessName}
            </h1>
            <p className="text-gray-400 mt-2">Business Admin Login</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your business dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="rounded-lg bg-red-950 border border-red-800 p-3">
                    <p className="text-sm text-red-400">{errors.general}</p>
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={errors.email}
                  placeholder="your-email@example.com"
                  required
                  autoFocus
                />

                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={errors.password}
                  placeholder="Enter your password"
                  required
                />

                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full mt-6 theme-bg-primary"
                  size="lg"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Need help? Contact support for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}