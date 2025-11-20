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
    const { data: orders, error } = await adminClient
      .from('orders')
      .select('*, campaigns(*)')
      .eq('customer_id', params.id)
      .order('ordered_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        try {
          const { data: items, error: itemsError } = await adminClient
            .from('order_items')
            .select('*, services(*), offers(*)')
            .eq('order_id', order.id)

          if (itemsError) {
            console.error(`Error getting items for order ${order.id}:`, itemsError)
          }

          return {
            ...order,
            items: items || [],
          }
        } catch (err) {
          console.error(`Error processing order ${order.id}:`, err)
          return {
            ...order,
            items: [],
          }
        }
      })
    )

    return NextResponse.json({ orders: ordersWithItems })
  } catch (error: any) {
    console.error('Get customer orders error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب طلبات العميل' },
      { status: 500 }
    )
  }
}

