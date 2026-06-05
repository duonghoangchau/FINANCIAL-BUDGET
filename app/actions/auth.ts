'use server'

import { createClientServer } from '@/lib/supabase'
import { ensureUserProfileAndDefaultBucket } from '@/lib/user-state'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = createClientServer()
  const fullName = String(formData.get('full_name') || '')
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: 'https://financial-budget-alpha.vercel.app/login',
    },
  })

  if (error) redirect('/register?error=' + encodeURIComponent(error.message))

  if (data.user) {
    await ensureUserProfileAndDefaultBucket({
      id: data.user.id,
      email,
      user_metadata: { full_name: fullName },
    })
  }

  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const supabase = createClientServer()
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=' + encodeURIComponent(error.message))
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClientServer()
  await supabase.auth.signOut()
  redirect('/login')
}
