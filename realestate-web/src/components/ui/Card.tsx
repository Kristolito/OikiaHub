import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900 shadow-soft ${className}`}>
      {children}
    </div>
  )
}

export default Card
