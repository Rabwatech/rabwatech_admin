import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id') || ''
    const offerId = searchParams.get('offer_id') || ''
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('is_active')

    const adminClient = createAdminClient()
    let query = adminClient
      .from('coupons')
      .select('*, campaigns(*), offers(*)', { count: 'exact' })

    // Apply filters
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    if (offerId) {
      query = query.eq('offer_id', offerId)
    }

    if (status === 'active') {
      const now = new Date().toISOString()
      query = query.eq('is_active', true).lte('start_date', now).gte('end_date', now)
    } else if (status === 'upcoming') {
      const now = new Date().toISOString()
      query = query.gt('start_date', now)
    } else if (status === 'expired') {
      const now = new Date().toISOString()
      query = query.lt('end_date', now)
    }

    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    if (search) {
      query = query.or(
        `coupon_code.ilike.%${search}%,coupon_name.ilike.%${search}%,coupon_name_ar.ilike.%${search}%`
      )
    }

    const { data: coupons, error, count } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      coupons: coupons || [],
      pagination: {
        total: count || 0,
      },
    })
  } catch (error: any) {
    console.error('Get coupons error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الكوبونات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      campaign_id,
      offer_id,
      coupon_code,
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
      created_by,
      notes,
    } = body

    if (!coupon_code || !discount_type || !discount_value || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'الكود ونوع الخصم وقيمة الخصم وتواريخ البداية والنهاية مطلوبة' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if coupon_code already exists
    const { data: existing } = await adminClient
      .from('coupons')
      .select('id')
      .eq('coupon_code', coupon_code)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'كود الكوبون موجود بالفعل' },
        { status: 400 }
      )
    }

    const { data, error } = await adminClient
      .from('coupons')
      .insert({
        campaign_id: campaign_id || null,
        offer_id: offer_id || null,
        coupon_code,
        coupon_name: coupon_name || null,
        coupon_name_ar: coupon_name_ar || null,
        description: description || null,
        description_ar: description_ar || null,
        discount_type,
        discount_value: parseFloat(discount_value),
        min_purchase_amount: min_purchase_amount ? parseFloat(min_purchase_amount) : 0.0,
        max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
        applies_to: applies_to || 'all',
        applicable_services: applicable_services || null,
        applicable_categories: applicable_categories || null,
        applicable_offers: applicable_offers || null,
        usage_limit: usage_limit || null,
        usage_limit_per_customer: usage_limit_per_customer || 1,
        start_date,
        end_date,
        customer_segment: customer_segment || 'all',
        specific_customers: specific_customers || null,
        is_active: is_active !== undefined ? is_active : true,
        is_public: is_public !== undefined ? is_public : true,
        created_by: created_by || null,
        notes: notes || null,
      })
      .select('*, campaigns(*), offers(*)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ coupon: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create coupon error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الكوبون' },
      { status: 500 }
    )
  }
}
