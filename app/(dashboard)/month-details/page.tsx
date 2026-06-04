import Link from 'next/link'
import { getMonthDetailData } from '@/lib/data'
import {
  calculateDailyBucketBudget,
  calculateRemainingTodayBudget,
  daysInMonth,
  formatMoney,
  isMonthlySpendingBucket,
  monthLabel,
  normalizeMonthYear,
  padNumber,
  toDateKey,
} from '@/lib/utils'

const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function moveMonth(month: number, year: number, offset: number) {
  const date = new Date(year, month - 1 + offset, 1)
  return { month: date.getMonth() + 1, year: date.getFullYear() }
}

export default async function MonthDetails({
  searchParams,
}: {
  searchParams: { month?: string; year?: string; error?: string; success?: string }
}) {
  const { month, year } = normalizeMonthYear(Number(searchParams.month), Number(searchParams.year))
  const { budget, buckets, transactions } = await getMonthDetailData(month, year)
  const totalDays = daysInMonth(month, year)
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const monthlySpendingBucket = buckets.find((bucket: any) => isMonthlySpendingBucket(bucket.name))
  const monthlyTarget = Number(
    monthlySpendingBucket?.allocated_amount ||
      monthlySpendingBucket?.target_amount ||
      monthlySpendingBucket?.current_balance ||
      0,
  )
  const plannedDailyBudget = monthlyTarget > 0 ? monthlyTarget / totalDays : 0
  const expenseTransactions = transactions.filter((transaction: any) => transaction.type === 'expense')
  const totalSpent = expenseTransactions.reduce(
    (sum: number, transaction: any) => sum + Number(transaction.amount || 0),
    0,
  )
  const monthlySpendingTransactions = monthlySpendingBucket
    ? expenseTransactions.filter(
        (transaction: any) => transaction.bucket_id === monthlySpendingBucket.id,
      )
    : []

  const dailyMap = new Map<
    string,
    { total: number; count: number; categories: Record<string, number>; bucketNames: string[] }
  >()

  for (const transaction of expenseTransactions) {
    const occurredAt = new Date(transaction.occurred_at)
    const key = toDateKey(occurredAt)
    const current = dailyMap.get(key) || {
      total: 0,
      count: 0,
      categories: {},
      bucketNames: [],
    }

    current.total += Number(transaction.amount || 0)
    current.count += 1
    current.categories[transaction.category || 'Khác'] =
      (current.categories[transaction.category || 'Khác'] || 0) + Number(transaction.amount || 0)

    if (transaction.buckets?.name && !current.bucketNames.includes(transaction.buckets.name)) {
      current.bucketNames.push(transaction.buckets.name)
    }

    dailyMap.set(key, current)
  }

  const activeDays = Array.from(dailyMap.values()).filter((day) => day.total > 0).length
  const averagePerActiveDay = activeDays ? totalSpent / activeDays : 0
  const daysOverBudget =
    plannedDailyBudget > 0
      ? Array.from(dailyMap.values()).filter((day) => day.total > plannedDailyBudget).length
      : 0
  const previousMonth = moveMonth(month, year, -1)
  const nextMonth = moveMonth(month, year, 1)
  const today = new Date()
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year
  const todayKey = toDateKey(today)
  const spentToday = isCurrentMonth
    ? monthlySpendingTransactions
        .filter((transaction: any) => toDateKey(new Date(transaction.occurred_at)) === todayKey)
        .reduce((sum: number, transaction: any) => sum + Number(transaction.amount || 0), 0)
    : 0
  const openingBalanceToday = monthlySpendingBucket
    ? Number(monthlySpendingBucket.current_balance || 0) + spentToday
    : 0
  const currentSafeBudget = monthlySpendingBucket
    ? calculateDailyBucketBudget(openingBalanceToday, month, year)
    : 0
  const remainingToday = isCurrentMonth
    ? calculateRemainingTodayBudget(currentSafeBudget, spentToday)
    : 0
  const successMessages: Record<string, string> = {
    budget_saved: 'Đã lưu ngân sách tháng thành công.',
    expense_created: 'Đã ghi chi tiêu thành công.',
  }
  const successMessage = searchParams.success ? successMessages[searchParams.success] : ''

  const calendarCells = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({
      key: `empty-${index}`,
      empty: true,
    })),
    ...Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1
      const key = `${year}-${padNumber(month)}-${padNumber(day)}`
      const dayData = dailyMap.get(key) || {
        total: 0,
        count: 0,
        categories: {},
        bucketNames: [],
      }

      return {
        key,
        day,
        total: dayData.total,
        count: dayData.count,
        bucketNames: dayData.bucketNames,
        topCategories: Object.entries(dayData.categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2),
        isOverBudget: plannedDailyBudget > 0 && dayData.total > plannedDailyBudget,
        isToday: isCurrentMonth && day === today.getDate(),
      }
    }),
  ]

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black">Chi tiết tháng</h1>
          <p className="mt-1 text-slate-500">
            Lịch chi tiêu trực quan theo từng ngày trong {monthLabel(month, year).toLowerCase()}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/month-details?month=${previousMonth.month}&year=${previousMonth.year}`}
            className="btn bg-white"
          >
            Tháng trước
          </Link>
          <Link href="/month-details" className="btn bg-slate-900 text-white">
            Tháng hiện tại
          </Link>
          <Link
            href={`/month-details?month=${nextMonth.month}&year=${nextMonth.year}`}
            className="btn bg-white"
          >
            Tháng sau
          </Link>
        </div>
      </div>

      {searchParams.error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{searchParams.error}</div>
      )}
      {successMessage && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-emerald-700">{successMessage}</div>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <div className="card overflow-hidden border-emerald-100 bg-[linear-gradient(135deg,_#ecfdf5,_#f8fafc_58%,_#ffffff)] p-0 text-slate-900">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_58%)] p-5">
            <p className="text-sm font-semibold text-slate-600">Đã chi trong tháng</p>
            <b className="mt-2 block text-3xl tracking-tight text-slate-950">{formatMoney(totalSpent)}</b>
            <p className="mt-2 text-sm text-slate-500">
              {expenseTransactions.length} giao dịch đã ghi nhận
            </p>
          </div>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Mức chi chuẩn mỗi ngày</p>
          <b className="mt-2 block text-2xl">{formatMoney(plannedDailyBudget)}</b>
          <p className="mt-2 text-sm text-slate-500">
            Tính từ hũ {monthlySpendingBucket?.name || 'Chi tiêu tháng'} trên toàn bộ {totalDays} ngày.
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Mức an toàn phần còn lại</p>
          <b className="mt-2 block text-2xl">{formatMoney(currentSafeBudget)}</b>
          <p className="mt-2 text-sm text-slate-500">
            Lấy theo số dư đầu ngày của hũ Chi tiêu tháng, rồi ngày mai sẽ tự đổi theo số dư còn lại.
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Nhịp chi tiêu</p>
          <b className="mt-2 block text-2xl">{formatMoney(averagePerActiveDay)}</b>
          <p className="mt-2 text-sm text-slate-500">
            Trung bình mỗi ngày có chi. Có {daysOverBudget} ngày vượt mức chuẩn.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,2.2fr)_360px]">
        <div className="card p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-black">{monthLabel(month, year)}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Ô đỏ nhạt là ngày chi cao hơn mức chuẩn/ngày.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {activeDays} ngày có phát sinh chi tiêu
            </div>
          </div>

          <div className="mt-6 hidden grid-cols-7 gap-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500 xl:grid">
            {weekdayLabels.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
            {calendarCells.map((cell: any) =>
              cell.empty ? (
                <div
                  key={cell.key}
                  className="hidden min-h-[210px] rounded-3xl border border-dashed border-slate-200 bg-slate-50 xl:block"
                />
              ) : (
                <div
                  key={cell.key}
                  className={`min-h-[210px] overflow-hidden rounded-3xl border p-4 shadow-sm transition xl:p-5 ${
                    cell.isOverBudget
                      ? 'border-rose-200 bg-rose-50'
                      : cell.total > 0
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-white'
                  } ${cell.isToday ? 'ring-2 ring-slate-900' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ngày</p>
                      <b className="text-2xl leading-none text-slate-900">{cell.day}</b>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-slate-600">
                      {cell.count} GD
                    </span>
                  </div>

                  <div className="mt-4 min-w-0">
                    <p className="text-[11px] font-medium text-slate-500">Đã chi</p>
                    <b className="mt-1 block break-words text-base leading-tight text-slate-900 xl:text-lg">
                      {formatMoney(cell.total)}
                    </b>
                  </div>

                  <div className="mt-3 space-y-2">
                    {cell.topCategories.length > 0 ? (
                      cell.topCategories.map(([category, amount]: [string, number]) => (
                        <div
                          key={category}
                          className="rounded-2xl bg-white/90 px-3 py-2 text-[11px] font-semibold leading-snug text-slate-700"
                        >
                          <span className="break-words">{category}</span>: {formatMoney(amount)}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-400">
                        Không có khoản chi
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-black">Tổng quan hũ Chi tiêu tháng</h2>
            {monthlySpendingBucket ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                  <p className="text-sm text-slate-300">Số dư hiện tại</p>
                  <b className="mt-2 block text-3xl">
                    {formatMoney(Number(monthlySpendingBucket.current_balance || 0))}
                  </b>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-sm text-slate-500">Phân bổ đầu tháng</p>
                    <b className="mt-2 block text-xl">
                      {formatMoney(Number(monthlySpendingBucket.allocated_amount || 0))}
                    </b>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-sm text-slate-500">Thu nhập tháng</p>
                    <b className="mt-2 block text-xl">{formatMoney(Number(budget?.income || 0))}</b>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Chưa có hũ mặc định. Sau khi chạy lại `schema.sql`, tài khoản mới sẽ tự có hũ
                `Chi tiêu tháng`.
              </p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-black">Hôm nay còn bao nhiêu</h2>
            {isCurrentMonth ? (
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Mức an toàn hôm nay</p>
                  <b className="mt-2 block text-xl">{formatMoney(currentSafeBudget)}</b>
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
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Chỉ số này chỉ hiển thị khi bạn đang xem tháng hiện tại, vì nó phụ thuộc vào giao dịch của ngày hôm nay.
              </p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-black">Điểm cần chú ý</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-100 p-4">
                {daysOverBudget > 0
                  ? `Có ${daysOverBudget} ngày vượt mức chuẩn. Nên xem lại các ngày tô đỏ để biết danh mục chi mạnh.`
                  : 'Chưa có ngày nào vượt mức chuẩn/ngày trong tháng này.'}
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                {activeDays > 0
                  ? `Trung bình bạn chi ${formatMoney(averagePerActiveDay)} trong mỗi ngày có phát sinh giao dịch.`
                  : 'Tháng này chưa có giao dịch chi nào được ghi nhận.'}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
