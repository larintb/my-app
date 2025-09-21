'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessLoginForm } from '@/components/forms/BusinessLoginForm'
import { Card, CardContent } from '@/components/ui/Card'
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle'
import { setBusinessAdminSession } from '@/utils/auth'

interface PageProps {
  params: Promise<{ businessname: string }>
}

export default function BusinessLoginPage({ params }: PageProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState<string>('')
  const [businessData, setBusinessData] = useState<any>(null)
  const [loadingState, setLoadingState] = useState<'loading' | 'found' | 'not_found'>('loading')

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      const decodedBusinessName = decodeURIComponent(resolvedParams.businessname)
      setBusinessName(decodedBusinessName)
      await loadBusinessData(decodedBusinessName)
    }

    getParams()
  }, [params])

  const loadBusinessData = async (businessNameParam: string) => {
    try {
      const response = await fetch(`/api/businesses/by-name/${encodeURIComponent(businessNameParam)}`)
      const data = await response.json()

      if (data.success && data.business) {
        setBusinessData(data.business)
        setLoadingState('found')
      } else {
        setLoadingState('not_found')
      }
    } catch (error) {
      console.error('Error loading business data:', error)
      setLoadingState('not_found')
    }
  }

  const handleLoginSuccess = (user: any) => {
    // Store business admin session (localStorage + cookie)
    setBusinessAdminSession(user)

    // Redirect to business dashboard
    router.push(`/${businessName}/dashboard`)
  }

  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="absolute top-4 right-4">
          <ClientThemeToggle />
        </div>
        <Card className="w-full max-w-md feature-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p style={{ color: 'var(--text-secondary)' }}>Cargando información del negocio...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadingState === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="absolute top-4 right-4">
          <ClientThemeToggle />
        </div>
        <Card className="w-full max-w-md feature-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🏢❌</div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Negocio No Encontrado</h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                No se encontró ningún negocio con el nombre "{businessName}"
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Por favor, verifica la URL o contacta al dueño del negocio.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadingState === 'found' && businessData) {
    return (
      <BusinessLoginForm
        businessName={businessData.business_name}
        businessId={businessData.id}
        onSuccess={handleLoginSuccess}
      />
    )
  }

  return null
}