'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useBusinessTheme } from '@/hooks/useBusinessTheme'

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

  // Apply business theme
  const { isLoading: themeLoading } = useBusinessTheme(user?.businessId)

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

  if (isLoading || themeLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen theme-font" style={{ backgroundColor: 'var(--background, #0a0a0a)' }}>
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
              <h1 className="text-3xl font-bold theme-primary" style={{ color: 'var(--theme-primary, #3b82f6)' }}>
                Appointments
              </h1>
              <p className="text-gray-400 mt-1">Manage your appointments and schedule</p>
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
                    variant={filter === filterOption.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterOption.key as any)}
                    className={filter === filterOption.key ? 'theme-bg-primary' : ''}
                  >
                    {filterOption.label}
                  </Button>
                ))}
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
                      <div className="h-24 bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-100">
                              {appointment.users.first_name} {appointment.users.last_name}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>

                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm text-gray-400">
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

                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <div>
                              <span className="font-medium">Phone:</span> {appointment.users.phone}
                            </div>
                            <div>
                              <span className="font-medium">Price:</span> ${appointment.services.price}
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-300">Notes:</span>
                              <p className="text-sm text-gray-400">{appointment.notes}</p>
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
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">
                    No {filter !== 'all' ? filter : ''} appointments
                  </h3>
                  <p className="text-gray-400 mb-4">
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
    </div>
  )
}