'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle'
import { BusinessAdminUser, requireBusinessAdminAuth } from '@/utils/auth'

interface PageProps {
  params: Promise<{ businessname: string }>
}

interface Client {
  id: string
  first_name: string
  last_name: string
  phone: string
  created_at: string
  appointment_count?: number
  last_appointment?: string
  total_spent?: number
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  services?: {
    id: string
    name: string
    price: number
    duration_minutes: number
  }
}

interface ClientHistory {
  client: Client
  appointments: Appointment[]
  summary: {
    totalAppointments: number
    completedAppointments: number
    upcomingAppointments: number
    totalSpent: number
    recentActivity: number
    memberSince: string
    lastVisit: string | null
  }
}

export default function ClientsPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<BusinessAdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClientHistory, setSelectedClientHistory] = useState<ClientHistory | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)


  const loadClients = useCallback(async (businessId: string) => {
    try {
      setLoadingClients(true)
      const response = await fetch(`/api/businesses/${businessId}/clients`)
      const data = await response.json()

      if (data.success) {
        setClients(data.clients)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoadingClients(false)
    }
  }, [])

  const loadClientHistory = useCallback(async (clientId: string) => {
    if (!user?.businessId) return

    try {
      setLoadingHistory(true)
      const response = await fetch(`/api/businesses/${user.businessId}/clients/${clientId}/history`)
      const data = await response.json()

      if (data.success) {
        setSelectedClientHistory(data)
        setShowHistoryModal(true)
      } else {
        alert('Error al cargar el historial del cliente')
      }
    } catch (error) {
      console.error('Error loading client history:', error)
      alert('Error al cargar el historial del cliente')
    } finally {
      setLoadingHistory(false)
    }
  }, [user?.businessId])


  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      const businessNameDecoded = decodeURIComponent(resolvedParams.businessname)
      setBusinessName(businessNameDecoded)

      // Wait for businessName to be set before checking auth
      const user = await requireBusinessAdminAuth(businessNameDecoded, router)
      if (user) {
        setUser(user)
        loadClients(user.businessId)
      }
      setIsLoading(false)
    }

    getParams()
  }, [params, router, loadClients])

  const filteredClients = clients.filter(client =>
    client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString}`)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada'
      case 'confirmed': return 'Confirmada'
      case 'pending': return 'Pendiente'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
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
                ← Volver al Panel
              </Button>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Gestión de Clientes
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Ve y administra tu base de datos de clientes</p>
            </div>
            <ClientThemeToggle />
          </div>


          {/* Search and Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Buscar clientes por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{clients.length}</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Total de Clientes</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                    {clients.filter(c => c.last_appointment && new Date(c.last_appointment).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Activos Este Mes</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clients List */}
          <Card>
            <CardHeader>
              <CardTitle>Tus Clientes</CardTitle>
              <CardDescription>
                {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
                {searchTerm && ` encontrado${filteredClients.length !== 1 ? 's' : ''} para "${searchTerm}"`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClients ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 rounded" style={{ backgroundColor: 'var(--bg-muted)' }}></div>
                    </div>
                  ))}
                </div>
              ) : filteredClients.length > 0 ? (
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <div key={client.id} className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {client.first_name} {client.last_name}
                            </h3>
                            <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                              Cliente
                            </span>
                          </div>

                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                            <div>
                              <span className="font-medium">Teléfono:</span> {client.phone}
                            </div>
                            <div>
                              <span className="font-medium">Se unió:</span> {formatDate(client.created_at)}
                            </div>
                            <div>
                              <span className="font-medium">Citas:</span> {client.appointment_count || 0}
                            </div>
                            <div>
                              <span className="font-medium">Total Gastado:</span> ${client.total_spent?.toFixed(2) || '0.00'}
                            </div>
                          </div>

                          {client.last_appointment && (
                            <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                              <span className="font-medium">Última visita:</span> {formatDate(client.last_appointment)}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadClientHistory(client.id)}
                            disabled={loadingHistory}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            {loadingHistory ? 'Cargando...' : 'Ver Historial'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No se encontraron clientes</h3>
                  <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                    No hay clientes que coincidan con tu búsqueda de &ldquo;{searchTerm}&rdquo;
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpiar Búsqueda
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Aún no hay clientes</h3>
                  <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                    Los clientes aparecerán aquí cuando se registren a través de tarjetas NFC o reserven citas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client History Modal */}
          {showHistoryModal && selectedClientHistory && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20">
                <div className="p-6 border-b border-gray-200/20 dark:border-gray-700/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Historial de {selectedClientHistory.client.first_name} {selectedClientHistory.client.last_name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Cliente desde {formatDate(selectedClientHistory.summary.memberSince)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowHistoryModal(false)
                        setSelectedClientHistory(null)
                      }}
                      className="hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
                    >
                      ✕ Cerrar
                    </Button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {/* Summary Stats */}
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {selectedClientHistory.summary.totalAppointments}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Total Citas</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {selectedClientHistory.summary.completedAppointments}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Completadas</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                            {selectedClientHistory.summary.upcomingAppointments}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Próximas</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            ${selectedClientHistory.summary.totalSpent.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Total Gastado</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Appointments History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Historial de Citas ({selectedClientHistory.appointments.length})
                    </h3>

                    {selectedClientHistory.appointments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedClientHistory.appointments.map((appointment) => (
                          <div key={appointment.id} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {appointment.services?.name || 'Servicio eliminado'}
                                  </h4>
                                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                                    {getStatusText(appointment.status)}
                                  </span>
                                </div>

                                <div className="grid gap-2 md:grid-cols-3 text-sm text-gray-600 dark:text-gray-300">
                                  <div>
                                    <span className="font-medium">Fecha:</span> {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Duración:</span> {appointment.services?.duration_minutes || 0} min
                                  </div>
                                  <div>
                                    <span className="font-medium">Precio:</span> ${appointment.services?.price?.toFixed(2) || '0.00'}
                                  </div>
                                </div>

                                {appointment.notes && (
                                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Notas:</span> {appointment.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-gray-600 dark:text-gray-400">Este cliente aún no tiene citas registradas</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}