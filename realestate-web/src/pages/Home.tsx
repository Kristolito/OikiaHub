import PageTitle from '../components/PageTitle'
import Card from '../components/ui/Card'

function Home() {
  return (
    <section>
      <PageTitle title="Welcome to OikiaHub" subtitle="A modern marketplace to discover premium homes and listings." />
      <Card className="mt-6 p-6">
        <p className="text-slate-700 dark:text-slate-300">
          Browse properties, save favorites, and connect with agents through a clean, responsive experience.
        </p>
      </Card>
    </section>
  )
}

export default Home
