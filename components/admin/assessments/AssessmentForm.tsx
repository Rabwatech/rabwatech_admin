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

interface AssessmentFormProps {
  assessmentId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function AssessmentForm({ assessmentId, onSuccess, onCancel }: AssessmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    type: 'growth_indicator',
    status: 'draft',
  })
  const { toast } = useToast()

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId])

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/admin/assessments/${assessmentId}`)
      const data = await response.json()

      if (response.ok) {
        setFormData({
          name: data.assessment.name || '',
          key: data.assessment.key || '',
          description: data.assessment.description || '',
          type: data.assessment.type || 'growth_indicator',
          status: data.assessment.status || 'draft',
        })
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات التقييم',
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
      const url = assessmentId
        ? `/api/admin/assessments/${assessmentId}`
        : '/api/admin/assessments'
      const method = assessmentId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: assessmentId ? 'تم تحديث التقييم بنجاح' : 'تم إنشاء التقييم بنجاح',
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ التقييم',
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
          <CardTitle>{assessmentId ? 'تعديل التقييم' : 'إنشاء تقييم جديد'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="اسم التقييم"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">المفتاح *</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="assessment-key"
              required
              disabled={!!assessmentId}
            />
            <p className="text-sm text-muted-foreground">
              المفتاح لا يمكن تغييره بعد الإنشاء. استخدم أحرف إنجليزية صغيرة وشرطات فقط.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف التقييم"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">النوع</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="growth_indicator">مؤشر النمو</SelectItem>
                  <SelectItem value="trackp">TrackP</SelectItem>
                  <SelectItem value="trackb">TrackB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                إلغاء
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : assessmentId ? 'تحديث' : 'إنشاء'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

