import { getAdminUser } from '@/lib/admin/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user: adminUser })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات المستخدم' },
      { status: 500 }
    )
  }
}

