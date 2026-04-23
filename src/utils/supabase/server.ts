import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  // Get remember me preference
  const rememberMeCookie = cookieStore.get('turnos_remember_me')?.value
  const rememberMe = rememberMeCookie ? rememberMeCookie === 'true' : true // Default to true if not set

  return createServerClient<any, string>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          return allCookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value
          }))
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Apply "Remember Me" preference:
              // If false, convert to session cookie by removing expiration
              if (!rememberMe && name.startsWith('sb-')) {
                delete options.maxAge
                delete (options as any).expires
              }
              
              // Enforce security flags
              options.httpOnly = true
              options.secure = process.env.NODE_ENV === 'production'
              options.sameSite = 'lax'

              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}
