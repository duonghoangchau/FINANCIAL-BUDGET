'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/utils'

type ImmediateRebalanceForecastProps = {
  currentSafeBudget: number
  spentToday: number
  forecastDailyBudget: number
  futureDaysCount: number
}

export function ImmediateRebalanceForecast({
  currentSafeBudget,
  spentToday,
  forecastDailyBudget,
  futureDaysCount,
}: ImmediateRebalanceForecastProps) {
  const [isOpen, setIsOpen] = useState(false)
  const todayDelta = currentSafeBudget - spentToday
  const forecastShift = forecastDailyBudget - currentSafeBudget
  const deltaLabel = todayDelta >= 0 ? 'Dự đoán đang dư hôm nay' : 'Dự đoán đang thiếu hôm nay'
  const deltaTone =
    todayDelta >= 0
      ? 'bg-sky-50 text-sky-900 ring-1 ring-sky-100'
      : 'bg-rose-50 text-rose-900 ring-1 ring-rose-100'
  const shiftLabel =
    forecastShift >= 0 ? 'Mỗi ngày tiếp theo có thể rộng hơn' : 'Mỗi ngày tiếp theo nên siết lại'
  const shiftTone =
    forecastShift >= 0
      ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100'
      : 'bg-amber-50 text-amber-900 ring-1 ring-amber-100'

  return (
    <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Dự đoán cho các ngày tiếp theo</p>
          <p className="mt-1 text-sm text-slate-500">
            Xem ngay mức chi mới cho những ngày sau hôm nay mà không đổi 3 chỉ số của hôm nay.
          </p>
        </div>
        <button
          type="button"
          className={`btn ${isOpen ? 'bg-slate-200 text-slate-900' : 'btn-primary'}`}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? 'Ẩn dự đoán' : 'Cân đối ngay'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 grid gap-3">
          <div className={`rounded-2xl p-4 ${deltaTone}`}>
            <p className="text-sm">{deltaLabel}</p>
            <b className="mt-2 block text-xl">{formatMoney(Math.abs(todayDelta))}</b>
            <p className="mt-2 text-sm opacity-80">
              So với mức an toàn hôm nay, đây là phần chênh lệch tạm tính từ chi tiêu đã phát sinh.
            </p>
          </div>

          {futureDaysCount > 0 ? (
            <>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Mức dự đoán cho mỗi ngày tiếp theo</p>
                <b className="mt-2 block text-xl text-slate-950">{formatMoney(forecastDailyBudget)}</b>
                <p className="mt-2 text-sm text-slate-500">
                  Áp cho {futureDaysCount} ngày còn lại sau hôm nay nếu bạn giữ nguyên số dư hiện tại.
                </p>
              </div>
              <div className={`rounded-2xl p-4 ${shiftTone}`}>
                <p className="text-sm">{shiftLabel}</p>
                <b className="mt-2 block text-xl">{formatMoney(Math.abs(forecastShift))}</b>
                <p className="mt-2 text-sm opacity-80">
                  Đây là mức tăng hoặc giảm mỗi ngày so với mức an toàn đang hiển thị cho hôm nay.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Hôm nay là ngày cuối cùng của tháng nên không còn ngày tiếp theo để chia lại mức chi.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
