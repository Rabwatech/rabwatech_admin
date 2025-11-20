'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { ArrowRight, Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function NewLeadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    company_name: '',
    company_size: '',
    industry: '',
    notes: '',
    lead_source: 'unknown',
    status: 'active',
    lead_status: 'new',
    lead_score: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.country) {
      setError('الاسم، البريد الإلكتروني، الهاتف، والدولة مطلوبة')
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('البريد الإلكتروني غير صحيح')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          company_name: formData.company_name || null,
          company_size: formData.company_size || null,
          industry: formData.industry || null,
          notes: formData.notes || null,
          lead_source: formData.lead_source,
          status: formData.status,
          lead_status: formData.lead_status,
          lead_score: formData.lead_score,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم إنشاء الزبون المحتمل بنجاح',
        })
        // Redirect to lead detail page
        router.push(`/admin/leads/${data.lead.id}`)
      } else {
        setError(data.error || 'حدث خطأ أثناء إنشاء الزبون المحتمل')
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء إنشاء الزبون المحتمل',
          variant: 'destructive',
        })
      }
    } catch (err) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">إنشاء زبون محتمل جديد</h1>
          <p className="text-muted-foreground">إضافة زبون محتمل جديد إلى النظام</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/leads">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة إلى القائمة
          </Link>
        </Button>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            معلومات الزبون المحتمل
          </CardTitle>
          <CardDescription>املأ البيانات التالية لإنشاء زبون محتمل جديد</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="اسم الزبون المحتمل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">الهاتف *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">الدولة *</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="الدولة"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">معلومات الشركة (اختياري)</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">اسم الشركة</Label>
                  <Input
                    id="company_name"
                    type="text"
                    placeholder="اسم الشركة"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_size">حجم الشركة</Label>
                  <Input
                    id="company_size"
                    type="text"
                    placeholder="مثال: 1-10 موظفين"
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="industry">القطاع</Label>
                  <Input
                    id="industry"
                    type="text"
                    placeholder="مثال: التكنولوجيا، المالية، إلخ"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">إعدادات إضافية</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lead_source">مصدر الزبون</Label>
                  <Input
                    id="lead_source"
                    type="text"
                    placeholder="مثال: موقع الويب، إعلان، إلخ"
                    value={formData.lead_source}
                    onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_status">حالة المبيعات</Label>
                  <Select
                    value={formData.lead_status}
                    onValueChange={(value) => setFormData({ ...formData, lead_status: value })}
                    disabled={loading}
                  >
                    <SelectTrigger id="lead_status">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    disabled={loading}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_score">نقاط الزبون (0-100)</Label>
                  <Input
                    id="lead_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.lead_score}
                    onChange={(e) =>
                      setFormData({ ...formData, lead_score: parseInt(e.target.value) || 0 })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="أضف أي ملاحظات عن الزبون المحتمل..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    إنشاء زبون محتمل
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild disabled={loading}>
                <Link href="/admin/leads">إلغاء</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

