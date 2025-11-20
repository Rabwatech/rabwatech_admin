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
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ResultProfile {
  id: string
  name: string
  key: string
  description?: string
  min_score: number
  max_score: number
}

interface ResultProfilesManagerProps {
  assessmentId: string
  onUpdate?: () => void
}

export function ResultProfilesManager({ assessmentId, onUpdate }: ResultProfilesManagerProps) {
  const [profiles, setProfiles] = useState<ResultProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ResultProfile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    min_score: 0,
    max_score: 100,
  })
  const { toast } = useToast()

  useEffect(() => {
    if (assessmentId) {
      fetchProfiles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId])

  const fetchProfiles = async () => {
    if (!assessmentId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/result-profiles?assessment_id=${assessmentId}`)
      const data = await response.json()

      if (response.ok) {
        setProfiles(data.profiles || [])
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب ملفات النتائج',
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

  const handleOpenDialog = (profile?: ResultProfile) => {
    if (profile) {
      setEditingProfile(profile)
      setFormData({
        name: profile.name,
        key: profile.key,
        description: profile.description || '',
        min_score: profile.min_score,
        max_score: profile.max_score,
      })
    } else {
      setEditingProfile(null)
      setFormData({
        name: '',
        key: '',
        description: '',
        min_score: 0,
        max_score: 100,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingProfile(null)
    setFormData({
      name: '',
      key: '',
      description: '',
      min_score: 0,
      max_score: 100,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.min_score >= formData.max_score) {
      toast({
        title: 'خطأ',
        description: 'الحد الأدنى يجب أن يكون أقل من الحد الأقصى',
        variant: 'destructive',
      })
      return
    }

    try {
      const url = editingProfile
        ? `/api/admin/result-profiles/${editingProfile.id}`
        : '/api/admin/result-profiles'
      const method = editingProfile ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assessment_id: assessmentId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: editingProfile ? 'تم تحديث ملف النتيجة بنجاح' : 'تم إنشاء ملف النتيجة بنجاح',
        })
        handleCloseDialog()
        fetchProfiles()
        if (onUpdate) onUpdate()
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ ملف النتيجة',
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
      const response = await fetch(`/api/admin/result-profiles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم حذف ملف النتيجة بنجاح',
        })
        fetchProfiles()
        if (onUpdate) onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حذف ملف النتيجة',
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ملفات النتائج</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة ملف نتيجة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">جاري التحميل...</div>
          ) : profiles.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد ملفات نتائج. ابدأ بإضافة ملف نتيجة جديد.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المفتاح</TableHead>
                  <TableHead>نطاق النقاط</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{profile.key}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {profile.min_score} - {profile.max_score}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {profile.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(profile)}
                        >
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingProfile(profile)
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
            <DialogTitle>
              {editingProfile ? 'تعديل ملف النتيجة' : 'إضافة ملف نتيجة جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingProfile
                ? 'قم بتعديل معلومات ملف النتيجة'
                : 'أدخل معلومات ملف النتيجة الجديد. يجب أن لا تتداخل النطاقات.'}
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
                <Label htmlFor="key">المفتاح *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  required
                  disabled={!!editingProfile}
                  placeholder="excellent"
                />
                {!editingProfile && (
                  <p className="text-sm text-muted-foreground">
                    المفتاح لا يمكن تغييره بعد الإنشاء. استخدم أحرف إنجليزية صغيرة فقط.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_score">الحد الأدنى *</Label>
                  <Input
                    id="min_score"
                    type="number"
                    value={formData.min_score}
                    onChange={(e) =>
                      setFormData({ ...formData, min_score: parseFloat(e.target.value) || 0 })
                    }
                    required
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_score">الحد الأقصى *</Label>
                  <Input
                    id="max_score"
                    type="number"
                    value={formData.max_score}
                    onChange={(e) =>
                      setFormData({ ...formData, max_score: parseFloat(e.target.value) || 100 })
                    }
                    required
                    min={0}
                    max={100}
                  />
                </div>
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
              <Button type="submit">{editingProfile ? 'تحديث' : 'إنشاء'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف ملف النتيجة هذا؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => editingProfile && handleDelete(editingProfile.id)}
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

