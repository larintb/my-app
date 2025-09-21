'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { LoginForm } from '@/types'

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
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
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
        setErrors({ general: data.error || 'Error de inicio de sesión. Inténtalo de nuevo.' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'Ocurrió un error durante el inicio de sesión. Inténtalo de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="min-h-screen bg-app">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-3xl font-bold accent-text">
              {businessName}
            </h1>
            <p className="text-muted mt-2">Inicio de Sesión de Administrador</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bienvenido de Vuelta</CardTitle>
              <CardDescription>
                Inicia sesión en tu panel de administración
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
                  label="Dirección de Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={errors.email}
                  placeholder="tu-email@ejemplo.com"
                  required
                  autoFocus
                />

                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={errors.password}
                  placeholder="Ingresa tu contraseña"
                  required
                />

                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full mt-6 btn-primary"
                  size="lg"
                >
                  {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted">
                  ¿Necesitas ayuda? Contacta soporte para asistencia.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}