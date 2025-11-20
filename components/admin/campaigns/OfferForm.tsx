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
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'

interface OfferType {
  id: number
  type_code: string
  type_name: string
  type_name_ar: string
}

interface OfferFormProps {
  campaignId: number
  offerId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function OfferForm({ campaignId, offerId, onSuccess, onCancel }: OfferFormProps) {
  const [loading, setLoading] = useState(false)
  const [offerTypes, setOfferTypes] = useState<OfferType[]>([])
  const [formData, setFormData] = useState({
    offer_type_id: '',
    offer_code: '',
    offer_name: '',
    offer_name_ar: '',
    subtitle: '',
    subtitle_ar: '',
    description: '',
    description_ar: '',
    terms_and_conditions: '',
    terms_and_conditions_ar: '',
    original_price: '',
    sale_price: '',
    discount_value: '',
    discount_type: 'percentage',
    target_audience: '',
    target_audience_ar: '',
    customer_segment: 'all',
    badge_text: '',
    badge_text_ar: '',
    badge_color: '#FF0000',
    image_url: '',
    thumbnail_url: '',
    is_featured: false,
    display_order: '0',
    start_date: '',
    end_date: '',
    max_quantity: '',
    quantity_per_customer: '1',
    min_purchase_amount: '',
    requires_coupon: false,
    is_active: true,
    is_public: true,
    auto_apply: false,
    meta_title: '',
    meta_title_ar: '',
    meta_description: '',
    meta_description_ar: '',
    slug: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchOfferTypes()
    if (offerId) {
      fetchOffer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId])

  const fetchOfferTypes = async () => {
    try {
      const response = await fetch('/api/admin/offer-types')
      const data = await response.json()
      if (response.ok) {
        setOfferTypes(data.offer_types || [])
      }
    } catch (error) {
      console.error('Error fetching offer types:', error)
    }
  }

  const fetchOffer = async () => {
    try {
      const response = await fetch(`/api/admin/offers/${offerId}`)
      const data = await response.json()

      if (response.ok) {
        const offer = data.offer
        setFormData({
          offer_type_id: offer.offer_type_id?.toString() || '',
          offer_code: offer.offer_code || '',
          offer_name: offer.offer_name || '',
          offer_name_ar: offer.offer_name_ar || '',
          subtitle: offer.subtitle || '',
          subtitle_ar: offer.subtitle_ar || '',
          description: offer.description || '',
          description_ar: offer.description_ar || '',
          terms_and_conditions: offer.terms_and_conditions || '',
          terms_and_conditions_ar: offer.terms_and_conditions_ar || '',
          original_price: offer.original_price?.toString() || '',
          sale_price: offer.sale_price?.toString() || '',
          discount_value: offer.discount_value?.toString() || '',
          discount_type: offer.discount_type || 'percentage',
          target_audience: offer.target_audience || '',
          target_audience_ar: offer.target_audience_ar || '',
          customer_segment: offer.customer_segment || 'all',
          badge_text: offer.badge_text || '',
          badge_text_ar: offer.badge_text_ar || '',
          badge_color: offer.badge_color || '#FF0000',
          image_url: offer.image_url || '',
          thumbnail_url: offer.thumbnail_url || '',
          is_featured: offer.is_featured || false,
          display_order: offer.display_order?.toString() || '0',
          start_date: offer.start_date ? offer.start_date.split('T')[0] + 'T' + offer.start_date.split('T')[1].substring(0, 5) : '',
          end_date: offer.end_date ? offer.end_date.split('T')[0] + 'T' + offer.end_date.split('T')[1].substring(0, 5) : '',
          max_quantity: offer.max_quantity?.toString() || '',
          quantity_per_customer: offer.quantity_per_customer?.toString() || '1',
          min_purchase_amount: offer.min_purchase_amount?.toString() || '',
          requires_coupon: offer.requires_coupon || false,
          is_active: offer.is_active !== undefined ? offer.is_active : true,
          is_public: offer.is_public !== undefined ? offer.is_public : true,
          auto_apply: offer.auto_apply || false,
          meta_title: offer.meta_title || '',
          meta_title_ar: offer.meta_title_ar || '',
          meta_description: offer.meta_description || '',
          meta_description_ar: offer.meta_description_ar || '',
          slug: offer.slug || '',
        })
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات العرض',
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
      const url = offerId ? `/api/admin/offers/${offerId}` : '/api/admin/offers'
      const method = offerId ? 'PUT' : 'POST'

      const payload: any = {
        campaign_id: campaignId,
        ...formData,
        offer_type_id: parseInt(formData.offer_type_id),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      }

      if (formData.original_price) payload.original_price = parseFloat(formData.original_price)
      if (formData.sale_price) payload.sale_price = parseFloat(formData.sale_price)
      if (formData.discount_value) payload.discount_value = parseFloat(formData.discount_value)
      if (formData.max_quantity) payload.max_quantity = parseInt(formData.max_quantity)
      if (formData.quantity_per_customer) payload.quantity_per_customer = parseInt(formData.quantity_per_customer)
      if (formData.min_purchase_amount) payload.min_purchase_amount = parseFloat(formData.min_purchase_amount)
      payload.display_order = parseInt(formData.display_order)

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
          description: offerId ? 'تم تحديث العرض بنجاح' : 'تم إنشاء العرض بنجاح',
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ العرض',
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="offer_code">كود العرض *</Label>
            <Input
              id="offer_code"
              value={formData.offer_code}
              onChange={(e) => setFormData({ ...formData, offer_code: e.target.value })}
              placeholder="offer-code"
              required
              disabled={!!offerId}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer_type_id">نوع العرض *</Label>
            <Select
              value={formData.offer_type_id}
              onValueChange={(value) => setFormData({ ...formData, offer_type_id: value })}
            >
              <SelectTrigger id="offer_type_id">
                <SelectValue placeholder="اختر نوع العرض" />
              </SelectTrigger>
              <SelectContent>
                {offerTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.type_name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="offer_name">الاسم (إنجليزي) *</Label>
            <Input
              id="offer_name"
              value={formData.offer_name}
              onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
              placeholder="Offer Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer_name_ar">الاسم (عربي) *</Label>
            <Input
              id="offer_name_ar"
              value={formData.offer_name_ar}
              onChange={(e) => setFormData({ ...formData, offer_name_ar: e.target.value })}
              placeholder="اسم العرض"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subtitle">العنوان الفرعي (إنجليزي)</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Subtitle"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle_ar">العنوان الفرعي (عربي)</Label>
            <Input
              id="subtitle_ar"
              value={formData.subtitle_ar}
              onChange={(e) => setFormData({ ...formData, subtitle_ar: e.target.value })}
              placeholder="العنوان الفرعي"
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
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_ar">الوصف (عربي)</Label>
            <Textarea
              id="description_ar"
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              placeholder="وصف العرض"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">التسعير</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="original_price">السعر الأصلي</Label>
            <Input
              id="original_price"
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale_price">سعر البيع</Label>
            <Input
              id="sale_price"
              type="number"
              step="0.01"
              value={formData.sale_price}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_type">نوع الخصم</Label>
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
              </SelectContent>
            </Select>
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
              <p className="text-sm text-muted-foreground">تفعيل العرض</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>عام</Label>
              <p className="text-sm text-muted-foreground">عرض العرض للجمهور</p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>مميز</Label>
              <p className="text-sm text-muted-foreground">عرض العرض في المميزات</p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
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
          {loading ? 'جاري الحفظ...' : offerId ? 'تحديث' : 'إنشاء'}
        </Button>
      </div>
    </form>
  )
}

