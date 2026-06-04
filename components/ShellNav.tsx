'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  CalendarDays,
  Home,
  PiggyBank,
  ReceiptText,
  Settings,
} from 'lucide-react'

const iconMap = {
  home: Home,
  calendar: CalendarDays,
  'piggy-bank': PiggyBank,
  receipt: ReceiptText,
  chart: BarChart3,
  settings: Settings,
} as const

type NavLink = {
  href: string
  icon: keyof typeof iconMap
  label: string
}

type ShellNavProps = {
  links: ReadonlyArray<NavLink>
  variant: 'mobile' | 'desktop'
}

export function ShellNav({ links, variant }: ShellNavProps) {
  const pathname = usePathname()

  if (variant === 'mobile') {
    return (
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
        {links.map(({ href, icon, label }) => {
          const Icon = iconMap[icon]

          return (
          <Link
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              pathname === href
                ? 'border-emerald-200 bg-emerald-500 text-white shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
            key={href}
            href={href}
          >
            <Icon size={16} />
            {label}
          </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="mt-8 space-y-2">
      {links.map(({ href, icon, label }) => {
        const Icon = iconMap[icon]

        return (
        <Link
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition ${
            pathname === href
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          key={href}
          href={href}
        >
          <Icon size={20} />
          {label}
        </Link>
        )
      })}
    </nav>
  )
}
