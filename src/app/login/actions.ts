'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rememberMe = formData.get('rememberMe') === 'on'

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('Login error:', error)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Store remember me preference in a cookie
  const cookieStore = await cookies()
  const prefValue = rememberMe ? 'true' : 'false'
  
  cookieStore.set('turnos_remember_me', prefValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const requestedSlug = formData.get('requestedSlug') as string | null
  const rememberMe = formData.get('rememberMe') === 'on'

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup error:', error)
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // Store remember me preference in a cookie
  const cookieStore = await cookies()
  const prefValue = rememberMe ? 'true' : 'false'
  
  cookieStore.set('turnos_remember_me', prefValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  // Create public profile
  if (data.user) {
    let slug = requestedSlug?.trim() || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    
    // Check if slug is taken
    const { data: existing } = await supabase.from('profiles').select('slug').eq('slug', slug).single()
    
    if (existing) {
      // If taken, append random number
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`
    }
    
    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      slug: slug,
      brand_color: '#3b82f6'
    })
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
