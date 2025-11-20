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
    const { data: customer, error } = await adminClient
      .from('customers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
    }

    // Get orders count
    let ordersCount = 0
    let totalSpent = 0
    try {
      const { count, error: ordersError } = await adminClient
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', params.id)

      if (ordersError) {
        console.error('Error getting orders count:', ordersError)
      } else {
        ordersCount = count || 0
      }

      // Get total spent
      const { data: orders, error: ordersDataError } = await adminClient
        .from('orders')
        .select('total_amount')
        .eq('customer_id', params.id)
        .eq('order_status', 'completed')

      if (ordersDataError) {
        console.error('Error getting orders data:', ordersDataError)
      } else {
        totalSpent =
          orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      }
    } catch (err) {
      console.error('Error processing customer stats:', err)
    }

    return NextResponse.json({
      customer: {
        ...customer,
        orders_count: ordersCount,
        total_spent: totalSpent,
      },
    })
  } catch (error: any) {
    console.error('Get customer error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات العميل' },
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
      first_name,
      last_name,
      email,
      phone,
      company_name,
      company_name_ar,
      tax_number,
      country,
      city,
      address,
      customer_type,
      preferred_language,
      is_verified,
    } = body

    const adminClient = createAdminClient()

    // Check if email is being changed and already exists
    if (email) {
      const { data: existingEmail } = await adminClient
        .from('customers')
        .select('id')
        .eq('email', email)
        .neq('id', params.id)
        .single()

      if (existingEmail) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني موجود بالفعل' },
          { status: 400 }
        )
      }
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (first_name !== undefined) updates.first_name = first_name
    if (last_name !== undefined) updates.last_name = last_name
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (company_name !== undefined) updates.company_name = company_name
    if (company_name_ar !== undefined) updates.company_name_ar = company_name_ar
    if (tax_number !== undefined) updates.tax_number = tax_number
    if (country !== undefined) updates.country = country
    if (city !== undefined) updates.city = city
    if (address !== undefined) updates.address = address
    if (customer_type !== undefined) updates.customer_type = customer_type
    if (preferred_language !== undefined) updates.preferred_language = preferred_language
    if (is_verified !== undefined) updates.is_verified = is_verified

    const { data, error } = await adminClient
      .from('customers')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ customer: data })
  } catch (error: any) {
    console.error('Update customer error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث العميل' },
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

    // Check if customer has orders
    const { count: ordersCount } = await adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', params.id)

    if (ordersCount && ordersCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف العميل لأنه لديه طلبات. يمكنك تعطيله بدلاً من ذلك' },
        { status: 400 }
      )
    }

    const { error } = await adminClient.from('customers').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete customer error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف العميل' },
      { status: 500 }
    )
  }
}

