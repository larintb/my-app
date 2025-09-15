import { NextResponse } from 'next/server'
import { getServicesByBusinessId, createService } from '@/lib/db/services'

interface RouteParams {
  params: Promise<{
    businessId: string
  }>
}

// GET /api/businesses/[businessId]/services
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

    const services = await getServicesByBusinessId(businessId)

    return NextResponse.json({
      success: true,
      services
    })

  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/businesses/[businessId]/services
export async function POST(request: Request, { params }: RouteParams) {
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

    const { name, description, price, duration_minutes } = body

    if (!name || !price || !duration_minutes) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and duration are required' },
        { status: 400 }
      )
    }

    const service = await createService({
      business_id: businessId,
      name: name.trim(),
      description: description?.trim() || null,
      price: parseFloat(price),
      duration_minutes: parseInt(duration_minutes)
    })

    return NextResponse.json({
      success: true,
      service
    })

  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}