import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('is_active')

    const adminClient = createAdminClient()
    let query = adminClient.from('campaigns').select('*', { count: 'exact' })

    // Apply filters
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

    if (type) {
      query = query.eq('campaign_type', type)
    }

    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    if (search) {
      query = query.or(
        `campaign_name.ilike.%${search}%,campaign_name_ar.ilike.%${search}%,campaign_code.ilike.%${search}%`
      )
    }

    const { data: campaigns, error, count } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      pagination: {
        total: count || 0,
      },
    })
  } catch (error: any) {
    console.error('Get campaigns error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الحملات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      campaign_code,
      campaign_name,
      campaign_name_ar,
      tagline,
      tagline_ar,
      description,
      description_ar,
      campaign_type,
      season,
      start_date,
      end_date,
      banner_image_url,
      banner_image_mobile_url,
      theme_color,
      landing_page_url,
      landing_page_slug,
      target_revenue,
      target_customers,
      marketing_budget,
      priority,
      is_featured,
      is_active,
      is_public,
      notify_start,
      notify_end,
    } = body

    if (!campaign_code || !campaign_name || !campaign_name_ar || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'الكود والاسم (عربي وإنجليزي) وتواريخ البداية والنهاية مطلوبة' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if campaign_code already exists
    const { data: existing } = await adminClient
      .from('campaigns')
      .select('id')
      .eq('campaign_code', campaign_code)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'كود الحملة موجود بالفعل' },
        { status: 400 }
      )
    }

    // Check if landing_page_slug already exists (if provided)
    if (landing_page_slug) {
      const { data: existingSlug } = await adminClient
        .from('campaigns')
        .select('id')
        .eq('landing_page_slug', landing_page_slug)
        .single()

      if (existingSlug) {
        return NextResponse.json(
          { error: 'رابط الصفحة المقصودة موجود بالفعل' },
          { status: 400 }
        )
      }
    }

    const { data, error } = await adminClient
      .from('campaigns')
      .insert({
        campaign_code,
        campaign_name,
        campaign_name_ar,
        tagline: tagline || null,
        tagline_ar: tagline_ar || null,
        description: description || null,
        description_ar: description_ar || null,
        campaign_type: campaign_type || 'seasonal',
        season: season || null,
        start_date,
        end_date,
        banner_image_url: banner_image_url || null,
        banner_image_mobile_url: banner_image_mobile_url || null,
        theme_color: theme_color || null,
        landing_page_url: landing_page_url || null,
        landing_page_slug: landing_page_slug || null,
        target_revenue: target_revenue || null,
        target_customers: target_customers || null,
        marketing_budget: marketing_budget || null,
        priority: priority || 0,
        is_featured: is_featured !== undefined ? is_featured : false,
        is_active: is_active !== undefined ? is_active : true,
        is_public: is_public !== undefined ? is_public : true,
        notify_start: notify_start !== undefined ? notify_start : true,
        notify_end: notify_end !== undefined ? notify_end : true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ campaign: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الحملة' },
      { status: 500 }
    )
  }
}

