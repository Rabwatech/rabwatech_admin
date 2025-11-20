'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { OfferForm } from './OfferForm'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Offer {
  id: number
  offer_code: string
  offer_name: string
  offer_name_ar: string
  original_price?: number
  sale_price?: number
  discount_percentage?: number
  is_active: boolean
  start_date: string
  end_date: string
  items_count?: number
  offer_types?: {
    type_name_ar: string
  }
}

interface OffersManagerProps {
  campaignId: number
  onUpdate?: () => void
}

export function OffersManager({ campaignId, onUpdate }: OffersManagerProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (campaignId) {
      fetchOffers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const fetchOffers = async () => {
    if (!campaignId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/offers?campaign_id=${campaignId}`)
      const data = await response.json()

      if (response.ok) {
        setOffers(data.offers || [])
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب العروض',
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

  const handleOpenDialog = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer)
    } else {
      setEditingOffer(null)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingOffer(null)
  }

  const handleSuccess = () => {
    fetchOffers()
    handleCloseDialog()
    if (onUpdate) {
      onUpdate()
    }
  }

  const handleDelete = async () => {
    if (!editingOffer) return

    try {
      const response = await fetch(`/api/admin/offers/${editingOffer.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم حذف العرض بنجاح',
        })
        fetchOffers()
        if (onUpdate) {
          onUpdate()
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حذف العرض',
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
      setEditingOffer(null)
    }
  }

  const getStatusBadge = (offer: Offer) => {
    const now = new Date()
    const startDate = new Date(offer.start_date)
    const endDate = new Date(offer.end_date)

    if (!offer.is_active) {
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>العروض</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة عرض
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد عروض</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الخصم</TableHead>
                  <TableHead>العناصر</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ البداية</TableHead>
                  <TableHead>تاريخ النهاية</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-mono text-sm">{offer.offer_code}</TableCell>
                    <TableCell className="font-medium">
                      {offer.offer_name_ar || offer.offer_name}
                    </TableCell>
                    <TableCell>{offer.offer_types?.type_name_ar || '-'}</TableCell>
                    <TableCell>
                      {offer.sale_price
                        ? offer.sale_price.toLocaleString('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                          })
                        : offer.original_price
                          ? offer.original_price.toLocaleString('ar-SA', {
                              style: 'currency',
                              currency: 'SAR',
                            })
                          : '-'}
                    </TableCell>
                    <TableCell>
                      {offer.discount_percentage ? `${offer.discount_percentage}%` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {offer.items_count || 0} عنصر
                        </Badge>
                        {(offer.items_count || 0) > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            asChild
                            title="إدارة العناصر"
                          >
                            <Link href={`/admin/offers/${offer.id}?tab=items`}>
                              <Package className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(offer)}</TableCell>
                    <TableCell>
                      {format(new Date(offer.start_date), 'yyyy-MM-dd', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(offer.end_date), 'yyyy-MM-dd', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/admin/offers/${offer.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(offer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingOffer(offer)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingOffer
                ? 'قم بتعديل معلومات العرض'
                : 'أدخل معلومات العرض الجديد'}
            </DialogDescription>
          </DialogHeader>
          <OfferForm
            campaignId={campaignId}
            offerId={editingOffer?.id}
            onSuccess={handleSuccess}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا العرض بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
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
    </>
  )
}

