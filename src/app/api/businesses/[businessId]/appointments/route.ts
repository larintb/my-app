import { NextResponse } from 'next/server'
import { getAppointmentsByBusinessId } from '@/lib/db/appointments'

interface RouteParams {
  params: Promise<{
    businessId: string
  }>
}

// GET /api/businesses/[businessId]/appointments
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

    const appointments = await getAppointmentsByBusinessId(businessId)

    return NextResponse.json({
      success: true,
      appointments
    })

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}