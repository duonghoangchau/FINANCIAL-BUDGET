'use client'

import Link from 'next/link'
import { WifiOff, RotateCcw, PiggyBank } from 'lucide-react'

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="card w-full max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white">
          <WifiOff />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Offline Mode
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Ban dang ngoai tuyen</h1>
        <p className="mt-3 text-slate-500">
          BudgetFlow chua tai duoc du lieu moi. Khi co mang lai, ban co the tiep tuc quan ly ngan
          sach nhu binh thuong.
        </p>

        <div className="mt-6 grid gap-3">
          <button className="btn btn-primary w-full" onClick={() => window.location.reload()}>
            <RotateCcw size={18} />
            <span className="ml-2">Thu tai lai</span>
          </button>

          <Link href="/" className="btn btn-soft w-full">
            <PiggyBank size={18} />
            <span className="ml-2">Ve trang chu</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
