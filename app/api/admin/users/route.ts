import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const isActive = searchParams.get('is_active')

    const adminClient = createAdminClient()
    let query = adminClient.from('users').select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    // Get total count
    const { count } = await query

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error } = await query.range(from, to).order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      users: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب المستخدمين' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { email, password, role, is_active } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: authError?.message || 'حدث خطأ أثناء إنشاء المستخدم في نظام المصادقة' },
        { status: 500 }
      )
    }

    // Create user record in users table
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        role: role || 'user',
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single()

    if (userError) {
      // If user creation in users table fails, try to delete the auth user
      await adminClient.auth.admin.deleteUser(authData.user.id)
      console.error('Error creating user record:', userError)
      return NextResponse.json(
        { error: userError.message || 'حدث خطأ أثناء إنشاء سجل المستخدم' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        user: userData,
        message: 'تم إنشاء المستخدم بنجاح',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء المستخدم' },
      { status: 500 }
    )
  }
}

