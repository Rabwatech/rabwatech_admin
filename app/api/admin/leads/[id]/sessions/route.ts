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
    const { data, error } = await adminClient
      .from('assessment_sessions')
      .select('*')
      .eq('lead_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ sessions: data || [] })
  } catch (error: any) {
    console.error('Get lead sessions error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب جلسات الزبون المحتمل' },
      { status: 500 }
    )
  }
}

