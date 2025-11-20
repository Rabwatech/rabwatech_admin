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
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Pillar {
  id: string
  name: string
  description?: string
  questions_count?: number
}

interface PillarsManagerProps {
  assessmentId: string
  onUpdate?: () => void
}

export function PillarsManager({ assessmentId, onUpdate }: PillarsManagerProps) {
  const [pillars, setPillars] = useState<Pillar[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPillar, setEditingPillar] = useState<Pillar | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    if (assessmentId) {
      fetchPillars()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId])

  const fetchPillars = async () => {
    if (!assessmentId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/pillars?assessment_id=${assessmentId}`)
      const data = await response.json()

      if (response.ok) {
        setPillars(data.pillars || [])
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب الأعمدة',
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

  const handleOpenDialog = (pillar?: Pillar) => {
    if (pillar) {
      setEditingPillar(pillar)
      setFormData({
        name: pillar.name,
        description: pillar.description || '',
      })
    } else {
      setEditingPillar(null)
      setFormData({
        name: '',
        description: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingPillar(null)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingPillar
        ? `/api/admin/pillars/${editingPillar.id}`
        : '/api/admin/pillars'
      const method = editingPillar ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          track_id: assessmentId, // API expects track_id but maps to assessment_id
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: editingPillar ? 'تم تحديث العمود بنجاح' : 'تم إنشاء العمود بنجاح',
        })
        handleCloseDialog()
        fetchPillars()
        if (onUpdate) onUpdate()
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ العمود',
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/pillars/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم حذف العمود بنجاح',
        })
        fetchPillars()
        if (onUpdate) onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حذف العمود',
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
    }
  }

  const handleReorder = async (pillarId: string, direction: 'up' | 'down') => {
    // Reordering disabled since order_index column doesn't exist
    // This would require database migration to add the column
    toast({
      title: 'ملاحظة',
      description: 'إعادة الترتيب غير متاحة حالياً. يرجى إضافة عمود order_index إلى قاعدة البيانات.',
      variant: 'default',
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>الأعمدة</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة عمود
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">جاري التحميل...</div>
          ) : pillars.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد أعمدة. ابدأ بإضافة عمود جديد.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">الترتيب</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>عدد الأسئلة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pillars.map((pillar, index) => (
                  <TableRow key={pillar.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(pillar.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(pillar.id, 'down')}
                          disabled={index === pillars.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{pillar.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {pillar.description || '-'}
                    </TableCell>
                    <TableCell>{pillar.questions_count || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(pillar)}
                        >
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPillar(pillar)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPillar ? 'تعديل العمود' : 'إضافة عمود جديد'}</DialogTitle>
            <DialogDescription>
              {editingPillar
                ? 'قم بتعديل معلومات العمود'
                : 'أدخل معلومات العمود الجديد'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                إلغاء
              </Button>
              <Button type="submit">{editingPillar ? 'تحديث' : 'إنشاء'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا العمود؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => editingPillar && handleDelete(editingPillar.id)}
              className="bg-destructive text-destructive-foreground"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

