'use client'

import { CampaignForm } from '@/components/admin/campaigns/CampaignForm'
import { useRouter } from 'next/navigation'

export default function NewCampaignPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/campaigns')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">إنشاء حملة جديدة</h1>
        <p className="text-muted-foreground">إنشاء حملة تسويقية جديدة</p>
      </div>
      <CampaignForm onSuccess={handleSuccess} onCancel={() => router.back()} />
    </div>
  )
}

