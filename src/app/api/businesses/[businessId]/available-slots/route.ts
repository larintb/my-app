import { NextResponse } from 'next/server'
import { getBusinessHours } from '@/lib/db/businessHours'
import { getAppointmentsByBusinessId } from '@/lib/db/appointments'

interface RouteParams {
  params: Promise<{
    businessId: string
  }>
}

interface AvailableSlot {
  date: string
  time: string
  available: boolean
}

// GET /api/businesses/[businessId]/available-slots?date=YYYY-MM-DD
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const businessId = resolvedParams.businessId
    const url = new URL(request.url)
    const dateParam = url.searchParams.get('date')

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      )
    }

    if (!dateParam) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Parse date safely to avoid timezone issues
    const [year, month, day] = dateParam.split('-').map(num => parseInt(num))
    const selectedDate = new Date(year, month - 1, day) // month is 0-indexed
    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    // Get business hours for this day
    const businessHours = await getBusinessHours(businessId)
    const todayHours = businessHours.find(h => h.day_of_week === dayOfWeek && h.is_active)

    if (!todayHours) {
      return NextResponse.json({
        success: true,
        slots: [],
        message: 'Business is closed on this day'
      })
    }

    // Get existing appointments for this date
    const allAppointments = await getAppointmentsByBusinessId(businessId)
    const appointmentsForDate = allAppointments.filter(
      app => app.appointment_date === dateParam && 
             (app.status === 'pending' || app.status === 'confirmed')
    )

    // Generate time slots (every 30 minutes)
    const slots: AvailableSlot[] = []
    const openTime = todayHours.open_time
    const closeTime = todayHours.close_time

    // Convert time strings to minutes for easier calculation
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }

    const openMinutes = timeToMinutes(openTime)
    const closeMinutes = timeToMinutes(closeTime)

    // Generate 30-minute slots
    for (let minutes = openMinutes; minutes < closeMinutes; minutes += 30) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`

      const isBooked = appointmentsForDate.some(app => app.appointment_time === timeStr)
      
      slots.push({
        date: dateParam,
        time: timeStr,
        available: !isBooked
      })
    }

    return NextResponse.json({
      success: true,
      slots,
      businessHours: {
        open: openTime,
        close: closeTime
      }
    })

  } catch (error) {
    console.error('Error fetching available slots:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}