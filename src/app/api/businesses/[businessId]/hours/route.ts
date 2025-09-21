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

    console.log('=== GET BUSINESS HOURS DEBUG ===')
    console.log('BusinessId:', businessId)
    
    const hours = await getBusinessHours(businessId)
    console.log('Raw hours from database:', JSON.stringify(hours, null, 2))
    
    // Log each hour individually
    hours.forEach((hour, index) => {
      console.log(`Hour ${index}: day=${hour.day_of_week}, open="${hour.open_time}", close="${hour.close_time}", typeof open=${typeof hour.open_time}, typeof close=${typeof hour.close_time}`)
    })

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

    // Log the data being received for debugging
    console.log('Received hours data:', JSON.stringify(hours, null, 2))

    // Validate and normalize hours format
    for (const hour of hours) {
      console.log(`Processing hour for day ${hour.day_of_week}: open=${hour.open_time}, close=${hour.close_time}, active=${hour.is_active}`)
      if (
        typeof hour.day_of_week !== 'number' ||
        hour.day_of_week < 0 ||
        hour.day_of_week > 6 ||
        typeof hour.is_active !== 'boolean'
      ) {
        return NextResponse.json(
          { success: false, error: 'Invalid hour format' },
          { status: 400 }
        )
      }

      // Only validate times if the day is active
      if (hour.is_active) {
        // Ensure times are provided for active days
        if (!hour.open_time || !hour.close_time) {
          return NextResponse.json(
            { success: false, error: 'Open and close times are required for active days' },
            { status: 400 }
          )
        }

        // Normalize time format - ensure HH:MM format
        const normalizeTime = (timeStr: string) => {
          if (!timeStr) return null

          // Handle various time formats
          let cleanTime = timeStr.trim()
          
          // Log the time being processed
          console.log(`Normalizing time: "${timeStr}" -> "${cleanTime}"`)

          // If already in HH:MM format, validate and return
          const simpleTimeMatch = cleanTime.match(/^(\d{1,2}):(\d{2})$/)
          if (simpleTimeMatch) {
            const hours = parseInt(simpleTimeMatch[1])
            const minutes = parseInt(simpleTimeMatch[2])
            
            // Validate ranges
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
              const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
              console.log(`Time normalized successfully: "${cleanTime}" -> "${result}"`)
              return result
            }
          }

          // If time doesn't include colon, it might be in HHMM format
          if (!cleanTime.includes(':') && cleanTime.length === 4) {
            cleanTime = cleanTime.substring(0, 2) + ':' + cleanTime.substring(2)
          }

          // Parse the time
          const timeMatch = cleanTime.match(/^(\d{1,2}):?(\d{2})?$/)
          if (!timeMatch) {
            console.log(`Failed to match time pattern: "${cleanTime}"`)
            return null
          }

          const hours = parseInt(timeMatch[1])
          const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0

          // Validate ranges
          if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.log(`Time out of range: hours=${hours}, minutes=${minutes}`)
            return null
          }

          // Return in HH:MM format
          const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
          console.log(`Time normalized: "${timeStr}" -> "${result}"`)
          return result
        }

        const normalizedOpenTime = normalizeTime(hour.open_time)
        const normalizedCloseTime = normalizeTime(hour.close_time)

        console.log(`Day ${hour.day_of_week} - Original: open="${hour.open_time}", close="${hour.close_time}"`)
        console.log(`Day ${hour.day_of_week} - Normalized: open="${normalizedOpenTime}", close="${normalizedCloseTime}"`)

        if (!normalizedOpenTime || !normalizedCloseTime) {
          const errorMsg = `Invalid time format. Please use HH:MM format (e.g., 09:00, 17:30). Failed on day ${hour.day_of_week}: open="${hour.open_time}", close="${hour.close_time}"`
          console.error(errorMsg)
          return NextResponse.json(
            { success: false, error: errorMsg },
            { status: 400 }
          )
        }

        // Update the hour object with normalized times
        hour.open_time = normalizedOpenTime
        hour.close_time = normalizedCloseTime

        // Validate that close time is after open time
        if (hour.open_time >= hour.close_time) {
          return NextResponse.json(
            { success: false, error: 'Close time must be after open time' },
            { status: 400 }
          )
        }
      } else {
        // For inactive days, set default times to avoid validation issues
        hour.open_time = hour.open_time || '09:00'
        hour.close_time = hour.close_time || '17:00'
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