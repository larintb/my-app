import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/businesses - Get all businesses for admin
export async function GET() {
  try {
    // Get all businesses with basic info
    const { data: businesses, error } = await supabaseAdmin
      .from('businesses')
      .select(`
        id,
        business_name,
        owner_name,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching businesses:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      businesses: businesses || []
    })

  } catch (error) {
    console.error('Error in admin businesses API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}