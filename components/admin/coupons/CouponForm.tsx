'use client'

import { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'

interface CouponFormProps {
  couponId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function CouponForm({ couponId, onSuccess, onCancel }: CouponFormProps) {
  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    campaign_id: '',
    offer_id: '',
    coupon_code: '',
    coupon_name: '',
    coupon_name_ar: '',
    description: '',
    description_ar: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase_amount: '0',
    max_discount_amount: '',
    applies_to: 'all',
    usage_limit: '',
    usage_limit_per_customer: '1',
    start_date: '',
    end_date: '',
    customer_segment: 'all',
    is_active: true,
    is_public: true,
    notes: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCampaigns()
    if (couponId) {
      fetchCoupon()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponId])

  useEffect(() => {
    if (formData.campaign_id) {
      fetchOffers(formData.campaign_id)
    } else {
      setOffers([])
    }
  }, [formData.campaign_id])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/campaigns')
      const data = await response.json()
      if (response.ok) {
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const fetchOffers = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/offers?campaign_id=${campaignId}`)
      const data = await response.json()
      if (response.ok) {
        setOffers(data.offers || [])
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
    }
  }

  const fetchCoupon = async () => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`)
      const data = await response.json()

      if (response.ok) {
        const coupon = data.coupon
        setFormData({
          campaign_id: coupon.campaign_id?.toString() || '',
          offer_id: coupon.offer_id?.toString() || '',
          coupon_code: coupon.coupon_code || '',
          coupon_name: coupon.coupon_name || '',
          coupon_name_ar: coupon.coupon_name_ar || '',
          description: coupon.description || '',
          description_ar: coupon.description_ar || '',
          discount_type: coupon.discount_type || 'percentage',
          discount_value: coupon.discount_value?.toString() || '',
          min_purchase_amount: coupon.min_purchase_amount?.toString() || '0',
          max_discount_amount: coupon.max_discount_amount?.toString() || '',
          applies_to: coupon.applies_to || 'all',
          usage_limit: coupon.usage_limit?.toString() || '',
          usage_limit_per_customer: coupon.usage_limit_per_customer?.toString() || '1',
          start_date: coupon.start_date
            ? coupon.start_date.split('T')[0] + 'T' + coupon.start_date.split('T')[1].substring(0, 5)
            : '',
          end_date: coupon.end_date
            ? coupon.end_date.split('T')[0] + 'T' + coupon.end_date.split('T')[1].substring(0, 5)
            : '',
          customer_segment: coupon.customer_segment || 'all',
          is_active: coupon.is_active !== undefined ? coupon.is_active : true,
          is_public: coupon.is_public !== undefined ? coupon.is_public : true,
          notes: coupon.notes || '',
        })
        if (coupon.campaign_id) {
          fetchOffers(coupon.campaign_id.toString())
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات الكوبون',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = couponId ? `/api/admin/coupons/${couponId}` : '/api/admin/coupons'
      const method = couponId ? 'PUT' : 'POST'

      const payload: any = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      }

      if (formData.campaign_id) payload.campaign_id = parseInt(formData.campaign_id)
      if (formData.offer_id) payload.offer_id = parseInt(formData.offer_id)
      if (formData.discount_value) payload.discount_value = parseFloat(formData.discount_value)
      if (formData.min_purchase_amount)
        payload.min_purchase_amount = parseFloat(formData.min_purchase_amount)
      if (formData.max_discount_amount)
        payload.max_discount_amount = parseFloat(formData.max_discount_amount)
      if (formData.usage_limit) payload.usage_limit = parseInt(formData.usage_limit)
      payload.usage_limit_per_customer = parseInt(formData.usage_limit_per_customer)

      // Remove empty strings and convert to null
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '') {
          payload[key] = null
        }
      })

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: couponId ? 'تم تحديث الكوبون بنجاح' : 'تم إنشاء الكوبون بنجاح',
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ الكوبون',
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

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{couponId ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon_code">كود الكوبون *</Label>
                <Input
                  id="coupon_code"
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
                  placeholder="COUPON2025"
                  required
                  disabled={!!couponId}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_type">نوع الخصم *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                >
                  <SelectTrigger id="discount_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                    <SelectItem value="free_shipping">شحن مجاني</SelectItem>
                    <SelectItem value="free_item">عنصر مجاني</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon_name">الاسم (إنجليزي)</Label>
                <Input
                  id="coupon_name"
                  value={formData.coupon_name}
                  onChange={(e) => setFormData({ ...formData, coupon_name: e.target.value })}
                  placeholder="Coupon Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon_name_ar">الاسم (عربي)</Label>
                <Input
                  id="coupon_name_ar"
                  value={formData.coupon_name_ar}
                  onChange={(e) => setFormData({ ...formData, coupon_name_ar: e.target.value })}
                  placeholder="اسم الكوبون"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">الوصف (إنجليزي)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_ar">الوصف (عربي)</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder="وصف الكوبون"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Discount Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">تفاصيل الخصم</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_value">قيمة الخصم *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_purchase_amount">الحد الأدنى للشراء</Label>
                <Input
                  id="min_purchase_amount"
                  type="number"
                  step="0.01"
                  value={formData.min_purchase_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_purchase_amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_discount_amount">الحد الأقصى للخصم</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  step="0.01"
                  value={formData.max_discount_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, max_discount_amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الربط</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_id">الحملة</Label>
                <Select
                  value={formData.campaign_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, campaign_id: value, offer_id: '' })
                  }}
                >
                  <SelectTrigger id="campaign_id">
                    <SelectValue placeholder="اختر حملة (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">لا شيء</SelectItem>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.campaign_name_ar || campaign.campaign_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer_id">العرض</Label>
                <Select
                  value={formData.offer_id}
                  onValueChange={(value) => setFormData({ ...formData, offer_id: value })}
                  disabled={!formData.campaign_id}
                >
                  <SelectTrigger id="offer_id">
                    <SelectValue placeholder="اختر عرض (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">لا شيء</SelectItem>
                    {offers.map((offer) => (
                      <SelectItem key={offer.id} value={offer.id.toString()}>
                        {offer.offer_name_ar || offer.offer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">حدود الاستخدام</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage_limit">الحد الأقصى للاستخدام</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="لا محدود"
                />
                <p className="text-sm text-muted-foreground">اتركه فارغاً للاستخدام غير المحدود</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage_limit_per_customer">الحد الأقصى لكل عميل</Label>
                <Input
                  id="usage_limit_per_customer"
                  type="number"
                  value={formData.usage_limit_per_customer}
                  onChange={(e) =>
                    setFormData({ ...formData, usage_limit_per_customer: e.target.value })
                  }
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">التواريخ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">تاريخ البداية *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">تاريخ النهاية *</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الحالة</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>نشط</Label>
                  <p className="text-sm text-muted-foreground">تفعيل الكوبون</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>عام</Label>
                  <p className="text-sm text-muted-foreground">عرض الكوبون للجمهور</p>
                </div>
                <Switch
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                إلغاء
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : couponId ? 'تحديث' : 'إنشاء'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

