import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const adminClient = createAdminClient()
    const { data: offerTypes, error } = await adminClient
      .from('offer_types')
      .select('*')
      .eq('is_active', true)
      .order('type_name_ar', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ offer_types: offerTypes || [] })
  } catch (error: any) {
    console.error('Get offer types error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب أنواع العروض' },
      { status: 500 }
    )
  }
}

