import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const state = crypto.randomBytes(16).toString('hex')
  const clientId = process.env.MP_CLIENT_ID
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  const redirectUri = `${baseUrl}/api/auth/mercadopago/callback`

  const authUrl = new URL('https://auth.mercadopago.com/authorization')
  authUrl.searchParams.set('client_id', clientId || '')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('redirect_uri', redirectUri)

  const response = NextResponse.redirect(authUrl.toString())

  // Cookie de seguridad estándar para CSRF
  response.cookies.set('mp_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  return response
}
