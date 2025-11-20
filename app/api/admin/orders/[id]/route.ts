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
    const { data: order, error } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    // Manually fetch related data
    const result: any = { ...order }

    // Fetch customer
    if (order.customer_id) {
      try {
        const { data: customer } = await adminClient
          .from('customers')
          .select('*')
          .eq('id', order.customer_id)
          .single()
        result.customers = customer
      } catch (err) {
        console.error(`Error fetching customer ${order.customer_id}:`, err)
        result.customers = null
      }
    }

    // Fetch campaign
    if (order.campaign_id) {
      try {
        const { data: campaign } = await adminClient
          .from('campaigns')
          .select('*')
          .eq('id', order.campaign_id)
          .single()
        result.campaigns = campaign
      } catch (err) {
        console.error(`Error fetching campaign ${order.campaign_id}:`, err)
        result.campaigns = null
      }
    }

    // Get order items
    let orderItems: any[] = []
    try {
      const { data: items, error: itemsError } = await adminClient
        .from('order_items')
        .select('*')
        .eq('order_id', params.id)
        .order('created_at', { ascending: true })

      if (itemsError) {
        console.error('Error getting order items:', itemsError)
      } else {
        // Fetch related services and offers for each item
        orderItems = await Promise.all(
          (items || []).map(async (item: any): Promise<any> => {
            const itemResult: any = { ...item }

            // Fetch service
            if (item.service_id) {
              try {
                const { data: service } = await adminClient
                  .from('services')
                  .select('*')
                  .eq('id', item.service_id)
                  .single()
                itemResult.services = service
              } catch (err) {
                console.error(`Error fetching service ${item.service_id}:`, err)
              }
            }

            // Fetch offer
            if (item.offer_id) {
              try {
                const { data: offer } = await adminClient
                  .from('offers')
                  .select('*')
                  .eq('id', item.offer_id)
                  .single()
                itemResult.offers = offer
              } catch (err) {
                console.error(`Error fetching offer ${item.offer_id}:`, err)
              }
            }

            return itemResult
          })
        )
      }
    } catch (err) {
      console.error('Error getting order items:', err)
    }

    return NextResponse.json({
      order: {
        ...result,
        items: orderItems,
      },
    })
  } catch (error: any) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الطلب' },
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
      order_status,
      payment_status,
      payment_method,
      payment_date,
      transaction_id,
      admin_notes,
      customer_notes,
    } = body

    const adminClient = createAdminClient()

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    }
    if (order_status !== undefined) {
      updates.order_status = order_status
      // Set timestamp based on status
      if (order_status === 'completed') {
        updates.completed_at = new Date().toISOString()
      } else if (order_status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString()
      } else if (order_status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString()
      }
    }
    if (payment_status !== undefined) {
      updates.payment_status = payment_status
      if (payment_status === 'paid' && !payment_date) {
        updates.payment_date = new Date().toISOString()
      }
    }
    if (payment_method !== undefined) updates.payment_method = payment_method
    if (payment_date !== undefined) updates.payment_date = payment_date
    if (transaction_id !== undefined) updates.transaction_id = transaction_id
    if (admin_notes !== undefined) updates.admin_notes = admin_notes
    if (customer_notes !== undefined) updates.customer_notes = customer_notes

    const { data: updatedOrder, error } = await adminClient
      .from('orders')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    // Manually fetch related data
    const result: any = { ...updatedOrder }

    // Fetch customer
    if (updatedOrder.customer_id) {
      try {
        const { data: customer } = await adminClient
          .from('customers')
          .select('*')
          .eq('id', updatedOrder.customer_id)
          .single()
        result.customers = customer
      } catch (err) {
        console.error(`Error fetching customer ${updatedOrder.customer_id}:`, err)
      }
    }

    // Fetch campaign
    if (updatedOrder.campaign_id) {
      try {
        const { data: campaign } = await adminClient
          .from('campaigns')
          .select('*')
          .eq('id', updatedOrder.campaign_id)
          .single()
        result.campaigns = campaign
      } catch (err) {
        console.error(`Error fetching campaign ${updatedOrder.campaign_id}:`, err)
      }
    }

    return NextResponse.json({ order: result })
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الطلب' },
      { status: 500 }
    )
  }
}

