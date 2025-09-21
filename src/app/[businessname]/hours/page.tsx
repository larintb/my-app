'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle'

interface PageProps {
  params: Promise<{ businessname: string }>
}

interface BusinessHour {
  id?: string
  day_of_week: number
  open_time: string
  close_time: string
  is_active: boolean
}

const DAYS_OF_WEEK = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
]

export default function BusinessHoursPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([])
  const [loadingHours, setLoadingHours] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Simple time formatter - no complex validation
  const formatTimeForDisplay = (timeStr: string): string => {
    if (!timeStr) return '09:00'
    return timeStr
  }

  // Generate time options for dropdowns in 24-hour format
  const generateTimeOptions = () => {
    const times = []
    for (let hour = 1; hour < 24; hour++) { // Start from 1 to avoid midnight
      for (let minute of ['00', '30']) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`
        times.push({ value: timeStr, label: timeStr }) // Use 24-hour format for both value and label
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      const name = decodeURIComponent(resolvedParams.businessname)
      setBusinessName(name)
      checkAuth()
    }

    getParams()
  }, [params])

  const checkAuth = () => {
    const savedUser = localStorage.getItem('businessAdmin')
    console.log('Checking auth, savedUser:', !!savedUser)

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        console.log('Parsed user data:', userData)

        // Validate that we have required fields
        if (!userData.businessId) {
          console.error('User data missing businessId')
          localStorage.removeItem('businessAdmin')
          router.push(`/${businessName}/login`)
          return
        }

        setUser(userData)
        loadBusinessHours(userData.businessId)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('businessAdmin')
        router.push(`/${businessName}/login`)
      }
    } else {
      console.log('No saved user, redirecting to login')
      router.push(`/${businessName}/login`)
    }
    setIsLoading(false)
  }

  const loadBusinessHours = async (businessId: string) => {
    try {
      setLoadingHours(true)
      console.log('Loading business hours for businessId:', businessId)

      const response = await fetch(`/api/businesses/${businessId}/hours`)
      console.log('Hours API response status:', response.status)

      const data = await response.json()
      console.log('Hours API response data:', data)

      if (data.success) {
        const existingHours = data.hours || []
        console.log('Existing hours from database:', existingHours)
        
        // Log each individual hour record for debugging
        existingHours.forEach((hour: any, index: number) => {
          console.log(`Hour ${index}: day=${hour.day_of_week}, open="${hour.open_time}", close="${hour.close_time}", active=${hour.is_active}`)
        })

        // Create array for all 7 days of the week
        const allDayHours = DAYS_OF_WEEK.map((_, dayIndex) => {
          const existing = existingHours.find((h: BusinessHour) => h.day_of_week === dayIndex)

          if (existing) {
            // Use existing values, normalizing time format (remove seconds if present)
            let openTime = existing.open_time || '09:00'
            let closeTime = existing.close_time || '17:00'
            
            // Normalize time format: convert "09:00:00" to "09:00"
            if (openTime.includes(':')) {
              openTime = openTime.substring(0, 5) // Take only HH:MM part
            }
            if (closeTime.includes(':')) {
              closeTime = closeTime.substring(0, 5) // Take only HH:MM part
            }
            
            // Replace midnight with sensible defaults
            if (openTime === '00:00') openTime = '09:00'
            if (closeTime === '00:00') closeTime = '17:00'
            
            console.log(`Day ${dayIndex}: normalized open="${openTime}", close="${closeTime}"`)
            
            return {
              id: existing.id,
              day_of_week: dayIndex,
              open_time: openTime,
              close_time: closeTime,
              is_active: existing.is_active
            }
          }

          // Create default values for days that don't exist in database
          return {
            day_of_week: dayIndex,
            open_time: '09:00',
            close_time: '17:00',
            is_active: false
          }
        })

        console.log('Final processed business hours:', allDayHours)
        setBusinessHours(allDayHours)
      } else {
        console.error('Failed to load business hours:', data.error)
        // Initialize with empty hours if API fails
        const emptyHours = DAYS_OF_WEEK.map((_, dayIndex) => ({
          day_of_week: dayIndex,
          open_time: '09:00',
          close_time: '17:00',
          is_active: false
        }))
        setBusinessHours(emptyHours)
      }
    } catch (error) {
      console.error('Error loading business hours:', error)
      // Initialize with empty hours on error
      const emptyHours = DAYS_OF_WEEK.map((_, dayIndex) => ({
        day_of_week: dayIndex,
        open_time: '09:00',
        close_time: '17:00',
        is_active: false
      }))
      setBusinessHours(emptyHours)
    } finally {
      setLoadingHours(false)
    }
  }

  const updateDayHours = (dayIndex: number, field: keyof BusinessHour, value: any) => {
    setBusinessHours(prev => prev.map(hour => {
      if (hour.day_of_week === dayIndex) {
        const updatedHour = { ...hour, [field]: value }

        // If activating a day and times are empty, set reasonable defaults
        if (field === 'is_active' && value === true) {
          if (!updatedHour.open_time || updatedHour.open_time === '00:00') {
            updatedHour.open_time = '09:00'
          }
          if (!updatedHour.close_time || updatedHour.close_time === '00:00') {
            updatedHour.close_time = '17:00'
          }
        }

        return updatedHour
      }
      return hour
    }))
  }

  // Handle dropdown time change
  const handleDropdownTimeChange = (dayIndex: number, field: 'open_time' | 'close_time', selectedValue: string) => {
    updateDayHours(dayIndex, field, selectedValue)
  }

  const saveBusinessHours = async () => {
    if (!user?.businessId) {
      alert('No se encontró ID del negocio. Por favor inicia sesión nuevamente.')
      return
    }

    try {
      setIsSaving(true)
      console.log('Saving business hours for businessId:', user.businessId)
      console.log('Business hours to save:', businessHours)

      // Simple validation
      const validationErrors = validateBusinessHours()
      
      if (validationErrors.length > 0) {
        alert('Por favor corrige los siguientes problemas:\n' + validationErrors.join('\n'))
        return
      }

      const requestBody = { hours: businessHours }
      console.log('Request body:', requestBody)
      console.log('Individual hours being sent:')
      businessHours.forEach((hour, index) => {
        console.log(`Day ${index} (${DAYS_OF_WEEK[index]}): active=${hour.is_active}, open="${hour.open_time}", close="${hour.close_time}"`)
        if (hour.is_active) {
          console.log(`  -> This day will be saved to database`)
        }
      })

      const response = await fetch(`/api/businesses/${user.businessId}/hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Save response status:', response.status)
      const data = await response.json()
      console.log('Save response data:', data)

      if (data.success) {
        alert('¡Horarios guardados exitosamente!')
        await loadBusinessHours(user.businessId)
      } else {
        console.error('Save failed:', data.error)
        alert('Error al guardar horarios: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error saving business hours:', error)
      alert('Error al guardar horarios. Revisa la consola para más detalles.')
    } finally {
      setIsSaving(false)
    }
  }

  const validateBusinessHours = (): string[] => {
    const errors: string[] = []
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

    businessHours.forEach((hour) => {
      if (hour.is_active) {
        // Simple validation - just check if times exist
        if (!hour.open_time || !hour.close_time) {
          errors.push(`${dayNames[hour.day_of_week]}: Por favor selecciona horario de apertura y cierre`)
          return
        }

        // Simple time comparison
        if (hour.open_time >= hour.close_time) {
          errors.push(`${dayNames[hour.day_of_week]}: La hora de cierre debe ser después de la hora de apertura`)
        }
      }
    })

    return errors
  }

  const setAllDays = (isActive: boolean) => {
    setBusinessHours(prev => prev.map(hour => {
      if (isActive && (!hour.open_time || !hour.close_time)) {
        // Set default times if activating and no times are set
        return {
          ...hour,
          is_active: isActive,
          open_time: '09:00',
          close_time: '17:00'
        }
      }
      return { ...hour, is_active: isActive }
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="absolute top-4 right-4">
          <ClientThemeToggle />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="absolute top-4 right-4">
              <ClientThemeToggle />
            </div>
            <div>
              <Button
                onClick={() => router.push(`/${businessName}/dashboard`)}
                variant="outline"
                size="sm"
                className="mb-4"
              >
                ← Volver al Panel
              </Button>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Horarios de Atención
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Configura cuándo tu negocio está abierto</p>
            </div>
            <Button
              onClick={saveBusinessHours}
              loading={isSaving}
              variant="primary"
            >
              Guardar Horarios
            </Button>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setAllDays(true)}
                  size="sm"
                >
                  Abrir Todos los Días
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAllDays(false)}
                  size="sm"
                >
                  Cerrar Todos los Días
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Horario Semanal</CardTitle>
              <CardDescription>
                Configura tus horas de operación para cada día de la semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHours ? (
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {businessHours.map((hour, index) => (
                    <div key={hour.day_of_week} className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-24">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={hour.is_active}
                                onChange={(e) => updateDayHours(hour.day_of_week, 'is_active', e.target.checked)}
                                className="rounded border-gray-300 bg-white text-green-600 focus:ring-green-500"
                              />
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {DAYS_OF_WEEK[hour.day_of_week]}
                              </span>
                            </label>
                          </div>

                          {hour.is_active ? (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Abre:</label>
                                <select
                                  value={hour.open_time}
                                  onChange={(e) => handleDropdownTimeChange(hour.day_of_week, 'open_time', e.target.value)}
                                  className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors min-w-[100px]"
                                >
                                  {timeOptions.map((time) => (
                                    <option key={time.value} value={time.value}>
                                      {time.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <span style={{ color: 'var(--text-muted)' }}>a</span>
                              <div className="flex items-center gap-2">
                                <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Cierra:</label>
                                <select
                                  value={hour.close_time}
                                  onChange={(e) => handleDropdownTimeChange(hour.day_of_week, 'close_time', e.target.value)}
                                  className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors min-w-[100px]"
                                >
                                  {timeOptions.map((time) => (
                                    <option key={time.value} value={time.value}>
                                      {time.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="italic" style={{ color: 'var(--text-muted)' }}>Cerrado</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa de Horarios</CardTitle>
              <CardDescription>
                Así aparecerán tus horarios a los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {businessHours.map((hour) => (
                  <div key={hour.day_of_week} className="flex justify-between items-center py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {DAYS_OF_WEEK[hour.day_of_week]}
                    </span>
                    <span className={hour.is_active ? 'text-green-600' : ''} style={{ color: hour.is_active ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {hour.is_active
                        ? `${hour.open_time} - ${hour.close_time}`
                        : 'Cerrado'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              onClick={saveBusinessHours}
              loading={isSaving}
              variant="primary"
              size="lg"
            >
              Guardar Horarios de Atención
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}