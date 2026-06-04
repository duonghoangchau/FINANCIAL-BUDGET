import {
  createBucket,
  deleteBucket,
  transferBucket,
  updateBucket,
} from '@/app/actions/budget'
import { MoneyInput } from '@/components/MoneyInput'
import { getUserData } from '@/lib/data'
import {
  calculateDailyBucketBudget,
  formatMoney,
  isMonthlySpendingBucket,
  percent,
  remainingDaysInMonth,
} from '@/lib/utils'

const successMessages: Record<string, string> = {
  created: 'Tạo hũ thành công. Form đã được làm mới để bạn tạo hũ tiếp theo nhanh hơn.',
  updated: 'Đã lưu chỉnh sửa cho hũ tài chính.',
  deleted: 'Đã xóa hũ tài chính.',
  transferred: 'Chuyển tiền giữa các hũ thành công.',
}

export default async function Buckets({
  searchParams,
}: {
  searchParams: { error?: string; success?: string }
}) {
  const { buckets, month, year } = await getUserData()
  const remainingDays = remainingDaysInMonth(month, year)
  const totalBalance = buckets.reduce(
    (sum: number, bucket: any) => sum + Number(bucket.current_balance || 0),
    0,
  )
  const monthlyBucket = buckets.find((bucket: any) => isMonthlySpendingBucket(bucket.name))
  const dailyBudget = monthlyBucket
    ? calculateDailyBucketBudget(Number(monthlyBucket.current_balance || 0), month, year)
    : 0
  const successMessage = searchParams.success ? successMessages[searchParams.success] : ''

  return (
    <div>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black">Hũ tài chính</h1>
          <p className="mt-1 text-slate-500">
            Quản lý nhanh hũ, ưu tiên thao tác chuyển tiền và chỉ mở phần chỉnh sửa khi cần.
          </p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
          {buckets.length} hũ • Tổng số dư {formatMoney(totalBalance)}
        </div>
      </div>

      {searchParams.error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{searchParams.error}</div>
      )}
      {successMessage && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-emerald-700">{successMessage}</div>
      )}

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Tổng số dư hiện tại</p>
          <b className="mt-2 block text-2xl">{formatMoney(totalBalance)}</b>
          <p className="mt-2 text-sm text-slate-500">
            Tất cả số dư còn lại trong các hũ của bạn.
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Chi tiêu an toàn hôm nay</p>
          <b className="mt-2 block text-2xl">{formatMoney(dailyBudget)}</b>
          <p className="mt-2 text-sm text-slate-500">
            {monthlyBucket
              ? `Tính từ hũ ${monthlyBucket.name}, chia cho ${remainingDays} ngày còn lại.`
              : 'Tạo hoặc giữ hũ "Chi tiêu tháng" để hệ thống tính hạn mức/ngày.'}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Số lượng hũ</p>
          <b className="mt-2 block text-2xl">{buckets.length}</b>
          <p className="mt-2 text-sm text-slate-500">
            Danh sách bên dưới đã được rút gọn để dễ quản lý khi có nhiều hũ.
          </p>
        </div>
      </section>

      <form action={transferBucket} className="card mt-6 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-black">Chuyển tiền giữa các hũ</h2>
            <p className="mt-1 text-sm text-slate-500">
              Đưa thao tác thường dùng nhất lên đầu để chuyển tiền nhanh hơn.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select name="from_bucket_id" className="input">
            {buckets.map((bucket: any) => (
              <option key={bucket.id} value={bucket.id}>
                Từ: {bucket.name}
              </option>
            ))}
          </select>
          <select name="to_bucket_id" className="input">
            {buckets.map((bucket: any) => (
              <option key={bucket.id} value={bucket.id}>
                Đến: {bucket.name}
              </option>
            ))}
          </select>
          <MoneyInput
            name="amount"
            required
            className="input"
            placeholder="Số tiền"
          />
          <button className="btn btn-primary">Chuyển tiền</button>
        </div>
      </form>

      <section className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <form action={createBucket} className="card p-6 xl:sticky xl:top-8 xl:self-start">
          <h2 className="font-black">Tạo hũ mới</h2>
          <p className="mt-1 text-sm text-slate-500">
            Form gọn hơn và sẽ tự xóa nội dung sau khi tạo thành công.
          </p>

          <div className="mt-4 space-y-3">
            <input
              name="name"
              required
              className="input"
              placeholder="Tên hũ: Chi tiêu tháng, Du lịch..."
            />
            <input name="description" className="input" placeholder="Mô tả ngắn" />
            <div className="grid grid-cols-2 gap-3">
              <MoneyInput
                name="allocated_amount"
                className="input"
                placeholder="Phân bổ"
              />
              <MoneyInput
                name="current_balance"
                className="input"
                placeholder="Số dư"
              />
            </div>
            <MoneyInput
              name="target_amount"
              className="input"
              placeholder="Mục tiêu"
            />
            <div className="grid grid-cols-2 gap-3">
              <input name="color" type="color" className="input h-12" defaultValue="#16a34a" />
              <select name="calculation_mode" className="input">
                <option value="end_of_day">Cuối ngày</option>
                <option value="realtime">Realtime</option>
                <option value="manual">Thủ công</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input name="is_rollover" type="checkbox" />
              Cộng dồn sang tháng sau
            </label>
          </div>

          <button className="btn btn-primary mt-5 w-full">Tạo hũ</button>
        </form>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Danh sách hũ</h2>
            <p className="text-sm text-slate-500">Bấm “Mở chỉnh sửa” khi cần thay đổi chi tiết.</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {buckets.map((bucket: any) => {
              const targetAmount = Number(bucket.target_amount || bucket.allocated_amount || 1)
              const isMonthlyBucket = isMonthlySpendingBucket(bucket.name)
              const monthlyDailyBudget = isMonthlyBucket
                ? calculateDailyBucketBudget(Number(bucket.current_balance || 0), month, year)
                : 0

              return (
                <div className="card p-5" key={bucket.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full ring-4 ring-white"
                          style={{ background: bucket.color }}
                        />
                        <b className="truncate text-lg">{bucket.name}</b>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {bucket.description || 'Không có mô tả'}
                      </p>
                    </div>
                    <span
                      className="badge shrink-0"
                      style={{ background: `${bucket.color}22`, color: bucket.color }}
                    >
                      {bucket.calculation_mode}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Số dư</p>
                      <b className="mt-1 block text-base text-slate-900">
                        {formatMoney(bucket.current_balance)}
                      </b>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Mục tiêu</p>
                      <b className="mt-1 block text-base text-slate-900">
                        {formatMoney(bucket.target_amount || bucket.allocated_amount)}
                      </b>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                      <span>Tiến độ</span>
                      <span>{percent(Number(bucket.current_balance), targetAmount)}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${percent(Number(bucket.current_balance), targetAmount)}%`,
                          background: bucket.color,
                        }}
                      />
                    </div>
                  </div>

                  {isMonthlyBucket && (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-emerald-900">
                      <p className="text-xs font-semibold uppercase tracking-wide">Chi tiêu theo ngày</p>
                      <p className="mt-2 text-2xl font-black">{formatMoney(monthlyDailyBudget)}</p>
                      <p className="mt-1 text-sm text-emerald-800">
                        Số dư còn lại được chia cho {remainingDays} ngày còn lại trong tháng.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <details className="group flex-1 rounded-2xl border border-slate-200 bg-slate-50">
                      <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-slate-700">
                        <span className="group-open:hidden">Mở chỉnh sửa</span>
                        <span className="hidden group-open:inline">Thu gọn chỉnh sửa</span>
                      </summary>

                      <form action={updateBucket} className="border-t border-slate-200 p-4">
                        <input type="hidden" name="bucket_id" value={bucket.id} />
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            name="name"
                            required
                            className="input"
                            defaultValue={bucket.name}
                            placeholder="Tên hũ"
                          />
                          <input
                            name="description"
                            className="input"
                            defaultValue={bucket.description || ''}
                            placeholder="Mô tả"
                          />
                          <MoneyInput
                            name="allocated_amount"
                            className="input"
                            defaultValue={Number(bucket.allocated_amount || 0)}
                            placeholder="Phân bổ"
                          />
                          <MoneyInput
                            name="current_balance"
                            className="input"
                            defaultValue={Number(bucket.current_balance || 0)}
                            placeholder="Số dư hiện tại"
                          />
                          <MoneyInput
                            name="target_amount"
                            className="input"
                            defaultValue={Number(bucket.target_amount || 0)}
                            placeholder="Mục tiêu"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              name="color"
                              type="color"
                              className="input h-12"
                              defaultValue={bucket.color || '#16a34a'}
                            />
                            <select
                              name="calculation_mode"
                              className="input"
                              defaultValue={bucket.calculation_mode}
                            >
                              <option value="end_of_day">Cuối ngày</option>
                              <option value="realtime">Realtime</option>
                              <option value="manual">Thủ công</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-2 text-sm md:col-span-2">
                            <input
                              name="is_rollover"
                              type="checkbox"
                              defaultChecked={bucket.is_rollover}
                            />
                            Cộng dồn sang tháng sau
                          </label>
                        </div>

                        <button className="btn btn-primary mt-4 w-full">Lưu chỉnh sửa</button>
                      </form>
                    </details>

                    <form action={deleteBucket}>
                      <input type="hidden" name="bucket_id" value={bucket.id} />
                      <button className="btn bg-red-50 text-red-700 hover:bg-red-100">
                        Xóa hũ
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
