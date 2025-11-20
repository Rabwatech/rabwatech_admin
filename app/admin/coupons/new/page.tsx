'use client'

import { CouponForm } from '@/components/admin/coupons/CouponForm'
import { useRouter } from 'next/navigation'

export default function NewCouponPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/coupons')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">إنشاء كوبون جديد</h1>
        <p className="text-muted-foreground">إنشاء كوبون ترويجي جديد</p>
      </div>
      <CouponForm onSuccess={handleSuccess} onCancel={() => router.back()} />
    </div>
  )
}

