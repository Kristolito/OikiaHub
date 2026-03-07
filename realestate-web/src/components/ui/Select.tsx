import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

function Select({ className = '', ...props }: SelectProps) {
  return (
    <select
      className={`w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800 ${className}`}
      {...props}
    />
  )
}

export default Select
