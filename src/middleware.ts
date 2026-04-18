/**
 * Next.js Middleware — Protects /admin/* and /api/admin/* routes.
 * 
 * Verifies that a valid Supabase session exists via cookies.
 * For API routes, returns 401 JSON. For pages, redirects to /login.
 * 
 * NOTE: Detailed role checks happen inside each API route handler
 * using the withAuth() wrapper. The middleware only checks session existence.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect admin routes
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next()
  }

  // Create a response we can modify (needed for cookie handling)
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // No session → block access
  if (!session) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión.' },
        { status: 401 }
      )
    }
    // Redirect to login for admin pages
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Session exists → verify role for admin access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isMainAdmin = session.user.email === 'jajl840316@gmail.com'
  const allowedRoles = ['admin', 'manager', 'staff', 'kitchen', 'cashier', 'delivery', 'waiter']
  const userRole = isMainAdmin ? 'admin' : profile?.role

  if (!isMainAdmin && (!userRole || !allowedRoles.includes(userRole))) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta sección.' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
