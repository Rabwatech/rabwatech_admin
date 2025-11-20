import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      )
    }

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
      console.error('Auth error:', authError?.message)
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Check if user is admin
    let adminClient
    try {
      adminClient = createAdminClient()
    } catch (error: any) {
      console.error('Error creating admin client:', error.message)
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      )
    }

    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', authData.user.id)
      .single()

    if (userError) {
      console.error('Database error fetching user:', userError)
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    if (!userData) {
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
    const { error: updateError } = await adminClient
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id)

    if (updateError) {
      console.error('Error updating last login:', updateError)
      // Don't fail the login if last_login update fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      },
    })
  } catch (error: any) {
    console.error('Login error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء تسجيل الدخول',
        // Include error message in development for debugging
        ...(process.env.NODE_ENV === 'development' && { details: error?.message })
      },
      { status: 500 }
    )
  }
}

