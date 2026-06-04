'use server'
import { createClientServer, createAdminClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = createClientServer()
  const fullName = String(formData.get('full_name') || '')
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  if (error) redirect('/register?error=' + encodeURIComponent(error.message))
  if (data.user) {
    const admin = createAdminClient()
    await admin.from('profiles').upsert({ id: data.user.id, full_name: fullName, email, currency: 'VND', timezone: 'Asia/Ho_Chi_Minh' })
    const { data: defaultBucket } = await admin
      .from('buckets')
      .select('id')
      .eq('user_id', data.user.id)
      .eq('name', 'Chi tiêu tháng')
      .maybeSingle()

    if (!defaultBucket) {
      await admin.from('buckets').insert({
        user_id: data.user.id,
        name: 'Chi tiêu tháng',
        description: 'Hũ mặc định để theo dõi chi tiêu sinh hoạt theo ngày trong tháng.',
        color: '#0f766e',
        icon: 'Wallet',
        allocated_amount: 0,
        current_balance: 0,
        target_amount: 0,
        is_rollover: false,
        calculation_mode: 'realtime',
      })
    }
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
