'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const orderId = params.id as string

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const fetchOrder = async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      const data = await response.json()

      if (response.ok) {
        setOrder(data.order)
        setFormData({
          order_status: data.order.order_status || 'pending',
          payment_status: data.order.payment_status || 'pending',
          payment_method: data.order.payment_method || '',
          payment_date: data.order.payment_date
            ? new Date(data.order.payment_date).toISOString().slice(0, 16)
            : '',
          transaction_id: data.order.transaction_id || '',
          admin_notes: data.order.admin_notes || '',
          customer_notes: data.order.customer_notes || '',
        })
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات الطلب',
          variant: 'destructive',
        })
        router.push('/admin/orders')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          payment_date: formData.payment_date
            ? new Date(formData.payment_date).toISOString()
            : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم تحديث الطلب بنجاح',
        })
        fetchOrder()
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء تحديث الطلب',
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
      setSaving(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">الطلب #{order.order_number}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getOrderStatusBadge(order.order_status)}
              <span className="text-muted-foreground">•</span>
              {getPaymentStatusBadge(order.payment_status)}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {order.total_amount?.toLocaleString('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">معلومات الطلب</TabsTrigger>
          <TabsTrigger value="items">العناصر ({order.items?.length || 0})</TabsTrigger>
          <TabsTrigger value="payment">الدفع</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-medium">
                    {order.customers
                      ? `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim() ||
                        order.customers.email
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p>{order.customers?.email || order.contact_email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الهاتف</p>
                  <p>{order.customers?.phone || order.contact_phone || '-'}</p>
                </div>
                {order.customers?.company_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">الشركة</p>
                    <p>{order.customers.company_name_ar || order.customers.company_name}</p>
                  </div>
                )}
                {order.delivery_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">عنوان التسليم</p>
                    <p>{order.delivery_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معلومات الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">رقم الطلب</p>
                  <p className="font-mono font-medium">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الحملة</p>
                  <p>
                    {order.campaigns
                      ? order.campaigns.campaign_name_ar || order.campaigns.campaign_name
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                  <p>
                    {format(new Date(order.ordered_at), 'yyyy-MM-dd HH:mm', { locale: ar })}
                  </p>
                </div>
                {order.confirmed_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ التأكيد</p>
                    <p>{format(new Date(order.confirmed_at), 'yyyy-MM-dd HH:mm', { locale: ar })}</p>
                  </div>
                )}
                {order.completed_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الإكمال</p>
                    <p>{format(new Date(order.completed_at), 'yyyy-MM-dd HH:mm', { locale: ar })}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>التسعير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">المجموع الفرعي</p>
                  <p className="text-lg font-medium">
                    {order.subtotal?.toLocaleString('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الخصم</p>
                  <p className="text-lg font-medium text-green-600">
                    -{order.discount_amount?.toLocaleString('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الضريبة</p>
                  <p className="text-lg font-medium">
                    {order.tax_amount?.toLocaleString('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
                  <p className="text-2xl font-bold">
                    {order.total_amount?.toLocaleString('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تعديل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_status">حالة الطلب</Label>
                  <Select
                    value={formData.order_status}
                    onValueChange={(value) => setFormData({ ...formData, order_status: value })}
                  >
                    <SelectTrigger id="order_status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                      <SelectItem value="refunded">مسترد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_status">حالة الدفع</Label>
                  <Select
                    value={formData.payment_status}
                    onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
                  >
                    <SelectTrigger id="payment_status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="paid">مدفوع</SelectItem>
                      <SelectItem value="failed">فشل</SelectItem>
                      <SelectItem value="refunded">مسترد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_notes">ملاحظات الإدارة</Label>
                <Textarea
                  id="admin_notes"
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_notes">ملاحظات العميل</Label>
                <Textarea
                  id="customer_notes"
                  value={formData.customer_notes}
                  onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                  rows={4}
                  readOnly
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>عناصر الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              {!order.items || order.items.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد عناصر</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنصر</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>الخصم</TableHead>
                      <TableHead>الإجمالي</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.item_name_ar || item.item_name}
                        </TableCell>
                        <TableCell>
                          {item.offers
                            ? 'عرض'
                            : item.services
                              ? 'خدمة'
                              : 'مخصص'}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.unit_price?.toLocaleString('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                          })}
                        </TableCell>
                        <TableCell>
                          {item.discount_amount > 0
                            ? item.discount_amount.toLocaleString('ar-SA', {
                                style: 'currency',
                                currency: 'SAR',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.total_price?.toLocaleString('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.item_status === 'completed'
                                ? 'default'
                                : item.item_status === 'cancelled'
                                  ? 'destructive'
                                  : 'outline'
                            }
                          >
                            {item.item_status === 'pending'
                              ? 'معلق'
                              : item.item_status === 'in_progress'
                                ? 'قيد المعالجة'
                                : item.item_status === 'completed'
                                  ? 'مكتمل'
                                  : item.item_status === 'cancelled'
                                    ? 'ملغي'
                                    : item.item_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">طريقة الدفع</Label>
                  <Input
                    id="payment_method"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    placeholder="مثال: بطاقة ائتمانية، تحويل بنكي..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction_id">رقم المعاملة</Label>
                  <Input
                    id="transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) =>
                      setFormData({ ...formData, transaction_id: e.target.value })
                    }
                    placeholder="رقم المعاملة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">تاريخ الدفع</Label>
                  <Input
                    id="payment_date"
                    type="datetime-local"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'جاري الحفظ...' : 'حفظ معلومات الدفع'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

