type PageTitleProps = {
  title: string
  subtitle?: string
}

function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
      {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
    </div>
  )
}

export default PageTitle
