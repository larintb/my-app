import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Get recent appointments (last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: recentAppointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        status,
        created_at,
        appointment_date,
        appointment_time,
        users!appointments_client_id_fkey (
          first_name,
          last_name
        ),
        services (
          name,
          price
        )
      `)
      .eq('business_id', businessId)
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (appointmentsError) {
      console.error('Error fetching recent appointments:', appointmentsError)
      throw appointmentsError
    }

    // Get recent client registrations (last 7 days)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: recentClients, error: clientsError } = await supabaseAdmin
      .from('client_businesses')
      .select(`
        id,
        created_at,
        users!client_businesses_client_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('business_id', businessId)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    if (clientsError) {
      console.error('Error fetching recent clients:', clientsError)
      throw clientsError
    }

    // Format activities
    const activities = []

    // Add appointment activities
    recentAppointments?.forEach(appointment => {
      const clientName = `${appointment.users.first_name} ${appointment.users.last_name}`
      const serviceName = appointment.services.name
      const createdAt = new Date(appointment.created_at)
      const timeDiff = Date.now() - createdAt.getTime()

      let timeAgo = ''
      if (timeDiff < 60000) { // Less than 1 minute
        timeAgo = 'Just now'
      } else if (timeDiff < 3600000) { // Less than 1 hour
        timeAgo = `${Math.floor(timeDiff / 60000)} min ago`
      } else if (timeDiff < 86400000) { // Less than 24 hours
        timeAgo = `${Math.floor(timeDiff / 3600000)} hour${Math.floor(timeDiff / 3600000) > 1 ? 's' : ''} ago`
      } else {
        timeAgo = `${Math.floor(timeDiff / 86400000)} day${Math.floor(timeDiff / 86400000) > 1 ? 's' : ''} ago`
      }

      if (appointment.status === 'completed') {
        activities.push({
          type: 'payment',
          title: 'Payment received',
          description: `$${appointment.services.price} from ${clientName} - ${serviceName}`,
          timeAgo,
          timestamp: appointment.created_at
        })
      } else {
        activities.push({
          type: 'appointment',
          title: 'New appointment booked',
          description: `${clientName} - ${serviceName} - ${appointment.appointment_date} ${appointment.appointment_time}`,
          timeAgo,
          timestamp: appointment.created_at
        })
      }
    })

    // Add client registration activities
    recentClients?.forEach(client => {
      const clientName = `${client.users.first_name} ${client.users.last_name}`
      const createdAt = new Date(client.created_at)
      const timeDiff = Date.now() - createdAt.getTime()

      let timeAgo = ''
      if (timeDiff < 3600000) { // Less than 1 hour
        timeAgo = `${Math.floor(timeDiff / 60000)} min ago`
      } else if (timeDiff < 86400000) { // Less than 24 hours
        timeAgo = `${Math.floor(timeDiff / 3600000)} hour${Math.floor(timeDiff / 3600000) > 1 ? 's' : ''} ago`
      } else {
        timeAgo = `${Math.floor(timeDiff / 86400000)} day${Math.floor(timeDiff / 86400000) > 1 ? 's' : ''} ago`
      }

      activities.push({
        type: 'client',
        title: 'New client registered',
        description: `${clientName} via NFC card`,
        timeAgo,
        timestamp: client.created_at
      })
    })

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      activities: activities.slice(0, 10) // Limit to 10 most recent
    })

  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}