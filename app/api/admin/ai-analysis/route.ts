import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const leadId = searchParams.get('lead_id') || ''

    const adminClient = createAdminClient()
    let query = adminClient
      .from('ai_analysis')
      .select('*, leads(*)', { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (leadId) {
      query = query.eq('lead_id', leadId)
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
      analyses: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Get AI analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب التحليلات' },
      { status: 500 }
    )
  }
}

