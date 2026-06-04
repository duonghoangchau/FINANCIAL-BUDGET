import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClientBrowser() {
  return createBrowserClient(url, anon)
}

export function createClientServer() {
  const cookieStore = cookies()
  return createServerClient(url, anon, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
      set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
      remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) }
    }
  })
}

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}
