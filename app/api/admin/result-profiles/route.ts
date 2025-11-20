import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const assessmentId = searchParams.get('assessment_id') || ''

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'معرف التقييم مطلوب' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    const { data: profiles, error, count } = await adminClient
      .from('result_profiles')
      .select('*', { count: 'exact' })
      .eq('assessment_id', assessmentId)
      .order('min_score', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      profiles: profiles || [],
      pagination: {
        total: count || 0,
      },
    })
  } catch (error: any) {
    console.error('Get result profiles error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب ملفات النتائج' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { assessment_id, name, key, description, min_score, max_score } = body

    if (!assessment_id || !name || !key || min_score === undefined || max_score === undefined) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    if (min_score >= max_score) {
      return NextResponse.json(
        { error: 'الحد الأدنى يجب أن يكون أقل من الحد الأقصى' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check for overlapping ranges
    const { data: existingProfiles } = await adminClient
      .from('result_profiles')
      .select('*')
      .eq('assessment_id', assessment_id)

    if (existingProfiles) {
      const hasOverlap = existingProfiles.some(
        (profile) =>
          (min_score >= profile.min_score && min_score < profile.max_score) ||
          (max_score > profile.min_score && max_score <= profile.max_score) ||
          (min_score <= profile.min_score && max_score >= profile.max_score)
      )

      if (hasOverlap) {
        return NextResponse.json(
          { error: 'نطاق النقاط يتداخل مع ملف نتيجة موجود' },
          { status: 400 }
        )
      }
    }

    const { data, error } = await adminClient
      .from('result_profiles')
      .insert({
        assessment_id,
        name,
        key,
        description: description || null,
        min_score,
        max_score,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create result profile error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء ملف النتيجة' },
      { status: 500 }
    )
  }
}

