'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { AddressAutocomplete, AddressDetails } from '@/components/ui/AddressAutocomplete'
import { BusinessAdminRegistrationForm } from '@/types'

interface BusinessRegistrationProps {
  token: string
  onSuccess: (data: any) => void
}

export function BusinessRegistrationForm({ token, onSuccess }: BusinessRegistrationProps) {
  const [formData, setFormData] = useState<BusinessAdminRegistrationForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    business_name: '',
    owner_name: '',
    business_phone: '',
    address: '',
  })

  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<BusinessAdminRegistrationForm & { confirmPassword: string }>>({})
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null)

  const handleInputChange = (field: keyof BusinessAdminRegistrationForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddressSelect = (address: AddressDetails) => {
    setAddressDetails(address)
    setFormData(prev => ({ ...prev, address: address.fullAddress }))
    // Clear address error when address is selected
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessAdminRegistrationForm & { confirmPassword: string }> = {}

    // Personal info validation
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    // Business info validation
    if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required'
    if (!formData.owner_name.trim()) newErrors.owner_name = 'Owner name is required'
    if (!formData.business_phone.trim()) newErrors.business_phone = 'Business phone is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/register-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          // Personal data
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          // Business data
          business_name: formData.business_name,
          owner_name: formData.owner_name,
          business_phone: formData.business_phone,
          address: formData.address,
          // Additional address details (if available)
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

      if (!response.ok) {
        if (data.error === 'Email already exists') {
          setErrors({ email: 'This email is already registered' })
        } else if (data.error === 'Invalid or expired token') {
          setErrors({ email: 'Registration token is invalid or expired' })
        } else {
          setErrors({ email: data.error || 'Registration failed. Please try again.' })
        }
        return
      }

      if (data.success) {
        onSuccess({
          success: true,
          message: 'Registration successful!',
          user: data.user,
          business: data.business
        })
      } else {
        setErrors({ email: 'Registration failed. Please try again.' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ email: 'Registration failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-100">Welcome to MyCard</h1>
          <p className="mt-2 text-gray-400">Set up your business account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your contact details and login credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange('first_name')}
                  error={errors.first_name}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange('last_name')}
                  error={errors.last_name}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={errors.email}
                helper="This will be used for login"
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={errors.phone}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={errors.password}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: '' }))
                    }
                  }}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Details about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Business Name"
                value={formData.business_name}
                onChange={handleInputChange('business_name')}
                error={errors.business_name}
                required
              />

              <Input
                label="Business Owner Name"
                value={formData.owner_name}
                onChange={handleInputChange('owner_name')}
                error={errors.owner_name}
                helper="This can be different from your personal name"
                required
              />

              <Input
                label="Business Phone"
                type="tel"
                value={formData.business_phone}
                onChange={handleInputChange('business_phone')}
                error={errors.business_phone}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Address *
                </label>
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  placeholder="Comienza escribiendo la dirección de tu negocio..."
                  initialValue={formData.address}
                  disabled={isSubmitting}
                  className="w-full"
                  darkMode={true}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-400">{errors.address}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Busca y selecciona tu dirección exacta. Soportamos Estados Unidos y México.
                </p>

                {/* Selected Address Details */}
                {addressDetails && addressDetails.fullAddress && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Dirección Confirmada</p>
                        <p className="text-sm text-green-700">{addressDetails.fullAddress}</p>
                        {(addressDetails.city || addressDetails.state) && (
                          <p className="text-xs text-green-600 mt-1">
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

              {/* TODO: Add image upload for business_image */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <div className="text-gray-600">
                  <p className="text-sm">Business Photo (Optional)</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon - you can add this later</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Business Account'}
              </Button>

              <p className="mt-4 text-center text-sm text-gray-600">
                By creating an account, you agree to our terms of service and privacy policy.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}