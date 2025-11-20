import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const offerId = searchParams.get('offer_id') || ''

    if (!offerId) {
      return NextResponse.json({ error: 'معرف العرض مطلوب' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: items, error } = await adminClient
      .from('offer_items')
      .select('*, services(*)', { count: 'exact' })
      .eq('offer_id', offerId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      items: items || [],
      pagination: {
        total: items?.length || 0,
      },
    })
  } catch (error: any) {
    console.error('Get offer items error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب عناصر العرض' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { offer_id, service_id, item_name, item_name_ar, item_description, item_description_ar, quantity, unit_price, display_order, is_highlighted, icon } = body

    if (!offer_id || !item_name || !item_name_ar) {
      return NextResponse.json(
        { error: 'معرف العرض والاسم (عربي وإنجليزي) مطلوبان' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('offer_items')
      .insert({
        offer_id,
        service_id: service_id || null,
        item_name,
        item_name_ar,
        item_description: item_description || null,
        item_description_ar: item_description_ar || null,
        quantity: quantity || 1,
        unit_price: unit_price || null,
        display_order: display_order || 0,
        is_highlighted: is_highlighted !== undefined ? is_highlighted : false,
        icon: icon || null,
      })
      .select('*, services(*)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ item: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create offer item error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء عنصر العرض' },
      { status: 500 }
    )
  }
}

