'use client'

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatMoney } from '@/lib/utils'

type ReportsBucketChartProps = {
  data: Array<{
    name: string
    value: number
    color: string
    share: number
  }>
  totalBalance: number
}

export function ReportsBucketChart({ data, totalBalance }: ReportsBucketChartProps) {
  if (!data.length) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        Chưa có hũ nào có số dư để hiển thị tỷ trọng.
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-center">
      <div className="relative mx-auto h-72 w-full max-w-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={72}
              outerRadius={108}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell fill={entry.color} key={entry.name} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatMoney(Number(value))}
              contentStyle={{
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 30px rgba(15,23,42,.10)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tổng số dư</p>
          <b className="mt-2 max-w-[180px] text-2xl leading-tight text-slate-950">
            {formatMoney(totalBalance)}
          </b>
        </div>
      </div>

      <div className="grid gap-3">
        {data.map((bucket, index) => (
          <div
            className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
            key={bucket.name}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <b className="break-words text-slate-900">
                    {index + 1}. {bucket.name}
                  </b>
                </div>
                <p className="mt-2 text-sm text-slate-500">{bucket.share.toFixed(1)}% tổng số dư</p>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <b className="block text-slate-950">{formatMoney(bucket.value)}</b>
                <span className="text-xs text-slate-500">Hiện đang nắm giữ</span>
              </div>
            </div>

            <div className="mt-4 h-2.5 rounded-full bg-slate-200">
              <div
                className="h-2.5 rounded-full"
                style={{ width: `${Math.max(bucket.share, 6)}%`, backgroundColor: bucket.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
