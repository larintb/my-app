'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface PageProps {
  params: Promise<{ businessname: string }>
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  users: {
    first_name: string
    last_name: string
    phone: string
  }
  services: {
    name: string
    price: number
    duration_minutes: number
  }
}

export default function AppointmentsPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'confirmed'>('today')
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [checkinCode, setCheckinCode] = useState('')
  const [checkinLoading, setCheckinLoading] = useState(false)


  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setBusinessName(decodeURIComponent(resolvedParams.businessname))
      checkAuth()
    }

    getParams()
  }, [params])

  const checkAuth = () => {
    const savedUser = localStorage.getItem('businessAdmin')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        loadAppointments(userData.businessId)
      } catch (error) {
        localStorage.removeItem('businessAdmin')
        router.push(`/${businessName}/login`)
      }
    } else {
      router.push(`/${businessName}/login`)
    }
    setIsLoading(false)
  }

  const loadAppointments = async (businessId: string) => {
    try {
      setLoadingAppointments(true)
      const response = await fetch(`/api/businesses/${businessId}/appointments`)
      const data = await response.json()

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoadingAppointments(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const response = await fetch(`/api/businesses/${user.businessId}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        await loadAppointments(user.businessId)
        alert(`Appointment ${newStatus} successfully!`)
      } else {
        alert('Failed to update appointment: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Failed to update appointment')
    }
  }

  const confirmWithCode = async () => {
    if (!checkinCode.trim() || checkinCode.length !== 6) {
      alert('Por favor ingresa un código de 6 caracteres válido')
      return
    }

    setCheckinLoading(true)
    try {
      // Verificar código usando la nueva API
      const response = await fetch('/api/checkin-codes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: checkinCode.trim().toUpperCase(),
          businessId: user.businessId
        })
      })

      const data = await response.json()

      if (data.success) {
        await loadAppointments(user.businessId)
        setShowCheckinModal(false)
        setCheckinCode('')

        const statusText = data.appointment.newStatus === 'confirmed' ? 'confirmada' : 'completada'
        alert(`✅ Cita ${statusText} exitosamente!\n\nCliente: ${data.appointment.client}\nServicio: ${data.appointment.service}\nHora: ${data.appointment.time}`)
      } else {
        alert('❌ ' + (data.error || 'Código inválido o expirado'))
      }
    } catch (error) {
      console.error('Error en check-in:', error)
      alert('❌ Error al procesar el check-in')
    } finally {
      setCheckinLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0]

    switch (filter) {
      case 'today':
        return appointment.appointment_date === today
      case 'pending':
        return appointment.status === 'pending'
      case 'confirmed':
        return appointment.status === 'confirmed'
      default:
        return true
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900'
      case 'confirmed': return 'text-green-400 bg-green-900'
      case 'completed': return 'text-blue-400 bg-blue-900'
      case 'cancelled': return 'text-red-400 bg-red-900'
      default: return 'text-gray-400 bg-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 accent-text"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-app">
      <div className="p-4">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => router.push(`/${businessName}/dashboard`)}
                variant="outline"
                size="sm"
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold accent-text">
                Appointments
              </h1>
              <p className="text-muted mt-1">Manage your appointments and schedule</p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'today', label: 'Today' },
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' }
                ].map((filterOption) => (
                  <Button
                    key={filterOption.key}
                    variant={filter === filterOption.key ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterOption.key as any)}
                    className={filter === filterOption.key ? 'btn-primary' : ''}
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>
              
              {/* Botón de Check-in con código */}
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  onClick={() => setShowCheckinModal(true)}
                  variant="primary"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Procesar Código de Cliente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filter === 'today' ? "Today's Appointments" :
                 filter === 'all' ? 'All Appointments' :
                 `${filter.charAt(0).toUpperCase() + filter.slice(1)} Appointments`}
              </CardTitle>
              <CardDescription>
                {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-app">
                              {appointment.users.first_name} {appointment.users.last_name}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>

                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm text-muted">
                            <div>
                              <span className="font-medium">Service:</span> {appointment.services.name}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {formatDate(appointment.appointment_date)}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {formatTime(appointment.appointment_time)}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {appointment.services.duration_minutes} min
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                            <div>
                              <span className="font-medium">Phone:</span> {appointment.users.phone}
                            </div>
                            <div>
                              <span className="font-medium">Price:</span> ${appointment.services.price}
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-app">Notes:</span>
                              <p className="text-sm text-muted">{appointment.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {appointment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-app mb-2">
                    No {filter !== 'all' ? filter : ''} appointments
                  </h3>
                  <p className="text-muted mb-4">
                    {filter === 'today'
                      ? "You don't have any appointments scheduled for today"
                      : `No ${filter !== 'all' ? filter : ''} appointments found`
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Check-in con Código */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-app">Check-in con Código</h3>
              <button
                onClick={() => {
                  setShowCheckinModal(false);
                  setCheckinCode('');
                }}
                className="text-muted hover:text-app">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Información de citas disponibles */}
              <div className="bg-muted/20 rounded-lg p-3">
                <h4 className="text-sm font-medium text-app mb-2">Citas disponibles para check-in:</h4>
                {(() => {
                  const today = new Date().toISOString().split('T')[0]
                  const availableAppointments = appointments.filter(appointment => {
                    return appointment.appointment_date >= today &&
                           (appointment.status === 'pending' || appointment.status === 'confirmed')
                  })
                  
                  if (availableAppointments.length === 0) {
                    return <p className="text-xs text-muted">No hay citas disponibles para check-in</p>
                  }

                  return (
                    <div className="space-y-1">
                      {availableAppointments.slice(0, 3).map((apt) => (
                        <div key={apt.id} className="flex justify-between items-center text-xs">
                          <span className="text-app">
                            {apt.users.first_name} {apt.users.last_name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted">{apt.appointment_date} {apt.appointment_time}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              apt.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-green-900 text-green-300'
                            }`}>
                              {apt.status === 'pending' ? 'Por confirmar' : 'Confirmar llegada'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {availableAppointments.length > 3 && (
                        <p className="text-xs text-muted mt-1">
                          +{availableAppointments.length - 3} citas más
                        </p>
                      )}
                    </div>
                  )
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">
                  Código de 6 dígitos
                </label>
                <input
                  type="text"
                  value={checkinCode}
                  onChange={(e) => setCheckinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="Ej: A3B2C1"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-app text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  maxLength={6}
                />
                <p className="text-xs text-muted mt-1">
                  Ingresa el código mostrado en la pantalla del cliente
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowCheckinModal(false);
                    setCheckinCode('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmWithCode}
                  variant="primary"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={checkinCode.length !== 6 || checkinLoading}
                >
                  {checkinLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    'Procesar Check-in'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}