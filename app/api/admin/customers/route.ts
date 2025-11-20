import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const customerType = searchParams.get('customer_type') || ''
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100')

    const adminClient = createAdminClient()
    let query = adminClient.from('customers').select('*', { count: 'exact' })

    // Apply filters
    if (customerType) {
      query = query.eq('customer_type', customerType)
    }

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,company_name.ilike.%${search}%,company_name_ar.ilike.%${search}%,customer_code.ilike.%${search}%`
      )
    }

    const { data: customers, error, count } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return NextResponse.json({
      customers: customers || [],
      pagination: {
        total: count || 0,
      },
    })
  } catch (error: any) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب العملاء' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      customer_code,
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
    } = body

    if (!customer_code || !email) {
      return NextResponse.json(
        { error: 'كود العميل والبريد الإلكتروني مطلوبان' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if customer_code already exists
    const { data: existingCode } = await adminClient
      .from('customers')
      .select('id')
      .eq('customer_code', customer_code)
      .single()

    if (existingCode) {
      return NextResponse.json(
        { error: 'كود العميل موجود بالفعل' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingEmail } = await adminClient
      .from('customers')
      .select('id')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني موجود بالفعل' },
        { status: 400 }
      )
    }

    const { data, error } = await adminClient
      .from('customers')
      .insert({
        customer_code,
        first_name: first_name || null,
        last_name: last_name || null,
        email,
        phone: phone || null,
        company_name: company_name || null,
        company_name_ar: company_name_ar || null,
        tax_number: tax_number || null,
        country: country || 'Saudi Arabia',
        city: city || null,
        address: address || null,
        customer_type: customer_type || 'individual',
        preferred_language: preferred_language || 'ar',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ customer: data }, { status: 201 })
  } catch (error: any) {
    console.error('Create customer error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء العميل' },
      { status: 500 }
    )
  }
}

