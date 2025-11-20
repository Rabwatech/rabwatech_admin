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
    const { data: campaign, error } = await adminClient
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'الحملة غير موجودة' }, { status: 404 })
    }

    // Get offers count for this campaign
    let offersCount = 0
    try {
      const { count, error: offersError } = await adminClient
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', params.id)

      if (offersError) {
        console.error('Error getting offers count:', offersError)
      } else {
        offersCount = count || 0
      }
    } catch (err) {
      console.error('Error getting offers count:', err)
    }

    return NextResponse.json({
      campaign: {
        ...campaign,
        offers_count: offersCount,
      },
    })
  } catch (error: any) {
    console.error('Get campaign error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الحملة' },
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

    const adminClient = createAdminClient()

    // Check if landing_page_slug already exists for another campaign (if provided)
    if (landing_page_slug) {
      const { data: existingSlug } = await adminClient
        .from('campaigns')
        .select('id')
        .eq('landing_page_slug', landing_page_slug)
        .neq('id', params.id)
        .single()

      if (existingSlug) {
        return NextResponse.json(
          { error: 'رابط الصفحة المقصودة موجود بالفعل' },
          { status: 400 }
        )
      }
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (campaign_name !== undefined) updates.campaign_name = campaign_name
    if (campaign_name_ar !== undefined) updates.campaign_name_ar = campaign_name_ar
    if (tagline !== undefined) updates.tagline = tagline
    if (tagline_ar !== undefined) updates.tagline_ar = tagline_ar
    if (description !== undefined) updates.description = description
    if (description_ar !== undefined) updates.description_ar = description_ar
    if (campaign_type !== undefined) updates.campaign_type = campaign_type
    if (season !== undefined) updates.season = season
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (banner_image_url !== undefined) updates.banner_image_url = banner_image_url
    if (banner_image_mobile_url !== undefined) updates.banner_image_mobile_url = banner_image_mobile_url
    if (theme_color !== undefined) updates.theme_color = theme_color
    if (landing_page_url !== undefined) updates.landing_page_url = landing_page_url
    if (landing_page_slug !== undefined) updates.landing_page_slug = landing_page_slug
    if (target_revenue !== undefined) updates.target_revenue = target_revenue
    if (target_customers !== undefined) updates.target_customers = target_customers
    if (marketing_budget !== undefined) updates.marketing_budget = marketing_budget
    if (priority !== undefined) updates.priority = priority
    if (is_featured !== undefined) updates.is_featured = is_featured
    if (is_active !== undefined) updates.is_active = is_active
    if (is_public !== undefined) updates.is_public = is_public
    if (notify_start !== undefined) updates.notify_start = notify_start
    if (notify_end !== undefined) updates.notify_end = notify_end

    const { data, error } = await adminClient
      .from('campaigns')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ campaign: data })
  } catch (error: any) {
    console.error('Update campaign error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الحملة' },
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

    // Check if campaign has offers
    const { count: offersCount } = await adminClient
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', params.id)

    if (offersCount && offersCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الحملة لأنها تحتوي على عروض. يرجى حذف العروض أولاً' },
        { status: 400 }
      )
    }

    // Check if campaign has orders
    const { count: ordersCount } = await adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', params.id)

    if (ordersCount && ordersCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الحملة لأنها مرتبطة بطلبات. يمكنك تعطيلها بدلاً من ذلك' },
        { status: 400 }
      )
    }

    const { error } = await adminClient.from('campaigns').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف الحملة' },
      { status: 500 }
    )
  }
}

