import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const search = searchParams.get('search') || ''

    const adminClient = createAdminClient()
    let query = adminClient.from('assessments').select('*', { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,key.ilike.%${search}%`)
    }

    const { data: assessments, error, count } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get counts for each assessment
    const assessmentsWithCounts = await Promise.all(
      (assessments || []).map(async (assessment) => {
        try {
          // Get pillars count
          const { count: pillarsCount, error: pillarsError } = await adminClient
            .from('pillars')
            .select('*', { count: 'exact', head: true })
            .eq('assessment_id', assessment.id)

          if (pillarsError) {
            console.error(`Error getting pillars count for assessment ${assessment.id}:`, pillarsError)
          }

          // Get questions count (through pillars)
          const { data: pillars, error: pillarsDataError } = await adminClient
            .from('pillars')
            .select('id')
            .eq('assessment_id', assessment.id)

          if (pillarsDataError) {
            console.error(`Error getting pillars for assessment ${assessment.id}:`, pillarsDataError)
          }

          const pillarIds = pillars?.map((p) => p.id) || []
          let questionsCount = 0
          if (pillarIds.length > 0) {
            const { count, error: questionsError } = await adminClient
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .in('pillar_id', pillarIds)
            
            if (questionsError) {
              console.error(`Error getting questions count for assessment ${assessment.id}:`, questionsError)
            } else {
              questionsCount = count || 0
            }
          }

          // Get sessions count
          const { count: sessionsCount, error: sessionsError } = await adminClient
            .from('assessment_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('assessment_id', assessment.id)

          if (sessionsError) {
            console.error(`Error getting sessions count for assessment ${assessment.id}:`, sessionsError)
          }

          return {
            ...assessment,
            pillars_count: pillarsCount || 0,
            questions_count: questionsCount,
            sessions_count: sessionsCount || 0,
          }
        } catch (err) {
          console.error(`Error processing assessment ${assessment.id}:`, err)
          return {
            ...assessment,
            pillars_count: 0,
            questions_count: 0,
            sessions_count: 0,
          }
        }
      })
    )

    return NextResponse.json({
      assessments: assessmentsWithCounts,
      pagination: {
        total: count || 0,
      },
    })
  } catch (error: any) {
    console.error('Get assessments error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب التقييمات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name, key, description, type, status } = body

    if (!name || !key) {
      return NextResponse.json(
        { error: 'الاسم والمفتاح مطلوبان' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if key already exists
    const { data: existing } = await adminClient
      .from('assessments')
      .select('id')
      .eq('key', key)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'المفتاح موجود بالفعل' },
        { status: 400 }
      )
    }

    const { data, error } = await adminClient
      .from('assessments')
      .insert({
        name,
        key,
        description: description || null,
        type: type || 'growth_indicator',
        status: status || 'draft',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ assessment: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create assessment error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء التقييم' },
      { status: 500 }
    )
  }
}

