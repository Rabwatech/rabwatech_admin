import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      if (user) {
        // Check if user is admin
        const { data: userData } = await supabase
          .from('users')
          .select('role, is_active')
          .eq('id', user.id)
          .single()

        if (userData?.role === 'admin' && userData?.is_active) {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
      }
      // Set header to indicate this is the login page
      response.headers.set('x-pathname', '/admin/login')
      return response
    }
    
    // Set pathname header for other routes
    response.headers.set('x-pathname', request.nextUrl.pathname)

    // Require authentication for all other admin routes
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin' || !userData.is_active) {
      return NextResponse.redirect(
        new URL('/admin/login?error=unauthorized', request.url)
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}

