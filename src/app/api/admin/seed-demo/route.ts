import { NextResponse } from 'next/server'
import { seedDemoData } from '@/scripts/seed-demo-data'

export async function POST() {
  try {
    // Optional: Add authentication check here to ensure only superusers can run this
    // const { userId } = await request.json()
    // const user = await getUserById(userId)
    // if (!user || user.role !== 'superuser') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('Starting demo data seeding...')
    await seedDemoData()

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully'
    })

  } catch (error) {
    console.error('Error seeding demo data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed demo data' },
      { status: 500 }
    )
  }
}