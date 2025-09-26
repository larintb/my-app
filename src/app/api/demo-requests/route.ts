import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase'

// Helper function to verify superuser authentication
async function verifySuperuser(request: NextRequest) {
  try {
    const sessionData = request.headers.get('x-superuser-session')

    if (!sessionData) {
      return { isValid: false, error: 'No authentication provided' }
    }

    // Parse the session data
    let userData
    try {
      userData = JSON.parse(sessionData)
    } catch {
      return { isValid: false, error: 'Invalid session data' }
    }

    // Validate the user exists and is a superuser
    if (!userData.id || !userData.role) {
      return { isValid: false, error: 'Invalid user data' }
    }

    // Check if user is superuser and exists in database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', userData.id)
      .eq('role', 'superuser')
      .single()

    if (error || !user) {
      console.error('Superuser validation error:', error)
      return { isValid: false, error: 'Superuser not found or invalid' }
    }

    return { isValid: true, error: null, userId: user.id }
  } catch (authError) {
    console.error('Authentication error:', authError)
    return { isValid: false, error: 'Authentication failed' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, business_name, email, message } = body

    // Validate required fields
    if (!name || !business_name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nombre, nombre del negocio y email son requeridos'
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formato de email inválido'
        },
        { status: 400 }
      )
    }

    // Insert demo request into database
    const { data, error } = await supabase
      .from('demo_requests')
      .insert([
        {
          name: name.trim(),
          business_name: business_name.trim(),
          email: email.trim().toLowerCase(),
          message: message?.trim() || null,
          status: 'pending'
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Error al guardar la solicitud. Inténtalo de nuevo.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '¡Solicitud de demo enviada exitosamente! Te contactaremos pronto.',
      data: data[0]
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify superuser authentication
    const auth = await verifySuperuser(request)
    if (!auth.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Superuser access required'
        },
        { status: 401 }
      )
    }

    // Get all demo requests (for admin purposes) using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('demo_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Error al obtener las solicitudes'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify superuser authentication
    const auth = await verifySuperuser(request)
    if (!auth.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Superuser access required'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, status } = body

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID y status son requeridos'
        },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = ['pending', 'contacted', 'completed', 'declined']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Status inválido'
        },
        { status: 400 }
      )
    }

    // Update demo request status using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('demo_requests')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Error al actualizar la solicitud'
        },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Solicitud no encontrada'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: data[0]
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}