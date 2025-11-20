import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const country = searchParams.get('country') || ''
    const leadSource = searchParams.get('lead_source') || ''

    const adminClient = createAdminClient()
    let query = adminClient.from('leads').select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (country) {
      query = query.eq('country', country)
    }

    if (leadSource) {
      query = query.eq('lead_source', leadSource)
    }

    // Get total count
    const { count } = await query

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error } = await query.range(from, to).order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      leads: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الزبائن المحتملين' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      name,
      email,
      phone,
      country,
      company_name,
      company_size,
      industry,
      notes,
      source,
      lead_source,
      status,
      lead_status,
      lead_score,
      metadata,
    } = body

    // Validate required fields
    if (!name || !email || !phone || !country) {
      return NextResponse.json(
        { error: 'الاسم، البريد الإلكتروني، الهاتف، والدولة مطلوبة' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Prepare lead data with defaults
    const leadData: any = {
      name,
      email,
      phone,
      country,
      status: status || 'active',
      lead_status: lead_status || 'new',
      lead_score: lead_score !== undefined ? lead_score : 0,
      source: source || 'other',
      lead_source: lead_source || 'unknown',
    }

    // Add optional fields if provided
    if (company_name) leadData.company_name = company_name
    if (company_size) leadData.company_size = company_size
    if (industry) leadData.industry = industry
    if (notes) leadData.notes = notes
    if (metadata) leadData.metadata = metadata

    const { data, error } = await adminClient.from('leads').insert(leadData).select().single()

    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json(
        { error: error.message || 'حدث خطأ أثناء إنشاء الزبون المحتمل' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        lead: data,
        message: 'تم إنشاء الزبون المحتمل بنجاح',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create lead error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الزبون المحتمل' },
      { status: 500 }
    )
  }
}

