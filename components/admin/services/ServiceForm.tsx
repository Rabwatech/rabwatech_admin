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

interface ServiceFormProps {
  serviceId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function ServiceForm({ serviceId, onSuccess, onCancel }: ServiceFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    category_id: '',
    service_code: '',
    service_name: '',
    service_name_ar: '',
    short_description: '',
    short_description_ar: '',
    full_description: '',
    full_description_ar: '',
    base_price: '',
    currency: 'SAR',
    delivery_time_days: '',
    delivery_time_text: '',
    delivery_time_text_ar: '',
    image_url: '',
    thumbnail_url: '',
    meta_title: '',
    meta_title_ar: '',
    meta_description: '',
    meta_description_ar: '',
    slug: '',
    is_featured: false,
    display_order: '0',
    is_active: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
    if (serviceId) {
      fetchService()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/service-categories')
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`)
      const data = await response.json()

      if (response.ok) {
        const service = data.service
        setFormData({
          category_id: service.category_id?.toString() || '',
          service_code: service.service_code || '',
          service_name: service.service_name || '',
          service_name_ar: service.service_name_ar || '',
          short_description: service.short_description || '',
          short_description_ar: service.short_description_ar || '',
          full_description: service.full_description || '',
          full_description_ar: service.full_description_ar || '',
          base_price: service.base_price?.toString() || '',
          currency: service.currency || 'SAR',
          delivery_time_days: service.delivery_time_days?.toString() || '',
          delivery_time_text: service.delivery_time_text || '',
          delivery_time_text_ar: service.delivery_time_text_ar || '',
          image_url: service.image_url || '',
          thumbnail_url: service.thumbnail_url || '',
          meta_title: service.meta_title || '',
          meta_title_ar: service.meta_title_ar || '',
          meta_description: service.meta_description || '',
          meta_description_ar: service.meta_description_ar || '',
          slug: service.slug || '',
          is_featured: service.is_featured || false,
          display_order: service.display_order?.toString() || '0',
          is_active: service.is_active !== undefined ? service.is_active : true,
        })
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات الخدمة',
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
      const url = serviceId ? `/api/admin/services/${serviceId}` : '/api/admin/services'
      const method = serviceId ? 'PUT' : 'POST'

      const payload: any = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        display_order: parseInt(formData.display_order),
      }

      if (formData.category_id) payload.category_id = parseInt(formData.category_id)
      if (formData.delivery_time_days)
        payload.delivery_time_days = parseInt(formData.delivery_time_days)

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
          description: serviceId ? 'تم تحديث الخدمة بنجاح' : 'تم إنشاء الخدمة بنجاح',
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ الخدمة',
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
          <CardTitle>{serviceId ? 'تعديل الخدمة' : 'إنشاء خدمة جديدة'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_code">كود الخدمة *</Label>
                <Input
                  id="service_code"
                  value={formData.service_code}
                  onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
                  placeholder="service-code"
                  required
                  disabled={!!serviceId}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">الفئة</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger id="category_id">
                    <SelectValue placeholder="اختر فئة (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">لا شيء</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.category_name_ar || cat.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_name">الاسم (إنجليزي) *</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="Service Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_name_ar">الاسم (عربي) *</Label>
                <Input
                  id="service_name_ar"
                  value={formData.service_name_ar}
                  onChange={(e) => setFormData({ ...formData, service_name_ar: e.target.value })}
                  placeholder="اسم الخدمة"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="short_description">الوصف المختصر (إنجليزي)</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                  placeholder="Short description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_description_ar">الوصف المختصر (عربي)</Label>
                <Textarea
                  id="short_description_ar"
                  value={formData.short_description_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description_ar: e.target.value })
                  }
                  placeholder="وصف مختصر"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_description">الوصف الكامل (إنجليزي)</Label>
                <Textarea
                  id="full_description"
                  value={formData.full_description}
                  onChange={(e) =>
                    setFormData({ ...formData, full_description: e.target.value })
                  }
                  placeholder="Full description"
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_description_ar">الوصف الكامل (عربي)</Label>
                <Textarea
                  id="full_description_ar"
                  value={formData.full_description_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, full_description_ar: e.target.value })
                  }
                  placeholder="وصف كامل"
                  rows={5}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">التسعير</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">السعر الأساسي *</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                    <SelectItem value="EUR">يورو (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">مدة التسليم</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_time_days">عدد الأيام</Label>
                <Input
                  id="delivery_time_days"
                  type="number"
                  value={formData.delivery_time_days}
                  onChange={(e) =>
                    setFormData({ ...formData, delivery_time_days: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_time_text">النص (إنجليزي)</Label>
                <Input
                  id="delivery_time_text"
                  value={formData.delivery_time_text}
                  onChange={(e) =>
                    setFormData({ ...formData, delivery_time_text: e.target.value })
                  }
                  placeholder="e.g., 2-3 weeks"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_time_text_ar">النص (عربي)</Label>
                <Input
                  id="delivery_time_text_ar"
                  value={formData.delivery_time_text_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, delivery_time_text_ar: e.target.value })
                  }
                  placeholder="مثال: 2-3 أسابيع"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الوسائط</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">رابط الصورة</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">رابط الصورة المصغرة</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">تحسين محركات البحث (SEO)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">الرابط المختصر</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="service-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">ترتيب العرض</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">عنوان SEO (إنجليزي)</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="SEO Title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_title_ar">عنوان SEO (عربي)</Label>
                <Input
                  id="meta_title_ar"
                  value={formData.meta_title_ar}
                  onChange={(e) => setFormData({ ...formData, meta_title_ar: e.target.value })}
                  placeholder="عنوان SEO"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta_description">وصف SEO (إنجليزي)</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="SEO Description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description_ar">وصف SEO (عربي)</Label>
                <Textarea
                  id="meta_description_ar"
                  value={formData.meta_description_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_description_ar: e.target.value })
                  }
                  placeholder="وصف SEO"
                  rows={3}
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
                  <p className="text-sm text-muted-foreground">تفعيل الخدمة</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>مميز</Label>
                  <p className="text-sm text-muted-foreground">عرض الخدمة في المميزات</p>
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
              {loading ? 'جاري الحفظ...' : serviceId ? 'تحديث' : 'إنشاء'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

