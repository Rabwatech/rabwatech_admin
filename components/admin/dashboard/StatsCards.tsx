'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, FileCheck, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    activeUsers: number
    newLeads7Days: number
    newLeads30Days: number
    completedSessions: number
    activeSessions: number
    abandonedSessions: number
    pendingOrders: number
    totalRevenue: number
    averageScore: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'المستخدمون النشطون',
      value: stats.activeUsers,
      icon: Users,
      description: 'إجمالي المستخدمين النشطين',
    },
    {
      title: 'الزبائن الجدد',
      value: stats.newLeads7Days,
      icon: UserPlus,
      description: 'آخر 7 أيام',
      subValue: `${stats.newLeads30Days} آخر 30 يوم`,
    },
    {
      title: 'الجلسات المكتملة',
      value: stats.completedSessions,
      icon: FileCheck,
      description: `${stats.activeSessions} نشطة، ${stats.abandonedSessions} متروكة`,
    },
    {
      title: 'الطلبات المعلقة',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      description: 'في انتظار المعالجة',
    },
    {
      title: 'إجمالي الإيرادات',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'من الطلبات المكتملة',
    },
    {
      title: 'متوسط النتائج',
      value: stats.averageScore.toFixed(1),
      icon: TrendingUp,
      description: 'من جميع التقييمات',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
                {card.subValue && (
                  <>
                    <br />
                    <span className="text-muted-foreground/70">{card.subValue}</span>
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

