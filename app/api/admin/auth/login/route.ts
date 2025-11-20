import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Sign in user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminClient = createAdminClient()
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    if (userData.role !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'ليس لديك صلاحية للوصول إلى لوحة التحكم' },
        { status: 403 }
      )
    }

    if (!userData.is_active) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'حسابك غير مفعّل. يرجى الاتصال بالمسؤول' },
        { status: 403 }
      )
    }

    // Update last login
    await adminClient
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}

