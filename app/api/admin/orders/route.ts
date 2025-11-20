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
    
    // Build base query
    let query = adminClient.from('orders').select('*', { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('order_status', status)
    }

    if (leadId) {
      query = query.eq('customer_id', leadId)
    }

    // Get total count
    const { count } = await query

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: orders, error } = await query.range(from, to).order('ordered_at', { ascending: false })

    if (error) {
      throw error
    }

    // Batch fetch related data for better performance
    const customerIds = Array.from(new Set((orders || []).map((o: any) => o.customer_id).filter(Boolean)))
    const campaignIds = Array.from(new Set((orders || []).map((o: any) => o.campaign_id).filter(Boolean)))

    // Fetch all customers at once
    const customersMap = new Map()
    if (customerIds.length > 0) {
      try {
        const { data: customers } = await adminClient
          .from('customers')
          .select('*')
          .in('id', customerIds)
        customers?.forEach((customer) => {
          customersMap.set(customer.id, customer)
        })
      } catch (err) {
        console.error('Error fetching customers:', err)
      }
    }

    // Fetch all campaigns at once
    const campaignsMap = new Map()
    if (campaignIds.length > 0) {
      try {
        const { data: campaigns } = await adminClient
          .from('campaigns')
          .select('*')
          .in('id', campaignIds)
        campaigns?.forEach((campaign) => {
          campaignsMap.set(campaign.id, campaign)
        })
      } catch (err) {
        console.error('Error fetching campaigns:', err)
      }
    }

    // Map relations to orders
    const ordersWithRelations = (orders || []).map((order: any) => ({
      ...order,
      customers: order.customer_id ? customersMap.get(order.customer_id) || null : null,
      campaigns: order.campaign_id ? campaignsMap.get(order.campaign_id) || null : null,
    }))

    return NextResponse.json({
      orders: ordersWithRelations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    )
  }
}

