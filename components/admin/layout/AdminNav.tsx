'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  ClipboardList,
  ShoppingCart,
  Brain,
  Settings,
  BarChart3,
  Mail,
  Activity,
  Megaphone,
  Ticket,
  Package,
  UserCheck,
} from 'lucide-react'

const navItems = [
  {
    title: 'لوحة التحكم',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'المستخدمون',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'الزبائن المحتملون',
    href: '/admin/leads',
    icon: UserPlus,
  },
  {
    title: 'التقييمات',
    href: '/admin/assessments',
    icon: FileText,
  },
  {
    title: 'نتائج الزبائن',
    href: '/admin/results',
    icon: ClipboardList,
  },
  {
    title: 'الحملات',
    href: '/admin/campaigns',
    icon: Megaphone,
  },
  {
    title: 'الكوبونات',
    href: '/admin/coupons',
    icon: Ticket,
  },
  {
    title: 'الخدمات',
    href: '/admin/services',
    icon: Package,
  },
  {
    title: 'العملاء',
    href: '/admin/customers',
    icon: UserCheck,
  },
  {
    title: 'الطلبات',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'تحليلات الذكاء الاصطناعي',
    href: '/admin/ai-analysis',
    icon: Brain,
  },
  {
    title: 'قائمة الإيميلات',
    href: '/admin/emails',
    icon: Mail,
  },
  {
    title: 'الأحداث التحليلية',
    href: '/admin/analytics',
    icon: Activity,
  },
  {
    title: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

