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
    const { data: offer, error } = await adminClient
      .from('offers')
      .select('*, campaigns(*), offer_types(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })
    }

    // Get items count for this offer
    let itemsCount = 0
    try {
      const { count, error: itemsError } = await adminClient
        .from('offer_items')
        .select('*', { count: 'exact', head: true })
        .eq('offer_id', params.id)

      if (itemsError) {
        console.error('Error getting items count:', itemsError)
      } else {
        itemsCount = count || 0
      }
    } catch (err) {
      console.error('Error getting items count:', err)
    }

    return NextResponse.json({
      offer: {
        ...offer,
        items_count: itemsCount,
      },
    })
  } catch (error: any) {
    console.error('Get offer error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات العرض' },
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
      offer_name,
      offer_name_ar,
      subtitle,
      subtitle_ar,
      description,
      description_ar,
      terms_and_conditions,
      terms_and_conditions_ar,
      original_price,
      sale_price,
      discount_value,
      discount_type,
      target_audience,
      target_audience_ar,
      customer_segment,
      badge_text,
      badge_text_ar,
      badge_color,
      image_url,
      thumbnail_url,
      is_featured,
      display_order,
      start_date,
      end_date,
      max_quantity,
      quantity_per_customer,
      min_purchase_amount,
      requires_coupon,
      is_active,
      is_public,
      auto_apply,
      meta_title,
      meta_title_ar,
      meta_description,
      meta_description_ar,
      slug,
    } = body

    const adminClient = createAdminClient()

    // Check if slug already exists for another offer (if provided)
    if (slug) {
      const { data: existingSlug } = await adminClient
        .from('offers')
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

    // Calculate discount percentage and savings if original_price and sale_price are provided
    let discount_percentage: number | null = null
    let savings_amount: number | null = null
    if (original_price !== undefined && sale_price !== undefined && original_price && sale_price) {
      savings_amount = original_price - sale_price
      discount_percentage = Math.round((savings_amount / original_price) * 100)
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (offer_name !== undefined) updates.offer_name = offer_name
    if (offer_name_ar !== undefined) updates.offer_name_ar = offer_name_ar
    if (subtitle !== undefined) updates.subtitle = subtitle
    if (subtitle_ar !== undefined) updates.subtitle_ar = subtitle_ar
    if (description !== undefined) updates.description = description
    if (description_ar !== undefined) updates.description_ar = description_ar
    if (terms_and_conditions !== undefined) updates.terms_and_conditions = terms_and_conditions
    if (terms_and_conditions_ar !== undefined) updates.terms_and_conditions_ar = terms_and_conditions_ar
    if (original_price !== undefined) updates.original_price = original_price
    if (sale_price !== undefined) updates.sale_price = sale_price
    if (discount_value !== undefined) updates.discount_value = discount_value
    if (discount_type !== undefined) updates.discount_type = discount_type
    if (savings_amount !== null) updates.savings_amount = savings_amount
    if (discount_percentage !== null) updates.discount_percentage = discount_percentage
    if (target_audience !== undefined) updates.target_audience = target_audience
    if (target_audience_ar !== undefined) updates.target_audience_ar = target_audience_ar
    if (customer_segment !== undefined) updates.customer_segment = customer_segment
    if (badge_text !== undefined) updates.badge_text = badge_text
    if (badge_text_ar !== undefined) updates.badge_text_ar = badge_text_ar
    if (badge_color !== undefined) updates.badge_color = badge_color
    if (image_url !== undefined) updates.image_url = image_url
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url
    if (is_featured !== undefined) updates.is_featured = is_featured
    if (display_order !== undefined) updates.display_order = display_order
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (max_quantity !== undefined) updates.max_quantity = max_quantity
    if (quantity_per_customer !== undefined) updates.quantity_per_customer = quantity_per_customer
    if (min_purchase_amount !== undefined) updates.min_purchase_amount = min_purchase_amount
    if (requires_coupon !== undefined) updates.requires_coupon = requires_coupon
    if (is_active !== undefined) updates.is_active = is_active
    if (is_public !== undefined) updates.is_public = is_public
    if (auto_apply !== undefined) updates.auto_apply = auto_apply
    if (meta_title !== undefined) updates.meta_title = meta_title
    if (meta_title_ar !== undefined) updates.meta_title_ar = meta_title_ar
    if (meta_description !== undefined) updates.meta_description = meta_description
    if (meta_description_ar !== undefined) updates.meta_description_ar = meta_description_ar
    if (slug !== undefined) updates.slug = slug

    const { data, error } = await adminClient
      .from('offers')
      .update(updates)
      .eq('id', params.id)
      .select('*, campaigns(*), offer_types(*)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ offer: data })
  } catch (error: any) {
    console.error('Update offer error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث العرض' },
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

    // Check if offer has items
    const { count: itemsCount } = await adminClient
      .from('offer_items')
      .select('*', { count: 'exact', head: true })
      .eq('offer_id', params.id)

    if (itemsCount && itemsCount > 0) {
      // Items will be cascade deleted, but we can still warn
      console.log(`Deleting offer ${params.id} with ${itemsCount} items`)
    }

    // Check if offer has orders
    const { count: ordersCount } = await adminClient
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('offer_id', params.id)

    if (ordersCount && ordersCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف العرض لأنه مرتبط بطلبات. يمكنك تعطيله بدلاً من ذلك' },
        { status: 400 }
      )
    }

    const { error } = await adminClient.from('offers').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete offer error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف العرض' },
      { status: 500 }
    )
  }
}

