import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const pillarId = searchParams.get('pillar_id') || ''
    const trackId = searchParams.get('track_id') || searchParams.get('assessment_id') || ''
    const isActive = searchParams.get('is_active')

    const adminClient = createAdminClient()
    
    // Handle trackId/assessment_id filter first
    let pillarIds: string[] = []
    if (trackId) {
      const { data: assessmentPillars, error: pillarsError } = await adminClient
        .from('pillars')
        .select('id')
        .eq('assessment_id', trackId)

      if (pillarsError) {
        console.error('Error getting pillars for assessment:', pillarsError)
        return NextResponse.json({ questions: [] })
      }

      pillarIds = assessmentPillars?.map((p) => p.id) || []
      if (pillarIds.length === 0) {
        // No pillars, return empty result
        return NextResponse.json({ questions: [] })
      }
    }

    // Build query
    let query = adminClient
      .from('questions')
      .select('*, pillars(*), question_options(*)', { count: 'exact' })

    // Apply filters
    if (pillarId) {
      query = query.eq('pillar_id', pillarId)
    } else if (trackId && pillarIds.length > 0) {
      query = query.in('pillar_id', pillarIds)
    }

    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error } = await query.order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ questions: data || [] })
  } catch (error: any) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الأسئلة' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { pillar_id, question_text, question_type, order_index, is_active } = body

    if (!pillar_id || !question_text) {
      return NextResponse.json(
        { error: 'العمود ونص السؤال مطلوبان' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('questions')
      .insert({
        pillar_id,
        question_text,
        question_type: question_type || 'multiple_choice',
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ question: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create question error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء السؤال' },
      { status: 500 }
    )
  }
}

