'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessLoginForm } from '@/components/forms/BusinessLoginForm'
import { Card, CardContent } from '@/components/ui/Card'
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading business information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadingState === 'not_found') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🏢❌</div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Business Not Found</h2>
              <p className="text-gray-400 mb-4">
                No business found with the name "{businessName}"
              </p>
              <p className="text-sm text-gray-500">
                Please check the URL or contact the business owner.
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