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

interface BusinessData {
  id: string
  business_name: string
  owner_name: string
  phone: string
  address: string
  business_image_url?: string
  theme_settings?: any
}

export default function BusinessSettingsPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    phone: '',
    address: '',
    business_image_url: ''
  })
  const [formErrors, setFormErrors] = useState<any>({})

  // Theme settings
  const [themeData, setThemeData] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#6b7280',
    backgroundColor: '#0a0a0a',
    textColor: '#fafafa'
  })

  // Apply business theme
  const { isLoading: themeLoading, theme: currentTheme, refreshTheme } = useBusinessTheme(user?.businessId)

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
        loadBusinessData(userData.businessId)
      } catch (error) {
        localStorage.removeItem('businessAdmin')
        router.push(`/${businessName}/login`)
      }
    } else {
      router.push(`/${businessName}/login`)
    }
    setIsLoading(false)
  }

  const loadBusinessData = async (businessId: string) => {
    try {
      setLoadingBusiness(true)
      const response = await fetch(`/api/businesses/${businessId}`)
      const data = await response.json()

      if (data.success) {
        setBusinessData(data.business)
        setFormData({
          business_name: data.business.business_name,
          owner_name: data.business.owner_name,
          phone: data.business.phone,
          address: data.business.address,
          business_image_url: data.business.business_image_url || ''
        })

        // Load theme settings
        if (data.business.theme_settings) {
          setThemeData({
            primaryColor: data.business.theme_settings.primaryColor || '#3b82f6',
            secondaryColor: data.business.theme_settings.secondaryColor || '#6b7280',
            backgroundColor: data.business.theme_settings.backgroundColor || '#0a0a0a',
            textColor: data.business.theme_settings.textColor || '#fafafa'
          })
        }
      }
    } catch (error) {
      console.error('Error loading business data:', error)
    } finally {
      setLoadingBusiness(false)
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (formErrors[field]) {
      setFormErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const handleThemeChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setThemeData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const validateForm = () => {
    const errors: any = {}

    if (!formData.business_name.trim()) errors.business_name = 'Business name is required'
    if (!formData.owner_name.trim()) errors.owner_name = 'Owner name is required'
    if (!formData.phone.trim()) errors.phone = 'Phone is required'
    if (!formData.address.trim()) errors.address = 'Address is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveBusinessSettings = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/businesses/${user.businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          theme_settings: themeData
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Business settings saved successfully!')

        // Clear theme cache to force refresh
        localStorage.removeItem(`businessTheme_${user.businessId}`)

        await loadBusinessData(user.businessId)
        if (refreshTheme) {
          await refreshTheme()
        }
      } else {
        alert('Failed to save settings: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving business settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
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
                Business Settings
              </h1>
              <p className="text-gray-400 mt-1">Manage your business information and appearance</p>
            </div>
            <Button
              onClick={saveBusinessSettings}
              loading={isSaving}
              className="theme-bg-primary"
            >
              Save Settings
            </Button>
          </div>

          {loadingBusiness ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                      <div className="space-y-3">
                        <div className="h-10 bg-gray-700 rounded"></div>
                        <div className="h-10 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your business details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Business Name"
                      value={formData.business_name}
                      onChange={handleInputChange('business_name')}
                      error={formErrors.business_name}
                      placeholder="Your Business Name"
                      required
                    />
                    <Input
                      label="Owner Name"
                      value={formData.owner_name}
                      onChange={handleInputChange('owner_name')}
                      error={formErrors.owner_name}
                      placeholder="Owner's Full Name"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      error={formErrors.phone}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                    <Input
                      label="Business Image URL (optional)"
                      value={formData.business_image_url}
                      onChange={handleInputChange('business_image_url')}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Address *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={handleInputChange('address')}
                      className={`w-full rounded-md border px-3 py-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.address ? 'border-red-400 bg-red-950' : 'border-gray-600 bg-gray-800'
                      }`}
                      rows={3}
                      placeholder="123 Main Street, City, State 12345"
                      required
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.address}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Theme Customization */}
              <Card>
                <CardHeader>
                  <CardTitle>Theme Customization</CardTitle>
                  <CardDescription>
                    Customize the appearance of your business pages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={themeData.primaryColor}
                          onChange={handleThemeChange('primaryColor')}
                          className="w-12 h-10 rounded border border-gray-600 bg-gray-800"
                        />
                        <Input
                          value={themeData.primaryColor}
                          onChange={handleThemeChange('primaryColor')}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={themeData.secondaryColor}
                          onChange={handleThemeChange('secondaryColor')}
                          className="w-12 h-10 rounded border border-gray-600 bg-gray-800"
                        />
                        <Input
                          value={themeData.secondaryColor}
                          onChange={handleThemeChange('secondaryColor')}
                          placeholder="#6b7280"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Background Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={themeData.backgroundColor}
                          onChange={handleThemeChange('backgroundColor')}
                          className="w-12 h-10 rounded border border-gray-600 bg-gray-800"
                        />
                        <Input
                          value={themeData.backgroundColor}
                          onChange={handleThemeChange('backgroundColor')}
                          placeholder="#0a0a0a"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Text Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={themeData.textColor}
                          onChange={handleThemeChange('textColor')}
                          className="w-12 h-10 rounded border border-gray-600 bg-gray-800"
                        />
                        <Input
                          value={themeData.textColor}
                          onChange={handleThemeChange('textColor')}
                          placeholder="#fafafa"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-700 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold text-gray-200 mb-3">Theme Preview</h3>
                    <div
                      className="rounded-lg p-4 border"
                      style={{
                        backgroundColor: themeData.backgroundColor,
                        color: themeData.textColor,
                        borderColor: themeData.secondaryColor
                      }}
                    >
                      <h4
                        className="text-lg font-semibold mb-2"
                        style={{ color: themeData.primaryColor }}
                      >
                        {formData.business_name || 'Your Business Name'}
                      </h4>
                      <p style={{ color: themeData.textColor }}>
                        This is how your business pages will look with these colors.
                      </p>
                      <button
                        className="mt-2 px-4 py-2 rounded font-medium"
                        style={{
                          backgroundColor: themeData.primaryColor,
                          color: themeData.backgroundColor
                        }}
                      >
                        Sample Button
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-center">
                <Button
                  onClick={saveBusinessSettings}
                  loading={isSaving}
                  className="theme-bg-primary"
                  size="lg"
                >
                  Save All Settings
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}