import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800 ${className}`}
      {...props}
    />
  )
}

export default Input
