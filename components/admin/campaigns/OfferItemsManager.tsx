'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OfferItem {
  id: number
  offer_id: number
  service_id?: number
  item_name: string
  item_name_ar: string
  item_description?: string
  item_description_ar?: string
  quantity: number
  unit_price?: number
  display_order: number
  is_highlighted: boolean
  icon?: string
  services?: {
    id: number
    service_name: string
    service_name_ar: string
  }
}

interface OfferItemsManagerProps {
  offerId: number
  onUpdate?: () => void
}

export function OfferItemsManager({ offerId, onUpdate }: OfferItemsManagerProps) {
  const [items, setItems] = useState<OfferItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OfferItem | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [formData, setFormData] = useState({
    service_id: '',
    item_name: '',
    item_name_ar: '',
    item_description: '',
    item_description_ar: '',
    quantity: '1',
    unit_price: '',
    display_order: '0',
    is_highlighted: false,
    icon: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    if (offerId) {
      fetchItems()
      fetchServices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services?limit=1000')
      const data = await response.json()
      if (response.ok) {
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchItems = async () => {
    if (!offerId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/offer-items?offer_id=${offerId}`)
      const data = await response.json()

      if (response.ok) {
        setItems(data.items || [])
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب عناصر العرض',
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

  const handleOpenDialog = (item?: OfferItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        service_id: item.service_id?.toString() || '',
        item_name: item.item_name || '',
        item_name_ar: item.item_name_ar || '',
        item_description: item.item_description || '',
        item_description_ar: item.item_description_ar || '',
        quantity: item.quantity?.toString() || '1',
        unit_price: item.unit_price?.toString() || '',
        display_order: item.display_order?.toString() || '0',
        is_highlighted: item.is_highlighted || false,
        icon: item.icon || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        service_id: '',
        item_name: '',
        item_name_ar: '',
        item_description: '',
        item_description_ar: '',
        quantity: '1',
        unit_price: '',
        display_order: (items.length + 1).toString(),
        is_highlighted: false,
        icon: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setFormData({
      service_id: '',
      item_name: '',
      item_name_ar: '',
      item_description: '',
      item_description_ar: '',
      quantity: '1',
      unit_price: '',
      display_order: '0',
      is_highlighted: false,
      icon: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingItem
        ? `/api/admin/offer-items/${editingItem.id}`
        : '/api/admin/offer-items'
      const method = editingItem ? 'PUT' : 'POST'

      const payload: any = {
        offer_id: offerId,
        item_name: formData.item_name,
        item_name_ar: formData.item_name_ar,
        quantity: parseInt(formData.quantity),
        display_order: parseInt(formData.display_order),
        is_highlighted: formData.is_highlighted,
      }

      if (formData.service_id) payload.service_id = parseInt(formData.service_id)
      if (formData.item_description) payload.item_description = formData.item_description
      if (formData.item_description_ar) payload.item_description_ar = formData.item_description_ar
      if (formData.unit_price) payload.unit_price = parseFloat(formData.unit_price)
      if (formData.icon) payload.icon = formData.icon

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
          description: editingItem ? 'تم تحديث العنصر بنجاح' : 'تم إضافة العنصر بنجاح',
        })
        fetchItems()
        handleCloseDialog()
        if (onUpdate) {
          onUpdate()
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ العنصر',
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

  const handleDelete = async () => {
    if (!editingItem) return

    try {
      const response = await fetch(`/api/admin/offer-items/${editingItem.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم حذف العنصر بنجاح',
        })
        fetchItems()
        if (onUpdate) {
          onUpdate()
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حذف العنصر',
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
      setEditingItem(null)
    }
  }

  const handleReorder = async (itemId: number, direction: 'up' | 'down') => {
    const itemIndex = items.findIndex((item) => item.id === itemId)
    if (itemIndex === -1) return

    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const item = items[itemIndex]
    const targetItem = items[newIndex]

    try {
      // Update both items' display_order
      await fetch(`/api/admin/offer-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: targetItem.display_order }),
      })

      await fetch(`/api/admin/offer-items/${targetItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: item.display_order }),
      })

      fetchItems()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إعادة الترتيب',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>عناصر العرض</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة عنصر
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد عناصر</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الخدمة</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>مميز</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleReorder(item.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <span className="text-sm">{item.display_order}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleReorder(item.id, 'down')}
                          disabled={index === items.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.item_name_ar || item.item_name}
                      {item.is_highlighted && (
                        <Badge variant="default" className="mr-2">
                          مميز
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.services
                        ? item.services.service_name_ar || item.services.service_name
                        : 'مخصص'}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.unit_price
                        ? item.unit_price.toLocaleString('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>{item.is_highlighted ? 'نعم' : 'لا'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingItem(item)
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'قم بتعديل معلومات العنصر' : 'أدخل معلومات العنصر الجديد'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_id">الخدمة (اختياري)</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                >
                  <SelectTrigger id="service_id">
                    <SelectValue placeholder="اختر خدمة أو اتركه فارغاً لعنصر مخصص" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">عنصر مخصص</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.service_name_ar || service.service_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_name">الاسم (إنجليزي) *</Label>
                  <Input
                    id="item_name"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="Item Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item_name_ar">الاسم (عربي) *</Label>
                  <Input
                    id="item_name_ar"
                    value={formData.item_name_ar}
                    onChange={(e) => setFormData({ ...formData, item_name_ar: e.target.value })}
                    placeholder="اسم العنصر"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_description">الوصف (إنجليزي)</Label>
                  <Textarea
                    id="item_description"
                    value={formData.item_description}
                    onChange={(e) =>
                      setFormData({ ...formData, item_description: e.target.value })
                    }
                    placeholder="Description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item_description_ar">الوصف (عربي)</Label>
                  <Textarea
                    id="item_description_ar"
                    value={formData.item_description_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, item_description_ar: e.target.value })
                    }
                    placeholder="وصف العنصر"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="1"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_price">السعر</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    placeholder="0.00"
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

              <div className="space-y-2">
                <Label htmlFor="icon">الأيقونة</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="icon-name"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_highlighted"
                  checked={formData.is_highlighted}
                  onChange={(e) =>
                    setFormData({ ...formData, is_highlighted: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="is_highlighted">تمييز هذا العنصر</Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                إلغاء
              </Button>
              <Button type="submit">{editingItem ? 'تحديث' : 'إضافة'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا العنصر بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
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
