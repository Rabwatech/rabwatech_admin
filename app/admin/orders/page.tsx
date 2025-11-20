'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      })
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders)
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب الطلبات',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">معلق</Badge>
      case 'confirmed':
        return <Badge variant="secondary">مؤكد</Badge>
      case 'in_progress':
        return <Badge variant="secondary">قيد المعالجة</Badge>
      case 'completed':
        return <Badge variant="default">مكتمل</Badge>
      case 'cancelled':
        return <Badge variant="destructive">ملغي</Badge>
      case 'refunded':
        return <Badge variant="destructive">مسترد</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">معلق</Badge>
      case 'paid':
        return <Badge variant="default">مدفوع</Badge>
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>
      case 'refunded':
        return <Badge variant="destructive">مسترد</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة الطلبات</h1>
        <p className="text-muted-foreground">عرض وإدارة طلبات Rabwa Brand</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="confirmed">مؤكد</SelectItem>
              <SelectItem value="in_progress">قيد المعالجة</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
              <SelectItem value="refunded">مسترد</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>الحملة</TableHead>
                  <TableHead>المبلغ الإجمالي</TableHead>
                  <TableHead>حالة الطلب</TableHead>
                  <TableHead>حالة الدفع</TableHead>
                  <TableHead>تاريخ الطلب</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      لا توجد طلبات
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        {order.customers
                          ? `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim() ||
                            order.customers.email
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {order.campaigns
                          ? order.campaigns.campaign_name_ar || order.campaigns.campaign_name
                          : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.total_amount?.toLocaleString('ar-SA', {
                          style: 'currency',
                          currency: 'SAR',
                        }) || '0.00'}
                      </TableCell>
                      <TableCell>{getOrderStatusBadge(order.order_status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                      <TableCell>
                        {format(new Date(order.ordered_at || order.created_at), 'dd/MM/yyyy', {
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4 ml-2" />
                            عرض
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

