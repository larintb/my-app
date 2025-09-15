'use client'

import { useEffect, useState } from 'react'
import { ClientRegistrationForm } from '@/components/forms/ClientRegistrationForm'
import { BusinessLandingPage } from '@/components/layouts/BusinessLandingPage'
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
      <div className="min-h-screen theme-font" style={{ backgroundColor: 'var(--background, #f9fafb)' }}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-primary mx-auto mb-4" style={{ borderBottomColor: 'var(--theme-primary, #3b82f6)' }}></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen theme-font" style={{ backgroundColor: 'var(--background, #f9fafb)' }}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
                <p className="text-gray-600 mb-4">
                  This business card link is not valid or has been deactivated.
                </p>
                <p className="text-sm text-gray-500">
                  Please ask the business for a new card or link.
                </p>
              </div>
            </CardContent>
          </Card>
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
      <BusinessLandingPage
        business={business}
        services={services}
        onBookAppointment={handleBookAppointment}
        onViewSchedule={handleViewSchedule}
      />
    )
  }

  return null
}