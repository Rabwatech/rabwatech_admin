'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { CouponForm } from '@/components/admin/coupons/CouponForm'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function CouponDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [coupon, setCoupon] = useState<any>(null)
  const [usage, setUsage] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const couponId = params.id as string

  useEffect(() => {
    if (couponId) {
      fetchCoupon()
      fetchUsage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponId])

  const fetchCoupon = async () => {
    if (!couponId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`)
      const data = await response.json()

      if (response.ok) {
        setCoupon(data.coupon)
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات الكوبون',
          variant: 'destructive',
        })
        router.push('/admin/coupons')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
      router.push('/admin/coupons')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsage = async () => {
    if (!couponId) return
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}/usage`)
      const data = await response.json()
      if (response.ok) {
        setUsage(data.usage || [])
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    }
  }

  const handleFormSuccess = () => {
    fetchCoupon()
  }

  const getStatusBadge = (coupon: any) => {
    if (!coupon) return null
    const now = new Date()
    const startDate = new Date(coupon.start_date)
    const endDate = new Date(coupon.end_date)

    if (!coupon.is_active) {
      return <Badge variant="secondary">معطل</Badge>
    }

    if (now < startDate) {
      return <Badge variant="outline">قادم</Badge>
    }

    if (now >= startDate && now <= endDate) {
      if (coupon.usage_limit && coupon.current_usage >= coupon.usage_limit) {
        return <Badge variant="destructive">منتهي الاستخدام</Badge>
      }
      return <Badge variant="default">نشط</Badge>
    }

    return <Badge variant="destructive">منتهي</Badge>
  }

  const getDiscountLabel = (coupon: any) => {
    if (!coupon) return '-'
    switch (coupon.discount_type) {
      case 'percentage':
        return `${coupon.discount_value}%`
      case 'fixed':
        return `${coupon.discount_value.toLocaleString('ar-SA', {
          style: 'currency',
          currency: 'SAR',
        })}`
      case 'free_shipping':
        return 'شحن مجاني'
      case 'free_item':
        return 'عنصر مجاني'
      default:
        return coupon.discount_value?.toString() || '-'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!coupon) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/coupons">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {coupon.coupon_name_ar || coupon.coupon_name || coupon.coupon_code}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground font-mono">{coupon.coupon_code}</span>
              <span className="text-muted-foreground">•</span>
              {getStatusBadge(coupon)}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{getDiscountLabel(coupon)}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">معلومات الكوبون</TabsTrigger>
          <TabsTrigger value="usage">تاريخ الاستخدام ({usage.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <CouponForm couponId={parseInt(couponId)} onSuccess={handleFormSuccess} />
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تاريخ الاستخدام</CardTitle>
            </CardHeader>
            <CardContent>
              {usage.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا يوجد استخدام حتى الآن</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العميل</TableHead>
                      <TableHead>الطلب</TableHead>
                      <TableHead>الخصم المطبق</TableHead>
                      <TableHead>إجمالي الطلب</TableHead>
                      <TableHead>تاريخ الاستخدام</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usage.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.customers
                            ? `${item.customers.first_name || ''} ${item.customers.last_name || ''}`.trim() ||
                              item.customers.email
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {item.orders ? item.orders.order_number : item.order_id || '-'}
                        </TableCell>
                        <TableCell>
                          {item.discount_applied.toLocaleString('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                          })}
                        </TableCell>
                        <TableCell>
                          {item.order_total
                            ? item.order_total.toLocaleString('ar-SA', {
                                style: 'currency',
                                currency: 'SAR',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.used_at), 'yyyy-MM-dd HH:mm', { locale: ar })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

