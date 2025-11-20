'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Eye, Search } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [assessmentFilter, setAssessmentFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchAssessments()
    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, assessmentFilter, profileFilter])

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/admin/assessments')
      const data = await response.json()
      if (response.ok) {
        setAssessments(data.assessments || [])
      }
    } catch (error) {
      console.error('Error fetching assessments:', error)
    }
  }

  const fetchResults = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '50',
      })
      if (assessmentFilter && assessmentFilter !== 'all') {
        params.append('track_id', assessmentFilter)
      }
      if (profileFilter && profileFilter !== 'all') {
        params.append('result_profile', profileFilter)
      }

      const response = await fetch(`/api/admin/assessments/results?${params}`)
      const data = await response.json()

      if (response.ok) {
        let filteredResults = data.results || []
        
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase()
          filteredResults = filteredResults.filter(
            (result: any) =>
              result.leads?.name?.toLowerCase().includes(searchLower) ||
              result.leads?.email?.toLowerCase().includes(searchLower) ||
              result.assessments?.name?.toLowerCase().includes(searchLower)
          )
        }
        
        setResults(filteredResults)
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
        return <Badge className="bg-green-500">ممتاز</Badge>
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
        <h1 className="text-3xl font-bold mb-2">نتائج الزبائن</h1>
        <p className="text-muted-foreground">عرض جميع نتائج التقييم للزبائن المحتملين</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم، البريد، أو التقييم..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={assessmentFilter} onValueChange={setAssessmentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="جميع التقييمات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التقييمات</SelectItem>
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={profileFilter} onValueChange={setProfileFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="جميع الملفات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الملفات</SelectItem>
                <SelectItem value="excellent">ممتاز</SelectItem>
                <SelectItem value="good">جيد</SelectItem>
                <SelectItem value="needs_improvement">يحتاج تحسين</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الزبون المحتمل</TableHead>
                  <TableHead>التقييم</TableHead>
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
                        <Link
                          href={`/admin/leads/${result.lead_id}`}
                          className="text-primary hover:underline"
                        >
                          {result.leads?.name || result.leads?.email || '-'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {result.assessments?.name || result.assessments?.key || result.assessment_id || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {result.total_score?.toFixed(1) || '-'}
                      </TableCell>
                      <TableCell>
                        {getProfileBadge(result.result_profiles?.key || result.profile_id || '-')}
                      </TableCell>
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

