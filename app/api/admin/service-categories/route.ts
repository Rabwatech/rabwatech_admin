import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get('is_active')
    const search = searchParams.get('search') || ''

    const adminClient = createAdminClient()
    let query = adminClient.from('service_categories').select('*', { count: 'exact' })

    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    if (search) {
      query = query.or(
        `category_name.ilike.%${search}%,category_name_ar.ilike.%${search}%,category_code.ilike.%${search}%`
      )
    }

    const { data: categories, error, count } = await query.order('display_order', { ascending: true }).order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get services count for each category
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        try {
          const { count: servicesCount, error: servicesError } = await adminClient
            .from('services')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)

          if (servicesError) {
            console.error(`Error getting services count for category ${category.id}:`, servicesError)
          }

          return {
            ...category,
            services_count: servicesCount || 0,
          }
        } catch (err) {
          console.error(`Error processing category ${category.id}:`, err)
          return {
            ...category,
            services_count: 0,
          }
        }
      })
    )

    return NextResponse.json({
      categories: categoriesWithCounts,
      pagination: {
        total: count || 0,
      },
    })
  } catch (error: any) {
    console.error('Get service categories error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب فئات الخدمات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      category_code,
      category_name,
      category_name_ar,
      description,
      description_ar,
      parent_id,
      icon,
      display_order,
      is_active,
    } = body

    if (!category_code || !category_name || !category_name_ar) {
      return NextResponse.json(
        { error: 'الكود والاسم (عربي وإنجليزي) مطلوبة' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if category_code already exists
    const { data: existing } = await adminClient
      .from('service_categories')
      .select('id')
      .eq('category_code', category_code)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'كود الفئة موجود بالفعل' },
        { status: 400 }
      )
    }

    const { data, error } = await adminClient
      .from('service_categories')
      .insert({
        category_code,
        category_name,
        category_name_ar,
        description: description || null,
        description_ar: description_ar || null,
        parent_id: parent_id || null,
        icon: icon || null,
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ category: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create service category error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء فئة الخدمة' },
      { status: 500 }
    )
  }
}

