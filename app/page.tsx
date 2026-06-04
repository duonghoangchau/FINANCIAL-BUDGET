import Link from 'next/link'
import { PiggyBank, CalendarDays, ShieldCheck, BarChart3 } from 'lucide-react'

const highlights = [
  [CalendarDays, 'Ngân sách tháng'],
  [PiggyBank, 'Hũ tài chính'],
  [BarChart3, 'Báo cáo'],
  [ShieldCheck, 'Bảo mật server'],
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20">
        <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xl font-black">
            <PiggyBank />
            BudgetFlow
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="btn bg-white/10" href="/login">
              Đăng nhập
            </Link>
            <Link className="btn bg-emerald-400 text-slate-950" href="/register">
              Tạo tài khoản
            </Link>
          </div>
        </nav>

        <div className="grid gap-10 py-14 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="badge bg-emerald-400/15 text-emerald-200">Next.js + Supabase Auth thật</p>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
              Quản lý tiền theo hũ, bớt đau đầu cuối tháng.
            </h1>
            <p className="mt-5 text-base text-slate-300 sm:text-lg">
              Theo dõi thu nhập, phân bổ ngân sách, ghi chi tiêu hằng ngày, chuyển tiền giữa các
              hũ và xem báo cáo trực quan.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="btn bg-emerald-400 text-slate-950">
                Bắt đầu ngay
              </Link>
              <Link href="/login" className="btn bg-white/10">
                Đăng nhập
              </Link>
            </div>
          </div>

          <div className="card border-white/10 bg-white/10 p-5 backdrop-blur sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map(([Icon, title]: any) => (
                <div key={title} className="rounded-2xl bg-white/10 p-5">
                  <Icon className="mb-4 text-emerald-300" />
                  <b>{title}</b>
                  <p className="mt-2 text-sm text-slate-300">Sẵn route, action và database.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
