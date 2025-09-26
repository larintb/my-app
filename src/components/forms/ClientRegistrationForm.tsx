'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle'
import { FinalClientRegistrationForm, User, Business } from '@/types'
import Image from 'next/image'

interface ClientRegistrationSuccessData {
  success: boolean
  message: string
  user: User
}

interface ClientRegistrationProps {
  token: string
  business: Business
  onSuccess: (data: ClientRegistrationSuccessData) => void
}

export function ClientRegistrationForm({ token, business, onSuccess }: ClientRegistrationProps) {
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
          message: 'Welcome to ' + business.business_name + '!',
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
    <div className="min-h-screen theme-font p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="absolute top-4 right-4">
        <ClientThemeToggle />
      </div>
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden shadow-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              {business.business_image_url ? (
                <Image
                  src={business.business_image_url}
                  alt={`Logo de ${business.business_name}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>¡Bienvenido!</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Te estás registrando en <span className="font-semibold spotify-green-text">{business.business_name}</span>
          </p>
        </div>

        <Card className="feature-card">
          <CardHeader>
            <CardTitle>Registro Rápido</CardTitle>
            <CardDescription>
              Solo algunos detalles para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre"
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                error={errors.first_name}
                required
                autoFocus
              />

              <Input
                label="Apellido"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                error={errors.last_name}
                required
              />

              <Input
                label="Número de Teléfono"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={errors.phone}
                helper="Usaremos esto para contactarte sobre tus citas"
                required
              />

              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full mt-6"
                size="lg"
              >
                {isSubmitting ? 'Creando Cuenta...' : 'Comenzar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            🔒 Tu información es segura y solo será utilizada por {business.business_name}
          </p>
        </div>
      </div>
    </div>
  )
}