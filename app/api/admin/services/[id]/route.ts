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
    const { data: service, error } = await adminClient
      .from('services')
      .select('*, service_categories(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error('Get service error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الخدمة' },
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
      category_id,
      service_name,
      service_name_ar,
      short_description,
      short_description_ar,
      full_description,
      full_description_ar,
      base_price,
      currency,
      delivery_time_days,
      delivery_time_text,
      delivery_time_text_ar,
      features,
      image_url,
      thumbnail_url,
      meta_title,
      meta_title_ar,
      meta_description,
      meta_description_ar,
      slug,
      is_featured,
      display_order,
      is_active,
    } = body

    const adminClient = createAdminClient()

    // Check if slug already exists for another service (if provided)
    if (slug) {
      const { data: existingSlug } = await adminClient
        .from('services')
        .select('id')
        .eq('slug', slug)
        .neq('id', params.id)
        .single()

      if (existingSlug) {
        return NextResponse.json(
          { error: 'الرابط المختصر موجود بالفعل' },
          { status: 400 }
        )
      }
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (category_id !== undefined) updates.category_id = category_id
    if (service_name !== undefined) updates.service_name = service_name
    if (service_name_ar !== undefined) updates.service_name_ar = service_name_ar
    if (short_description !== undefined) updates.short_description = short_description
    if (short_description_ar !== undefined) updates.short_description_ar = short_description_ar
    if (full_description !== undefined) updates.full_description = full_description
    if (full_description_ar !== undefined) updates.full_description_ar = full_description_ar
    if (base_price !== undefined) updates.base_price = parseFloat(base_price)
    if (currency !== undefined) updates.currency = currency
    if (delivery_time_days !== undefined) updates.delivery_time_days = delivery_time_days
    if (delivery_time_text !== undefined) updates.delivery_time_text = delivery_time_text
    if (delivery_time_text_ar !== undefined) updates.delivery_time_text_ar = delivery_time_text_ar
    if (features !== undefined) updates.features = features
    if (image_url !== undefined) updates.image_url = image_url
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url
    if (meta_title !== undefined) updates.meta_title = meta_title
    if (meta_title_ar !== undefined) updates.meta_title_ar = meta_title_ar
    if (meta_description !== undefined) updates.meta_description = meta_description
    if (meta_description_ar !== undefined) updates.meta_description_ar = meta_description_ar
    if (slug !== undefined) updates.slug = slug
    if (is_featured !== undefined) updates.is_featured = is_featured
    if (display_order !== undefined) updates.display_order = display_order
    if (is_active !== undefined) updates.is_active = is_active

    const { data, error } = await adminClient
      .from('services')
      .update(updates)
      .eq('id', params.id)
      .select('*, service_categories(*)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ service: data })
  } catch (error: any) {
    console.error('Update service error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الخدمة' },
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

    // Check if service is used in offer items
    const { count: offerItemsCount } = await adminClient
      .from('offer_items')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', params.id)

    if (offerItemsCount && offerItemsCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الخدمة لأنها مستخدمة في عروض. يمكنك تعطيلها بدلاً من ذلك' },
        { status: 400 }
      )
    }

    // Check if service is used in orders
    const { count: orderItemsCount } = await adminClient
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', params.id)

    if (orderItemsCount && orderItemsCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الخدمة لأنها مرتبطة بطلبات. يمكنك تعطيلها بدلاً من ذلك' },
        { status: 400 }
      )
    }

    const { error } = await adminClient.from('services').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف الخدمة' },
      { status: 500 }
    )
  }
}

