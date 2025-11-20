'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { ArrowRight, Edit, Save, X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

interface User {
  id: string
  email: string
  role: 'admin' | 'moderator' | 'user'
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at?: string
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: 'user' as 'admin' | 'moderator' | 'user',
    is_active: true,
  })

  const userId = params.id as string

  useEffect(() => {
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const fetchUser = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setFormData({
          email: data.user.email || '',
          role: data.user.role || 'user',
          is_active: data.user.is_active !== undefined ? data.user.is_active : true,
        })
      } else {
        setError(data.error || 'حدث خطأ أثناء جلب بيانات المستخدم')
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات المستخدم',
          variant: 'destructive',
        })
      }
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: formData.role,
          is_active: formData.is_active,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم تحديث بيانات المستخدم بنجاح',
        })
        setIsEditing(false)
        fetchUser()
      } else {
        setError(data.error || 'حدث خطأ أثناء تحديث المستخدم')
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء تحديث المستخدم',
          variant: 'destructive',
        })
      }
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email || '',
        role: user.role || 'user',
        is_active: user.is_active !== undefined ? user.is_active : true,
      })
    }
    setIsEditing(false)
    setError('')
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'moderator':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مسؤول'
      case 'moderator':
        return 'مشرف'
      default:
        return 'مستخدم'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة إلى القائمة
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">تفاصيل المستخدم</h1>
          <p className="text-muted-foreground">عرض وتعديل بيانات المستخدم</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" asChild>
                <Link href="/admin/users">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  العودة
                </Link>
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input value={formData.email} disabled />
              <p className="text-sm text-muted-foreground">لا يمكن تعديل البريد الإلكتروني</p>
            </div>

            <div className="space-y-2">
              <Label>الدور</Label>
              {isEditing ? (
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'moderator' | 'user') =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مسؤول</SelectItem>
                    <SelectItem value="moderator">مشرف</SelectItem>
                    <SelectItem value="user">مستخدم</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>الحالة</Label>
              {isEditing ? (
                <Select
                  value={formData.is_active ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">نشط</SelectItem>
                    <SelectItem value="false">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>معرف المستخدم</Label>
              <p className="text-sm font-mono py-2">{user.id}</p>
            </div>

            <div className="space-y-2">
              <Label>آخر تسجيل دخول</Label>
              <p className="text-sm py-2">
                {user.last_login
                  ? format(new Date(user.last_login), 'dd/MM/yyyy HH:mm', { locale: ar })
                  : 'لم يسجل دخول بعد'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>تاريخ الإنشاء</Label>
              <p className="text-sm py-2">
                {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
              </p>
            </div>

            {user.updated_at && (
              <div className="space-y-2">
                <Label>آخر تحديث</Label>
                <p className="text-sm py-2">
                  {format(new Date(user.updated_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

