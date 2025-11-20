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
import { CampaignForm } from '@/components/admin/campaigns/CampaignForm'
import { OffersManager } from '@/components/admin/campaigns/OffersManager'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const campaignId = params.id as string

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const fetchCampaign = async () => {
    if (!campaignId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`)
      const data = await response.json()

      if (response.ok) {
        setCampaign(data.campaign)
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات الحملة',
          variant: 'destructive',
        })
        router.push('/admin/campaigns')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
      router.push('/admin/campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = () => {
    fetchCampaign()
  }

  const getStatusBadge = (campaign: any) => {
    if (!campaign) return null
    const now = new Date()
    const startDate = new Date(campaign.start_date)
    const endDate = new Date(campaign.end_date)

    if (!campaign.is_active) {
      return <Badge variant="secondary">معطل</Badge>
    }

    if (now < startDate) {
      return <Badge variant="outline">قادم</Badge>
    }

    if (now >= startDate && now <= endDate) {
      return <Badge variant="default">نشط</Badge>
    }

    return <Badge variant="destructive">منتهي</Badge>
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      seasonal: 'موسمي',
      launch: 'إطلاق',
      anniversary: 'ذكرى',
      clearance: 'تصفية',
      flash_sale: 'عرض سريع',
      loyalty: 'ولاء',
      referral: 'إحالة',
      custom: 'مخصص',
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!campaign) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/campaigns">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{campaign.campaign_name_ar || campaign.campaign_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground font-mono">{campaign.campaign_code}</span>
              <span className="text-muted-foreground">•</span>
              {getStatusBadge(campaign)}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{getTypeLabel(campaign.campaign_type)}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">معلومات الحملة</TabsTrigger>
          <TabsTrigger value="offers">العروض ({campaign.offers_count || 0})</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <CampaignForm campaignId={parseInt(campaignId)} onSuccess={handleFormSuccess} />
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <OffersManager campaignId={parseInt(campaignId)} onUpdate={fetchCampaign} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أداء الحملة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold">
                    {campaign.total_revenue?.toLocaleString('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">عدد الطلبات</p>
                  <p className="text-2xl font-bold">{campaign.total_orders || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">عدد العملاء</p>
                  <p className="text-2xl font-bold">{campaign.unique_customers || 0}</p>
                </div>
              </div>
              {campaign.target_revenue && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">الإيرادات المستهدفة</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((campaign.total_revenue || 0) / campaign.target_revenue) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((campaign.total_revenue || 0) / campaign.target_revenue * 100).toFixed(1)}% من الهدف
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الحملة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">تاريخ البداية</p>
                  <p className="text-muted-foreground">
                    {format(new Date(campaign.start_date), 'yyyy-MM-dd HH:mm', { locale: ar })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">تاريخ النهاية</p>
                  <p className="text-muted-foreground">
                    {format(new Date(campaign.end_date), 'yyyy-MM-dd HH:mm', { locale: ar })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">مميز</p>
                  <p className="text-muted-foreground">{campaign.is_featured ? 'نعم' : 'لا'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">نشط</p>
                  <p className="text-muted-foreground">{campaign.is_active ? 'نعم' : 'لا'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">عام</p>
                  <p className="text-muted-foreground">{campaign.is_public ? 'نعم' : 'لا'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">الأولوية</p>
                  <p className="text-muted-foreground">{campaign.priority || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

