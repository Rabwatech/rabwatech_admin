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
    const { data: item, error } = await adminClient
      .from('offer_items')
      .select('*, services(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'عنصر العرض غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error: any) {
    console.error('Get offer item error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات عنصر العرض' },
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
    const {
      service_id,
      item_name,
      item_name_ar,
      item_description,
      item_description_ar,
      quantity,
      unit_price,
      display_order,
      is_highlighted,
      icon,
    } = body

    const adminClient = createAdminClient()
    const updates: any = {}

    if (service_id !== undefined) updates.service_id = service_id
    if (item_name !== undefined) updates.item_name = item_name
    if (item_name_ar !== undefined) updates.item_name_ar = item_name_ar
    if (item_description !== undefined) updates.item_description = item_description
    if (item_description_ar !== undefined) updates.item_description_ar = item_description_ar
    if (quantity !== undefined) updates.quantity = quantity
    if (unit_price !== undefined) updates.unit_price = unit_price
    if (display_order !== undefined) updates.display_order = display_order
    if (is_highlighted !== undefined) updates.is_highlighted = is_highlighted
    if (icon !== undefined) updates.icon = icon

    const { data, error } = await adminClient
      .from('offer_items')
      .update(updates)
      .eq('id', params.id)
      .select('*, services(*)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ item: data })
  } catch (error: any) {
    console.error('Update offer item error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث عنصر العرض' },
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
    const { error } = await adminClient.from('offer_items').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete offer item error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف عنصر العرض' },
      { status: 500 }
    )
  }
}

