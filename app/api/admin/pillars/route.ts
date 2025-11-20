import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const assessmentId = searchParams.get('assessment_id') || searchParams.get('track_id') || ''

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'معرف التقييم مطلوب' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    let query = adminClient
      .from('pillars')
      .select('*', { count: 'exact' })
      .eq('assessment_id', assessmentId)

    const { data: pillars, error, count } = await query.order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    // Get question counts for each pillar
    const pillarsWithCounts = await Promise.all(
      (pillars || []).map(async (pillar) => {
        try {
          const { count: questionsCount } = await adminClient
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('pillar_id', pillar.id)

          return {
            ...pillar,
            questions_count: questionsCount || 0,
          }
        } catch (err) {
          console.error(`Error getting question count for pillar ${pillar.id}:`, err)
          return {
            ...pillar,
            questions_count: 0,
          }
        }
      })
    )

    return NextResponse.json({
      pillars: pillarsWithCounts,
      pagination: {
        total: count || 0,
      },
    })
  } catch (error: any) {
    console.error('Get pillars error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الأعمدة' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { track_id, name, description, order_index } = body

    if (!track_id || !name) {
      return NextResponse.json(
        { error: 'معرف التقييم والاسم مطلوبان' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Insert pillar without order_index (column doesn't exist in DB)
    const { data, error } = await adminClient
      .from('pillars')
      .insert({
        assessment_id: track_id,
        name,
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ pillar: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create pillar error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء العمود' },
      { status: 500 }
    )
  }
}

