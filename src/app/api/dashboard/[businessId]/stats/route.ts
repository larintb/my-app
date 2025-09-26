import { NextResponse } from 'next/server'
import { getAppointmentStats } from '@/lib/db/appointments'
import { getClientCount } from '@/lib/db/clientBusinesses'
import { getServicesByBusinessId } from '@/lib/db/services'

interface RouteParams {
  params: Promise<{
    businessId: string
  }>
}

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

    // Get all stats in parallel
    const [appointmentStats, clientCount, services] = await Promise.all([
      getAppointmentStats(businessId),
      getClientCount(businessId),
      getServicesByBusinessId(businessId)
    ])

    const stats = {
      todayAppointments: appointmentStats.todayAppointments,
      totalClients: clientCount,
      servicesOffered: services.length,
      monthlyRevenue: appointmentStats.monthlyRevenue,
      monthlyAppointments: appointmentStats.monthlyAppointments,
      pendingAppointments: appointmentStats.pendingAppointments
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}