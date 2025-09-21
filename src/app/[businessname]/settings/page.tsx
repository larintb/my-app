'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AddressAutocomplete, AddressDetails } from '@/components/ui/AddressAutocomplete'
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle'

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
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null)



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


  const handleAddressSelect = (address: AddressDetails) => {
    setAddressDetails(address)
    setFormData(prev => ({ ...prev, address: address.fullAddress }))
    // Clear address error when address is selected
    if (formErrors.address) {
      setFormErrors((prev: any) => ({ ...prev, address: '' }))
    }
  }

  const validateForm = () => {
    const errors: any = {}

    if (!formData.business_name.trim()) errors.business_name = 'El nombre del negocio es requerido'
    if (!formData.owner_name.trim()) errors.owner_name = 'El nombre del propietario es requerido'
    if (!formData.phone.trim()) errors.phone = 'El teléfono es requerido'
    if (!formData.address.trim()) errors.address = 'La dirección es requerida'

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
          // Include address details if available
          ...(addressDetails && {
            address_details: {
              place_id: addressDetails.placeId,
              latitude: addressDetails.latitude,
              longitude: addressDetails.longitude,
              city: addressDetails.city,
              state: addressDetails.state,
              country: addressDetails.country,
              postal_code: addressDetails.postalCode
            }
          })
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('¡Configuraciones del negocio guardadas exitosamente!')

        await loadBusinessData(user.businessId)
      } else {
        alert('Error al guardar configuraciones: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving business settings:', error)
      alert('Error al guardar configuraciones')
    } finally {
      setIsSaving(false)
    }
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
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => router.push(`/${businessName}/dashboard`)}
                className="btn-secondary mb-4"
                size="sm"
              >
                ← Volver al Panel
              </Button>
              <h1 className="text-3xl font-bold accent-text">
                Configuraciones del Negocio
              </h1>
              <p className="text-muted mt-1">Administra la información de tu negocio</p>
            </div>
            <div className="flex items-center gap-4">
              <ClientThemeToggle />
              <Button
                onClick={saveBusinessSettings}
                loading={isSaving}
                className="btn-primary"
              >
                Guardar Configuraciones
              </Button>
            </div>
          </div>

          {loadingBusiness ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-card rounded w-1/4"></div>
                      <div className="space-y-3">
                        <div className="h-10 bg-card rounded"></div>
                        <div className="h-10 bg-card rounded"></div>
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
                    <label className="block text-sm font-medium text-app mb-2">
                      Business Address *
                    </label>
                    <AddressAutocomplete
                      onAddressSelect={handleAddressSelect}
                      placeholder="Busca y actualiza la dirección de tu negocio..."
                      initialValue={formData.address}
                      disabled={isSaving}
                      className="w-full"
                      darkMode={false}
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm" style={{ color: 'var(--danger-color)' }}>{formErrors.address}</p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      Busca tu dirección para actualizarla con mayor precisión. Soportamos Estados Unidos y México.
                    </p>

                    {/* Selected Address Details */}
                    {addressDetails && addressDetails.fullAddress && (
                      <div className="mt-3 p-3 rounded-lg" style={{
                        backgroundColor: 'var(--success-color, #10b981)',
                        opacity: 0.1,
                        border: '1px solid var(--success-color, #10b981)'
                      }}>
                        <div className="flex items-start">
                          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: 'var(--success-color, #10b981)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: 'var(--success-color, #10b981)' }}>Nueva Dirección Seleccionada</p>
                            <p className="text-sm text-app">{addressDetails.fullAddress}</p>
                            {(addressDetails.city || addressDetails.state) && (
                              <p className="text-xs text-muted mt-1">
                                {addressDetails.city && `${addressDetails.city}, `}
                                {addressDetails.state && addressDetails.state}
                                {addressDetails.postalCode && ` ${addressDetails.postalCode}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>


              {/* Save Button */}
              <div className="flex justify-center">
                <Button
                  onClick={saveBusinessSettings}
                  loading={isSaving}
                  className="btn-primary"
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