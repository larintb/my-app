'use client'

import { useState, useEffect } from 'react'
import { Business, Service, User } from '@/types'
import { DynamicCalendar } from './DynamicCalendar'
import { QRCodeGenerator } from '../ui/QRCodeGenerator'
import { GoogleMap } from '../ui/GoogleMap'
import { Button } from '../ui/Button'

interface ClientAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  service?: {
    id: string
    name: string
    duration_minutes: number
    price: number
  }
}

interface AppointmentSlot {
  date: string
  time: string
}

interface CalendarSelection {
  year: number | null
  month: number | null
  day: number | null
  step: 'month' | 'day' | 'time'
}

interface BusinessHour {
  id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_active: boolean
}

interface ClientAppointmentInterfaceProps {
  business: Business
  services: Service[]
  user: User
  token: string
}

type ScreenType = 'home' | 'services' | 'calendar' | 'appointments' | 'business-info' | 'confirmation'

export function ClientAppointmentInterface({
  business,
  services,
  user,
  token
}: ClientAppointmentInterfaceProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home')
  const [appointments, setAppointments] = useState<ClientAppointment[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const [calendarSelection, setCalendarSelection] = useState<CalendarSelection>({
    year: null,
    month: null,
    day: null,
    step: 'month'
  })
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([])
  const [loadingHours, setLoadingHours] = useState(false)
  const [loading, setLoading] = useState(false)

  // Helper function to get service data
  const getServiceData = (appointment: ClientAppointment) => {
    return appointment.service || null
  }

  // Helper function to safely parse date strings avoiding timezone issues
  const parseDateString = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num))
    return new Date(year, month - 1, day) // month is 0-indexed
  }

  useEffect(() => {
    loadUserAppointments()
    loadBusinessHours()
  }, [])

  const loadUserAppointments = async () => {
    try {
      const response = await fetch(`/api/businesses/${business.id}/client-appointments?client_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    }
  }

  const loadBusinessHours = async () => {
    setLoadingHours(true)
    try {
      const response = await fetch(`/api/businesses/${business.id}/hours`)
      const data = await response.json()
      if (data.success) {
        setBusinessHours(data.hours || [])
      }
    } catch (error) {
      console.error('Error loading business hours:', error)
    } finally {
      setLoadingHours(false)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedService || !selectedSlot) return

    setLoading(true)
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          business_id: business.id,
          service_id: selectedService.id,
          user_id: user.id,
          appointment_date: selectedSlot.date,
          appointment_time: selectedSlot.time
        })
      })

      const data = await response.json()
      if (data.success) {
        setCurrentScreen('confirmation')
        loadUserAppointments()
      } else {
        alert('Error al agendar la cita: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Error al agendar la cita. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return days[dayOfWeek]
  }

  const renderNavigation = () => (
    <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-lg sticky top-0 z-50">
      {/* Gradient overlay for smoother effect */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative px-4 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Animated business avatar */}
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-3a1 1 0 011-1h2a1 1 0 011 1v3" />
              </svg>
            </div>
            <div className="text-white">
              <h1 className="font-bold text-lg leading-tight">{business.business_name}</h1>
              <p className="text-xs text-white/80">¡Hola, {user.first_name}!</p>
            </div>
          </div>

          {/* Back to home button - only show if not on home */}
          {currentScreen !== 'home' && (
            <button
              onClick={() => setCurrentScreen('home')}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium px-4 py-2 rounded-full text-sm transition-all duration-200 flex items-center space-x-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Inicio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderHome = () => (
    <div className="px-4 pb-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Welcome section with improved mobile design */}
      <div className="pt-6 pb-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Bienvenido!
        </h2>
        <p className="text-gray-600 text-lg mb-2">
          {business.business_name}
        </p>
        <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Cliente Registrado
        </div>
      </div>

      {/* Action cards optimized for mobile */}
      <div className="space-y-4">
        {/* Primary action - Book appointment */}
        <button
          onClick={() => setCurrentScreen('services')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl p-6 shadow-lg active:scale-[0.98] transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Agendar Cita</h3>
                  <p className="text-white/80 text-sm">Ver servicios disponibles</p>
                </div>
              </div>
            </div>
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Secondary actions grid */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentScreen('appointments')}
            className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg active:scale-[0.98] transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-base">Mis Citas</h3>
            <p className="text-gray-600 text-sm">
              {appointments.length === 0 ? 'Sin citas' : `${appointments.length} cita${appointments.length !== 1 ? 's' : ''}`}
            </p>
          </button>

          <button
            onClick={() => setCurrentScreen('business-info')}
            className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg active:scale-[0.98] transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-base">Info</h3>
            <p className="text-gray-600 text-sm">Detalles del negocio</p>
          </button>
        </div>

        {/* Next appointment card */}
        {appointments.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Próxima Cita</h3>
                    <p className="text-white/80 text-sm">
                      {getServiceData(appointments[0])?.name || 'Servicio programado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderServices = () => (
    <div className="px-4 pb-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header with back navigation */}
      <div className="pt-6 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="mr-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 active:scale-95"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
            <p className="text-gray-600">Selecciona un servicio para agendar</p>
          </div>
        </div>
      </div>

      {/* Services list optimized for mobile */}
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="mb-4">
              {/* Service header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{service.name}</h3>
                  {service.description && (
                    <p className="text-gray-600 text-base leading-relaxed mb-3">{service.description}</p>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(service.price)}
                  </div>
                </div>
              </div>

              {/* Service details */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{service.duration_minutes} minutos</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-green-600 font-medium">Disponible</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => {
                setSelectedService(service)
                setCurrentScreen('calendar')
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-lg">Agendar Cita</span>
            </button>
          </div>
        ))}

        {/* Empty state */}
        {services.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin servicios disponibles</h3>
            <p className="text-gray-600">Este negocio aún no ha configurado sus servicios.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderCalendar = () => (
    <div className="px-4 pb-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header with back navigation */}
      <div className="pt-6 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setCurrentScreen('services')}
            className="mr-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 active:scale-95"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedService?.name}
            </h2>
            <p className="text-gray-600">Selecciona fecha y hora para tu cita</p>
          </div>
        </div>

        {/* Service info card */}
        {selectedService && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedService.name}</h3>
                <p className="text-white/80 text-sm">{selectedService.duration_minutes} minutos</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatCurrency(selectedService.price)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedService && (
        <DynamicCalendar
          businessId={business.id}
          onTimeSlotSelected={(date: string, time: string) => {
            setSelectedSlot({ date, time })
          }}
          onBack={() => setCurrentScreen('services')}
        />
      )}
      
      {selectedSlot && selectedService && (
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="font-bold text-xl text-gray-900 mb-6">Confirmar Reserva</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <span className="text-gray-600 text-sm">Servicio</span>
                <div className="font-bold text-gray-900">{selectedService.name}</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <span className="text-gray-600 text-sm">Fecha</span>
                <div className="font-bold text-gray-900">{parseDateString(selectedSlot.date).toLocaleDateString('es-MX')}</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="text-gray-600 text-sm">Hora</span>
                <div className="font-bold text-gray-900">{formatTime(selectedSlot.time)} ({selectedService.duration_minutes} min)</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <div>
                <span className="text-gray-600 text-sm">Precio</span>
                <div className="font-bold text-green-700 text-lg">{formatCurrency(selectedService.price)}</div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleBookAppointment}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] text-lg"
            >
              {loading ? 'Confirmando...' : 'Confirmar Cita'}
            </button>
            <button
              onClick={() => setSelectedSlot(null)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] text-lg"
            >
              Cambiar Horario
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderAppointments = () => (
    <div className="px-4 pb-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header with back navigation */}
      <div className="pt-6 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="mr-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 active:scale-95"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mis Citas</h2>
            <p className="text-gray-600">Gestiona tus citas programadas</p>
          </div>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Sin citas programadas</h3>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">¡Agenda tu primera cita y descubre nuestros servicios!</p>
          <button 
            onClick={() => setCurrentScreen('services')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 active:scale-[0.98] text-lg"
          >
            Ver Servicios
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {getServiceData(appointment)?.name || 'Servicio no disponible'}
                  </h3>
                  <div className="flex items-center text-gray-600 text-base mb-3">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">
                      {parseDateString(appointment.appointment_date).toLocaleDateString('es-MX', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 text-base mb-4">
                    <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">
                      {formatTime(appointment.appointment_time)} ({getServiceData(appointment)?.duration_minutes || 0} min)
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-3 ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmada' :
                     appointment.status === 'pending' ? 'Pendiente' :
                     appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(getServiceData(appointment)?.price || 0)}
                  </div>
                </div>
              </div>

              {/* Action button for pending appointments */}
              {appointment.status === 'pending' && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 active:scale-[0.98]">
                    Gestionar Cita
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add new appointment button */}
          <div className="mt-8">
            <button 
              onClick={() => setCurrentScreen('services')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-lg">Agendar Nueva Cita</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderBusinessInfo = () => (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Información del Negocio</h2>
        <p className="text-gray-600">Detalles de contacto y ubicación</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Detalles de Contacto</h3>
            
            {business.phone && (
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">{business.phone}</span>
              </div>
            )}

            {business.address && (
              <div className="flex items-start mb-3">
                <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700">{business.address}</span>
              </div>
            )}
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Horarios de Atención</h3>
            {loadingHours ? (
              <div className="text-gray-500">Cargando horarios...</div>
            ) : businessHours.length > 0 ? (
              <div className="space-y-2">
                {businessHours.map((hour) => (
                  <div key={hour.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{getDayName(hour.day_of_week)}</span>
                    <span className="text-gray-600">
                      {hour.is_active 
                        ? `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`
                        : 'Cerrado'
                      }
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No hay horarios configurados</div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 pb-0">
            <h3 className="font-semibold text-gray-900 mb-4">Ubicación</h3>
          </div>
          <div className="h-80">
            {business.address ? (
              <GoogleMap address={business.address} businessName={business.business_name} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <p>Ubicación no disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cita Agendada!</h2>
        <p className="text-gray-600 mb-6">
          Tu cita ha sido programada exitosamente. Recibirás una confirmación pronto.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => setCurrentScreen('appointments')}
            className="w-full"
          >
            Ver Mis Citas
          </Button>
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-full text-green-600 hover:text-green-700 font-medium"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 transition-all duration-300">
      {renderNavigation()}
      
      {/* Screen content with smooth transitions */}
      <div className="transition-all duration-300 ease-in-out">
        <div className="opacity-100 transform translate-y-0 transition-all duration-300">
          {currentScreen === 'home' && renderHome()}
          {currentScreen === 'services' && renderServices()}
          {currentScreen === 'calendar' && renderCalendar()}
          {currentScreen === 'appointments' && renderAppointments()}
          {currentScreen === 'business-info' && renderBusinessInfo()}
          {currentScreen === 'confirmation' && renderConfirmation()}
        </div>
      </div>

      {/* Mobile-optimized safe area bottom spacing */}
      <div className="h-8 md:h-4"></div>
    </div>
  )
}
