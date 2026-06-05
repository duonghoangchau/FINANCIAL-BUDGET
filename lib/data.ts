import { createAdminClient, createClientServer } from '@/lib/supabase'
import { assertNoQueryErrors, ensureUserProfileAndDefaultBucket } from '@/lib/user-state'
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
  await ensureUserProfileAndDefaultBucket(user)
  const admin = createAdminClient()
  const { month, year } = nowMonth()

  const [profileResult, budgetResult, bucketsResult, transactionsResult] =
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

  assertNoQueryErrors(
    [profileResult, budgetResult, bucketsResult, transactionsResult],
    [
      'Unable to load profile',
      'Unable to load monthly budget',
      'Unable to load buckets',
      'Unable to load transactions',
    ],
  )

  return {
    user,
    profile: profileResult.data,
    budget: budgetResult.data,
    buckets: bucketsResult.data || [],
    transactions: transactionsResult.data || [],
    month,
    year,
  }
}

export async function getMonthDetailData(requestedMonth?: number, requestedYear?: number) {
  const user = await requireUser()
  await ensureUserProfileAndDefaultBucket(user)
  const admin = createAdminClient()
  const { month, year } = normalizeMonthYear(requestedMonth, requestedYear)
  const { start, end } = monthRange(month, year)

  const [profileResult, budgetResult, bucketsResult, transactionsResult] =
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

  assertNoQueryErrors(
    [profileResult, budgetResult, bucketsResult, transactionsResult],
    [
      'Unable to load profile',
      'Unable to load monthly budget',
      'Unable to load buckets',
      'Unable to load monthly transactions',
    ],
  )

  return {
    user,
    profile: profileResult.data,
    budget: budgetResult.data,
    buckets: bucketsResult.data || [],
    transactions: transactionsResult.data || [],
    month,
    year,
  }
}
