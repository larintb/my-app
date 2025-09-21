import { supabaseAdmin } from '@/lib/supabase'

export interface Appointment {
  id: string
  business_id: string
  client_id: string
  service_id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface CreateAppointmentData {
  business_id: string
  client_id: string
  service_id: string
  appointment_date: string
  appointment_time: string
  notes?: string
}

// Get appointments for a business
export async function getAppointmentsByBusinessId(businessId: string): Promise<Appointment[]> {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      *,
      users!appointments_client_id_fkey (
        id,
        first_name,
        last_name,
        phone
      ),
      services (
        id,
        name,
        price,
        duration_minutes
      )
    `)
    .eq('business_id', businessId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (error) {
    console.error('Error fetching appointments:', error)
    throw new Error('Failed to fetch appointments')
  }

  return data || []
}

// Get today's appointments for a business
export async function getTodaysAppointments(businessId: string): Promise<Appointment[]> {
  // Use local date instead of UTC to match how appointments are created
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayLocal = `${year}-${month}-${day}`

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      *,
      users!appointments_client_id_fkey (
        id,
        first_name,
        last_name,
        phone
      ),
      services (
        id,
        name,
        price,
        duration_minutes
      )
    `)
    .eq('business_id', businessId)
    .eq('appointment_date', todayLocal)
    .order('appointment_time', { ascending: true })

  if (error) {
    console.error('Error fetching today\'s appointments:', error)
    throw new Error('Failed to fetch today\'s appointments')
  }

  return data || []
}

// Create a new appointment
export async function createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single()

  if (error) {
    console.error('Error creating appointment:', error)
    throw new Error('Failed to create appointment')
  }

  return data
}

// Update appointment status
export async function updateAppointmentStatus(
  appointmentId: string,
  status: Appointment['status']
): Promise<Appointment> {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating appointment status:', error)
    throw new Error('Failed to update appointment status')
  }

  return data
}

// Get appointment statistics for dashboard
export async function getAppointmentStats(businessId: string) {
  try {
    // Use local date instead of UTC to match how appointments are created
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayLocal = `${year}-${month}-${day}`
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthYear = startOfMonth.getFullYear()
    const monthMonth = String(startOfMonth.getMonth() + 1).padStart(2, '0')
    const monthDay = String(startOfMonth.getDate()).padStart(2, '0')
    const startOfMonthLocal = `${monthYear}-${monthMonth}-${monthDay}`

    // Get today's appointments count
    const { data: todayData, error: todayError } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('business_id', businessId)
      .eq('appointment_date', todayLocal)

    if (todayError) throw todayError

    // Get this month's appointments
    const { data: monthData, error: monthError } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('business_id', businessId)
      .gte('appointment_date', startOfMonthLocal)

    if (monthError) throw monthError

    // Get pending appointments
    const { data: pendingData, error: pendingError } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('business_id', businessId)
      .eq('status', 'pending')
      .gte('appointment_date', todayLocal)

    if (pendingError) throw pendingError

    // Get today's revenue (completed appointments)
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('appointments')
      .select(`
        services (price)
      `)
      .eq('business_id', businessId)
      .eq('appointment_date', todayLocal)
      .eq('status', 'completed')

    if (revenueError) throw revenueError

    const todayRevenue = revenueData?.reduce((total, appointment) => {
      return total + (appointment.services?.price || 0)
    }, 0) || 0

    return {
      todayAppointments: todayData?.length || 0,
      monthlyAppointments: monthData?.length || 0,
      pendingAppointments: pendingData?.length || 0,
      todayRevenue: todayRevenue
    }
  } catch (error) {
    console.error('Error fetching appointment stats:', error)
    return {
      todayAppointments: 0,
      monthlyAppointments: 0,
      pendingAppointments: 0,
      todayRevenue: 0
    }
  }
}