import { NextResponse } from 'next/server'
import { updateService, deleteService, getServiceById } from '@/lib/db/services'

interface RouteParams {
  params: Promise<{
    businessId: string
    serviceId: string
  }>
}

// PUT /api/businesses/[businessId]/services/[serviceId]
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const { businessId, serviceId } = resolvedParams
    const body = await request.json()

    if (!businessId || !serviceId) {
      return NextResponse.json(
        { success: false, error: 'Business ID and Service ID are required' },
        { status: 400 }
      )
    }

    // Verify service belongs to business
    const existingService = await getServiceById(serviceId)
    if (!existingService || existingService.business_id !== businessId) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    const { name, description, price, duration_minutes } = body

    if (!name || !price || !duration_minutes) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and duration are required' },
        { status: 400 }
      )
    }

    const updatedService = await updateService(serviceId, {
      name: name.trim(),
      description: description?.trim() || null,
      price: parseFloat(price),
      duration_minutes: parseInt(duration_minutes)
    })

    return NextResponse.json({
      success: true,
      service: updatedService
    })

  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/businesses/[businessId]/services/[serviceId]
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const { businessId, serviceId } = resolvedParams

    if (!businessId || !serviceId) {
      return NextResponse.json(
        { success: false, error: 'Business ID and Service ID are required' },
        { status: 400 }
      )
    }

    // Verify service belongs to business
    const existingService = await getServiceById(serviceId)
    if (!existingService || existingService.business_id !== businessId) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    await deleteService(serviceId)

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}