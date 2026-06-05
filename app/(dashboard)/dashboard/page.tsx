import { addExpense, saveMonthlyBudget } from '@/app/actions/budget'
import { ImmediateRebalanceForecast } from '@/components/ImmediateRebalanceForecast'
import { MoneyInput } from '@/components/MoneyInput'
import { getUserData } from '@/lib/data'
import {
  calculateDailyBucketBudget,
  calculateFutureDailyBucketBudget,
  calculateRemainingTodayBudget,
  formatMoney,
  isMonthlySpendingBucket,
  percent,
  toDateKey,
} from '@/lib/utils'

const successMessages: Record<string, string> = {
  budget_saved: 'Đã lưu ngân sách tháng thành công.',
  expense_created: 'Đã ghi chi tiêu thành công.',
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { error?: string; success?: string }
}) {
  const { budget, buckets, transactions, month, year } = await getUserData()
  const income = Number(budget?.income || 0)
  const allocated = buckets.reduce(
    (sum: number, bucket: any) => sum + Number(bucket.allocated_amount || 0),
    0,
  )
  const expenseTransactions = transactions.filter((transaction: any) => transaction.type === 'expense')
  const spent = expenseTransactions.reduce(
    (sum: number, transaction: any) => sum + Number(transaction.amount || 0),
    0,
  )
  const monthlySpendingBucket = buckets.find((bucket: any) => isMonthlySpendingBucket(bucket.name))
  const todayKey = toDateKey(new Date())
  const monthlySpendingTransactions = monthlySpendingBucket
    ? expenseTransactions.filter((transaction: any) => transaction.bucket_id === monthlySpendingBucket.id)
    : []
  const spentToday = monthlySpendingTransactions
    .filter((transaction: any) => toDateKey(new Date(transaction.occurred_at)) === todayKey)
    .reduce((sum: number, transaction: any) => sum + Number(transaction.amount || 0), 0)
  const openingBalanceToday = monthlySpendingBucket
    ? Number(monthlySpendingBucket.current_balance || 0) + spentToday
    : 0
  const dayBudget = monthlySpendingBucket
    ? calculateDailyBucketBudget(openingBalanceToday, month, year)
    : 0
  const remainingToday = calculateRemainingTodayBudget(dayBudget, spentToday)
  const futureDaysCount = monthlySpendingBucket
    ? Math.max(0, new Date(year, month, 0).getDate() - new Date().getDate())
    : 0
  const forecastDailyBudget = monthlySpendingBucket
    ? calculateFutureDailyBucketBudget(Number(monthlySpendingBucket.current_balance || 0), month, year)
    : 0
  const successMessage = searchParams.success ? successMessages[searchParams.success] : ''

  return (
    <div>
      <h1 className="text-2xl font-black sm:text-3xl">Dashboard tháng {month}/{year}</h1>
      <p className="mt-1 text-slate-500">Tổng quan dòng tiền, hũ tài chính và hạn mức hôm nay.</p>

      {searchParams.error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{searchParams.error}</div>
      )}
      {successMessage && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-emerald-700">{successMessage}</div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Thu nhập', income],
          ['Đã phân bổ', allocated],
          ['Còn chưa chia', income - allocated],
          ['Đã chi', spent],
        ].map(([label, value]: any) => (
          <div className="card p-5" key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <b className="mt-2 block text-2xl">{formatMoney(value)}</b>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <form action={saveMonthlyBudget} className="card p-6">
          <input type="hidden" name="return_to" value="/dashboard" />
          <h2 className="font-black">Ngân sách tháng</h2>
          <label className="mt-4 block text-sm font-bold">
            Thu nhập tháng
            <MoneyInput name="income" defaultValue={income} className="input mt-2" />
          </label>
          <button className="btn btn-primary mt-4 w-full">Lưu thu nhập</button>
        </form>

        <form action={addExpense} className="card p-6 lg:col-span-2">
          <input type="hidden" name="return_to" value="/dashboard" />
          <h2 className="font-black">Thêm chi tiêu nhanh</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select name="bucket_id" required className="input">
              {buckets.map((bucket: any) => (
                <option key={bucket.id} value={bucket.id}>
                  {bucket.name} - {formatMoney(bucket.current_balance)}
                </option>
              ))}
            </select>
            <MoneyInput name="amount" required className="input" placeholder="Số tiền" />
            <input name="category" className="input" placeholder="Danh mục" />
            <input name="note" className="input" placeholder="Ghi chú" />
            <input name="occurred_at" type="datetime-local" className="input md:col-span-2" />
          </div>
          <button className="btn btn-primary mt-4 w-full md:w-auto">Ghi chi tiêu</button>
        </form>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-black">Các hũ của bạn</h2>
          <div className="mt-4 space-y-4">
            {buckets.map((bucket: any) => (
              <div key={bucket.id}>
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between">
                  <b className="min-w-0 break-words">{bucket.name}</b>
                  <span className="break-words text-slate-600 sm:text-right">
                    {formatMoney(bucket.current_balance)} /{' '}
                    {formatMoney(bucket.target_amount || bucket.allocated_amount)}
                  </span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-emerald-500"
                    style={{
                      width: `${percent(
                        Number(bucket.current_balance),
                        Number(bucket.target_amount || bucket.allocated_amount || 1),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-black">Ngân sách an toàn hôm nay</h2>
          <p className="mt-4 text-4xl font-black text-emerald-600">{formatMoney(dayBudget)}</p>
          <p className="mt-2 text-slate-500">
            {monthlySpendingBucket
              ? `Lấy từ hũ ${monthlySpendingBucket.name}. Mức hôm nay giữ theo đầu ngày, và ngày mai sẽ tự đổi theo số dư còn lại.`
              : 'Tạo hũ tên "Chi tiêu tháng" để hệ thống tự tính hạn mức chi mỗi ngày.'}
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Mức an toàn hôm nay</p>
              <b className="mt-2 block text-xl">{formatMoney(dayBudget)}</b>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Đã chi hôm nay</p>
              <b className="mt-2 block text-xl text-amber-900">{formatMoney(spentToday)}</b>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Còn lại hôm nay</p>
              <b className="mt-2 block text-xl text-emerald-900">{formatMoney(remainingToday)}</b>
            </div>
          </div>

          {monthlySpendingBucket && (
            <ImmediateRebalanceForecast
              currentSafeBudget={dayBudget}
              spentToday={spentToday}
              forecastDailyBudget={forecastDailyBudget}
              futureDaysCount={futureDaysCount}
            />
          )}

          <h3 className="mt-6 font-bold">Giao dịch gần đây</h3>
          <div className="mt-3 space-y-2">
            {transactions.slice(0, 5).map((transaction: any) => (
              <div
                className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                key={transaction.id}
              >
                <span className="min-w-0 break-words">
                  {transaction.category} · {transaction.buckets?.name}
                </span>
                <b className="shrink-0">{formatMoney(transaction.amount)}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
