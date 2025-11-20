import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const adminClient = createAdminClient()
    const { data: usage, error } = await adminClient
      .from('coupon_usage')
      .select('*, customers(*), orders(*)')
      .eq('coupon_id', params.id)
      .order('used_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ usage: usage || [] })
  } catch (error: any) {
    console.error('Get coupon usage error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب تاريخ استخدام الكوبون' },
      { status: 500 }
    )
  }
}
