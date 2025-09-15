'use client'

import { useEffect, useState } from 'react'
import { ClientRegistrationForm } from '@/components/forms/ClientRegistrationForm'
import { BusinessLandingPage } from '@/components/layouts/BusinessLandingPage'
import { ClientAppointmentInterface } from '@/components/client/ClientAppointmentInterface'
import { Card, CardContent } from '@/components/ui/Card'
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

  // Apply business theme
  const { isLoading: themeLoading } = useBusinessTheme(business?.id)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setToken(resolvedParams.token)
      await validateTokenAndLoadData(resolvedParams.token)
    }

    getParams()
  }, [params])

  const validateTokenAndLoadData = async (tokenValue: string) => {
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
      } else {
        setTokenStatus('invalid')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setTokenStatus('invalid')
    }
  }

  const loadBusinessServices = async (businessId: string) => {
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
  }

  const handleRegistrationSuccess = (data: any) => {
    if (data.user) {
      setUser(data.user)
      setTokenStatus('registered')
    }
  }

  const handleBookAppointment = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    alert(`Booking appointment for: ${service?.name}\nThis feature is coming soon!`)
  }

  const handleViewSchedule = () => {
    alert('Schedule view coming soon!')
  }

  if (tokenStatus === 'loading' || themeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md w-full">
            <div className="text-center">
              {/* Animated loading spinner */}
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-green-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cargando...</h3>
              <p className="text-gray-600">Validando tu acceso y cargando la información del negocio</p>
              
              {/* Loading dots animation */}
              <div className="flex justify-center mt-4 space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md w-full text-center">
            {/* Error icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Enlace No Válido</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Este enlace de tarjeta de negocio no es válido o ha sido desactivado.
            </p>
            
            {/* Action suggestions */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-amber-800 mb-2">¿Qué puedes hacer?</h4>
              <ul className="text-sm text-amber-700 space-y-1 text-left">
                <li>• Solicita una nueva tarjeta al negocio</li>
                <li>• Verifica que el enlace esté completo</li>
                <li>• Contacta directamente al establecimiento</li>
              </ul>
            </div>

            <button 
              onClick={() => window.history.back()} 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (tokenStatus === 'valid' && business) {
    return (
      <ClientRegistrationForm
        token={token}
        businessName={business.business_name}
        onSuccess={handleRegistrationSuccess}
      />
    )
  }

  if (tokenStatus === 'registered' && business && user) {
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