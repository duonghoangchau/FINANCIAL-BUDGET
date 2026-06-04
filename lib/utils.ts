export const formatMoney = (v: number, currency = 'VND') =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(v || 0)

export const nowMonth = () => {
  const date = new Date()
  return { month: date.getMonth() + 1, year: date.getFullYear() }
}

export const daysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate()
export const percent = (a: number, b: number) => (b ? Math.min(100, Math.round((a / b) * 100)) : 0)
export const padNumber = (value: number) => String(value).padStart(2, '0')
export const monthLabel = (month: number, year: number) => `Tháng ${month}/${year}`
export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`

const normalizeLabel = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (char) => (char === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .trim()

export const isMonthlySpendingBucket = (name: string) => {
  const normalized = normalizeLabel(name)

  return (
    normalized === 'chi tieu thang' ||
    normalized.includes('chi tieu hang thang') ||
    normalized.includes('monthly spending')
  )
}

export const remainingDaysInMonth = (month: number, year: number, referenceDate = new Date()) => {
  const isCurrentMonth =
    referenceDate.getMonth() + 1 === month && referenceDate.getFullYear() === year

  if (!isCurrentMonth) return daysInMonth(month, year)

  return Math.max(1, daysInMonth(month, year) - referenceDate.getDate() + 1)
}

export const calculateDailyBucketBudget = (
  balance: number,
  month: number,
  year: number,
  referenceDate = new Date(),
) => Math.max(0, balance) / remainingDaysInMonth(month, year, referenceDate)

export const calculateRemainingTodayBudget = (safeBudget: number, spentToday: number) =>
  Math.max(0, safeBudget - spentToday)

export const normalizeMonthYear = (month?: number, year?: number) => {
  const current = nowMonth()
  const safeMonth = Number.isInteger(month) && month! >= 1 && month! <= 12 ? month! : current.month
  const safeYear = Number.isInteger(year) && year! >= 2000 && year! <= 2100 ? year! : current.year

  return { month: safeMonth, year: safeYear }
}

export const monthRange = (month: number, year: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0))

  return { start, end }
}
