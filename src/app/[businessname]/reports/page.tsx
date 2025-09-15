'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useBusinessTheme } from '@/hooks/useBusinessTheme'

interface PageProps {
  params: Promise<{ businessname: string }>
}

interface ReportData {
  totalRevenue: number
  totalAppointments: number
  totalClients: number
  avgAppointmentValue: number
  monthlyData: {
    month: string
    revenue: number
    appointments: number
    newClients: number
  }[]
  topServices: {
    name: string
    count: number
    revenue: number
  }[]
  clientRetention: {
    returning: number
    new: number
  }
}

export default function ReportsPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loadingReports, setLoadingReports] = useState(true)
  const [dateRange, setDateRange] = useState('3months') // 1month, 3months, 6months, 1year

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
        loadReportData(userData.businessId)
      } catch (error) {
        localStorage.removeItem('businessAdmin')
        router.push(`/${businessName}/login`)
      }
    } else {
      router.push(`/${businessName}/login`)
    }
    setIsLoading(false)
  }

  const loadReportData = async (businessId: string) => {
    try {
      setLoadingReports(true)
      const response = await fetch(`/api/businesses/${businessId}/reports?range=${dateRange}`)
      const data = await response.json()

      if (data.success) {
        setReportData(data.reports)
      }
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    if (user?.businessId) {
      loadReportData(user.businessId)
    }
  }, [dateRange, user?.businessId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
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
                Analytics & Reports
              </h1>
              <p className="text-gray-400 mt-1">Insights into your business performance</p>
            </div>
          </div>

          {/* Date Range Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 self-center mr-4">Time Period:</span>
                {[
                  { key: '1month', label: 'Last Month' },
                  { key: '3months', label: 'Last 3 Months' },
                  { key: '6months', label: 'Last 6 Months' },
                  { key: '1year', label: 'Last Year' }
                ].map((range) => (
                  <Button
                    key={range.key}
                    variant={dateRange === range.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange(range.key)}
                    className={dateRange === range.key ? 'theme-bg-primary' : ''}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {loadingReports ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse text-center">
                      <div className="h-8 w-16 bg-gray-700 rounded mx-auto mb-2"></div>
                      <div className="h-4 w-20 bg-gray-700 rounded mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reportData ? (
            <>
              {/* Key Metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {formatCurrency(reportData.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-400">Total Revenue</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {reportData.totalAppointments}
                      </div>
                      <div className="text-sm text-gray-400">Total Appointments</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {reportData.totalClients}
                      </div>
                      <div className="text-sm text-gray-400">Total Clients</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {formatCurrency(reportData.avgAppointmentValue)}
                      </div>
                      <div className="text-sm text-gray-400">Avg Appointment Value</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends */}
              {reportData.monthlyData && reportData.monthlyData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                    <CardDescription>
                      Revenue and appointment trends over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.monthlyData.map((month, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-700 rounded">
                          <div>
                            <span className="font-medium text-gray-200">{formatDate(month.month)}</span>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <div>
                              <span className="text-gray-400">Revenue: </span>
                              <span className="text-green-400 font-medium">{formatCurrency(month.revenue)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Appointments: </span>
                              <span className="text-blue-400 font-medium">{month.appointments}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">New Clients: </span>
                              <span className="text-purple-400 font-medium">{month.newClients}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Services */}
                {reportData.topServices && reportData.topServices.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Services</CardTitle>
                      <CardDescription>
                        Most popular services by appointments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reportData.topServices.map((service, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-700 rounded">
                            <div>
                              <span className="font-medium text-gray-200">{service.name}</span>
                              <div className="text-sm text-gray-400">{service.count} appointments</div>
                            </div>
                            <div className="text-green-400 font-medium">
                              {formatCurrency(service.revenue)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Client Retention */}
                <Card>
                  <CardHeader>
                    <CardTitle>Client Overview</CardTitle>
                    <CardDescription>
                      New vs returning clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border border-gray-700 rounded">
                        <span className="font-medium text-gray-200">Returning Clients</span>
                        <span className="text-green-400 font-medium">
                          {reportData.clientRetention?.returning || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-700 rounded">
                        <span className="font-medium text-gray-200">New Clients</span>
                        <span className="text-blue-400 font-medium">
                          {reportData.clientRetention?.new || 0}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 text-center">
                        Retention Rate: {
                          reportData.clientRetention
                            ? Math.round((reportData.clientRetention.returning / (reportData.clientRetention.returning + reportData.clientRetention.new)) * 100)
                            : 0
                        }%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">No data available</h3>
              <p className="text-gray-400 mb-4">
                Complete some appointments to see your analytics
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}