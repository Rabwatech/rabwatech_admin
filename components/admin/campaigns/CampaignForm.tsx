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

interface CampaignFormProps {
  campaignId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function CampaignForm({ campaignId, onSuccess, onCancel }: CampaignFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    campaign_code: '',
    campaign_name: '',
    campaign_name_ar: '',
    tagline: '',
    tagline_ar: '',
    description: '',
    description_ar: '',
    campaign_type: 'seasonal',
    season: '',
    start_date: '',
    end_date: '',
    banner_image_url: '',
    banner_image_mobile_url: '',
    theme_color: '#000000',
    landing_page_url: '',
    landing_page_slug: '',
    target_revenue: '',
    target_customers: '',
    marketing_budget: '',
    priority: '0',
    is_featured: false,
    is_active: true,
    is_public: true,
    notify_start: true,
    notify_end: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`)
      const data = await response.json()

      if (response.ok) {
        const campaign = data.campaign
        setFormData({
          campaign_code: campaign.campaign_code || '',
          campaign_name: campaign.campaign_name || '',
          campaign_name_ar: campaign.campaign_name_ar || '',
          tagline: campaign.tagline || '',
          tagline_ar: campaign.tagline_ar || '',
          description: campaign.description || '',
          description_ar: campaign.description_ar || '',
          campaign_type: campaign.campaign_type || 'seasonal',
          season: campaign.season || '',
          start_date: campaign.start_date ? campaign.start_date.split('T')[0] + 'T' + campaign.start_date.split('T')[1].substring(0, 5) : '',
          end_date: campaign.end_date ? campaign.end_date.split('T')[0] + 'T' + campaign.end_date.split('T')[1].substring(0, 5) : '',
          banner_image_url: campaign.banner_image_url || '',
          banner_image_mobile_url: campaign.banner_image_mobile_url || '',
          theme_color: campaign.theme_color || '#000000',
          landing_page_url: campaign.landing_page_url || '',
          landing_page_slug: campaign.landing_page_slug || '',
          target_revenue: campaign.target_revenue?.toString() || '',
          target_customers: campaign.target_customers?.toString() || '',
          marketing_budget: campaign.marketing_budget?.toString() || '',
          priority: campaign.priority?.toString() || '0',
          is_featured: campaign.is_featured || false,
          is_active: campaign.is_active !== undefined ? campaign.is_active : true,
          is_public: campaign.is_public !== undefined ? campaign.is_public : true,
          notify_start: campaign.notify_start !== undefined ? campaign.notify_start : true,
          notify_end: campaign.notify_end !== undefined ? campaign.notify_end : true,
        })
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات الحملة',
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
      const url = campaignId ? `/api/admin/campaigns/${campaignId}` : '/api/admin/campaigns'
      const method = campaignId ? 'PUT' : 'POST'

      const payload: any = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      }

      if (formData.target_revenue) payload.target_revenue = parseFloat(formData.target_revenue)
      if (formData.target_customers) payload.target_customers = parseInt(formData.target_customers)
      if (formData.marketing_budget) payload.marketing_budget = parseFloat(formData.marketing_budget)
      payload.priority = parseInt(formData.priority)

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
          description: campaignId ? 'تم تحديث الحملة بنجاح' : 'تم إنشاء الحملة بنجاح',
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ الحملة',
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
          <CardTitle>{campaignId ? 'تعديل الحملة' : 'إنشاء حملة جديدة'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_code">كود الحملة *</Label>
                <Input
                  id="campaign_code"
                  value={formData.campaign_code}
                  onChange={(e) => setFormData({ ...formData, campaign_code: e.target.value })}
                  placeholder="campaign-code"
                  required
                  disabled={!!campaignId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign_type">نوع الحملة</Label>
                <Select
                  value={formData.campaign_type}
                  onValueChange={(value) => setFormData({ ...formData, campaign_type: value })}
                >
                  <SelectTrigger id="campaign_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seasonal">موسمي</SelectItem>
                    <SelectItem value="launch">إطلاق</SelectItem>
                    <SelectItem value="anniversary">ذكرى</SelectItem>
                    <SelectItem value="clearance">تصفية</SelectItem>
                    <SelectItem value="flash_sale">عرض سريع</SelectItem>
                    <SelectItem value="loyalty">ولاء</SelectItem>
                    <SelectItem value="referral">إحالة</SelectItem>
                    <SelectItem value="custom">مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_name">الاسم (إنجليزي) *</Label>
                <Input
                  id="campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  placeholder="Campaign Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign_name_ar">الاسم (عربي) *</Label>
                <Input
                  id="campaign_name_ar"
                  value={formData.campaign_name_ar}
                  onChange={(e) => setFormData({ ...formData, campaign_name_ar: e.target.value })}
                  placeholder="اسم الحملة"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tagline">الشعار (إنجليزي)</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Tagline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline_ar">الشعار (عربي)</Label>
                <Input
                  id="tagline_ar"
                  value={formData.tagline_ar}
                  onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })}
                  placeholder="شعار الحملة"
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
                  placeholder="وصف الحملة"
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">الموسم</Label>
              <Input
                id="season"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                placeholder="مثال: رمضان 2025"
              />
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

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">إعدادات العرض</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner_image_url">رابط صورة البانر</Label>
                <Input
                  id="banner_image_url"
                  value={formData.banner_image_url}
                  onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner_image_mobile_url">رابط صورة البانر (موبايل)</Label>
                <Input
                  id="banner_image_mobile_url"
                  value={formData.banner_image_mobile_url}
                  onChange={(e) =>
                    setFormData({ ...formData, banner_image_mobile_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme_color">لون المظهر</Label>
                <div className="flex gap-2">
                  <Input
                    id="theme_color"
                    type="color"
                    value={formData.theme_color}
                    onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={formData.theme_color}
                    onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Landing Page */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الصفحة المقصودة</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="landing_page_url">رابط الصفحة</Label>
                <Input
                  id="landing_page_url"
                  value={formData.landing_page_url}
                  onChange={(e) => setFormData({ ...formData, landing_page_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landing_page_slug">رابط مختصر</Label>
                <Input
                  id="landing_page_slug"
                  value={formData.landing_page_slug}
                  onChange={(e) => setFormData({ ...formData, landing_page_slug: e.target.value })}
                  placeholder="campaign-slug"
                />
              </div>
            </div>
          </div>

          {/* Goals & Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الأهداف والميزانية</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_revenue">الإيرادات المستهدفة</Label>
                <Input
                  id="target_revenue"
                  type="number"
                  step="0.01"
                  value={formData.target_revenue}
                  onChange={(e) => setFormData({ ...formData, target_revenue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_customers">عدد العملاء المستهدف</Label>
                <Input
                  id="target_customers"
                  type="number"
                  value={formData.target_customers}
                  onChange={(e) => setFormData({ ...formData, target_customers: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketing_budget">ميزانية التسويق</Label>
                <Input
                  id="marketing_budget"
                  type="number"
                  step="0.01"
                  value={formData.marketing_budget}
                  onChange={(e) => setFormData({ ...formData, marketing_budget: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Status & Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الحالة والإعدادات</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>مميز</Label>
                  <p className="text-sm text-muted-foreground">عرض الحملة في المميزات</p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>نشط</Label>
                  <p className="text-sm text-muted-foreground">تفعيل الحملة</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>عام</Label>
                  <p className="text-sm text-muted-foreground">عرض الحملة للجمهور</p>
                </div>
                <Switch
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعار البداية</Label>
                  <p className="text-sm text-muted-foreground">إرسال إشعار عند بدء الحملة</p>
                </div>
                <Switch
                  checked={formData.notify_start}
                  onCheckedChange={(checked) => setFormData({ ...formData, notify_start: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعار النهاية</Label>
                  <p className="text-sm text-muted-foreground">إرسال إشعار عند انتهاء الحملة</p>
                </div>
                <Switch
                  checked={formData.notify_end}
                  onCheckedChange={(checked) => setFormData({ ...formData, notify_end: checked })}
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
              {loading ? 'جاري الحفظ...' : campaignId ? 'تحديث' : 'إنشاء'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

