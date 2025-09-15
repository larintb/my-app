'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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

export default function ClientsPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')


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
        loadClients(userData.businessId)
      } catch (error) {
        localStorage.removeItem('businessAdmin')
        router.push(`/${businessName}/login`)
      }
    } else {
      router.push(`/${businessName}/login`)
    }
    setIsLoading(false)
  }

  const loadClients = async (businessId: string) => {
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
  }


  const filteredClients = clients.filter(client =>
    client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
                Client Management
              </h1>
              <p className="text-muted mt-1">View and manage your client database</p>
            </div>
          </div>


          {/* Search and Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search clients by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold accent-text">{clients.length}</div>
                  <div className="text-sm text-muted">Total Clients</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold accent-text">
                    {clients.filter(c => c.last_appointment && new Date(c.last_appointment).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
                  </div>
                  <div className="text-sm text-muted">Active This Month</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clients List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Clients</CardTitle>
              <CardDescription>
                {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
                {searchTerm && ` found for "${searchTerm}"`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClients ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredClients.length > 0 ? (
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <div key={client.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-app">
                              {client.first_name} {client.last_name}
                            </h3>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-accent text-accent-foreground">
                              Client
                            </span>
                          </div>

                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm text-muted">
                            <div>
                              <span className="font-medium">Phone:</span> {client.phone}
                            </div>
                            <div>
                              <span className="font-medium">Joined:</span> {formatDate(client.created_at)}
                            </div>
                            <div>
                              <span className="font-medium">Appointments:</span> {client.appointment_count || 0}
                            </div>
                            <div>
                              <span className="font-medium">Total Spent:</span> ${client.total_spent?.toFixed(2) || '0.00'}
                            </div>
                          </div>

                          {client.last_appointment && (
                            <div className="mt-2 text-sm text-muted">
                              <span className="font-medium">Last visit:</span> {formatDate(client.last_appointment)}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to client history/details
                              alert(`Client details for ${client.first_name} ${client.last_name} - Feature coming soon!`)
                            }}
                          >
                            View History
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-app mb-2">No clients found</h3>
                  <p className="text-muted mb-4">
                    No clients match your search for "{searchTerm}"
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-app mb-2">No clients yet</h3>
                  <p className="text-muted mb-4">
                    Clients will appear here when they register through NFC cards or book appointments
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