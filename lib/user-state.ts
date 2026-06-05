import { createAdminClient } from '@/lib/supabase'
import { isMonthlySpendingBucket } from '@/lib/utils'

type AuthUserLike = {
  id: string
  email?: string | null
  user_metadata?: {
    full_name?: string
  } | null
}

function throwIfError(result: { error?: { message?: string } | null }, label: string) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message || 'Unknown Supabase error'}`)
  }
}

export async function ensureUserProfileAndDefaultBucket(user: AuthUserLike) {
  const admin = createAdminClient()
  const email = user.email || ''
  const fullName = user.user_metadata?.full_name || ''

  const profileById = await admin.from('profiles').select('*').eq('id', user.id).maybeSingle()
  throwIfError(profileById, 'Unable to load profile by auth user id')

  if (!profileById.data) {
    const profileByEmail = email
      ? await admin.from('profiles').select('*').eq('email', email).maybeSingle()
      : { data: null, error: null }

    throwIfError(profileByEmail, 'Unable to load profile by email')

    if (profileByEmail.data && profileByEmail.data.id !== user.id) {
      const orphanProfileId = profileByEmail.data.id
      const insertProfile = await admin.from('profiles').insert({
        id: user.id,
        full_name: profileByEmail.data.full_name || fullName,
        email,
        avatar_url: profileByEmail.data.avatar_url,
        currency: profileByEmail.data.currency || 'VND',
        timezone: profileByEmail.data.timezone || 'Asia/Ho_Chi_Minh',
        theme: profileByEmail.data.theme || 'light',
        role: profileByEmail.data.role || 'user',
        is_banned: Boolean(profileByEmail.data.is_banned),
      })
      throwIfError(insertProfile, 'Unable to recreate profile for current auth user')

      const migrationResults = await Promise.all([
        admin.from('monthly_budgets').update({ user_id: user.id }).eq('user_id', orphanProfileId),
        admin.from('buckets').update({ user_id: user.id }).eq('user_id', orphanProfileId),
        admin.from('transactions').update({ user_id: user.id }).eq('user_id', orphanProfileId),
        admin.from('notifications').update({ user_id: user.id }).eq('user_id', orphanProfileId),
        admin.from('audit_logs').update({ actor_id: user.id }).eq('actor_id', orphanProfileId),
      ])

      throwIfError(migrationResults[0], 'Unable to migrate monthly budgets to current auth user')
      throwIfError(migrationResults[1], 'Unable to migrate buckets to current auth user')
      throwIfError(migrationResults[2], 'Unable to migrate transactions to current auth user')
      throwIfError(migrationResults[3], 'Unable to migrate notifications to current auth user')
      throwIfError(migrationResults[4], 'Unable to migrate audit logs to current auth user')

      const deleteOldProfile = await admin.from('profiles').delete().eq('id', orphanProfileId)
      throwIfError(deleteOldProfile, 'Unable to remove orphaned profile')
    } else {
      const insertProfile = await admin.from('profiles').insert({
        id: user.id,
        full_name: fullName,
        email,
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
      })
      throwIfError(insertProfile, 'Unable to create profile for current auth user')
    }
  }

  const bucketRows = await admin.from('buckets').select('id,name').eq('user_id', user.id)
  throwIfError(bucketRows, 'Unable to load buckets for current auth user')

  const hasMonthlyBucket = (bucketRows.data || []).some((bucket: any) => isMonthlySpendingBucket(bucket.name))

  if (!hasMonthlyBucket) {
    const insertBucket = await admin.from('buckets').insert({
      user_id: user.id,
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
    throwIfError(insertBucket, 'Unable to create default monthly spending bucket')
  }
}

export function assertNoQueryErrors(
  results: Array<{ error?: { message?: string } | null }>,
  labels: string[],
) {
  for (let index = 0; index < results.length; index += 1) {
    throwIfError(results[index], labels[index] || `Query ${index + 1} failed`)
  }
}
