import { NextResponse } from 'next/server'
import { getBusinessById, updateBusiness } from '@/lib/db/businesses'

interface RouteParams {
  params: Promise<{
    businessId: string
  }>
}

// GET /api/businesses/[businessId]
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const businessId = resolvedParams.businessId

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      )
    }

    const business = await getBusinessById(businessId)

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      business
    })

  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/businesses/[businessId]
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const businessId = resolvedParams.businessId
    const body = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      )
    }

    const {
      business_name,
      owner_name,
      phone,
      address,
      business_image_url,
      address_details
    } = body

    // Validate required fields
    if (!business_name || !owner_name || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'Business name, owner name, phone, and address are required' },
        { status: 400 }
      )
    }

    // Verify business exists
    const existingBusiness = await getBusinessById(businessId)
    if (!existingBusiness) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }


    const updatedBusiness = await updateBusiness(businessId, {
      business_name: business_name.trim(),
      owner_name: owner_name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      business_image_url: business_image_url?.trim() || null,
      // Include address details if provided
      ...(address_details && {
        address_latitude: address_details.latitude,
        address_longitude: address_details.longitude,
        address_city: address_details.city,
        address_state: address_details.state,
        address_country: address_details.country,
        address_postal_code: address_details.postal_code,
        address_place_id: address_details.place_id
      })
    })


    return NextResponse.json({
      success: true,
      business: updatedBusiness
    })

  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}