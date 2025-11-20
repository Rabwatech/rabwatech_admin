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

interface Campaign {
  id: number
  campaign_code: string
  campaign_name: string
  campaign_name_ar: string
  campaign_type: string
  start_date: string
  end_date: string
  is_active: boolean
  is_featured: boolean
  total_revenue: number
  total_orders: number
  unique_customers: number
  created_at: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCampaigns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, debouncedSearchQuery])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (typeFilter && typeFilter !== 'all') {
        params.append('type', typeFilter)
      }
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery)
      }

      const response = await fetch(`/api/admin/campaigns?${params}`)
      const data = await response.json()

      if (response.ok) {
        setCampaigns(data.campaigns || [])
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب الحملات',
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
    if (!campaignToDelete) return

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignToDelete}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم حذف الحملة بنجاح',
        })
        fetchCampaigns()
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حذف الحملة',
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
      setCampaignToDelete(null)
    }
  }

  const getStatusBadge = (campaign: Campaign) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة الحملات</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع الحملات التسويقية</p>
        </div>
        <Button asChild>
          <Link href="/admin/campaigns/new">
            <Plus className="h-4 w-4 ml-2" />
            إنشاء حملة جديدة
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="بحث في الحملات..."
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ البداية</TableHead>
                <TableHead>تاريخ النهاية</TableHead>
                <TableHead>الإيرادات</TableHead>
                <TableHead>الطلبات</TableHead>
                <TableHead>العملاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    لا توجد حملات
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-mono text-sm">{campaign.campaign_code}</TableCell>
                    <TableCell className="font-medium">
                      {campaign.campaign_name_ar || campaign.campaign_name}
                    </TableCell>
                    <TableCell>{getTypeLabel(campaign.campaign_type)}</TableCell>
                    <TableCell>{getStatusBadge(campaign)}</TableCell>
                    <TableCell>
                      {format(new Date(campaign.start_date), 'yyyy-MM-dd', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(campaign.end_date), 'yyyy-MM-dd', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {campaign.total_revenue?.toLocaleString('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                      }) || '0.00'}
                    </TableCell>
                    <TableCell>{campaign.total_orders || 0}</TableCell>
                    <TableCell>{campaign.unique_customers || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/campaigns/${campaign.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCampaignToDelete(campaign.id)
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
              سيتم حذف هذه الحملة بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
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

