import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create response once at the start
  const response = NextResponse.next({
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
            // Update cookies on the existing response instead of creating a new one
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      // Don't redirect if already authenticated - let the user stay on login page
      // This prevents redirect loops when NEXT_PUBLIC_BASE_URL is set
      if (user) {
        // Only check user status, but don't redirect automatically
        // Let the login page handle the redirect after successful login
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('role, is_active')
            .eq('id', user.id)
            .single()

          // If user is admin and active, they can stay on login page
          // The login form will handle redirect after submission
          if (userData?.role === 'admin' && userData?.is_active) {
            // Don't redirect here - let the login page handle it
            // This prevents loops when NEXT_PUBLIC_BASE_URL causes redirects
          }
        } catch (error) {
          // If there's an error checking user, allow access to login page
          console.error('Error checking user in middleware:', error)
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
      // Prevent redirect loops by checking if we're already redirecting to login
      const loginUrl = new URL('/admin/login', request.url)
      // Don't redirect if already going to login page
      if (request.nextUrl.pathname !== '/admin/login') {
        return NextResponse.redirect(loginUrl)
      }
      return response
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

