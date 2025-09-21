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
        { success: false, error: 'Se requiere el ID del negocio' },
        { status: 400 }
      )
    }

    // Get recent appointments (last 24 hours)
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    // Format as local date strings 
    const nowYear = now.getFullYear()
    const nowMonth = String(now.getMonth() + 1).padStart(2, '0')
    const nowDay = String(now.getDate()).padStart(2, '0')
    const todayLocal = `${nowYear}-${nowMonth}-${nowDay}`
    
    const dayAgoYear = oneDayAgo.getFullYear()
    const dayAgoMonth = String(oneDayAgo.getMonth() + 1).padStart(2, '0')
    const dayAgoDay = String(oneDayAgo.getDate()).padStart(2, '0')
    const dayAgoLocal = `${dayAgoYear}-${dayAgoMonth}-${dayAgoDay}`

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
      .gte('appointment_date', dayAgoLocal)
      .order('created_at', { ascending: false })
      .limit(10)

    if (appointmentsError) {
      console.error('Error fetching recent appointments:', appointmentsError)
      throw appointmentsError
    }

    // Get recent client registrations (last 7 days)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekAgoYear = oneWeekAgo.getFullYear()
    const weekAgoMonth = String(oneWeekAgo.getMonth() + 1).padStart(2, '0')
    const weekAgoDay = String(oneWeekAgo.getDate()).padStart(2, '0')
    const weekAgoLocal = `${weekAgoYear}-${weekAgoMonth}-${weekAgoDay}`

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
        timeAgo = 'Ahora mismo'
      } else if (timeDiff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(timeDiff / 60000)
        timeAgo = `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
      } else if (timeDiff < 86400000) { // Less than 24 hours
        const hours = Math.floor(timeDiff / 3600000)
        timeAgo = `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
      } else {
        const days = Math.floor(timeDiff / 86400000)
        timeAgo = `hace ${days} ${days === 1 ? 'día' : 'días'}`
      }

      if (appointment.status === 'completed') {
        activities.push({
          type: 'payment',
          title: 'Pago recibido',
          description: `$${appointment.services.price} de ${clientName} - ${serviceName}`,
          timeAgo,
          timestamp: appointment.created_at
        })
      } else {
        activities.push({
          type: 'appointment',
          title: 'Nueva cita reservada',
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
        const minutes = Math.floor(timeDiff / 60000)
        timeAgo = `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
      } else if (timeDiff < 86400000) { // Less than 24 hours
        const hours = Math.floor(timeDiff / 3600000)
        timeAgo = `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
      } else {
        const days = Math.floor(timeDiff / 86400000)
        timeAgo = `hace ${days} ${days === 1 ? 'día' : 'días'}`
      }

      activities.push({
        type: 'client',
        title: 'Nuevo cliente registrado',
        description: `${clientName} vía tarjeta NFC`,
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
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}