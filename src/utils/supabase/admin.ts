import { createClient } from '@supabase/supabase-js'

// Pattern para instanciar el cliente en desarrollo y no crear demasiadas instancias por culpa del HMR
// y la naturaleza serverless en Next.js.
const globalForSupabaseAdmin = globalThis as unknown as {
  supabaseAdmin: ReturnType<typeof createClient<any, string, any>> | undefined
}

export const getSupabaseAdmin = () => {
  if (!globalForSupabaseAdmin.supabaseAdmin) {
    globalForSupabaseAdmin.supabaseAdmin = createClient<any, string, any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  return globalForSupabaseAdmin.supabaseAdmin
}
