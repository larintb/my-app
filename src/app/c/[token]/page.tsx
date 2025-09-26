'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { ClientRegistrationForm } from '@/components/forms/ClientRegistrationForm'
import { ClientAppointmentInterface } from '@/components/client/ClientAppointmentInterface'
import { useBusinessTheme } from '@/hooks/useBusinessTheme'
import { Business, Service, User } from '@/types'

interface PageProps {
  params: Promise<{ token: string }>
}

export default function ClientTokenPage({ params }: PageProps) {
  const [token, setToken] = useState<string>('')
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid' | 'registered'>('loading')
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [showSplash, setShowSplash] = useState(false)

  // Apply business theme
  const { isLoading: themeLoading } = useBusinessTheme(business?.id)

  const loadBusinessServices = useCallback(async (businessId: string) => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/services`)
      const data = await response.json()

      if (data.success) {
        // Only show active services
        const activeServices = data.services.filter((service: Service) => service.is_active)
        setServices(activeServices)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }, [])

  const validateTokenAndLoadData = useCallback(async (tokenValue: string) => {
    try {
      const response = await fetch('/api/tokens/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenValue, type: 'final_client' })
      })

      const data = await response.json()

      if (data.success) {
        if (data.business) {
          setBusiness(data.business)
          // Load services for this business
          await loadBusinessServices(data.business.id)
        }

        if (data.isRegistered && data.user) {
          setUser(data.user)
          setTokenStatus('registered')
        } else {
          setTokenStatus('valid')
        }

        // Show splash screen after successful validation
        setShowSplash(true)

        // Hide splash screen after 2 seconds
        setTimeout(() => {
          setShowSplash(false)
        }, 2000)
      } else {
        setTokenStatus('invalid')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setTokenStatus('invalid')
    }
  }, [loadBusinessServices])

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setToken(resolvedParams.token)
      await validateTokenAndLoadData(resolvedParams.token)
    }

    getParams()
  }, [params, validateTokenAndLoadData])

  const handleRegistrationSuccess = (data: { user: User }) => {
    setUser(data.user)
    setTokenStatus('registered')
  }

  // handleBookAppointment and handleViewSchedule functions removed as they were unused

  if (tokenStatus === 'loading' || themeLoading) {
    return (
      <div
        className="min-h-screen font-inter transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className="backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full feature-card"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="text-center">
              {/* Animated loading reload icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-green-500 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ animationDuration: '1.5s' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              </div>

              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Cargando...
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Validando tu acceso y cargando la información del negocio
              </p>

              {/* Enhanced loading dots animation */}
              <div className="flex justify-center mt-6 space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Splash screen after loading is complete
  if (showSplash && business) {
    return (
      <div
        className="min-h-screen font-inter transition-all duration-500 flex items-center justify-center"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="text-center">
          {/* Business logo/image with zoom in animation */}
          <div
            className="mb-6"
            style={{
              animation: 'zoomIn 0.8s ease-out forwards, fadeOut 0.5s ease-in 1.5s forwards'
            }}
          >
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              {business.business_image_url ? (
                <Image
                  src={business.business_image_url}
                  alt={`Logo de ${business.business_name}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <svg
                  className="w-12 h-12 text-white"
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

          {/* Business name with zoom in animation */}
          <h1
            className="text-3xl font-bold"
            style={{
              color: 'var(--text-primary)',
              animation: 'zoomIn 0.8s ease-out 0.3s forwards, fadeOut 0.5s ease-in 1.5s forwards',
              opacity: 0
            }}
          >
            {business.business_name}
          </h1>

          {/* Welcome text */}
          <p
            className="text-lg mt-2"
            style={{
              color: 'var(--text-secondary)',
              animation: 'zoomIn 0.8s ease-out 0.6s forwards, fadeOut 0.5s ease-in 1.5s forwards',
              opacity: 0
            }}
          >
            Bienvenido
          </p>
        </div>

        {/* Custom CSS animations */}
        <style jsx>{`
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.3);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes fadeOut {
            from {
              opacity: 1;
              transform: scale(1);
            }
            to {
              opacity: 0;
              transform: scale(1.1);
            }
          }
        `}</style>
      </div>
    )
  }

  if (tokenStatus === 'invalid') {
    return (
      <div
        className="min-h-screen font-inter transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className="backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full text-center feature-card"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            {/* Error icon */}
            <div className="mb-6">
              <div
                className="w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: 'var(--danger-color)' }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Enlace No Válido
            </h2>
            <p
              className="mb-6 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Este enlace de tarjeta de negocio no es válido o ha sido desactivado.
            </p>

            {/* Action suggestions */}
            <div
              className="rounded-xl p-4 mb-6"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--warning-color)',
                border: '1px solid'
              }}
            >
              <h4
                className="font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                ¿Qué puedes hacer?
              </h4>
              <ul
                className="text-sm space-y-1 text-left"
                style={{ color: 'var(--text-secondary)' }}
              >
                <li>• Solicita una nueva tarjeta al negocio</li>
                <li>• Verifica que el enlace esté completo</li>
                <li>• Contacta directamente al establecimiento</li>
              </ul>
            </div>

            <button
              onClick={() => window.history.back()}
              className="w-full btn-primary font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (tokenStatus === 'valid' && business && !showSplash) {
    return (
      <ClientRegistrationForm
        token={token}
        business={business}
        onSuccess={handleRegistrationSuccess}
      />
    )
  }

  if (tokenStatus === 'registered' && business && user && !showSplash) {
    return (
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: 'var(--background, #f8fafc)',
          color: 'var(--foreground, #1e293b)'
        }}
      >
        <ClientAppointmentInterface
          business={business}
          services={services}
          user={user}
          token={token}
        />
      </div>
    )
  }

  return null
}