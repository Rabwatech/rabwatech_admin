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
    const { data, error } = await adminClient
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'الزبون المحتمل غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ lead: data })
  } catch (error: any) {
    console.error('Get lead error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الزبون المحتمل' },
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
      status,
      name,
      email,
      phone,
      country,
      lead_source,
      company_name,
      company_size,
      industry,
      notes,
      lead_status,
      lead_score,
      source,
      converted_at,
    } = body

    const adminClient = createAdminClient()

    // Build update object
    const updates: any = {}
    if (status !== undefined) updates.status = status
    if (name !== undefined) updates.name = name
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (country !== undefined) updates.country = country
    if (lead_source !== undefined) updates.lead_source = lead_source
    if (company_name !== undefined) updates.company_name = company_name
    if (company_size !== undefined) updates.company_size = company_size
    if (industry !== undefined) updates.industry = industry
    if (notes !== undefined) updates.notes = notes
    if (lead_status !== undefined) updates.lead_status = lead_status
    if (lead_score !== undefined) updates.lead_score = lead_score
    if (source !== undefined) updates.source = source
    if (converted_at !== undefined) updates.converted_at = converted_at
    // Always update updated_at
    updates.updated_at = new Date().toISOString()

    const { data, error } = await adminClient
      .from('leads')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ lead: data })
  } catch (error: any) {
    console.error('Update lead error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الزبون المحتمل' },
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

    // Check for related records (assessment sessions)
    const { data: sessions, error: sessionsError } = await adminClient
      .from('assessment_sessions')
      .select('id')
      .eq('lead_id', params.id)
      .limit(1)

    if (sessionsError) {
      console.error('Error checking sessions:', sessionsError)
    }

    // Check for related orders
    const { data: orders, error: ordersError } = await adminClient
      .from('orders')
      .select('id')
      .eq('lead_id', params.id)
      .limit(1)

    if (ordersError) {
      console.error('Error checking orders:', ordersError)
    }

    // Warn if there are related records (but still allow deletion)
    if ((sessions && sessions.length > 0) || (orders && orders.length > 0)) {
      // For now, we'll allow deletion but log a warning
      // In the future, you might want to prevent deletion or implement soft delete
      console.warn(
        `Deleting lead ${params.id} with related records: ${sessions?.length || 0} sessions, ${orders?.length || 0} orders`
      )
    }

    const { error } = await adminClient.from('leads').delete().eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: 'تم حذف الزبون المحتمل بنجاح' })
  } catch (error: any) {
    console.error('Delete lead error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف الزبون المحتمل' },
      { status: 500 }
    )
  }
}

