import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'moderator' | 'user'

export interface AdminUser {
  id: string
  email: string
  role: UserRole
  is_active: boolean
  last_login?: string
  created_at: string
}

/**
 * Get current admin user with role check
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const adminClient = createAdminClient()
    const { data: userData, error } = await adminClient
      .from('users')
      .select('id, email, role, is_active, last_login, created_at')
      .eq('id', user.id)
      .single()

    if (error || !userData) {
      return null
    }

    return userData as AdminUser
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

/**
 * Check if user is admin
 */
export async function requireAdmin(): Promise<AdminUser> {
  const adminUser = await getAdminUser()

  if (!adminUser || adminUser.role !== 'admin') {
    redirect('/admin/login')
  }

  return adminUser
}

/**
 * Check if user is admin or moderator
 */
export async function requireAdminOrModerator(): Promise<AdminUser> {
  const adminUser = await getAdminUser()

  if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'moderator')) {
    redirect('/admin/login')
  }

  return adminUser
}

/**
 * Check if user is active
 */
export async function requireActiveAdmin(): Promise<AdminUser> {
  const adminUser = await requireAdmin()

  if (!adminUser.is_active) {
    redirect('/admin/login?error=inactive')
  }

  return adminUser
}

