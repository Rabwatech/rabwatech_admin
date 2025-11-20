'use client'

import { useRouter } from 'next/navigation'
import { AssessmentForm } from '@/components/admin/assessments/AssessmentForm'

export default function NewAssessmentPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/assessments')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">إنشاء تقييم جديد</h1>
        <p className="text-muted-foreground">أدخل معلومات التقييم الأساسية</p>
      </div>
      <AssessmentForm onSuccess={handleSuccess} onCancel={() => router.push('/admin/assessments')} />
    </div>
  )
}

