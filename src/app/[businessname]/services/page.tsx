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

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration_minutes: number
  is_active: boolean
}

interface ServiceFormErrors {
  name?: string
  price?: string
  duration_minutes?: string
}

export default function ServicesPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [user, setUser] = useState<BusinessAdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)


  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: ''
  })
  const [formErrors, setFormErrors] = useState<ServiceFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadServices = useCallback(async (businessId: string) => {
    try {
      setLoadingServices(true)
      const response = await fetch(`/api/businesses/${businessId}/services`)
      const data = await response.json()

      if (data.success) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoadingServices(false)
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
        loadServices(user.businessId)
      }
      setIsLoading(false)
    }
    getParams()
  }, [params, router, loadServices])

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (formErrors[field as keyof ServiceFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field as keyof ServiceFormErrors]: '' }))
    }
  }

  const validateForm = () => {
    const errors: ServiceFormErrors = {}

    if (!formData.name.trim()) errors.name = 'El nombre del servicio es requerido'
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Se requiere un precio válido'
    if (!formData.duration_minutes || parseInt(formData.duration_minutes) <= 0) errors.duration_minutes = 'Se requiere una duración válida'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (!user?.businessId) {
      alert('User not authenticated')
      return
    }

    setIsSubmitting(true)
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        business_id: user.businessId
      }

      const url = editingService
        ? `/api/businesses/${user.businessId}/services/${editingService.id}`
        : `/api/businesses/${user.businessId}/services`

      const method = editingService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      })

      const data = await response.json()

      if (data.success) {
        await loadServices(user.businessId)
        resetForm()
        alert(`¡Servicio ${editingService ? 'actualizado' : 'creado'} exitosamente!`)
      } else {
        alert(`Error al ${editingService ? 'actualizar' : 'crear'} servicio: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Error al guardar servicio')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_minutes: ''
    })
    setFormErrors({})
    setShowCreateForm(false)
    setEditingService(null)
  }

  const startEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString()
    })
    setShowCreateForm(true)
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return

    if (!user?.businessId) {
      alert('User not authenticated')
      return
    }

    try {
      const response = await fetch(`/api/businesses/${user.businessId}/services/${serviceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        await loadServices(user.businessId)
        alert('¡Servicio eliminado exitosamente!')
      } else {
        alert('Error al eliminar servicio: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error al eliminar servicio')
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
                Services & Pricing
              </h1>
              <p className="text-muted mt-1">Manage your services and pricing</p>
            </div>
            <div className="flex items-center gap-4">
              <ClientThemeToggle />
              <Button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
                disabled={showCreateForm}
              >
                + Add Service
              </Button>
            </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingService ? 'Edit Service' : 'Create New Service'}</CardTitle>
                <CardDescription>
                  {editingService ? 'Update service information' : 'Add a new service to your business'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Service Name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      error={formErrors.name}
                      placeholder="e.g. Haircut & Style"
                      required
                    />
                    <Input
                      label="Duration (minutes)"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={handleInputChange('duration_minutes')}
                      error={formErrors.duration_minutes}
                      placeholder="60"
                      required
                    />
                  </div>

                  <Input
                    label="Price ($)"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange('price')}
                    error={formErrors.price}
                    placeholder="45.00"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-app mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      className="w-full rounded-md border border-border bg-input px-3 py-2 text-app placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                      rows={3}
                      placeholder="Describe your service..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="btn-primary"
                    >
                      {editingService ? 'Update Service' : 'Create Service'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Services List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Services</CardTitle>
              <CardDescription>
                Manage all your services and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingServices ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-app">{service.name}</h3>
                            <span className="text-2xl font-bold accent-text">${service.price}</span>
                            <span className="text-sm text-muted">({service.duration_minutes} min)</span>
                          </div>
                          {service.description && (
                            <p className="text-muted mt-1">{service.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(service)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteService(service.id)}
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚙️</div>
                  <h3 className="text-xl font-semibold text-app mb-2">No services yet</h3>
                  <p className="text-muted mb-4">
                    Create your first service to start accepting bookings
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="btn-primary"
                  >
                    + Create First Service
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}