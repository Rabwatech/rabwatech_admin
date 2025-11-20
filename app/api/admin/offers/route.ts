import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id') || ''
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('is_active')

    const adminClient = createAdminClient()
    let query = adminClient
      .from('offers')
      .select('*, campaigns(*), offer_types(*)', { count: 'exact' })

    // Apply filters
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
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
        `offer_name.ilike.%${search}%,offer_name_ar.ilike.%${search}%,offer_code.ilike.%${search}%`
      )
    }

    const { data: offers, error, count } = await query.order('display_order', { ascending: true }).order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get items count for each offer
    const offersWithItemsCount = await Promise.all(
      (offers || []).map(async (offer) => {
        try {
          const { count: itemsCount, error: itemsError } = await adminClient
            .from('offer_items')
            .select('*', { count: 'exact', head: true })
            .eq('offer_id', offer.id)

          if (itemsError) {
            console.error(`Error getting items count for offer ${offer.id}:`, itemsError)
          }

          return {
            ...offer,
            items_count: itemsCount || 0,
          }
        } catch (err) {
          console.error(`Error processing offer ${offer.id}:`, err)
          return {
            ...offer,
            items_count: 0,
          }
        }
      })
    )

    return NextResponse.json({
      offers: offersWithItemsCount,
      pagination: {
        total: count || 0,
      },
    })
  } catch (error: any) {
    console.error('Get offers error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب العروض' },
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
      offer_type_id,
      offer_code,
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

    if (!offer_code || !offer_name || !offer_name_ar || !offer_type_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'الكود والاسم (عربي وإنجليزي) ونوع العرض وتواريخ البداية والنهاية مطلوبة' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if offer_code already exists
    const { data: existing } = await adminClient
      .from('offers')
      .select('id')
      .eq('offer_code', offer_code)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'كود العرض موجود بالفعل' },
        { status: 400 }
      )
    }

    // Check if slug already exists (if provided)
    if (slug) {
      const { data: existingSlug } = await adminClient
        .from('offers')
        .select('id')
        .eq('slug', slug)
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
    if (original_price && sale_price) {
      savings_amount = original_price - sale_price
      discount_percentage = Math.round((savings_amount / original_price) * 100)
    }

    const { data, error } = await adminClient
      .from('offers')
      .insert({
        campaign_id: campaign_id || null,
        offer_type_id,
        offer_code,
        offer_name,
        offer_name_ar,
        subtitle: subtitle || null,
        subtitle_ar: subtitle_ar || null,
        description: description || null,
        description_ar: description_ar || null,
        terms_and_conditions: terms_and_conditions || null,
        terms_and_conditions_ar: terms_and_conditions_ar || null,
        original_price: original_price || null,
        sale_price: sale_price || null,
        discount_value: discount_value || null,
        discount_type: discount_type || 'percentage',
        savings_amount,
        discount_percentage,
        target_audience: target_audience || null,
        target_audience_ar: target_audience_ar || null,
        customer_segment: customer_segment || 'all',
        badge_text: badge_text || null,
        badge_text_ar: badge_text_ar || null,
        badge_color: badge_color || null,
        image_url: image_url || null,
        thumbnail_url: thumbnail_url || null,
        is_featured: is_featured !== undefined ? is_featured : false,
        display_order: display_order || 0,
        start_date,
        end_date,
        max_quantity: max_quantity || null,
        quantity_per_customer: quantity_per_customer || 1,
        min_purchase_amount: min_purchase_amount || null,
        requires_coupon: requires_coupon !== undefined ? requires_coupon : false,
        is_active: is_active !== undefined ? is_active : true,
        is_public: is_public !== undefined ? is_public : true,
        auto_apply: auto_apply !== undefined ? auto_apply : false,
        meta_title: meta_title || null,
        meta_title_ar: meta_title_ar || null,
        meta_description: meta_description || null,
        meta_description_ar: meta_description_ar || null,
        slug: slug || null,
      })
      .select('*, campaigns(*), offer_types(*)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ offer: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create offer error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء العرض' },
      { status: 500 }
    )
  }
}

