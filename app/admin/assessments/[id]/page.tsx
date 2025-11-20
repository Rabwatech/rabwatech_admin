'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { AssessmentForm } from '@/components/admin/assessments/AssessmentForm'
import { PillarsManager } from '@/components/admin/assessments/PillarsManager'
import { QuestionsManager } from '@/components/admin/assessments/QuestionsManager'
import { ResultProfilesManager } from '@/components/admin/assessments/ResultProfilesManager'

export default function AssessmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const assessmentId = params.id as string

  useEffect(() => {
    fetchAssessment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId])

  const fetchAssessment = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/assessments/${assessmentId}`)
      const data = await response.json()

      if (response.ok) {
        setAssessment(data.assessment)
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات التقييم',
          variant: 'destructive',
        })
        router.push('/admin/assessments')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
      router.push('/admin/assessments')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = () => {
    fetchAssessment()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">منشور</Badge>
      case 'draft':
        return <Badge variant="secondary">مسودة</Badge>
      case 'archived':
        return <Badge variant="outline">مؤرشف</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      growth_indicator: 'مؤشر النمو',
      trackp: 'TrackP',
      trackb: 'TrackB',
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!assessment) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/assessments">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{assessment.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">{assessment.key}</span>
              <span className="text-muted-foreground">•</span>
              {getStatusBadge(assessment.status)}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{getTypeLabel(assessment.type)}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">معلومات التقييم</TabsTrigger>
          <TabsTrigger value="pillars">الأعمدة ({assessment.pillars_count || 0})</TabsTrigger>
          <TabsTrigger value="questions">الأسئلة ({assessment.questions_count || 0})</TabsTrigger>
          <TabsTrigger value="profiles">ملفات النتائج</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <AssessmentForm assessmentId={assessmentId} onSuccess={handleFormSuccess} />
        </TabsContent>

        <TabsContent value="pillars" className="space-y-4">
          <PillarsManager assessmentId={assessmentId} onUpdate={fetchAssessment} />
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <QuestionsManager assessmentId={assessmentId} onUpdate={fetchAssessment} />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <ResultProfilesManager assessmentId={assessmentId} onUpdate={fetchAssessment} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

