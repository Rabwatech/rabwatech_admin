import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
    const adminClient = createAdminClient()
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get active users count
    const { count: activeUsersCount } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get new leads (last 7 days)
    const { count: newLeads7Days } = await adminClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    // Get new leads (last 30 days)
    const { count: newLeads30Days } = await adminClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Get completed sessions
    const { count: completedSessions } = await adminClient
      .from('assessment_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Get active sessions
    const { count: activeSessions } = await adminClient
      .from('assessment_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get abandoned sessions
    const { count: abandonedSessions } = await adminClient
      .from('assessment_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'abandoned')

    // Get pending orders
    const { count: pendingOrders } = await adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'pending')

    // Get total revenue (sum of all completed orders)
    const { data: completedOrders } = await adminClient
      .from('orders')
      .select('total_amount')
      .eq('order_status', 'completed')

    const totalRevenue = completedOrders?.reduce((sum, order) => {
      return sum + (order.total_amount || 0)
    }, 0) || 0

    // Get average results
    const { data: results } = await adminClient
      .from('lead_results')
      .select('overall_score')

    const averageScore =
      results && results.length > 0
        ? results.reduce((sum, r) => sum + (r.overall_score || 0), 0) / results.length
        : 0

    // Get track distribution
    const { data: sessionsByTrack } = await adminClient
      .from('assessment_sessions')
      .select('track_id')
      .eq('status', 'completed')

    const trackDistribution: Record<string, number> = {}
    sessionsByTrack?.forEach((session) => {
      const trackId = session.track_id || 'unknown'
      trackDistribution[trackId] = (trackDistribution[trackId] || 0) + 1
    })

    // Get result distribution
    const { data: resultsByProfile } = await adminClient
      .from('lead_results')
      .select('result_profile')

    const resultDistribution: Record<string, number> = {}
    resultsByProfile?.forEach((result) => {
      const profile = result.result_profile || 'unknown'
      resultDistribution[profile] = (resultDistribution[profile] || 0) + 1
    })

    // Get leads trend (last 30 days)
    const { data: leadsTrend } = await adminClient
      .from('leads')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Group by date
    const leadsByDate: Record<string, number> = {}
    leadsTrend?.forEach((lead) => {
      const date = new Date(lead.created_at).toISOString().split('T')[0]
      leadsByDate[date] = (leadsByDate[date] || 0) + 1
    })

    return NextResponse.json({
      stats: {
        activeUsers: activeUsersCount || 0,
        newLeads7Days: newLeads7Days || 0,
        newLeads30Days: newLeads30Days || 0,
        completedSessions: completedSessions || 0,
        activeSessions: activeSessions || 0,
        abandonedSessions: abandonedSessions || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue,
        averageScore: Math.round(averageScore * 100) / 100,
      },
      distributions: {
        tracks: trackDistribution,
        results: resultDistribution,
      },
      trends: {
        leads: leadsByDate,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإحصائيات' },
      { status: 500 }
    )
  }
}

