import { NextResponse } from 'next/server'
import { getBusinessHours, updateBusinessHours } from '@/lib/db/businessHours'

interface RouteParams {
  params: Promise<{
    businessId: string
  }>
}

// GET /api/businesses/[businessId]/hours
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

    const hours = await getBusinessHours(businessId)

    return NextResponse.json({
      success: true,
      hours
    })

  } catch (error) {
    console.error('Error fetching business hours:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/businesses/[businessId]/hours
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

    const { hours } = body

    if (!Array.isArray(hours)) {
      return NextResponse.json(
        { success: false, error: 'Hours must be an array' },
        { status: 400 }
      )
    }

    // Validate hours format
    for (const hour of hours) {
      if (
        typeof hour.day_of_week !== 'number' ||
        hour.day_of_week < 0 ||
        hour.day_of_week > 6 ||
        !hour.open_time ||
        !hour.close_time ||
        typeof hour.is_active !== 'boolean'
      ) {
        return NextResponse.json(
          { success: false, error: 'Invalid hour format' },
          { status: 400 }
        )
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(hour.open_time) || !timeRegex.test(hour.close_time)) {
        return NextResponse.json(
          { success: false, error: 'Invalid time format. Use HH:MM format' },
          { status: 400 }
        )
      }

      // Validate that close time is after open time
      if (hour.is_active && hour.open_time >= hour.close_time) {
        return NextResponse.json(
          { success: false, error: 'Close time must be after open time' },
          { status: 400 }
        )
      }
    }

    await updateBusinessHours(businessId, hours)

    return NextResponse.json({
      success: true,
      message: 'Business hours updated successfully'
    })

  } catch (error) {
    console.error('Error updating business hours:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}