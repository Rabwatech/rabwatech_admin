'use client'

import { ServiceForm } from '@/components/admin/services/ServiceForm'
import { useRouter } from 'next/navigation'

export default function NewServicePage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/services')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">إنشاء خدمة جديدة</h1>
        <p className="text-muted-foreground">إنشاء خدمة جديدة</p>
      </div>
      <ServiceForm onSuccess={handleSuccess} onCancel={() => router.back()} />
    </div>
  )
}

