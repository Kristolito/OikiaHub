import { useParams } from 'react-router-dom'
import PageTitle from '../components/PageTitle'

function PropertyDetails() {
  const { id } = useParams()

  return (
    <section>
      <PageTitle title="Property Details" />
      <p className="mt-3 text-slate-600">Property ID: {id ?? 'N/A'}</p>
    </section>
  )
}

export default PropertyDetails
