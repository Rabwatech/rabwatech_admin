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

    // Get session with related data
    const { data: session, error: sessionError } = await adminClient
      .from('assessment_sessions')
      .select('*, leads(*), assessment_tracks(*)')
      .eq('id', params.id)
      .single()

    if (sessionError) {
      return NextResponse.json(
        { error: 'الجلسة غير موجودة' },
        { status: 404 }
      )
    }

    // Get responses for this session
    const { data: responses, error: responsesError } = await adminClient
      .from('responses')
      .select('*, questions(*), question_options(*)')
      .eq('session_id', params.id)
      .order('created_at', { ascending: true })

    if (responsesError) {
      console.error('Get responses error:', responsesError)
    }

    return NextResponse.json({
      session,
      responses: responses || [],
    })
  } catch (error: any) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الجلسة' },
      { status: 500 }
    )
  }
}

