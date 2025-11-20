'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useToast } from '@/hooks/use-toast'
import { ArrowRight, Edit, Save, X, Loader2, Trash2, CheckCircle2, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  country: string
  status: string
  lead_status: string
  lead_score?: number
  source?: string
  lead_source?: string
  company_name?: string
  company_size?: string
  industry?: string
  notes?: string
  converted_at?: string
  created_at: string
  updated_at?: string
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [lead, setLead] = useState<Lead | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    status: 'active',
    lead_status: 'new',
    lead_score: 0,
    source: 'other',
    lead_source: 'unknown',
    company_name: '',
    company_size: '',
    industry: '',
    notes: '',
  })

  const leadId = params.id as string

  useEffect(() => {
    fetchLead()
    fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId])

  const fetchLead = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`)
      const data = await response.json()

      if (response.ok) {
        setLead(data.lead)
        setFormData({
          name: data.lead.name || '',
          email: data.lead.email || '',
          phone: data.lead.phone || '',
          country: data.lead.country || '',
          status: data.lead.status || 'active',
          lead_status: data.lead.lead_status || 'new',
          lead_score: data.lead.lead_score || 0,
          source: data.lead.source || 'other',
          lead_source: data.lead.lead_source || 'unknown',
          company_name: data.lead.company_name || '',
          company_size: data.lead.company_size || '',
          industry: data.lead.industry || '',
          notes: data.lead.notes || '',
        })
      } else {
        setError(data.error || 'حدث خطأ أثناء جلب بيانات الزبون المحتمل')
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات الزبون المحتمل',
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

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/sessions`)
      const data = await response.json()
      if (response.ok) {
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم تحديث بيانات الزبون المحتمل بنجاح',
        })
        setIsEditing(false)
        fetchLead()
      } else {
        setError(data.error || 'حدث خطأ أثناء تحديث الزبون المحتمل')
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء تحديث الزبون المحتمل',
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
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        country: lead.country || '',
        status: lead.status || 'active',
        lead_status: lead.lead_status || 'new',
        lead_score: lead.lead_score || 0,
        source: lead.source || 'other',
        lead_source: lead.lead_source || 'unknown',
        company_name: lead.company_name || '',
        company_size: lead.company_size || '',
        industry: lead.industry || '',
        notes: lead.notes || '',
      })
    }
    setIsEditing(false)
    setError('')
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم حذف الزبون المحتمل بنجاح',
        })
        router.push('/admin/leads')
      } else {
        const data = await response.json()
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حذف الزبون المحتمل',
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

  const handleMarkAsConverted = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_status: 'converted',
          converted_at: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم تحديث حالة الزبون المحتمل إلى محول',
        })
        fetchLead()
      } else {
        const data = await response.json()
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء تحديث الحالة',
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
      setSaving(false)
    }
  }

  const getLeadStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      new: { label: 'جديد', variant: 'outline' },
      contacted: { label: 'تم التواصل', variant: 'secondary' },
      qualified: { label: 'مؤهل', variant: 'default' },
      converted: { label: 'محول', variant: 'default' },
      lost: { label: 'مفقود', variant: 'destructive' },
    }
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/leads">
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

  if (!lead) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">تفاصيل الزبون المحتمل</h1>
          <p className="text-muted-foreground">عرض وإدارة بيانات الزبون المحتمل</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" asChild>
                <Link href="/admin/leads">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  العودة
                </Link>
              </Button>
              {lead.lead_status !== 'converted' && (
                <Button variant="outline" onClick={handleMarkAsConverted} disabled={saving}>
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                  تحديد كمحول
                </Button>
              )}
              <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
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

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">المعلومات الأساسية</TabsTrigger>
          <TabsTrigger value="company">معلومات الشركة</TabsTrigger>
          <TabsTrigger value="management">إدارة الزبون</TabsTrigger>
          <TabsTrigger value="related">البيانات المرتبطة</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>الاسم *</Label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm py-2">{lead.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>البريد الإلكتروني *</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm py-2">{lead.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>الهاتف *</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm py-2">{lead.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>الدولة *</Label>
                  {isEditing ? (
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm py-2">{lead.country}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الشركة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>اسم الشركة</Label>
                  {isEditing ? (
                    <Input
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({ ...formData, company_name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm py-2">{lead.company_name || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>حجم الشركة</Label>
                  {isEditing ? (
                    <Input
                      value={formData.company_size}
                      onChange={(e) =>
                        setFormData({ ...formData, company_size: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm py-2">{lead.company_size || '-'}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>القطاع</Label>
                  {isEditing ? (
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm py-2">{lead.industry || '-'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>حالة الزبون</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>الحالة الأساسية</Label>
                  {isEditing ? (
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div>
                      <Badge variant={lead.status === 'active' ? 'default' : 'secondary'}>
                        {lead.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>حالة المبيعات</Label>
                  {isEditing ? (
                    <Select
                      value={formData.lead_status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, lead_status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">جديد</SelectItem>
                        <SelectItem value="contacted">تم التواصل</SelectItem>
                        <SelectItem value="qualified">مؤهل</SelectItem>
                        <SelectItem value="converted">محول</SelectItem>
                        <SelectItem value="lost">مفقود</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div>{getLeadStatusBadge(lead.lead_status)}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>نقاط الزبون</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.lead_score}
                      onChange={(e) =>
                        setFormData({ ...formData, lead_score: parseInt(e.target.value) || 0 })
                      }
                    />
                  ) : (
                    <p className="text-sm py-2">{lead.lead_score || 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مصدر الزبون</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>المصدر</Label>
                  {isEditing ? (
                    <Input
                      value={formData.lead_source}
                      onChange={(e) =>
                        setFormData({ ...formData, lead_source: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm py-2">{lead.lead_source || '-'}</p>
                  )}
                </div>

                {lead.converted_at && (
                  <div className="space-y-2">
                    <Label>تاريخ التحويل</Label>
                    <p className="text-sm py-2">
                      {format(new Date(lead.converted_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isEditing ? (
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={6}
                    placeholder="أضف ملاحظات عن الزبون المحتمل..."
                  />
                ) : (
                  <p className="text-sm py-2 whitespace-pre-wrap">{lead.notes || 'لا توجد ملاحظات'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>جلسات التقييم</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد جلسات تقييم</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    عدد الجلسات: {sessions.length}
                  </p>
                  <Button variant="outline" asChild>
                    <Link href={`/admin/assessments/sessions?lead_id=${leadId}`}>
                      <FileText className="h-4 w-4 ml-2" />
                      عرض جميع الجلسات
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>معرف الزبون</Label>
                <p className="text-sm font-mono py-2">{lead.id}</p>
              </div>

              <div className="space-y-2">
                <Label>تاريخ الإنشاء</Label>
                <p className="text-sm py-2">
                  {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                </p>
              </div>

              {lead.updated_at && (
                <div className="space-y-2">
                  <Label>آخر تحديث</Label>
                  <p className="text-sm py-2">
                    {format(new Date(lead.updated_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الزبون المحتمل؟ لا يمكن التراجع عن هذا الإجراء.
              {sessions.length > 0 && (
                <span className="block mt-2 text-destructive">
                  تحذير: هذا الزبون لديه {sessions.length} جلسة تقييم مرتبطة.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

