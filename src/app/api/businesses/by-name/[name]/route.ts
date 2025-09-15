import { NextResponse } from 'next/server'
import { getBusinessByName } from '@/lib/db/businesses'

interface RouteParams {
  params: Promise<{ name: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const businessName = decodeURIComponent(resolvedParams.name)

    const business = await getBusinessByName(businessName)

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        business_name: business.business_name,
        owner_name: business.owner_name,
        phone: business.phone,
        address: business.address,
        business_image_url: business.business_image_url,
        theme_settings: business.theme_settings
      }
    })

  } catch (error) {
    console.error('Business lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}