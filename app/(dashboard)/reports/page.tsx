import { ReportsBucketChart } from '@/components/ReportsBucketChart'
import { getMonthDetailData } from '@/lib/data'
import {
  calculateDailyBucketBudget,
  formatMoney,
  isMonthlySpendingBucket,
  monthLabel,
  percent,
} from '@/lib/utils'

type BucketReportRow = {
  id: string
  name: string
  color: string
  balance: number
  share: number
  progress: number
  monthlySpent: number
  transactionCount: number
}

export default async function Reports() {
  const { buckets, transactions, month, year } = await getMonthDetailData()
  const expenseTransactions = transactions.filter((transaction: any) => transaction.type === 'expense')
  const totalSpent = expenseTransactions.reduce(
    (sum: number, transaction: any) => sum + Number(transaction.amount || 0),
    0,
  )
  const totalBalance = buckets.reduce(
    (sum: number, bucket: any) => sum + Number(bucket.current_balance || 0),
    0,
  )
  const activeBuckets = buckets.filter((bucket: any) => Number(bucket.current_balance || 0) > 0)
  const monthlyBucket = buckets.find((bucket: any) => isMonthlySpendingBucket(bucket.name))
  const safeDailyBudget = monthlyBucket
    ? calculateDailyBucketBudget(Number(monthlyBucket.current_balance || 0), month, year)
    : 0

  const bucketRows: BucketReportRow[] = buckets
    .map((bucket: any) => {
      const bucketTransactions = expenseTransactions.filter(
        (transaction: any) => transaction.bucket_id === bucket.id,
      )
      const monthlySpent = bucketTransactions.reduce(
        (sum: number, transaction: any) => sum + Number(transaction.amount || 0),
        0,
      )
      const balance = Number(bucket.current_balance || 0)
      const target = Number(bucket.target_amount || bucket.allocated_amount || balance || 1)

      return {
        id: bucket.id,
        name: bucket.name,
        color: bucket.color || '#16a34a',
        balance,
        share: totalBalance ? (balance / totalBalance) * 100 : 0,
        progress: percent(balance, target),
        monthlySpent,
        transactionCount: bucketTransactions.length,
      }
    })
    .sort((left, right) => right.balance - left.balance)

  const chartSource = bucketRows.filter((bucket) => bucket.balance > 0)
  const primaryChartBuckets = chartSource.slice(0, 5)
  const otherBalance = chartSource
    .slice(5)
    .reduce((sum, bucket) => sum + bucket.balance, 0)

  const chartData = otherBalance
    ? [
        ...primaryChartBuckets,
        {
          id: 'other',
          name: 'Phần còn lại',
          color: '#cbd5e1',
          balance: otherBalance,
          share: totalBalance ? (otherBalance / totalBalance) * 100 : 0,
          progress: 0,
          monthlySpent: 0,
          transactionCount: 0,
        },
      ]
    : primaryChartBuckets

  const topBucket = bucketRows[0]
  const topSpendingBucket = [...bucketRows].sort((left, right) => right.monthlySpent - left.monthlySpent)[0]
  const bucketsNeedingAttention = bucketRows.filter(
    (bucket) => bucket.balance <= 0 || (bucket.progress < 40 && bucket.monthlySpent > 0),
  )

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Báo cáo</h1>
          <p className="mt-1 text-slate-500">
            Theo dõi dòng tiền trong {monthLabel(month, year).toLowerCase()} bằng tỷ trọng hũ,
            bảng xếp hạng và các điểm cần chú ý.
          </p>
        </div>

        <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
          {activeBuckets.length}/{buckets.length} hũ đang có số dư
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card overflow-hidden border-emerald-100 bg-[linear-gradient(135deg,_#ecfdf5,_#f8fafc_58%,_#ffffff)] p-0 text-slate-900">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_58%)] p-5">
            <p className="text-sm font-semibold text-slate-600">Tổng số dư hiện tại</p>
            <b className="mt-2 block text-3xl tracking-tight text-slate-950">{formatMoney(totalBalance)}</b>
            <p className="mt-2 text-sm text-slate-500">Tổng tiền còn lại trên tất cả các hũ tài chính.</p>
          </div>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Đã chi trong tháng</p>
          <b className="mt-2 block text-2xl">{formatMoney(totalSpent)}</b>
          <p className="mt-2 text-sm text-slate-500">{expenseTransactions.length} giao dịch chi tiêu đã ghi nhận.</p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Hũ chiếm tỷ trọng lớn nhất</p>
          <b className="mt-2 block text-2xl">{topBucket?.name || 'Chưa có dữ liệu'}</b>
          <p className="mt-2 text-sm text-slate-500">
            {topBucket ? `${topBucket.share.toFixed(1)}% tổng số dư` : 'Tạo thêm hũ để bắt đầu theo dõi phân bổ.'}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Mức chi an toàn hôm nay</p>
          <b className="mt-2 block text-2xl">{formatMoney(safeDailyBudget)}</b>
          <p className="mt-2 text-sm text-slate-500">
            {monthlyBucket
              ? `Tính từ hũ ${monthlyBucket.name}.`
              : 'Tạo hũ “Chi tiêu tháng” để hệ thống tự tính hạn mức mỗi ngày.'}
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="card p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="font-black">Tỷ trọng hũ tài chính</h2>
              <p className="mt-1 text-sm text-slate-500">
                Biểu đồ này cho thấy tiền của bạn đang tập trung ở đâu, để dễ nhìn ra hũ nào đang quá lớn hoặc quá mỏng.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {chartSource.length || 0} hũ có số dư
            </div>
          </div>

          <ReportsBucketChart
            data={chartData.map((bucket) => ({
              name: bucket.name,
              value: bucket.balance,
              color: bucket.color,
              share: bucket.share,
            }))}
            totalBalance={totalBalance}
          />
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-black">Điểm nổi bật</h2>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Hũ giữ nhiều tiền nhất</p>
                <b className="mt-2 block text-xl">{topBucket?.name || 'Chưa có dữ liệu'}</b>
                {topBucket && (
                  <p className="mt-2 text-sm text-slate-500">
                    {formatMoney(topBucket.balance)} tương đương {topBucket.share.toFixed(1)}% tổng số dư.
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm text-amber-700">Hũ chi mạnh nhất tháng</p>
                <b className="mt-2 block text-xl text-amber-950">
                  {topSpendingBucket?.monthlySpent ? topSpendingBucket.name : 'Chưa phát sinh chi'}
                </b>
                <p className="mt-2 text-sm text-amber-800">
                  {topSpendingBucket?.monthlySpent
                    ? `${formatMoney(topSpendingBucket.monthlySpent)} trong ${topSpendingBucket.transactionCount} giao dịch.`
                    : 'Chưa có khoản chi nào trong tháng này.'}
                </p>
              </div>

              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="text-sm text-rose-700">Hũ cần chú ý</p>
                <b className="mt-2 block text-xl text-rose-950">{bucketsNeedingAttention.length}</b>
                <p className="mt-2 text-sm text-rose-800">
                  {bucketsNeedingAttention.length
                    ? 'Ưu tiên xem các hũ gần cạn hoặc đang tiêu nhanh hơn tiến độ mục tiêu.'
                    : 'Phân bổ hiện tại đang khá cân bằng.'}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-black">Cách đọc nhanh</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-100 p-4">
                Phần trăm cao cho biết hũ đang giữ nhiều tiền. Nếu quá tập trung vào một hũ, bạn có thể cân nhắc phân bổ lại.
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                Cột “Đã chi tháng này” giúp nhìn ra hũ nào đang bị rút mạnh nhất, thay vì chỉ xem số dư còn lại.
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                Tiến độ thấp nhưng chi tiêu vẫn cao thường là dấu hiệu nên nạp thêm hoặc điều chỉnh mục tiêu cho hũ đó.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card mt-6 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-black">Bảng theo dõi chi tiết từng hũ</h2>
            <p className="mt-1 text-sm text-slate-500">
              Vừa xem được tỷ trọng, vừa xem được chi tiêu trong tháng và mức hoàn thành mục tiêu của từng hũ.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 md:hidden">
          {bucketRows.map((bucket, index) => (
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4" key={bucket.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full"
                      style={{ backgroundColor: bucket.color }}
                    />
                    <b className="break-words text-base">{index + 1}. {bucket.name}</b>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {bucket.transactionCount} giao dịch chi, tiến độ mục tiêu {bucket.progress}%
                  </p>
                </div>
                <b className="shrink-0 text-right">{formatMoney(bucket.balance)}</b>
              </div>

              <div className="mt-4 h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full"
                  style={{ width: `${Math.max(bucket.share, 6)}%`, backgroundColor: bucket.color }}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tỷ trọng</p>
                  <b className="mt-1 block text-base">{bucket.share.toFixed(1)}%</b>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đã chi tháng này</p>
                  <b className="mt-1 block text-base">{formatMoney(bucket.monthlySpent)}</b>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 hidden overflow-x-auto md:block">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="pb-3 pr-4">#</th>
                <th className="pb-3 pr-4">Hũ tài chính</th>
                <th className="pb-3 pr-4 text-right">Số dư</th>
                <th className="pb-3 pr-4 text-right">Tỷ trọng</th>
                <th className="pb-3 pr-4 text-right">Đã chi tháng này</th>
                <th className="pb-3 pr-4 text-right">Giao dịch</th>
                <th className="pb-3">Tiến độ mục tiêu</th>
              </tr>
            </thead>
            <tbody>
              {bucketRows.map((bucket, index) => (
                <tr className="border-b border-slate-100 align-top last:border-b-0" key={bucket.id}>
                  <td className="py-4 pr-4 font-semibold text-slate-400">{index + 1}</td>
                  <td className="py-4 pr-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full"
                        style={{ backgroundColor: bucket.color }}
                      />
                      <div className="min-w-0">
                        <b className="block break-words text-slate-900">{bucket.name}</b>
                        <span className="text-xs text-slate-500">
                          {bucket.share.toFixed(1)}% tổng số dư
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-right font-semibold text-slate-900">
                    {formatMoney(bucket.balance)}
                  </td>
                  <td className="py-4 pr-4 text-right">{bucket.share.toFixed(1)}%</td>
                  <td className="py-4 pr-4 text-right">{formatMoney(bucket.monthlySpent)}</td>
                  <td className="py-4 pr-4 text-right">{bucket.transactionCount}</td>
                  <td className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{bucket.progress}%</span>
                        <span>{bucket.progress >= 80 ? 'Ổn định' : bucket.progress >= 40 ? 'Cần theo dõi' : 'Ưu tiên nạp thêm'}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div
                          className="h-2.5 rounded-full"
                          style={{ width: `${bucket.progress}%`, backgroundColor: bucket.color }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
