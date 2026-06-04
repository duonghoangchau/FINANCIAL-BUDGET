import { getUserData } from '@/lib/data'
import { formatMoney } from '@/lib/utils'

export default async function Reports() {
  const { buckets, transactions } = await getUserData()
  const expense = transactions.filter((transaction: any) => transaction.type === 'expense')
  const total = expense.reduce((sum: any, transaction: any) => sum + Number(transaction.amount), 0)
  const maxBalance = Math.max(...buckets.map((bucket: any) => Number(bucket.current_balance)), 1)

  return (
    <div>
      <h1 className="text-2xl font-black sm:text-3xl">Báo cáo</h1>
      <p className="mt-1 text-slate-500">Tóm tắt toàn bộ chi tiêu và mức phân bổ giữa các hũ tài chính.</p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Tổng đã chi</p>
          <b className="mt-2 block text-2xl">{formatMoney(total)}</b>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Số hũ</p>
          <b className="mt-2 block text-2xl">{buckets.length}</b>
        </div>
        <div className="card p-5 sm:col-span-2 xl:col-span-1">
          <p className="text-sm text-slate-500">Giao dịch</p>
          <b className="mt-2 block text-2xl">{transactions.length}</b>
        </div>
      </section>

      <div className="card mt-6 p-6">
        <h2 className="font-black">Tỷ trọng hũ tài chính</h2>

        <div className="mt-5 space-y-4">
          {buckets.map((bucket: any) => (
            <div key={bucket.id}>
              <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between">
                <b className="break-words">{bucket.name}</b>
                <span className="break-words text-slate-600 sm:text-right">
                  {formatMoney(bucket.current_balance)}
                </span>
              </div>

              <div className="mt-2 h-4 rounded-full bg-slate-100">
                <div
                  className="h-4 rounded-full"
                  style={{
                    width: `${(Number(bucket.current_balance) / maxBalance) * 100}%`,
                    background: bucket.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
