'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useBusinessTheme } from '@/hooks/useBusinessTheme'
import { requireBusinessAdminAuth, clearBusinessAdminSession } from '@/utils/auth'
import { ThemeScript } from '@/components/ThemeScript'

interface PageProps {
  params: Promise<{ businessname: string }>
}

export default function BusinessDashboard({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

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
    const user = requireBusinessAdminAuth(businessName, router)
    if (user) {
      setUser(user)
      loadDashboardData(user.businessId)
    }
    setIsLoading(false)
  }

  const loadDashboardData = async (businessId: string) => {
    try {
      setLoadingData(true)

      // Load stats and recent activity in parallel
      const [statsResponse, activityResponse] = await Promise.all([
        fetch(`/api/dashboard/${businessId}/stats`),
        fetch(`/api/dashboard/${businessId}/recent-activity`)
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.stats)
        }
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        if (activityData.success) {
          setRecentActivity(activityData.activities)
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    clearBusinessAdminSession()
    router.push(`/${businessName}/login`)
  }

  if (isLoading || themeLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen theme-font" style={{ backgroundColor: 'var(--background, #0a0a0a)' }}>
      {user?.businessId && <ThemeScript businessId={user.businessId} />}
      <div className="p-4">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold theme-primary" style={{ color: 'var(--theme-primary, #3b82f6)' }}>
                {user.businessName}
              </h1>
              <p className="text-gray-400 mt-1">Business Dashboard</p>
              <p className="text-sm theme-secondary mt-1">Welcome back, {user.first_name}!</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              Logout
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  {loadingData ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-700 rounded mx-auto mb-2"></div>
                      <div className="h-4 w-24 bg-gray-700 rounded mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-blue-400">{stats?.todayAppointments || 0}</div>
                      <div className="text-sm text-gray-400">Today's Appointments</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  {loadingData ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-700 rounded mx-auto mb-2"></div>
                      <div className="h-4 w-24 bg-gray-700 rounded mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-400">{stats?.totalClients || 0}</div>
                      <div className="text-sm text-gray-400">Total Clients</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  {loadingData ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-700 rounded mx-auto mb-2"></div>
                      <div className="h-4 w-24 bg-gray-700 rounded mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-purple-400">{stats?.servicesOffered || 0}</div>
                      <div className="text-sm text-gray-400">Services Offered</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  {loadingData ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-700 rounded mx-auto mb-2"></div>
                      <div className="h-4 w-24 bg-gray-700 rounded mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-yellow-400">${stats?.todayRevenue?.toFixed(2) || '0.00'}</div>
                      <div className="text-sm text-gray-400">Today's Revenue</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Appointments Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📅 Appointments
                </CardTitle>
                <CardDescription>
                  Manage your appointments and schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full theme-bg-primary"
                  size="lg"
                  onClick={() => router.push(`/${businessName}/appointments`)}
                >
                  View Today's Schedule
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/${businessName}/appointments`)}
                >
                  Manage Appointments
                </Button>
                <Button variant="outline" className="w-full">
                  Send Reminders
                </Button>
              </CardContent>
            </Card>

            {/* Services Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚙️ Services & Pricing
                </CardTitle>
                <CardDescription>
                  Configure your services and prices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full theme-bg-primary"
                  size="lg"
                  onClick={() => router.push(`/${businessName}/services`)}
                >
                  Manage Services
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/${businessName}/services`)}
                >
                  Update Pricing
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/${businessName}/hours`)}
                >
                  Business Hours
                </Button>
              </CardContent>
            </Card>

            {/* Client Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👥 Client Management
                </CardTitle>
                <CardDescription>
                  View and manage your clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full theme-bg-primary"
                  size="lg"
                  onClick={() => router.push(`/${businessName}/clients`)}
                >
                  View All Clients
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/${businessName}/clients`)}
                >
                  Client History
                </Button>
              </CardContent>
            </Card>

            {/* Business Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 Business Settings
                </CardTitle>
                <CardDescription>
                  Customize your business profile and theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full theme-bg-primary"
                  size="lg"
                  onClick={() => router.push(`/${businessName}/settings`)}
                >
                  Customize Theme
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/${businessName}/settings`)}
                >
                  Business Information
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/${businessName}/reports`)}
                >
                  Analytics & Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and activities in your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between py-2 border-b border-gray-700">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{activity.title}</p>
                        <p className="text-xs text-gray-400">{activity.description}</p>
                      </div>
                      <span className={`text-xs ${
                        activity.type === 'payment' ? 'text-blue-400' :
                        activity.type === 'appointment' ? 'text-green-400' :
                        'text-purple-400'
                      }`}>
                        {activity.timeAgo}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-400">No recent activity yet</p>
                  <p className="text-xs text-gray-500 mt-1">Activity will appear here as clients book appointments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}