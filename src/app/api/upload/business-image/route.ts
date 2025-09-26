import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a service role client for storage operations
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const businessId = formData.get('businessId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    // Generate file name
    const fileExtension = file.name.split('.').pop()
    const fileName = `${businessId}/logo.${fileExtension}`

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    console.log('📤 Attempting to upload file:', fileName)
    console.log('🗃️ File size:', file.size, 'bytes')
    console.log('📝 Content type:', file.type)

    const { data, error } = await supabaseServiceRole.storage
      .from('business-pics')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true // This will overwrite if file already exists
      })

    if (error) {
      console.error('❌ Supabase upload error:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Upload successful:', data)

    // Get public URL
    const { data: urlData } = supabaseServiceRole.storage
      .from('business-pics')
      .getPublicUrl(fileName)

    if (!urlData.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get public URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}