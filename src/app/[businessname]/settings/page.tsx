'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AddressAutocomplete, AddressDetails } from '@/components/ui/AddressAutocomplete'
import { GoogleMap } from '@/components/ui/GoogleMap'
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { BusinessAdminUser, requireBusinessAdminAuth } from '@/utils/auth'

interface PageProps {
  params: Promise<{ businessname: string }>
}

// BusinessData interface removed as it was unused

interface FormErrors {
  business_name?: string
  owner_name?: string
  phone?: string
  address?: string
}

export default function BusinessSettingsPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<BusinessAdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // businessData state removed as it was unused
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
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)



  const loadBusinessData = useCallback(async (businessId: string) => {
    try {
      setLoadingBusiness(true)
      const response = await fetch(`/api/businesses/${businessId}`)
      const data = await response.json()

      if (data.success) {
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
        loadBusinessData(user.businessId)
      }
      setIsLoading(false)
    }

    getParams()
  }, [params, router, loadBusinessData])

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field as keyof FormErrors]: '' }))
    }
  }


  const handleAddressSelect = (address: AddressDetails) => {
    setAddressDetails(address)
    setFormData(prev => ({ ...prev, address: address.fullAddress }))
    // Clear address error when address is selected
    if (formErrors.address) {
      setFormErrors((prev) => ({ ...prev, address: '' }))
    }
  }

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedImage(file)
    setImagePreviewUrl(previewUrl)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreviewUrl(null)
  }

  const uploadBusinessImage = async (businessId: string): Promise<string | null> => {
    if (!selectedImage) return null

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedImage)
      formDataUpload.append('businessId', businessId)

      const response = await fetch('/api/upload/business-image', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      return data.url
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const validateForm = () => {
    const errors: FormErrors = {}

    if (!formData.business_name.trim()) errors.business_name = 'El nombre del negocio es requerido'
    if (!formData.owner_name.trim()) errors.owner_name = 'El nombre del propietario es requerido'
    if (!formData.phone.trim()) errors.phone = 'El teléfono es requerido'
    if (!formData.address.trim()) errors.address = 'La dirección es requerida'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveBusinessSettings = async () => {
    if (!validateForm()) return

    if (!user?.businessId) {
      alert('User not authenticated')
      return
    }

    setIsSaving(true)
    try {
      // Upload image first if there's one selected
      let imageUrl = formData.business_image_url
      if (selectedImage) {
        try {
          const uploadedUrl = await uploadBusinessImage(user.businessId)
          if (uploadedUrl) {
            imageUrl = uploadedUrl
          }
        } catch (imageError) {
          console.error('Image upload failed:', imageError)
          alert('Error al subir la imagen, pero se guardarán los demás cambios')
        }
      }

      const response = await fetch(`/api/businesses/${user.businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          business_image_url: imageUrl,
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

        // Clear selected image after successful save
        setSelectedImage(null)
        setImagePreviewUrl(null)

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
                loading={isSaving || uploadingImage}
                className="btn-primary"
              >
                {uploadingImage
                  ? 'Subiendo imagen...'
                  : isSaving
                  ? 'Guardando...'
                  : 'Guardar Configuraciones'
                }
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
                    <div>
                      <label className="block text-sm font-medium text-app mb-2">
                        Logo del Negocio (Opcional)
                      </label>
                      <ImageUploader
                        onImageSelect={handleImageSelect}
                        onImageRemove={handleImageRemove}
                        currentImageUrl={imagePreviewUrl || formData.business_image_url || undefined}
                        disabled={isSaving || uploadingImage}
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-muted">
                        Sube una imagen que represente tu negocio. Recomendado: 800x800px, máximo 5MB.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-app mb-2">
                      Business Address *
                    </label>
                    {/* Address autocomplete component */}
                    <AddressAutocomplete
                      onAddressSelect={handleAddressSelect}
                      placeholder="Busca y actualiza la dirección de tu negocio..."
                      initialValue={formData.address}
                      disabled={isSaving}
                      className="w-full"
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

              {/* Map Preview Card */}
              {formData.address && (
                <Card>
                  <CardHeader>
                    <CardTitle>Previsualización del Mapa</CardTitle>
                    <CardDescription>
                      Vista previa de la ubicación de tu negocio en el mapa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GoogleMap
                      key={`${formData.address}-${formData.business_name}`} // Force re-render when address or business name changes
                      address={formData.address}
                      businessName={formData.business_name || 'Tu Negocio'}
                      className="h-80 w-full"
                    />
                  </CardContent>
                </Card>
              )}


              {/* Save Button */}
              <div className="flex justify-center">
                <Button
                  onClick={saveBusinessSettings}
                  loading={isSaving || uploadingImage}
                  className="btn-primary"
                  size="lg"
                >
                  {uploadingImage
                    ? 'Subiendo imagen...'
                    : isSaving
                    ? 'Guardando...'
                    : 'Guardar Configuraciones'
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}