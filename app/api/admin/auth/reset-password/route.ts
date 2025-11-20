import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * Admin endpoint to reset user password
 * This uses the service role key to bypass RLS
 * 
 * Usage: POST /api/admin/auth/reset-password
 * Body: { email: string, newPassword: string }
 */
export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور الجديدة مطلوبان' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Find user by email
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء البحث عن المستخدم' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Update user password using admin API
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تحديث كلمة المرور' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح',
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
      },
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' },
      { status: 500 }
    )
  }
}

