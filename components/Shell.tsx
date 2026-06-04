import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { BarChart3, CalendarDays, Home, PiggyBank, ReceiptText, Settings } from 'lucide-react'

const links = [
  ['/dashboard', Home, 'Dashboard'],
  ['/month-details', CalendarDays, 'Chi tiết tháng'],
  ['/buckets', PiggyBank, 'Hũ tài chính'],
  ['/transactions', ReceiptText, 'Giao dịch'],
  ['/reports', BarChart3, 'Báo cáo'],
  ['/settings', Settings, 'Cài đặt'],
]

export function Shell({ children, email }: { children: React.ReactNode; email?: string }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-3 text-lg font-black">
              <PiggyBank className="shrink-0 text-emerald-600" />
              <span className="truncate">BudgetFlow</span>
            </Link>

            <form action={signOut}>
              <button className="btn btn-soft px-3 py-2 text-sm">Đăng xuất</button>
            </form>
          </div>

          {email && <p className="mt-2 truncate text-sm text-slate-500">{email}</p>}
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {links.map(([href, Icon, label]: any) => (
            <Link
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
              key={href}
              href={href}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-white p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 text-xl font-black">
          <PiggyBank className="text-emerald-600" />
          BudgetFlow
        </Link>

        <nav className="mt-8 space-y-2">
          {links.map(([href, Icon, label]: any) => (
            <Link
              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold text-slate-700 hover:bg-slate-100"
              key={href}
              href={href}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>

        <form action={signOut} className="absolute bottom-5 left-5 right-5">
          <p className="mb-3 truncate text-sm text-slate-500">{email}</p>
          <button className="btn btn-soft w-full">Đăng xuất</button>
        </form>
      </aside>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
