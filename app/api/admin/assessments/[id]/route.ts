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
    const { data: assessment, error } = await adminClient
      .from('assessments')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'التقييم غير موجود' },
        { status: 404 }
      )
    }

    // Get related data counts
    let pillarsCount = 0
    let questionsCount = 0
    let sessionsCount = 0

    try {
      const { count, error: pillarsError } = await adminClient
        .from('pillars')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', params.id)

      if (pillarsError) {
        console.error('Error getting pillars count:', pillarsError)
      } else {
        pillarsCount = count || 0
      }

      const { data: pillars, error: pillarsDataError } = await adminClient
        .from('pillars')
        .select('id')
        .eq('assessment_id', params.id)

      if (pillarsDataError) {
        console.error('Error getting pillars:', pillarsDataError)
      } else {
        const pillarIds = pillars?.map((p) => p.id) || []
        if (pillarIds.length > 0) {
          const { count: qCount, error: questionsError } = await adminClient
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .in('pillar_id', pillarIds)

          if (questionsError) {
            console.error('Error getting questions count:', questionsError)
          } else {
            questionsCount = qCount || 0
          }
        }
      }

      const { count: sCount, error: sessionsError } = await adminClient
        .from('assessment_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', params.id)

      if (sessionsError) {
        console.error('Error getting sessions count:', sessionsError)
      } else {
        sessionsCount = sCount || 0
      }
    } catch (err) {
      console.error('Error getting assessment counts:', err)
    }

    return NextResponse.json({
      assessment: {
        ...assessment,
        pillars_count: pillarsCount,
        questions_count: questionsCount,
        sessions_count: sessionsCount,
      },
    })
  } catch (error: any) {
    console.error('Get assessment error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات التقييم' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name, description, type, status } = body

    const adminClient = createAdminClient()

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (type !== undefined) updates.type = type
    if (status !== undefined) updates.status = status

    const { data, error } = await adminClient
      .from('assessments')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ assessment: data })
  } catch (error: any) {
    console.error('Update assessment error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث التقييم' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const adminClient = createAdminClient()

    // Check for related data
    const { count: sessionsCount } = await adminClient
      .from('assessment_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', params.id)

    if (sessionsCount && sessionsCount > 0) {
      return NextResponse.json(
        {
          error: `لا يمكن حذف التقييم لأنه يحتوي على ${sessionsCount} جلسة. يرجى حذف الجلسات أولاً.`,
        },
        { status: 400 }
      )
    }

    const { error } = await adminClient.from('assessments').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete assessment error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف التقييم' },
      { status: 500 }
    )
  }
}

