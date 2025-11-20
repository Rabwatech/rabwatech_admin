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
import { Switch } from '@/components/ui/switch'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const customerId = params.id as string

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  const fetchCustomer = async () => {
    if (!customerId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`)
      const data = await response.json()

      if (response.ok) {
        setCustomer(data.customer)
        setFormData({
          first_name: data.customer.first_name || '',
          last_name: data.customer.last_name || '',
          email: data.customer.email || '',
          phone: data.customer.phone || '',
          company_name: data.customer.company_name || '',
          company_name_ar: data.customer.company_name_ar || '',
          tax_number: data.customer.tax_number || '',
          country: data.customer.country || '',
          city: data.customer.city || '',
          address: data.customer.address || '',
          customer_type: data.customer.customer_type || 'individual',
          preferred_language: data.customer.preferred_language || 'ar',
          is_verified: data.customer.is_verified || false,
        })
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات العميل',
          variant: 'destructive',
        })
        router.push('/admin/customers')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
      router.push('/admin/customers')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    if (!customerId) return
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/orders`)
      const data = await response.json()
      if (response.ok) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم تحديث بيانات العميل بنجاح',
        })
        fetchCustomer()
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء تحديث بيانات العميل',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/customers">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {customer.first_name || customer.last_name
                ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                : customer.company_name_ar || customer.company_name || customer.email}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground font-mono text-sm">
                {customer.customer_code}
              </span>
              <span className="text-muted-foreground">•</span>
              {customer.customer_type === 'business' ? (
                <Badge variant="default">شركة</Badge>
              ) : (
                <Badge variant="outline">فردي</Badge>
              )}
              {customer.is_verified && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant="default">موثق</Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">معلومات العميل</TabsTrigger>
          <TabsTrigger value="orders">الطلبات ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">الاسم الأول</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">اسم العائلة</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">اسم الشركة (إنجليزي)</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name_ar">اسم الشركة (عربي)</Label>
                  <Input
                    id="company_name_ar"
                    value={formData.company_name_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name_ar: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_type">نوع العميل</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={(value) => setFormData({ ...formData, customer_type: value })}
                  >
                    <SelectTrigger id="customer_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">فردي</SelectItem>
                      <SelectItem value="business">شركة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">الدولة</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_number">الرقم الضريبي</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_verified"
                  checked={formData.is_verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                />
                <Label htmlFor="is_verified">موثق</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تاريخ الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد طلبات</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>الحملة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>المبلغ الإجمالي</TableHead>
                      <TableHead>تاريخ الطلب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_number}</TableCell>
                        <TableCell>
                          {order.campaigns
                            ? order.campaigns.campaign_name_ar || order.campaigns.campaign_name
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.order_status === 'completed'
                                ? 'default'
                                : order.order_status === 'cancelled'
                                  ? 'destructive'
                                  : 'outline'
                            }
                          >
                            {order.order_status === 'pending'
                              ? 'معلق'
                              : order.order_status === 'confirmed'
                                ? 'مؤكد'
                                : order.order_status === 'completed'
                                  ? 'مكتمل'
                                  : order.order_status === 'cancelled'
                                    ? 'ملغي'
                                    : order.order_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.total_amount.toLocaleString('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                          })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.ordered_at), 'yyyy-MM-dd HH:mm', { locale: ar })}
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

