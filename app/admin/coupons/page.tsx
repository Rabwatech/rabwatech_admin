'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
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
import { Input } from '@/components/ui/input'
import { Eye, Plus, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Coupon {
  id: number
  coupon_code: string
  coupon_name?: string
  coupon_name_ar?: string
  discount_type: string
  discount_value: number
  current_usage: number
  usage_limit?: number
  start_date: string
  end_date: string
  is_active: boolean
  campaigns?: {
    campaign_name_ar?: string
    campaign_name?: string
  }
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCoupons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearchQuery])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery)
      }

      const response = await fetch(`/api/admin/coupons?${params}`)
      const data = await response.json()

      if (response.ok) {
        setCoupons(data.coupons || [])
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب الكوبونات',
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

  const handleDelete = async () => {
    if (!couponToDelete) return

    try {
      const response = await fetch(`/api/admin/coupons/${couponToDelete}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم حذف الكوبون بنجاح',
        })
        fetchCoupons()
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حذف الكوبون',
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
      setDeleteDialogOpen(false)
      setCouponToDelete(null)
    }
  }

  const getStatusBadge = (coupon: Coupon) => {
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

  const getDiscountLabel = (coupon: Coupon) => {
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
        return coupon.discount_value.toString()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة الكوبونات</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع الكوبونات الترويجية</p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="h-4 w-4 ml-2" />
            إنشاء كوبون جديد
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="بحث في الكوبونات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="upcoming">قادم</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الخصم</TableHead>
                <TableHead>الحملة</TableHead>
                <TableHead>الاستخدام</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ البداية</TableHead>
                <TableHead>تاريخ النهاية</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    لا توجد كوبونات
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono text-sm font-bold">
                      {coupon.coupon_code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {coupon.coupon_name_ar || coupon.coupon_name || '-'}
                    </TableCell>
                    <TableCell>{getDiscountLabel(coupon)}</TableCell>
                    <TableCell>
                      {coupon.campaigns
                        ? coupon.campaigns.campaign_name_ar || coupon.campaigns.campaign_name
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {coupon.usage_limit
                        ? `${coupon.current_usage} / ${coupon.usage_limit}`
                        : coupon.current_usage}
                    </TableCell>
                    <TableCell>{getStatusBadge(coupon)}</TableCell>
                    <TableCell>
                      {format(new Date(coupon.start_date), 'yyyy-MM-dd', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(coupon.end_date), 'yyyy-MM-dd', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/coupons/${coupon.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCouponToDelete(coupon.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا الكوبون بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
