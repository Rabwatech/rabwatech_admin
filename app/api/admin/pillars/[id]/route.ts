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
    const { data: pillar, error } = await adminClient
      .from('pillars')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'العمود غير موجود' },
        { status: 404 }
      )
    }

    // Get question count
    const { count: questionsCount } = await adminClient
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('pillar_id', params.id)

    return NextResponse.json({
      pillar: {
        ...pillar,
        questions_count: questionsCount || 0,
      },
    })
  } catch (error: any) {
    console.error('Get pillar error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات العمود' },
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
    const { name, description } = body

    const adminClient = createAdminClient()

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description

    const { data, error } = await adminClient
      .from('pillars')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ pillar: data })
  } catch (error: any) {
    console.error('Update pillar error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث العمود' },
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

    // Check for related questions
    const { count: questionsCount } = await adminClient
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('pillar_id', params.id)

    if (questionsCount && questionsCount > 0) {
      return NextResponse.json(
        {
          error: `لا يمكن حذف العمود لأنه يحتوي على ${questionsCount} سؤال. يرجى حذف الأسئلة أولاً.`,
        },
        { status: 400 }
      )
    }

    const { error } = await adminClient.from('pillars').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete pillar error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف العمود' },
      { status: 500 }
    )
  }
}

