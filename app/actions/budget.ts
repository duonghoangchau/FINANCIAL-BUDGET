'use server'

import { createAdminClient, createClientServer } from '@/lib/supabase'
import { nowMonth } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function currentUser() {
  const supabase = createClientServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return user
}

const toNumber = (value: FormDataEntryValue | null) => Number(value || 0)
const toText = (value: FormDataEntryValue | null) => String(value || '').trim()

function safeReturnPath(value: string | null | undefined, fallback: string) {
  const path = String(value || '').trim()

  if (
    path.startsWith('/dashboard') ||
    path.startsWith('/transactions') ||
    path.startsWith('/month-details') ||
    path.startsWith('/buckets')
  ) {
    return path
  }

  return fallback
}

function withStatus(path: string, key: 'error' | 'success', value: string) {
  const [pathname, query = ''] = path.split('?')
  const params = new URLSearchParams(query)
  params.set(key, value)
  return `${pathname}?${params.toString()}`
}

function redirectBucketError(message: string): never {
  redirect(withStatus('/buckets', 'error', message))
}

function redirectBucketSuccess(code: string): never {
  redirect(withStatus('/buckets', 'success', code))
}

function redirectToPathError(path: string, message: string): never {
  redirect(withStatus(path, 'error', message))
}

function redirectToPathSuccess(path: string, code: string): never {
  redirect(withStatus(path, 'success', code))
}

function validateNonNegativeNumber(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    redirectBucketError(`${field} không hợp lệ`)
  }
}

function touchBudgetPaths() {
  revalidatePath('/buckets')
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
  revalidatePath('/reports')
  revalidatePath('/month-details')
}

export async function saveMonthlyBudget(formData: FormData) {
  const user = await currentUser()
  const admin = createAdminClient()
  const { month, year } = nowMonth()
  const income = Number(formData.get('income') || 0)
  const returnTo = safeReturnPath(toText(formData.get('return_to')), '/dashboard')

  const { error: budgetError } = await admin
    .from('monthly_budgets')
    .upsert({ user_id: user.id, month, year, income }, { onConflict: 'user_id,month,year' })
  if (budgetError) redirectToPathError(returnTo, 'Không thể lưu ngân sách tháng')

  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'UPSERT_MONTHLY_BUDGET',
    target: 'monthly_budgets',
    after_data: { month, year, income },
  })

  revalidatePath('/dashboard')
  redirectToPathSuccess(returnTo, 'budget_saved')
}

export async function createBucket(formData: FormData) {
  const user = await currentUser()
  const admin = createAdminClient()
  const name = toText(formData.get('name'))
  const allocatedAmount = toNumber(formData.get('allocated_amount'))
  const currentBalanceValue = formData.get('current_balance')
  const currentBalance =
    currentBalanceValue === null || String(currentBalanceValue).trim() === ''
      ? allocatedAmount
      : toNumber(currentBalanceValue)
  const targetAmount = toNumber(formData.get('target_amount'))

  if (!name) redirectBucketError('Tên hũ là bắt buộc')

  validateNonNegativeNumber(allocatedAmount, 'Số tiền phân bổ')
  validateNonNegativeNumber(currentBalance, 'Số dư hiện tại')
  validateNonNegativeNumber(targetAmount, 'Mục tiêu')

  const payload = {
    user_id: user.id,
    name,
    description: toText(formData.get('description')),
    color: toText(formData.get('color')) || '#16a34a',
    icon: toText(formData.get('icon')) || 'Wallet',
    allocated_amount: allocatedAmount,
    current_balance: currentBalance,
    target_amount: targetAmount,
    is_rollover: formData.get('is_rollover') === 'on',
    calculation_mode: toText(formData.get('calculation_mode')) || 'end_of_day',
  }

  const { error: createError } = await admin.from('buckets').insert(payload)
  if (createError) redirectBucketError('Không thể tạo hũ lúc này')

  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'CREATE_BUCKET',
    target: 'buckets',
    after_data: payload,
  })

  touchBudgetPaths()
  redirectBucketSuccess('created')
}

export async function updateBucket(formData: FormData) {
  const user = await currentUser()
  const admin = createAdminClient()
  const bucketId = toText(formData.get('bucket_id'))
  const name = toText(formData.get('name'))
  const allocatedAmount = toNumber(formData.get('allocated_amount'))
  const currentBalance = toNumber(formData.get('current_balance'))
  const targetAmount = toNumber(formData.get('target_amount'))

  if (!bucketId) redirectBucketError('Không tìm thấy hũ cần cập nhật')
  if (!name) redirectBucketError('Tên hũ là bắt buộc')

  validateNonNegativeNumber(allocatedAmount, 'Số tiền phân bổ')
  validateNonNegativeNumber(currentBalance, 'Số dư hiện tại')
  validateNonNegativeNumber(targetAmount, 'Mục tiêu')

  const { data: bucket, error: bucketError } = await admin
    .from('buckets')
    .select('*')
    .eq('id', bucketId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (bucketError) redirectBucketError('Không thể tải thông tin hũ để cập nhật')
  if (!bucket) redirectBucketError('Hũ tài chính không tồn tại')

  const payload = {
    name,
    description: toText(formData.get('description')),
    color: toText(formData.get('color')) || '#16a34a',
    allocated_amount: allocatedAmount,
    current_balance: currentBalance,
    target_amount: targetAmount,
    is_rollover: formData.get('is_rollover') === 'on',
    calculation_mode: toText(formData.get('calculation_mode')) || 'end_of_day',
  }

  const { error: updateError } = await admin
    .from('buckets')
    .update(payload)
    .eq('id', bucketId)
    .eq('user_id', user.id)
  if (updateError) redirectBucketError('Không thể lưu chỉnh sửa cho hũ này')

  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'UPDATE_BUCKET',
    target: 'buckets',
    before_data: bucket,
    after_data: { id: bucketId, ...payload },
  })

  touchBudgetPaths()
  redirectBucketSuccess('updated')
}

export async function deleteBucket(formData: FormData) {
  const user = await currentUser()
  const admin = createAdminClient()
  const bucketId = toText(formData.get('bucket_id'))

  if (!bucketId) redirectBucketError('Không tìm thấy hũ cần xóa')

  const { data: bucket, error: bucketError } = await admin
    .from('buckets')
    .select('*')
    .eq('id', bucketId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (bucketError) redirectBucketError('Không thể tải thông tin hũ để xóa')
  if (!bucket) redirectBucketError('Hũ tài chính không tồn tại')

  const { error: deleteError } = await admin
    .from('buckets')
    .delete()
    .eq('id', bucketId)
    .eq('user_id', user.id)
  if (deleteError) redirectBucketError('Không thể xóa hũ này')

  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'DELETE_BUCKET',
    target: 'buckets',
    before_data: bucket,
  })

  touchBudgetPaths()
  redirectBucketSuccess('deleted')
}

export async function addExpense(formData: FormData) {
  const user = await currentUser()
  const admin = createAdminClient()
  const bucketId = String(formData.get('bucket_id') || '')
  const amount = Number(formData.get('amount') || 0)
  const returnTo = safeReturnPath(toText(formData.get('return_to')), '/transactions')

  const { data: bucket, error: bucketError } = await admin
    .from('buckets')
    .select('*')
    .eq('id', bucketId)
    .eq('user_id', user.id)
    .single()

  if (bucketError || !bucket) redirectToPathError(returnTo, 'Không tìm thấy hũ')
  if (!Number.isFinite(amount) || amount <= 0) redirectToPathError(returnTo, 'Số tiền không hợp lệ')
  if (Number(bucket.current_balance) < amount) {
    redirectToPathError(returnTo, 'Số dư trong hũ không đủ')
  }

  const { error: transactionError } = await admin.from('transactions').insert({
    user_id: user.id,
    bucket_id: bucketId,
    type: 'expense',
    amount,
    category: String(formData.get('category') || 'Khác'),
    note: String(formData.get('note') || ''),
    occurred_at: String(formData.get('occurred_at') || new Date().toISOString()),
  })
  if (transactionError) redirectToPathError(returnTo, 'Không thể lưu giao dịch')

  const { error: updateError } = await admin
    .from('buckets')
    .update({ current_balance: Number(bucket.current_balance) - amount })
    .eq('id', bucketId)
    .eq('user_id', user.id)
  if (updateError) {
    redirectToPathError(returnTo, 'Đã lưu giao dịch nhưng không thể cập nhật số dư hũ')
  }

  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'ADD_EXPENSE',
    target: 'transactions',
    after_data: { bucketId, amount },
  })

  touchBudgetPaths()
  redirectToPathSuccess(returnTo, 'expense_created')
}

export async function transferBucket(formData: FormData) {
  const user = await currentUser()
  const admin = createAdminClient()
  const from = String(formData.get('from_bucket_id') || '')
  const to = String(formData.get('to_bucket_id') || '')
  const amount = Number(formData.get('amount') || 0)

  if (from === to) redirectBucketError('Vui lòng chọn 2 hũ khác nhau')
  if (!Number.isFinite(amount) || amount <= 0) redirectBucketError('Số tiền chuyển không hợp lệ')

  const { data: buckets, error: bucketsError } = await admin
    .from('buckets')
    .select('*')
    .eq('user_id', user.id)
    .in('id', [from, to])

  if (bucketsError) redirectBucketError('Không thể tải thông tin hũ để chuyển tiền')

  const src = buckets?.find((bucket: any) => bucket.id === from)
  const dst = buckets?.find((bucket: any) => bucket.id === to)

  if (!src || !dst || Number(src.current_balance) < amount) {
    redirectBucketError('Không đủ số dư để chuyển')
  }

  const { error: srcUpdateError } = await admin
    .from('buckets')
    .update({
      current_balance: Number(src.current_balance) - amount,
      allocated_amount: Math.max(0, Number(src.allocated_amount || 0) - amount),
    })
    .eq('id', from)
  if (srcUpdateError) redirectBucketError('Không thể trừ tiền khỏi hũ nguồn')

  const { error: dstUpdateError } = await admin
    .from('buckets')
    .update({
      current_balance: Number(dst.current_balance) + amount,
      allocated_amount: Number(dst.allocated_amount || 0) + amount,
    })
    .eq('id', to)
  if (dstUpdateError) redirectBucketError('Không thể cộng tiền vào hũ đích')

  const { error: transactionError } = await admin.from('transactions').insert([
    {
      user_id: user.id,
      bucket_id: from,
      type: 'transfer_out',
      amount,
      category: 'Chuyển hũ',
      note: `Sang ${dst.name}`,
    },
    {
      user_id: user.id,
      bucket_id: to,
      type: 'transfer_in',
      amount,
      category: 'Chuyển hũ',
      note: `Từ ${src.name}`,
    },
  ])
  if (transactionError) redirectBucketError('Đã chuyển số dư nhưng không thể ghi nhận giao dịch')

  touchBudgetPaths()
  redirectBucketSuccess('transferred')
}
