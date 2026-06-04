import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { ShellNav } from '@/components/ShellNav'
import { PiggyBank } from 'lucide-react'

const links = [
  { href: '/dashboard', icon: 'home', label: 'Dashboard' },
  { href: '/month-details', icon: 'calendar', label: 'Chi tiet thang' },
  { href: '/buckets', icon: 'piggy-bank', label: 'Hu tai chinh' },
  { href: '/transactions', icon: 'receipt', label: 'Giao dich' },
  { href: '/reports', icon: 'chart', label: 'Bao cao' },
  { href: '/settings', icon: 'settings', label: 'Cai dat' },
] as const

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
              <button className="btn btn-soft px-3 py-2 text-sm">Dang xuat</button>
            </form>
          </div>

          {email && <p className="mt-2 truncate text-sm text-slate-500">{email}</p>}
        </div>

        <ShellNav links={links} variant="mobile" />
      </div>

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-white p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 text-xl font-black">
          <PiggyBank className="text-emerald-600" />
          BudgetFlow
        </Link>

        <ShellNav links={links} variant="desktop" />

        <form action={signOut} className="absolute bottom-5 left-5 right-5">
          <p className="mb-3 truncate text-sm text-slate-500">{email}</p>
          <button className="btn btn-soft w-full">Dang xuat</button>
        </form>
      </aside>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
