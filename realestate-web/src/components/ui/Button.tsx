import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-slate-100 text-slate-900 hover:bg-slate-300',
  secondary: 'border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800',
  ghost: 'text-slate-200 hover:bg-slate-800',
}

function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}

export default Button
