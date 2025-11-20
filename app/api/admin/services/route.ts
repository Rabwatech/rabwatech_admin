import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('category_id') || ''
    const isActive = searchParams.get('is_active')
    const isFeatured = searchParams.get('is_featured')
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100')

    const adminClient = createAdminClient()
    let query = adminClient
      .from('services')
      .select('*, service_categories(*)', { count: 'exact' })

    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    if (isFeatured !== null && isFeatured !== '') {
      query = query.eq('is_featured', isFeatured === 'true')
    }

    if (search) {
      query = query.or(
        `service_name.ilike.%${search}%,service_name_ar.ilike.%${search}%,service_code.ilike.%${search}%`
      )
    }

    const { data: services, error, count } = await query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return NextResponse.json({
      services: services || [],
      pagination: {
        total: count || 0,
      },
    })
  } catch (error: any) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الخدمات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      category_id,
      service_code,
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

    if (!service_code || !service_name || !service_name_ar || !base_price) {
      return NextResponse.json(
        { error: 'الكود والاسم (عربي وإنجليزي) والسعر الأساسي مطلوبة' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if service_code already exists
    const { data: existing } = await adminClient
      .from('services')
      .select('id')
      .eq('service_code', service_code)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'كود الخدمة موجود بالفعل' },
        { status: 400 }
      )
    }

    // Check if slug already exists (if provided)
    if (slug) {
      const { data: existingSlug } = await adminClient
        .from('services')
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

    const { data, error } = await adminClient
      .from('services')
      .insert({
        category_id: category_id || null,
        service_code,
        service_name,
        service_name_ar,
        short_description: short_description || null,
        short_description_ar: short_description_ar || null,
        full_description: full_description || null,
        full_description_ar: full_description_ar || null,
        base_price: parseFloat(base_price),
        currency: currency || 'SAR',
        delivery_time_days: delivery_time_days || null,
        delivery_time_text: delivery_time_text || null,
        delivery_time_text_ar: delivery_time_text_ar || null,
        features: features || null,
        image_url: image_url || null,
        thumbnail_url: thumbnail_url || null,
        meta_title: meta_title || null,
        meta_title_ar: meta_title_ar || null,
        meta_description: meta_description || null,
        meta_description_ar: meta_description_ar || null,
        slug: slug || null,
        is_featured: is_featured !== undefined ? is_featured : false,
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select('*, service_categories(*)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ service: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الخدمة' },
      { status: 500 }
    )
  }
}

