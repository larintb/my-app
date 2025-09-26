'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle'
import { SuperUserLoginForm } from '@/components/forms/SuperUserLoginForm'
import { User, Business } from '@/types'

interface RecentAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  users?: {
    first_name?: string
    last_name?: string
  }
  services?: {
    name?: string
  }
}

interface BusinessWithStats extends Business {
  stats?: {
    activeServices?: number
    totalClients?: number
    activeTokens?: number
    totalAppointments?: number
  }
  recentAppointments?: RecentAppointment[]
}

interface DemoRequest {
  id: string
  name: string
  business_name: string
  email: string
  message?: string
  status: 'pending' | 'contacted' | 'completed' | 'declined'
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [businessToken, setBusinessToken] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [tokenQuantity, setTokenQuantity] = useState(1)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [stats, setStats] = useState<{ activeBusinesses: number; totalClients: number; activeTokens: number; totalAppointments: number } | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([])
  const [showBusinesses, setShowBusinesses] = useState(false)
  const [selectedBusinessDetails, setSelectedBusinessDetails] = useState<BusinessWithStats | null>(null)
  const [loadingBusinessDetails, setLoadingBusinessDetails] = useState(false)
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([])
  const [loadingDemoRequests, setLoadingDemoRequests] = useState(false)
  const [showDemoRequests, setShowDemoRequests] = useState(false)

  const checkAuth = useCallback(() => {
    const savedUser = localStorage.getItem('superuser')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        // Verify the user has a valid UUID
        if (userData.id && userData.id.length === 36) {
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('superuser')
        }
      } catch {
        localStorage.removeItem('superuser')
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const loadDemoRequests = useCallback(async () => {
    setLoadingDemoRequests(true)
    try {
      // Get superuser session for authentication
      const savedUser = localStorage.getItem('superuser')
      if (!savedUser) {
        console.error('No superuser session found')
        return
      }

      const response = await fetch('/api/demo-requests', {
        headers: {
          'x-superuser-session': savedUser,
          'Content-Type': 'application/json'
        }
      })
      const result = await response.json()

      if (result.success) {
        setDemoRequests(result.data)
      } else {
        console.error('Error loading demo requests:', result.error)
        if (response.status === 401) {
          // Unauthorized - redirect to login
          setIsAuthenticated(false)
          localStorage.removeItem('superuser')
        }
      }
    } catch (error) {
      console.error('Error loading demo requests:', error)
    } finally {
      setLoadingDemoRequests(false)
    }
  }, [])

  const updateDemoRequestStatus = async (id: string, status: string) => {
    try {
      // Get superuser session for authentication
      const savedUser = localStorage.getItem('superuser')
      if (!savedUser) {
        console.error('No superuser session found')
        return
      }

      const response = await fetch('/api/demo-requests', {
        method: 'PATCH',
        headers: {
          'x-superuser-session': savedUser,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      })

      const result = await response.json()

      if (result.success) {
        // Update the local state
        setDemoRequests(prev =>
          prev.map(request =>
            request.id === id
              ? { ...request, status: status as DemoRequest['status'] }
              : request
          )
        )
      } else {
        console.error('Error updating demo request:', result.error)
        if (response.status === 401) {
          // Unauthorized - redirect to login
          setIsAuthenticated(false)
          localStorage.removeItem('superuser')
        }
      }
    } catch (error) {
      console.error('Error updating demo request:', error)
    }
  }

  const handleLoginSuccess = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('superuser', JSON.stringify(userData))
    // Load data after successful login
    loadAdminData()
    loadDemoRequests()
  }

  const loadAdminData = async () => {
    setLoadingData(true)
    try {
      // Load businesses and stats in parallel
      const [businessesResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/businesses'),
        fetch('/api/admin/stats')
      ])

      if (businessesResponse.ok) {
        const businessesData = await businessesResponse.json()
        if (businessesData.success) {
          setBusinesses(businessesData.businesses)
        }
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.stats)
        }
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('superuser')
  }

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <SuperUserLoginForm onSuccess={handleLoginSuccess} />
  }

  // Load data if authenticated but not yet loaded
  if (isAuthenticated && businesses.length === 0 && !loadingData && !stats) {
    loadAdminData()
  }

  const generateBusinessToken = async () => {
    if (!user?.id) {
      alert('User not authenticated')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/tokens/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'business_admin',
          createdBy: user.id,
          expiresInDays: 30 // Token expires in 30 days
        })
      })

      const data = await response.json()

      if (data.success) {
        setBusinessToken(data.token)
        // Refresh stats after generating token
        loadAdminData()
      } else {
        alert('Failed to generate token: ' + data.error)
      }
    } catch (error) {
      console.error('Error generating token:', error)
      alert('Failed to generate token')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateClientTokens = async () => {
    if (!selectedBusiness) {
      alert('Please select a business first')
      return
    }

    if (tokenQuantity < 1 || tokenQuantity > 50) {
      alert('Please enter a quantity between 1 and 50')
      return
    }

    if (!user?.id) {
      alert('User not authenticated')
      return
    }

    setIsGenerating(true)
    const tokens: string[] = []

    try {
      // Generate tokens one by one
      for (let i = 0; i < tokenQuantity; i++) {
        const response = await fetch('/api/tokens/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'final_client',
            createdBy: user.id,
            businessId: selectedBusiness
          })
        })

        const data = await response.json()

        if (data.success) {
          tokens.push(data.token)
        } else {
          console.error(`Failed to generate token ${i + 1}:`, data.error)
          break
        }
      }

      if (tokens.length > 0) {
        setGeneratedTokens(tokens)
        alert(`✅ Successfully generated ${tokens.length} client token(s)`)
        // Refresh stats
        loadAdminData()
      } else {
        alert('❌ Failed to generate any tokens')
      }
    } catch (error) {
      console.error('Error generating tokens:', error)
      alert('❌ Failed to generate tokens')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    alert(`${type} copied to clipboard!`)
  }



  const loadBusinessDetails = async (businessId: string) => {
    setLoadingBusinessDetails(true)
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`)
      const data = await response.json()

      if (data.success) {
        setSelectedBusinessDetails(data.business)
      } else {
        alert('❌ Failed to load business details: ' + data.error)
      }
    } catch (error) {
      console.error('Error loading business details:', error)
      alert('❌ Failed to load business details')
    } finally {
      setLoadingBusinessDetails(false)
    }
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-xl feature-card">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>MyCard Admin</h1>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Generate invitation tokens for businesses and clients</p>
            <p className="text-sm mt-1 spotify-green-text">Welcome, {user?.first_name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <ClientThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Business Admin Token Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏢 Business Admin Token
              </CardTitle>
              <CardDescription>
                Generate invitation tokens for new business administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={generateBusinessToken}
                loading={isGenerating}
                className="w-full"
                size="lg"
              >
                Generate Business Token
              </Button>

              {businessToken && (
                <div className="space-y-3">
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Token:</p>
                    <p className="break-all font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{businessToken}</p>
                  </div>

                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid #1DB954' }}>
                    <p className="text-sm font-medium spotify-green-text">Invitation URL:</p>
                    <p className="break-all text-sm" style={{ color: 'var(--text-primary)' }}>
                      {window.location.origin}/a/{businessToken}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 transition-all duration-300 hover:border-green-500"
                      onClick={() => copyToClipboard(businessToken, 'Token')}
                    >
                      Copy Token
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 transition-all duration-300 hover:border-green-500"
                      onClick={() => copyToClipboard(`${window.location.origin}/a/${businessToken}`, 'URL')}
                    >
                      Copy URL
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Final Client Token Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👤 Client Token
              </CardTitle>
              <CardDescription>
                Generate NFC tokens for final clients (linked to a business)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Business Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Select Business *
                </label>
                {loadingData ? (
                  <div className="animate-pulse">
                    <div className="h-10 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                  </div>
                ) : businesses.length > 0 ? (
                  <select
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                    className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <option value="">Choose a business...</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.business_name} - {business.owner_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-md px-3 py-2" style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)'
                  }}>
                    No businesses registered yet
                  </div>
                )}
              </div>

              {/* Quantity Selection */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  max="50"
                  value={tokenQuantity.toString()}
                  onChange={(e) => setTokenQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  helper="1-50 tokens"
                />
                <div className="flex items-end">
                  <Button
                    onClick={generateClientTokens}
                    loading={isGenerating}
                    className="w-full"
                    size="lg"
                    disabled={!selectedBusiness || tokenQuantity < 1}
                  >
                    Generate {tokenQuantity} Token{tokenQuantity !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>

              {/* Generated Tokens Display */}
              {generatedTokens.length > 0 && (
                <div className="space-y-3">
                  <div className="rounded-lg p-4 feature-card" style={{ border: '1px solid #1DB954' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold spotify-green-text">
                        ✅ Generated {generatedTokens.length} Client Token{generatedTokens.length !== 1 ? 's' : ''}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGeneratedTokens([])}
                        className="transition-all duration-300 hover:border-green-500"
                      >
                        Clear
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {generatedTokens.map((token, index) => (
                        <div key={token} className="rounded p-3 feature-card">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                              Token #{index + 1}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2 transition-all duration-300 hover:border-green-500"
                                onClick={() => copyToClipboard(token, `Token #${index + 1}`)}
                              >
                                Copy Token
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2 transition-all duration-300 hover:border-green-500"
                                onClick={() => copyToClipboard(`${window.location.origin}/c/${token}`, `URL #${index + 1}`)}
                              >
                                Copy URL
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Token:</p>
                              <p className="break-all font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{token}</p>
                            </div>
                            <div>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>NFC URL:</p>
                              <p className="break-all text-xs spotify-green-text">
                                {window.location.origin}/c/{token}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid #f59e0b' }}>
                      <p className="text-xs text-center" style={{ color: '#f59e0b' }}>
                        💡 Program these URLs into NFC cards/tags for your clients
                      </p>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 transition-all duration-300 hover:border-green-500"
                        onClick={() => copyToClipboard(generatedTokens.join('\n'), 'All Tokens')}
                      >
                        Copy All Tokens
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 transition-all duration-300 hover:border-green-500"
                        onClick={() => copyToClipboard(
                          generatedTokens.map(token => `${window.location.origin}/c/${token}`).join('\n'),
                          'All URLs'
                        )}
                      >
                        Copy All URLs
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Demo Requests Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                📧 Solicitudes de Demo
                {demoRequests.filter(req => req.status === 'pending').length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {demoRequests.filter(req => req.status === 'pending').length}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDemoRequests(!showDemoRequests)
                  if (!showDemoRequests && demoRequests.length === 0) {
                    loadDemoRequests()
                  }
                }}
                loading={loadingDemoRequests}
              >
                {showDemoRequests ? 'Ocultar' : 'Ver Solicitudes'}
              </Button>
            </CardTitle>
            <CardDescription>
              Gestiona las solicitudes de demo del landing page
            </CardDescription>
          </CardHeader>
          {showDemoRequests && (
            <CardContent>
              {loadingDemoRequests ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    </div>
                  ))}
                </div>
              ) : demoRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📭</div>
                  <p style={{ color: 'var(--text-secondary)' }}>No hay solicitudes de demo</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {demoRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg feature-card border"
                      style={{ borderColor: request.status === 'pending' ? '#1DB954' : 'var(--border-color)' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {request.name}
                            </h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                request.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'contacted'
                                  ? 'bg-blue-100 text-blue-800'
                                  : request.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {request.status === 'pending' && 'Pendiente'}
                              {request.status === 'contacted' && 'Contactado'}
                              {request.status === 'completed' && 'Completado'}
                              {request.status === 'declined' && 'Rechazado'}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <strong>Negocio:</strong> {request.business_name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <strong>Email:</strong> {request.email}
                          </p>
                          {request.message && (
                            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                              <strong>Mensaje:</strong> {request.message}
                            </p>
                          )}
                          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                            {new Date(request.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDemoRequestStatus(request.id, 'contacted')}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              Marcar como Contactado
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDemoRequestStatus(request.id, 'declined')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        {request.status === 'contacted' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDemoRequestStatus(request.id, 'completed')}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            Marcar como Completado
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`mailto:${request.email}`, '_blank')}
                          className="text-gray-600 border-gray-600 hover:bg-gray-50"
                        >
                          Enviar Email
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Stats/Overview Section */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                {loadingData ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-12 rounded mx-auto mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 w-20 rounded mx-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold spotify-green-text">{stats?.activeBusinesses || 0}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Businesses</div>
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
                    <div className="h-8 w-12 rounded mx-auto mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 w-20 rounded mx-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats?.totalClients || 0}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Clients</div>
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
                    <div className="h-8 w-12 rounded mx-auto mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 w-20 rounded mx-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{stats?.activeTokens || 0}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Tokens</div>
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
                    <div className="h-8 w-12 rounded mx-auto mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 w-20 rounded mx-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{stats?.totalAppointments || 0}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Appointments</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Management Section */}
        <Card className="feature-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                🏢 Business Management
              </div>
              <Button
                onClick={() => setShowBusinesses(!showBusinesses)}
                variant="outline"
                size="sm"
                className="transition-all duration-300 hover:border-green-500"
              >
                {showBusinesses ? 'Hide Businesses' : 'View Businesses'}
              </Button>
            </CardTitle>
            <CardDescription>
              View and manage all registered businesses in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showBusinesses && (
              <div className="space-y-4">
                {loadingData ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <div className="h-4 w-48 rounded mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
                        <div className="h-3 w-32 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
                      </div>
                    ))}
                  </div>
                ) : businesses.length > 0 ? (
                  <div className="grid gap-4">
                    {businesses.map((business) => (
                      <div
                        key={business.id}
                        className="rounded-lg p-4 feature-card border transition-all duration-300 hover:border-green-500"
                        style={{ border: '1px solid var(--border-color)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                {business.business_name}
                              </h3>
                              <span className="text-sm px-2 py-1 rounded" style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-muted)',
                                border: '1px solid #1DB954'
                              }}>
                                Active
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Owner: </span>
                                <span style={{ color: 'var(--text-primary)' }}>{business.owner_name}</span>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Phone: </span>
                                <span style={{ color: 'var(--text-primary)' }}>{business.phone}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span style={{ color: 'var(--text-muted)' }}>Address: </span>
                                <span style={{ color: 'var(--text-primary)' }}>
                                  {business.address}
                                </span>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Created: </span>
                                <span style={{ color: 'var(--text-primary)' }}>
                                  {new Date(business.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              onClick={() => loadBusinessDetails(business.id)}
                              variant="outline"
                              size="sm"
                              className="transition-all duration-300 hover:border-green-500"
                              disabled={loadingBusinessDetails}
                            >
                              {loadingBusinessDetails && selectedBusinessDetails?.id === business.id ? 'Loading...' : 'View Details'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    No businesses registered yet. Generate a business token to get started.
                  </div>
                )}

                {/* Business Details Modal */}
                {selectedBusinessDetails && (
                  <div className="mt-6 rounded-lg p-6 feature-card" style={{ border: '2px solid #1DB954' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold spotify-green-text">
                        {selectedBusinessDetails.business_name} - Detailed View
                      </h3>
                      <Button
                        onClick={() => setSelectedBusinessDetails(null)}
                        variant="outline"
                        size="sm"
                        className="transition-all duration-300 hover:border-red-500"
                      >
                        Close
                      </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Business Info */}
                      <div className="space-y-4">
                        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Business Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Owner: </span>
                            <span style={{ color: 'var(--text-primary)' }}>{selectedBusinessDetails.owner_name}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Phone: </span>
                            <span style={{ color: 'var(--text-primary)' }}>{selectedBusinessDetails.phone}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Address: </span>
                            <span style={{ color: 'var(--text-primary)' }}>{selectedBusinessDetails.address}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Created: </span>
                            <span style={{ color: 'var(--text-primary)' }}>
                              {new Date(selectedBusinessDetails.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Business Stats */}
                      <div className="space-y-4">
                        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Business Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <div className="text-xl font-bold spotify-green-text">
                              {selectedBusinessDetails.stats?.activeServices || 0}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Services</div>
                          </div>
                          <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <div className="text-xl font-bold" style={{ color: '#10b981' }}>
                              {selectedBusinessDetails.stats?.totalClients || 0}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Clients</div>
                          </div>
                          <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <div className="text-xl font-bold" style={{ color: '#8b5cf6' }}>
                              {selectedBusinessDetails.stats?.activeTokens || 0}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Tokens</div>
                          </div>
                          <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <div className="text-xl font-bold" style={{ color: '#f59e0b' }}>
                              {selectedBusinessDetails.stats?.totalAppointments || 0}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Appointments</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Appointments */}
                    {selectedBusinessDetails.recentAppointments && selectedBusinessDetails.recentAppointments.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recent Appointments</h4>
                        <div className="space-y-2">
                          {selectedBusinessDetails.recentAppointments.map((appointment: RecentAppointment) => (
                            <div
                              key={appointment.id}
                              className="flex items-center justify-between p-3 rounded"
                              style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                              <div className="flex-1">
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {appointment.users?.first_name} {appointment.users?.last_name}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {appointment.services?.name}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {new Date(appointment.appointment_date).toLocaleDateString()}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {appointment.appointment_time}
                                </div>
                              </div>
                              <div className="ml-3">
                                <span
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: appointment.status === 'confirmed' ? '#1DB954' :
                                                   appointment.status === 'pending' ? '#f59e0b' : '#ef4444',
                                    color: 'white'
                                  }}
                                >
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}