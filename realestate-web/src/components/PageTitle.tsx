type PageTitleProps = {
  title: string
}

function PageTitle({ title }: PageTitleProps) {
  return <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
}

export default PageTitle
