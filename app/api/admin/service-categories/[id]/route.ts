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
    const { data: category, error } = await adminClient
      .from('service_categories')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 })
    }

    // Get services count
    let servicesCount = 0
    try {
      const { count, error: servicesError } = await adminClient
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', params.id)

      if (servicesError) {
        console.error('Error getting services count:', servicesError)
      } else {
        servicesCount = count || 0
      }
    } catch (err) {
      console.error('Error getting services count:', err)
    }

    return NextResponse.json({
      category: {
        ...category,
        services_count: servicesCount,
      },
    })
  } catch (error: any) {
    console.error('Get service category error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الفئة' },
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
      category_name,
      category_name_ar,
      description,
      description_ar,
      parent_id,
      icon,
      display_order,
      is_active,
    } = body

    const adminClient = createAdminClient()
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (category_name !== undefined) updates.category_name = category_name
    if (category_name_ar !== undefined) updates.category_name_ar = category_name_ar
    if (description !== undefined) updates.description = description
    if (description_ar !== undefined) updates.description_ar = description_ar
    if (parent_id !== undefined) updates.parent_id = parent_id
    if (icon !== undefined) updates.icon = icon
    if (display_order !== undefined) updates.display_order = display_order
    if (is_active !== undefined) updates.is_active = is_active

    const { data, error } = await adminClient
      .from('service_categories')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ category: data })
  } catch (error: any) {
    console.error('Update service category error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الفئة' },
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

    // Check if category has services
    const { count: servicesCount } = await adminClient
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', params.id)

    if (servicesCount && servicesCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الفئة لأنها تحتوي على خدمات. يرجى نقل الخدمات أولاً' },
        { status: 400 }
      )
    }

    // Check if category has subcategories
    const { count: subcategoriesCount } = await adminClient
      .from('service_categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', params.id)

    if (subcategoriesCount && subcategoriesCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الفئة لأنها تحتوي على فئات فرعية. يرجى حذف الفئات الفرعية أولاً' },
        { status: 400 }
      )
    }

    const { error } = await adminClient.from('service_categories').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete service category error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف الفئة' },
      { status: 500 }
    )
  }
}

