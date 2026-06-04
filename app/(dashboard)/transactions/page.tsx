import { addExpense } from '@/app/actions/budget'
import { MoneyInput } from '@/components/MoneyInput'
import { getUserData } from '@/lib/data'
import { formatMoney } from '@/lib/utils'

const successMessages: Record<string, string> = {
  expense_created: 'Đã lưu giao dịch thành công.',
}

export default async function Transactions({
  searchParams,
}: {
  searchParams: { error?: string; success?: string }
}) {
  const { buckets, transactions } = await getUserData()
  const successMessage = searchParams.success ? successMessages[searchParams.success] : ''

  return (
    <div>
      <h1 className="text-3xl font-black">Giao dịch</h1>
      <p className="mt-1 text-slate-500">Thêm chi tiêu nhanh và xem lại lịch sử giao dịch trên mọi kích thước màn hình.</p>

      {searchParams.error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{searchParams.error}</div>
      )}
      {successMessage && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-emerald-700">{successMessage}</div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <form action={addExpense} className="card p-6 lg:sticky lg:top-8 lg:self-start">
          <input type="hidden" name="return_to" value="/transactions" />
          <h2 className="font-black">Thêm khoản chi</h2>
          <select name="bucket_id" required className="input mt-4">
            {buckets.map((bucket: any) => (
              <option key={bucket.id} value={bucket.id}>
                {bucket.name}
              </option>
            ))}
          </select>
          <MoneyInput name="amount" required className="input mt-3" placeholder="Số tiền" />
          <input name="category" className="input mt-3" placeholder="Danh mục" />
          <textarea name="note" className="input mt-3" placeholder="Ghi chú" />
          <input name="occurred_at" type="datetime-local" className="input mt-3" />
          <button className="btn btn-primary mt-4 w-full">Lưu giao dịch</button>
        </form>

        <div className="card p-6 lg:col-span-2">
          <h2 className="font-black">Lịch sử gần đây</h2>

          <div className="mt-4 space-y-3 md:hidden">
            {transactions.map((transaction: any) => (
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={transaction.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {new Date(transaction.occurred_at).toLocaleDateString('vi-VN')}
                    </p>
                    <b className="mt-1 block break-words text-base">{transaction.category || 'Chưa phân loại'}</b>
                  </div>
                  <b className="shrink-0 text-right">{formatMoney(transaction.amount)}</b>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">Hũ:</span> {transaction.buckets?.name}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Loại:</span> {transaction.type}
                  </p>
                  {transaction.note && (
                    <p>
                      <span className="font-semibold text-slate-900">Ghi chú:</span> {transaction.note}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 hidden overflow-x-auto rounded-2xl border md:block">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3">Ngày</th>
                  <th className="px-3">Hũ</th>
                  <th className="px-3">Loại</th>
                  <th className="px-3">Danh mục</th>
                  <th className="pr-3 text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction: any) => (
                  <tr className="border-t" key={transaction.id}>
                    <td className="whitespace-nowrap p-3">
                      {new Date(transaction.occurred_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-3">{transaction.buckets?.name}</td>
                    <td className="px-3">{transaction.type}</td>
                    <td className="px-3">{transaction.category}</td>
                    <td className="whitespace-nowrap pr-3 text-right font-bold">
                      {formatMoney(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
