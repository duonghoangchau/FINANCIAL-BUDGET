import { createAdminClient, createClientServer } from '@/lib/supabase'
import { monthRange, normalizeMonthYear, nowMonth } from '@/lib/utils'
import { redirect } from 'next/navigation'

async function requireUser() {
  const supabase = createClientServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return user
}

export async function getUserData() {
  const user = await requireUser()
  const admin = createAdminClient()
  const { month, year } = nowMonth()

  const [{ data: profile }, { data: budget }, { data: buckets }, { data: transactions }] =
    await Promise.all([
      admin.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      admin
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle(),
      admin.from('buckets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      admin
        .from('transactions')
        .select('*, buckets(name,color)')
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false })
        .limit(50),
    ])

  return {
    user,
    profile,
    budget,
    buckets: buckets || [],
    transactions: transactions || [],
    month,
    year,
  }
}

export async function getMonthDetailData(requestedMonth?: number, requestedYear?: number) {
  const user = await requireUser()
  const admin = createAdminClient()
  const { month, year } = normalizeMonthYear(requestedMonth, requestedYear)
  const { start, end } = monthRange(month, year)

  const [{ data: profile }, { data: budget }, { data: buckets }, { data: transactions }] =
    await Promise.all([
      admin.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      admin
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle(),
      admin.from('buckets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      admin
        .from('transactions')
        .select('*, buckets(name,color)')
        .eq('user_id', user.id)
        .gte('occurred_at', start.toISOString())
        .lt('occurred_at', end.toISOString())
        .order('occurred_at', { ascending: true }),
    ])

  return {
    user,
    profile,
    budget,
    buckets: buckets || [],
    transactions: transactions || [],
    month,
    year,
  }
}
