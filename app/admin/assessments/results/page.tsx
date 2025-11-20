'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/assessments/results?limit=50')
      const data = await response.json()

      if (response.ok) {
        setResults(data.results)
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب النتائج',
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

  const getProfileBadge = (profile: string) => {
    switch (profile) {
      case 'excellent':
        return <Badge variant="default">ممتاز</Badge>
      case 'good':
        return <Badge variant="secondary">جيد</Badge>
      case 'needs_improvement':
        return <Badge variant="outline">يحتاج تحسين</Badge>
      default:
        return <Badge>{profile}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">نتائج التقييم</h1>
        <p className="text-muted-foreground">عرض جميع نتائج التقييم</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الزبون المحتمل</TableHead>
                  <TableHead>المسار</TableHead>
                  <TableHead>النتيجة الإجمالية</TableHead>
                  <TableHead>ملف النتيجة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      لا توجد نتائج
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        {result.leads?.name || result.leads?.email || '-'}
                      </TableCell>
                      <TableCell>
                        {result.assessments?.name || result.assessments?.key || result.assessment_id || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {result.total_score?.toFixed(1) || '-'}
                      </TableCell>
                      <TableCell>{getProfileBadge(result.result_profiles?.key || result.profile_id || '-')}</TableCell>
                      <TableCell>
                        {format(new Date(result.created_at), 'dd/MM/yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/assessments/results/${result.id}`}>
                            <Eye className="h-4 w-4 ml-2" />
                            عرض
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

