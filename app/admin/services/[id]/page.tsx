'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { ServiceForm } from '@/components/admin/services/ServiceForm'

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const serviceId = params.id as string

  useEffect(() => {
    if (serviceId) {
      fetchService()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

  const fetchService = async () => {
    if (!serviceId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`)
      const data = await response.json()

      if (response.ok) {
        setService(data.service)
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب بيانات الخدمة',
          variant: 'destructive',
        })
        router.push('/admin/services')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
      router.push('/admin/services')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = () => {
    fetchService()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!service) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/services">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {service.service_name_ar || service.service_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground font-mono text-sm">{service.service_code}</span>
            </div>
          </div>
        </div>
      </div>

      <ServiceForm serviceId={parseInt(serviceId)} onSuccess={handleFormSuccess} />
    </div>
  )
}

