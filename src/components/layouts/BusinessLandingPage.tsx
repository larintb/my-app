'use client'

import { useState, useEffect } from 'react'
import { Business, Service, BusinessHours } from '@/types'

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
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
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

  const formatPhoneForDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="min-h-screen theme-font bg-gradient-to-br from-gray-50 to-gray-100" 
         style={{ 
           background: 'linear-gradient(135deg, var(--background, #f8fafc) 0%, var(--muted, #f1f5f9) 100%)',
           fontFamily: 'var(--theme-font-family, "Poppins", system-ui, sans-serif)'
         }}>
      
      {/* Hero Header Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ 
            background: `radial-gradient(circle at 50% 50%, var(--theme-primary, #3b82f6) 0%, transparent 70%)`
          }}
        ></div>
        
        <div className="relative px-6 py-12 text-center">
          {/* Business Image */}
          {business.business_image_url && (
            <div className="mb-6">
              <div className="relative inline-block">
                <img
                  src={business.business_image_url}
                  alt={business.business_name}
                  className="mx-auto h-32 w-32 rounded-full object-cover shadow-xl border-4 border-white"
                />
                <div 
                  className="absolute -inset-1 rounded-full opacity-20"
                  style={{ 
                    background: `linear-gradient(45deg, var(--theme-primary, #3b82f6), var(--theme-secondary, #1e40af))`
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Business Name & Info */}
          <div className="max-w-md mx-auto">
            <h1 
              className="text-4xl font-bold mb-3"
              style={{ color: 'var(--theme-primary, #1f2937)' }}
            >
              {business.business_name}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6 font-medium">
              {business.owner_name}
            </p>

            {/* Quick Contact Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a
                href={`tel:${business.phone}`}
                className="flex items-center justify-center px-6 py-3 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                style={{ 
                  backgroundColor: 'var(--theme-primary, #3b82f6)',
                  boxShadow: `0 10px 25px -5px var(--theme-primary, #3b82f6)40`
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {formatPhoneForDisplay(business.phone)}
              </a>
              
              <button
                onClick={onViewSchedule}
                className="flex items-center justify-center px-6 py-3 rounded-full font-semibold border-2 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                style={{ 
                  borderColor: 'var(--theme-primary, #3b82f6)',
                  color: 'var(--theme-primary, #3b82f6)',
                  backgroundColor: 'transparent'
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Schedule
              </button>
            </div>

            {/* Address */}
            <div className="flex items-center justify-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{business.address}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Services Section */}
      <div className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: 'var(--theme-primary, #1f2937)' }}
            >
              Our Services
            </h2>
            <p className="text-gray-600 text-lg">
              Professional services tailored to your needs
            </p>
          </div>

          {services.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-500 cursor-pointer"
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{ 
                      background: `linear-gradient(135deg, var(--theme-primary, #3b82f6), var(--theme-secondary, #1e40af))`
                    }}
                  ></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                            {service.description}
                          </p>
                        )}
                      </div>
                      
                      <div 
                        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ml-4"
                        style={{ backgroundColor: 'var(--theme-primary, #3b82f6)15' }}
                      >
                        <svg 
                          className="w-6 h-6"
                          style={{ color: 'var(--theme-primary, #3b82f6)' }}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-lg font-bold" 
                           style={{ color: 'var(--theme-primary, #059669)' }}>
                        <span className="text-2xl">$</span>
                        <span className="ml-1">{service.price.toFixed(2)}</span>
                      </div>
                      
                      <div className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {service.duration_minutes}min
                      </div>
                    </div>

                    <button
                      onClick={() => onBookAppointment(service.id)}
                      className="w-full mt-6 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      style={{ 
                        backgroundColor: 'var(--theme-primary, #3b82f6)',
                        backgroundImage: `linear-gradient(135deg, var(--theme-primary, #3b82f6), var(--theme-secondary, #1e40af))`
                      }}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-primary, #3b82f6)15' }}
              >
                <svg 
                  className="w-10 h-10"
                  style={{ color: 'var(--theme-primary, #3b82f6)' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Services Coming Soon
              </h3>
              <p className="text-gray-600">
                We&apos;re preparing our service offerings for you. Please check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Business Hours Section */}
      <div className="px-6 py-12" 
           style={{ backgroundColor: 'var(--theme-muted, #f8fafc)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: 'var(--theme-primary, #1f2937)' }}
            >
              Business Hours
            </h2>
            <p className="text-gray-600">
              Visit us during our operating hours
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {loadingHours ? (
              <div className="p-8 text-center">
                <div 
                  className="inline-block w-8 h-8 border-4 border-gray-200 rounded-full animate-spin"
                  style={{ borderTopColor: 'var(--theme-primary, #3b82f6)' }}
                ></div>
                <p className="mt-4 text-gray-600">Loading hours...</p>
              </div>
            ) : businessHours.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {businessHours.map((hour, index) => {
                  const isToday = new Date().getDay() === (hour.day_of_week === 0 ? 7 : hour.day_of_week)
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 flex justify-between items-center transition-colors duration-200 ${
                        isToday 
                          ? 'bg-gradient-to-r from-transparent to-transparent' 
                          : 'hover:bg-gray-50'
                      }`}
                      style={isToday ? { 
                        background: `linear-gradient(90deg, var(--theme-primary, #3b82f6)10, transparent)`
                      } : {}}
                    >
                      <span className={`font-semibold ${
                        isToday 
                          ? 'font-bold' 
                          : 'text-gray-700'
                      }`}
                      style={isToday ? { color: 'var(--theme-primary, #1f2937)' } : {}}>
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                          hour.day_of_week === 0 ? 6 : hour.day_of_week - 1
                        ]}
                        {isToday && (
                          <span className="ml-2 text-xs px-2 py-1 rounded-full font-medium text-white"
                                style={{ backgroundColor: 'var(--theme-primary, #3b82f6)' }}>
                            Today
                          </span>
                        )}
                      </span>
                      
                      <span className={`${
                        !hour.is_active
                          ? 'text-red-500 font-medium'
                          : isToday
                            ? 'font-bold'
                            : 'text-gray-600'
                      }`}
                      style={isToday && hour.is_active ? { color: 'var(--theme-primary, #1f2937)' } : {}}>
                        {!hour.is_active ? 'Closed' : `${hour.open_time} - ${hour.close_time}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--theme-primary, #3b82f6)15' }}
                >
                  <svg 
                    className="w-8 h-8"
                    style={{ color: 'var(--theme-primary, #3b82f6)' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hours Not Set
                </h3>
                <p className="text-gray-600">
                  Business hours will be displayed here once set
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-6 py-12 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto text-center">
          <div 
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, var(--theme-primary, #3b82f6), var(--theme-secondary, #1e40af))`
            }}
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h3 
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--theme-primary, #1f2937)' }}
          >
            Get in Touch
          </h3>
          
          <p className="text-gray-600 mb-6">
            Ready to book your appointment or have questions about our services?
          </p>

          <div className="space-y-3">
            <a
              href={`tel:${business.phone}`}
              className="w-full flex items-center justify-center px-6 py-3 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--theme-primary, #3b82f6)',
                backgroundImage: `linear-gradient(135deg, var(--theme-primary, #3b82f6), var(--theme-secondary, #1e40af))`
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Call {formatPhoneForDisplay(business.phone)}
            </a>

            <div className="flex items-center justify-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {business.address}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
