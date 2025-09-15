'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useBusinessTheme } from '@/hooks/useBusinessTheme'

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
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

export default function BusinessHoursPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([])
  const [loadingHours, setLoadingHours] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
        loadBusinessHours(userData.businessId)
      } catch (error) {
        localStorage.removeItem('businessAdmin')
        router.push(`/${businessName}/login`)
      }
    } else {
      router.push(`/${businessName}/login`)
    }
    setIsLoading(false)
  }

  const loadBusinessHours = async (businessId: string) => {
    try {
      setLoadingHours(true)
      const response = await fetch(`/api/businesses/${businessId}/hours`)
      const data = await response.json()

      if (data.success) {
        // Initialize with existing hours or default closed hours
        const existingHours = data.hours || []
        const allDayHours = DAYS_OF_WEEK.map((_, dayIndex) => {
          const existing = existingHours.find((h: BusinessHour) => h.day_of_week === dayIndex)
          return existing || {
            day_of_week: dayIndex,
            open_time: '09:00',
            close_time: '17:00',
            is_active: false
          }
        })
        setBusinessHours(allDayHours)
      }
    } catch (error) {
      console.error('Error loading business hours:', error)
    } finally {
      setLoadingHours(false)
    }
  }

  const updateDayHours = (dayIndex: number, field: keyof BusinessHour, value: any) => {
    setBusinessHours(prev => prev.map(hour =>
      hour.day_of_week === dayIndex
        ? { ...hour, [field]: value }
        : hour
    ))
  }

  const saveBusinessHours = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/businesses/${user.businessId}/hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: businessHours })
      })

      const data = await response.json()

      if (data.success) {
        alert('Business hours saved successfully!')
        await loadBusinessHours(user.businessId)
      } else {
        alert('Failed to save business hours: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving business hours:', error)
      alert('Failed to save business hours')
    } finally {
      setIsSaving(false)
    }
  }

  const setAllDays = (isActive: boolean) => {
    setBusinessHours(prev => prev.map(hour => ({ ...hour, is_active: isActive })))
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
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
        <div className="mx-auto max-w-4xl space-y-6">
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
                Business Hours
              </h1>
              <p className="text-gray-400 mt-1">Configure when your business is open</p>
            </div>
            <Button
              onClick={saveBusinessHours}
              loading={isSaving}
              className="theme-bg-primary"
            >
              Save Hours
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
                  Open All Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAllDays(false)}
                  size="sm"
                >
                  Close All Days
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Set your operating hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHours ? (
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-16 bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {businessHours.map((hour, index) => (
                    <div key={hour.day_of_week} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-24">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={hour.is_active}
                                onChange={(e) => updateDayHours(hour.day_of_week, 'is_active', e.target.checked)}
                                className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium text-gray-200">
                                {DAYS_OF_WEEK[hour.day_of_week]}
                              </span>
                            </label>
                          </div>

                          {hour.is_active ? (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-400">Open:</label>
                                <input
                                  type="time"
                                  value={hour.open_time}
                                  onChange={(e) => updateDayHours(hour.day_of_week, 'open_time', e.target.value)}
                                  className="rounded border border-gray-600 bg-gray-800 px-3 py-1 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <span className="text-gray-400">to</span>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-400">Close:</label>
                                <input
                                  type="time"
                                  value={hour.close_time}
                                  onChange={(e) => updateDayHours(hour.day_of_week, 'close_time', e.target.value)}
                                  className="rounded border border-gray-600 bg-gray-800 px-3 py-1 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500 italic">Closed</div>
                          )}
                        </div>

                        {hour.is_active && (
                          <div className="text-sm text-gray-400">
                            {formatTime(hour.open_time)} - {formatTime(hour.close_time)}
                          </div>
                        )}
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
              <CardTitle>Hours Preview</CardTitle>
              <CardDescription>
                How your hours will appear to clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {businessHours.map((hour) => (
                  <div key={hour.day_of_week} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                    <span className="font-medium text-gray-200">
                      {DAYS_OF_WEEK[hour.day_of_week]}
                    </span>
                    <span className={hour.is_active ? 'text-green-400' : 'text-red-400'}>
                      {hour.is_active
                        ? `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`
                        : 'Closed'
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
              className="theme-bg-primary"
              size="lg"
            >
              Save Business Hours
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}