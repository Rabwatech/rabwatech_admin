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
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface Category {
  id: number
  category_code: string
  category_name: string
  category_name_ar: string
  description?: string
  description_ar?: string
  parent_id?: number
  icon?: string
  display_order: number
  is_active: boolean
  services_count?: number
}

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    category_code: '',
    category_name: '',
    category_name_ar: '',
    description: '',
    description_ar: '',
    parent_id: '',
    icon: '',
    display_order: '0',
    is_active: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/service-categories')
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories || [])
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب الفئات',
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

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        category_code: category.category_code,
        category_name: category.category_name,
        category_name_ar: category.category_name_ar,
        description: category.description || '',
        description_ar: category.description_ar || '',
        parent_id: category.parent_id?.toString() || '',
        icon: category.icon || '',
        display_order: category.display_order?.toString() || '0',
        is_active: category.is_active,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        category_code: '',
        category_name: '',
        category_name_ar: '',
        description: '',
        description_ar: '',
        parent_id: '',
        icon: '',
        display_order: (categories.length + 1).toString(),
        is_active: true,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
    setFormData({
      category_code: '',
      category_name: '',
      category_name_ar: '',
      description: '',
      description_ar: '',
      parent_id: '',
      icon: '',
      display_order: '0',
      is_active: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory
        ? `/api/admin/service-categories/${editingCategory.id}`
        : '/api/admin/service-categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const payload: any = {
        ...formData,
        display_order: parseInt(formData.display_order),
      }

      if (formData.parent_id) payload.parent_id = parseInt(formData.parent_id)
      if (!formData.parent_id) payload.parent_id = null

      // Remove empty strings
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
          description: editingCategory ? 'تم تحديث الفئة بنجاح' : 'تم إضافة الفئة بنجاح',
        })
        fetchCategories()
        handleCloseDialog()
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ الفئة',
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
    if (!editingCategory) return

    try {
      const response = await fetch(`/api/admin/service-categories/${editingCategory.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم حذف الفئة بنجاح',
        })
        fetchCategories()
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حذف الفئة',
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
      setEditingCategory(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة فئات الخدمات</h1>
            <p className="text-muted-foreground">عرض وإدارة فئات الخدمات</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة فئة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الفئات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد فئات</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الفئة الأب</TableHead>
                  <TableHead>عدد الخدمات</TableHead>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono text-sm">{category.category_code}</TableCell>
                    <TableCell className="font-medium">
                      {category.category_name_ar || category.category_name}
                    </TableCell>
                    <TableCell>
                      {category.parent_id
                        ? categories.find((c) => c.id === category.parent_id)?.category_name_ar ||
                          '-'
                        : '-'}
                    </TableCell>
                    <TableCell>{category.services_count || 0}</TableCell>
                    <TableCell>{category.display_order}</TableCell>
                    <TableCell>
                      {category.is_active ? (
                        <Badge variant="default">نشط</Badge>
                      ) : (
                        <Badge variant="secondary">معطل</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCategory(category)
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
            <DialogTitle>
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'قم بتعديل معلومات الفئة' : 'أدخل معلومات الفئة الجديدة'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_code">كود الفئة *</Label>
                  <Input
                    id="category_code"
                    value={formData.category_code}
                    onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
                    placeholder="category-code"
                    required
                    disabled={!!editingCategory}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_id">الفئة الأب</Label>
                  <Select
                    value={formData.parent_id}
                    onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                  >
                    <SelectTrigger id="parent_id">
                      <SelectValue placeholder="لا شيء" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">لا شيء</SelectItem>
                      {categories
                        .filter((c) => c.id !== editingCategory?.id)
                        .map((cat) => (
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
                  <Label htmlFor="category_name">الاسم (إنجليزي) *</Label>
                  <Input
                    id="category_name"
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    placeholder="Category Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category_name_ar">الاسم (عربي) *</Label>
                  <Input
                    id="category_name_ar"
                    value={formData.category_name_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, category_name_ar: e.target.value })
                    }
                    placeholder="اسم الفئة"
                    required
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
                    placeholder="وصف الفئة"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">الأيقونة</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="icon-name"
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">نشط</Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                إلغاء
              </Button>
              <Button type="submit">{editingCategory ? 'تحديث' : 'إضافة'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذه الفئة بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
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

