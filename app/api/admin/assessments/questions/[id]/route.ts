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
      .from('questions')
      .select('*, pillars(*), question_options(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'السؤال غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ question: data })
  } catch (error: any) {
    console.error('Get question error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات السؤال' },
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
    const { question_text, question_type, is_active, pillar_id } = body

    const adminClient = createAdminClient()

    // Build update object
    const updates: any = {}
    if (question_text !== undefined) updates.question_text = question_text
    if (question_type !== undefined) updates.question_type = question_type
    if (is_active !== undefined) updates.is_active = is_active
    if (pillar_id !== undefined) updates.pillar_id = pillar_id

    const { data, error } = await adminClient
      .from('questions')
      .update(updates)
      .eq('id', params.id)
      .select('*, pillars(*), question_options(*)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ question: data })
  } catch (error: any) {
    console.error('Update question error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث السؤال' },
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

    // Check if question has responses
    const { count } = await adminClient
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', params.id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف السؤال لأنه يحتوي على إجابات' },
        { status: 400 }
      )
    }

    const { error } = await adminClient
      .from('questions')
      .delete()
      .eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete question error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف السؤال' },
      { status: 500 }
    )
  }
}

