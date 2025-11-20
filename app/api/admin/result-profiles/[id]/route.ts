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
    const { data: profile, error } = await adminClient
      .from('result_profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'ملف النتيجة غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Get result profile error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات ملف النتيجة' },
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
    const { name, description, min_score, max_score } = body

    if (min_score !== undefined && max_score !== undefined && min_score >= max_score) {
      return NextResponse.json(
        { error: 'الحد الأدنى يجب أن يكون أقل من الحد الأقصى' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Get current profile to check assessment_id and current scores
    const { data: currentProfile } = await adminClient
      .from('result_profiles')
      .select('assessment_id, min_score, max_score')
      .eq('id', params.id)
      .single()

    // Check for overlapping ranges if scores are being updated
    if (min_score !== undefined || max_score !== undefined) {
      const finalMinScore = min_score !== undefined ? min_score : currentProfile?.min_score
      const finalMaxScore = max_score !== undefined ? max_score : currentProfile?.max_score

      const { data: existingProfiles } = await adminClient
        .from('result_profiles')
        .select('*')
        .eq('assessment_id', currentProfile?.assessment_id)
        .neq('id', params.id)

      if (existingProfiles && finalMinScore !== undefined && finalMaxScore !== undefined) {
        const hasOverlap = existingProfiles.some(
          (profile) =>
            (finalMinScore >= profile.min_score && finalMinScore < profile.max_score) ||
            (finalMaxScore > profile.min_score && finalMaxScore <= profile.max_score) ||
            (finalMinScore <= profile.min_score && finalMaxScore >= profile.max_score)
        )

        if (hasOverlap) {
          return NextResponse.json(
            { error: 'نطاق النقاط يتداخل مع ملف نتيجة موجود' },
            { status: 400 }
          )
        }
      }
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (min_score !== undefined) updates.min_score = min_score
    if (max_score !== undefined) updates.max_score = max_score

    const { data, error } = await adminClient
      .from('result_profiles')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile: data })
  } catch (error: any) {
    console.error('Update result profile error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث ملف النتيجة' },
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

    // Check for related results
    const { count: resultsCount } = await adminClient
      .from('lead_results')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', params.id)

    if (resultsCount && resultsCount > 0) {
      return NextResponse.json(
        {
          error: `لا يمكن حذف ملف النتيجة لأنه مرتبط بـ ${resultsCount} نتيجة.`,
        },
        { status: 400 }
      )
    }

    const { error } = await adminClient.from('result_profiles').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete result profile error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف ملف النتيجة' },
      { status: 500 }
    )
  }
}

