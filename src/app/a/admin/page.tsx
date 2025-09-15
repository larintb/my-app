'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SuperUserLoginForm } from '@/components/forms/SuperUserLoginForm'

export default function AdminDashboard() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [businessToken, setBusinessToken] = useState('')
  const [clientToken, setClientToken] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [tokenQuantity, setTokenQuantity] = useState(1)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([])

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
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
        } catch (error) {
          localStorage.removeItem('superuser')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('superuser', JSON.stringify(userData))
    // Load data after successful login
    loadAdminData()
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
        setClientToken('') // Clear single token display
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

  const seedDemoData = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/seed-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Demo data generated successfully! Check your business dashboards.')
        // Refresh stats after generating demo data
        loadAdminData()
      } else {
        alert('❌ Failed to generate demo data: ' + data.error)
      }
    } catch (error) {
      console.error('Error generating demo data:', error)
      alert('❌ Failed to generate demo data')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-100">MyCard Admin</h1>
            <p className="mt-2 text-gray-400">Generate invitation tokens for businesses and clients</p>
            <p className="text-sm text-blue-400 mt-1">Welcome, {user.first_name}!</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
          >
            Logout
          </Button>
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
                  <div className="rounded-lg bg-gray-700 p-3">
                    <p className="text-sm font-medium text-gray-300">Token:</p>
                    <p className="break-all font-mono text-sm text-gray-100">{businessToken}</p>
                  </div>

                  <div className="rounded-lg bg-blue-950 p-3">
                    <p className="text-sm font-medium text-blue-300">Invitation URL:</p>
                    <p className="break-all text-sm text-blue-100">
                      {window.location.origin}/a/{businessToken}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyToClipboard(businessToken, 'Token')}
                    >
                      Copy Token
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Business *
                </label>
                {loadingData ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-700 rounded"></div>
                  </div>
                ) : businesses.length > 0 ? (
                  <select
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a business...</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.business_name} - {business.owner_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-400">
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
                  <div className="rounded-lg bg-green-950 border border-green-600 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-green-300">
                        ✅ Generated {generatedTokens.length} Client Token{generatedTokens.length !== 1 ? 's' : ''}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGeneratedTokens([])}
                        className="text-green-300 border-green-600 hover:bg-green-900"
                      >
                        Clear
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {generatedTokens.map((token, index) => (
                        <div key={token} className="bg-gray-800 rounded p-3 border border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400">
                              Token #{index + 1}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={() => copyToClipboard(token, `Token #${index + 1}`)}
                              >
                                Copy Token
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={() => copyToClipboard(`${window.location.origin}/c/${token}`, `URL #${index + 1}`)}
                              >
                                Copy URL
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div>
                              <p className="text-xs text-gray-400">Token:</p>
                              <p className="break-all font-mono text-xs text-gray-200">{token}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">NFC URL:</p>
                              <p className="break-all text-xs text-green-200">
                                {window.location.origin}/c/{token}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 p-3 bg-yellow-950 rounded border border-yellow-600">
                      <p className="text-xs text-yellow-300 text-center">
                        💡 Program these URLs into NFC cards/tags for your clients
                      </p>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyToClipboard(generatedTokens.join('\n'), 'All Tokens')}
                      >
                        Copy All Tokens
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
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

        {/* Stats/Overview Section */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                {loadingData ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-12 bg-gray-700 rounded mx-auto mb-2"></div>
                    <div className="h-4 w-20 bg-gray-700 rounded mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-400">{stats?.activeBusinesses || 0}</div>
                    <div className="text-sm text-gray-400">Active Businesses</div>
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
                    <div className="h-4 w-20 bg-gray-700 rounded mx-auto"></div>
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
                    <div className="h-4 w-20 bg-gray-700 rounded mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-400">{stats?.activeTokens || 0}</div>
                    <div className="text-sm text-gray-400">Active Tokens</div>
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
                    <div className="h-4 w-20 bg-gray-700 rounded mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-yellow-400">{stats?.totalAppointments || 0}</div>
                    <div className="text-sm text-gray-400">Total Appointments</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛠️ Development Tools
            </CardTitle>
            <CardDescription>
              Tools for testing and development (remove in production)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={seedDemoData}
              variant="outline"
              className="w-full"
              disabled={isGenerating}
            >
              🌱 Generate Demo Data
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              This will create sample services, clients, and appointments for existing businesses
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}