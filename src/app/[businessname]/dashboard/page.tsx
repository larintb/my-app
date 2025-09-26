'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle'
import { requireBusinessAdminAuth, clearBusinessAdminSession, BusinessAdminUser } from '@/utils/auth'
import { DashboardStats, ActivityItem } from '@/types'

interface PageProps {
  params: Promise<{ businessname: string }>
}

export default function BusinessDashboard({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<BusinessAdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loadingData, setLoadingData] = useState(true)


  const loadDashboardData = useCallback(async (businessId: string) => {
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
  }, [])


  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      const businessNameDecoded = decodeURIComponent(resolvedParams.businessname)
      setBusinessName(businessNameDecoded)

      // Wait for businessName to be set before checking auth
      const user = await requireBusinessAdminAuth(businessNameDecoded, router)
      if (user) {
        setUser(user)
        loadDashboardData(user.businessId)
      }
      setIsLoading(false)
    }

    getParams()
  }, [params, router, loadDashboardData])

  const handleLogout = () => {
    setUser(null)
    clearBusinessAdminSession()
    router.push(`/${businessName}/login`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="absolute top-4 right-4">
          <ClientThemeToggle />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 accent-text"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-app">
      <div className="p-4">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold accent-text">
                {user.businessName}
              </h1>
              <p className="text-muted mt-1">Panel de Control</p>
              <p className="text-sm text-app mt-1">¡Bienvenido de vuelta, {user.first_name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <ClientThemeToggle />
              <Button
                onClick={handleLogout}
                className="btn-secondary"
                size="sm"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  {loadingData ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-card rounded mx-auto mb-2"></div>
                      <div className="h-4 w-24 bg-card rounded mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold accent-text">{stats?.todayAppointments || 0}</div>
                      <div className="text-sm text-muted">Citas de Hoy</div>
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
                      <div className="h-8 w-12 bg-card rounded mx-auto mb-2"></div>
                      <div className="h-4 w-24 bg-card rounded mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold accent-text">{stats?.totalClients || 0}</div>
                      <div className="text-sm text-muted">Total de Clientes</div>
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
                      <div className="h-8 w-12 bg-card rounded mx-auto mb-2"></div>
                      <div className="h-4 w-24 bg-card rounded mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold accent-text">{stats?.servicesOffered || 0}</div>
                      <div className="text-sm text-muted">Servicios Ofrecidos</div>
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
                      <div className="h-8 w-12 bg-card rounded mx-auto mb-2"></div>
                      <div className="h-4 w-24 bg-card rounded mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold accent-text">${stats?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
                      <div className="text-sm text-muted">Ingresos del Mes</div>
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
                  📅 Citas
                </CardTitle>
                <CardDescription>
                  Administra tus citas y horarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full btn-primary"
                  size="lg"
                  onClick={() => router.push(`/${businessName}/appointments`)}
                >
                  Ver Agenda de Hoy
                </Button>
                <Button
                  className="w-full btn-secondary"
                  onClick={() => router.push(`/${businessName}/appointments`)}
                >
                  Administrar Citas
                </Button>
                <Button className="w-full btn-secondary">
                  Enviar Recordatorios
                </Button>
              </CardContent>
            </Card>

            {/* Services Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚙️ Servicios y Precios
                </CardTitle>
                <CardDescription>
                  Configura tus servicios y precios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full btn-primary"
                  size="lg"
                  onClick={() => router.push(`/${businessName}/services`)}
                >
                  Administrar Servicios
                </Button>
                <Button
                  className="w-full btn-secondary"
                  onClick={() => router.push(`/${businessName}/services`)}
                >
                  Actualizar Precios
                </Button>
                <Button
                  className="w-full btn-secondary"
                  onClick={() => router.push(`/${businessName}/hours`)}
                >
                  Horarios de Atención
                </Button>
              </CardContent>
            </Card>

            {/* Client Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👥 Gestión de Clientes
                </CardTitle>
                <CardDescription>
                  Ve y administra tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full btn-primary"
                  size="lg"
                  onClick={() => router.push(`/${businessName}/clients`)}
                >
                  Ver Todos los Clientes
                </Button>
                <Button
                  className="w-full btn-secondary"
                  onClick={() => router.push(`/${businessName}/clients`)}
                >
                  Historial de Clientes
                </Button>
              </CardContent>
            </Card>

            {/* Business Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 Configuraciones del Negocio
                </CardTitle>
                <CardDescription>
                  Personaliza el perfil e información de tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full btn-primary"
                  size="lg"
                  onClick={() => router.push(`/${businessName}/settings`)}
                >
                  Información del Negocio
                </Button>
                <Button
                  className="w-full btn-secondary"
                  onClick={() => router.push(`/${businessName}/settings`)}
                >
                  Actualizar Detalles
                </Button>
                <Button
                  className="w-full btn-secondary"
                  onClick={() => router.push(`/${businessName}/reports`)}
                >
                  Análisis y Reportes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas actualizaciones y actividades en tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex-1">
                        <div className="h-4 bg-card rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-card rounded w-1/2"></div>
                      </div>
                      <div className="h-3 bg-card rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border-color)' }}>
                      <div>
                        <p className="text-sm font-medium text-app">{activity.title}</p>
                        <p className="text-xs text-muted">{activity.description}</p>
                      </div>
                      <span className="text-xs accent-text">
                        {activity.timeAgo}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-muted">No hay actividad reciente aún</p>
                  <p className="text-xs text-muted mt-1">Las actividades aparecerán aquí cuando los clientes reserven citas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}