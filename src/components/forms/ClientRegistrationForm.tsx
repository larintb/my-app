'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { FinalClientRegistrationForm } from '@/types'

interface ClientRegistrationProps {
  token: string
  businessName: string
  onSuccess: (data: any) => void
}

export function ClientRegistrationForm({ token, businessName, onSuccess }: ClientRegistrationProps) {
  const [formData, setFormData] = useState<FinalClientRegistrationForm>({
    first_name: '',
    last_name: '',
    phone: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FinalClientRegistrationForm>>({})

  const handleInputChange = (field: keyof FinalClientRegistrationForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FinalClientRegistrationForm> = {}

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/register-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'Phone number already registered') {
          setErrors({ phone: 'This phone number is already registered' })
        } else if (data.error === 'Invalid or expired token') {
          setErrors({ phone: 'Registration link is invalid or expired' })
        } else {
          setErrors({ phone: data.error || 'Registration failed. Please try again.' })
        }
        return
      }

      if (data.success) {
        onSuccess({
          success: true,
          message: 'Welcome to ' + businessName + '!',
          user: data.user
        })
      } else {
        setErrors({ phone: 'Registration failed. Please try again.' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ phone: 'Registration failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen theme-font p-4" style={{ backgroundColor: 'var(--background, #f0f9ff)' }}>
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome!</h1>
          <p className="mt-2 text-gray-600">
            You're registering for <span className="font-semibold theme-primary" style={{ color: 'var(--theme-primary, #3b82f6)' }}>{businessName}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Registration</CardTitle>
            <CardDescription>
              Just a few details to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                error={errors.first_name}
                required
                autoFocus
              />

              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                error={errors.last_name}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={errors.phone}
                helper="We'll use this to contact you about your appointments"
                required
              />

              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full mt-6 theme-bg-primary"
                style={{ backgroundColor: 'var(--theme-primary, #3b82f6)' }}
                size="lg"
              >
                {isSubmitting ? 'Creating Account...' : 'Get Started'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            🔒 Your information is secure and will only be used by {businessName}
          </p>
        </div>
      </div>
    </div>
  )
}