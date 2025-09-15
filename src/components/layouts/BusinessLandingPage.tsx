'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Business, Service } from '@/types'

interface BusinessLandingPageProps {
  business: Business
  services: Service[]
  onBookAppointment: (serviceId: string) => void
  onViewSchedule: () => void
}

export function BusinessLandingPage({
  business,
  services = [],
  onBookAppointment,
  onViewSchedule
}: BusinessLandingPageProps) {
  const [businessHours, setBusinessHours] = useState<any[]>([])
  const [loadingHours, setLoadingHours] = useState(true)

  useEffect(() => {
    const loadBusinessHours = async () => {
      try {
        const response = await fetch(`/api/businesses/${business.id}/hours`)
        const data = await response.json()

        if (data.success) {
          setBusinessHours(data.hours)
        }
      } catch (error) {
        console.error('Error loading business hours:', error)
      } finally {
        setLoadingHours(false)
      }
    }

    loadBusinessHours()
  }, [business.id])
  return (
    <div className="min-h-screen theme-font" style={{ backgroundColor: 'var(--background, #f9fafb)' }}>
      {/* Header with business info */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="text-center">
            {business.business_image_url && (
              <div className="mb-4">
                <img
                  src={business.business_image_url}
                  alt={business.business_name}
                  className="mx-auto h-20 w-20 rounded-full object-cover"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold theme-primary">{business.business_name}</h1>
            <p className="mt-1 text-gray-600">{business.owner_name}</p>
            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p>📞 {business.phone}</p>
              <p>📍 {business.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Services Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Services</h2>

          {services.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <p>Services are being updated. Please call us for availability.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium theme-primary">
                            ${service.price.toFixed(2)}
                          </span>
                          <span>⏱️ {service.duration_minutes} min</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => onBookAppointment(service.id)}
                        size="sm"
                        className="ml-4 theme-bg-primary"
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={onViewSchedule}
            variant="outline"
            size="lg"
            className="theme-border-primary theme-primary"
          >
            📅 View Schedule
          </Button>

          <Button
            onClick={() => window.open(`tel:${business.phone}`, '_self')}
            variant="outline"
            size="lg"
          >
            📞 Call Now
          </Button>
        </div>

        {/* Business Hours Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHours ? (
              <div className="text-center text-gray-600">
                <p className="text-sm">Loading hours...</p>
              </div>
            ) : businessHours.length > 0 ? (
              <div className="space-y-2">
                {businessHours.map((hour: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm font-medium text-gray-700">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][hour.day_of_week]}
                    </span>
                    <span className="text-sm text-gray-600">
                      {hour.is_active ? `${hour.open_time} - ${hour.close_time}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600">
                <p className="text-sm">Hours not set</p>
                <p className="text-sm mt-1">Please call for current availability</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Phone:</span>
              <a
                href={`tel:${business.phone}`}
                className="theme-primary hover:underline"
              >
                {business.phone}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-700">Address:</span>
              <span className="text-gray-600">{business.address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="pt-8 pb-4 text-center">
          <p className="text-xs text-gray-500">
            Powered by MyCard - Digital Business Cards & Appointments
          </p>
        </div>
      </div>
    </div>
  )
}