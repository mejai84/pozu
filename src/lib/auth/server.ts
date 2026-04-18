/**
 * Server-side authentication helper for API routes.
 * Uses @supabase/ssr to read session from cookies.
 * 
 * Usage in API routes:
 *   const auth = await requireAuth(request)           // any authenticated user
 *   const auth = await requireAuth(request, ['admin']) // only admin role
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface AuthResult {
  userId: string
  email: string
  role: string
}

/**
 * Creates a Supabase server client that reads cookies from the request.
 * This is for use in API route handlers and server components.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Cookie setting may fail in some contexts (e.g., middleware)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options })
          } catch {
            // Cookie deletion may fail in some contexts
          }
        },
      },
    }
  )
}

/**
 * Verifies that the request has a valid authenticated session.
 * Optionally checks that the user has one of the allowed roles.
 * 
 * @throws Response with 401 if not authenticated
 * @throws Response with 403 if role not allowed
 */
export async function requireAuth(
  _request: Request,
  allowedRoles?: string[]
): Promise<AuthResult> {
  const supabase = await createServerSupabase()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Response(
      JSON.stringify({ error: 'No autorizado. Inicia sesión.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Get the user's role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  // Special admin bypass (matches existing logic in admin/layout.tsx)
  const isMainAdmin = session.user.email === 'jajl840316@gmail.com'
  const userRole = isMainAdmin ? 'admin' : profile?.role

  if (profileError && !isMainAdmin) {
    throw new Response(
      JSON.stringify({ error: 'No autorizado. Perfil no encontrado.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Check role if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new Response(
        JSON.stringify({ error: 'No tienes permisos para esta acción.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return {
    userId: session.user.id,
    email: session.user.email || '',
    role: userRole || 'unknown',
  }
}

/**
 * Wraps an API route handler with auth verification.
 * Catches auth errors and returns proper HTTP responses.
 * 
 * Usage:
 *   export const POST = withAuth(['admin'], async (req, auth) => { ... })
 */
export function withAuth(
  allowedRoles: string[],
  handler: (req: Request, auth: AuthResult) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    try {
      const auth = await requireAuth(req, allowedRoles)
      return await handler(req, auth)
    } catch (error) {
      if (error instanceof Response) {
        return error
      }
      console.error('Auth wrapper error:', error)
      return new Response(
        JSON.stringify({ error: 'Error interno del servidor.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}
