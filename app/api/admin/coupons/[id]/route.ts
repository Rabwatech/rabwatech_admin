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
    const { data: coupon, error } = await adminClient
      .from('coupons')
      .select('*, campaigns(*), offers(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'الكوبون غير موجود' }, { status: 404 })
    }

    // Get usage count
    let usageCount = 0
    try {
      const { count, error: usageError } = await adminClient
        .from('coupon_usage')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', params.id)

      if (usageError) {
        console.error('Error getting usage count:', usageError)
      } else {
        usageCount = count || 0
      }
    } catch (err) {
      console.error('Error getting usage count:', err)
    }

    return NextResponse.json({
      coupon: {
        ...coupon,
        usage_count: usageCount,
      },
    })
  } catch (error: any) {
    console.error('Get coupon error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الكوبون' },
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
      coupon_name,
      coupon_name_ar,
      description,
      description_ar,
      discount_type,
      discount_value,
      min_purchase_amount,
      max_discount_amount,
      applies_to,
      applicable_services,
      applicable_categories,
      applicable_offers,
      usage_limit,
      usage_limit_per_customer,
      start_date,
      end_date,
      customer_segment,
      specific_customers,
      is_active,
      is_public,
      notes,
    } = body

    const adminClient = createAdminClient()
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (coupon_name !== undefined) updates.coupon_name = coupon_name
    if (coupon_name_ar !== undefined) updates.coupon_name_ar = coupon_name_ar
    if (description !== undefined) updates.description = description
    if (description_ar !== undefined) updates.description_ar = description_ar
    if (discount_type !== undefined) updates.discount_type = discount_type
    if (discount_value !== undefined) updates.discount_value = parseFloat(discount_value)
    if (min_purchase_amount !== undefined)
      updates.min_purchase_amount = parseFloat(min_purchase_amount)
    if (max_discount_amount !== undefined)
      updates.max_discount_amount = max_discount_amount ? parseFloat(max_discount_amount) : null
    if (applies_to !== undefined) updates.applies_to = applies_to
    if (applicable_services !== undefined) updates.applicable_services = applicable_services
    if (applicable_categories !== undefined) updates.applicable_categories = applicable_categories
    if (applicable_offers !== undefined) updates.applicable_offers = applicable_offers
    if (usage_limit !== undefined) updates.usage_limit = usage_limit
    if (usage_limit_per_customer !== undefined)
      updates.usage_limit_per_customer = usage_limit_per_customer
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (customer_segment !== undefined) updates.customer_segment = customer_segment
    if (specific_customers !== undefined) updates.specific_customers = specific_customers
    if (is_active !== undefined) updates.is_active = is_active
    if (is_public !== undefined) updates.is_public = is_public
    if (notes !== undefined) updates.notes = notes

    const { data, error } = await adminClient
      .from('coupons')
      .update(updates)
      .eq('id', params.id)
      .select('*, campaigns(*), offers(*)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ coupon: data })
  } catch (error: any) {
    console.error('Update coupon error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الكوبون' },
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

    // Check if coupon has usage
    const { count: usageCount } = await adminClient
      .from('coupon_usage')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', params.id)

    if (usageCount && usageCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الكوبون لأنه تم استخدامه. يمكنك تعطيله بدلاً من ذلك' },
        { status: 400 }
      )
    }

    const { error } = await adminClient.from('coupons').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete coupon error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف الكوبون' },
      { status: 500 }
    )
  }
}
