'use client'

import { useEffect, useState } from 'react'

type MoneyInputProps = {
  name: string
  className?: string
  defaultValue?: number | string
  placeholder?: string
  required?: boolean
}

function normalizeDigits(value: string | number | undefined) {
  return String(value ?? '').replace(/\D/g, '')
}

function formatMoneyInput(value: string) {
  if (!value) return ''
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function MoneyInput({
  name,
  className,
  defaultValue,
  placeholder,
  required,
}: MoneyInputProps) {
  const [rawValue, setRawValue] = useState(() => normalizeDigits(defaultValue))

  useEffect(() => {
    setRawValue(normalizeDigits(defaultValue))
  }, [defaultValue])

  return (
    <>
      <input name={name} type="hidden" value={rawValue} />
      <input
        type="text"
        inputMode="numeric"
        className={className}
        value={formatMoneyInput(rawValue)}
        placeholder={placeholder}
        required={required}
        onChange={(event) => setRawValue(normalizeDigits(event.target.value))}
      />
    </>
  )
}
