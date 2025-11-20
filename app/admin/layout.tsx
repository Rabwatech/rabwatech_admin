import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { getAdminUser } from '@/lib/admin/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Skip auth check for login page - middleware handles it
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const adminUser = await getAdminUser()

  if (!adminUser || adminUser.role !== 'admin' || !adminUser.is_active) {
    redirect('/admin/login')
  }

  return <AdminLayout>{children}</AdminLayout>
}

