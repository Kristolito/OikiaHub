import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { resolveImageUrl } from '../services/api'
import {
  deleteAdminProperty,
  getAdminPropertyById,
  updateAdminPropertyStatus,
  type AdminPropertyDetailsResponse,
} from '../services/adminService'

const statusOptions = [
  { value: 1, label: 'Draft' },
  { value: 2, label: 'Published' },
  { value: 3, label: 'Sold' },
  { value: 4, label: 'Rented' },
  { value: 5, label: 'Archived' },
]

function statusLabel(status: number) {
  return statusOptions.find((x) => x.value === status)?.label ?? `Unknown (${status})`
}

function AdminPropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<AdminPropertyDetailsResponse | null>(null)
  const [status, setStatus] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const propertyId = Number(id)
    if (!Number.isFinite(propertyId) || propertyId <= 0) {
      setError('Invalid property id.')
      return
    }

    void (async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getAdminPropertyById(propertyId)
        setProperty(data)
        setStatus(data.status)
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError('Property not found.')
        } else {
          setError(err?.response?.data?.message ?? 'Failed to load property details.')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const updateStatus = async () => {
    if (!property) {
      return
    }

    setError('')
    setSuccess('')
    try {
      const updated = await updateAdminPropertyStatus(property.id, status)
      setProperty(updated)
      setSuccess('Property status updated.')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update property status.')
    }
  }

  const remove = async () => {
    if (!property) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await deleteAdminProperty(property.id)
      navigate('/admin/properties')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to delete property.')
    }
  }

  return (
    <section>
      <PageTitle title="Admin Property Review" />
      <Link to="/admin/properties" className="mt-3 inline-block text-sm text-slate-600 hover:text-slate-900">
        Back to properties
      </Link>
      {loading && <p className="mt-3 text-slate-600">Loading property details...</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}
      {success && <p className="mt-3 text-green-700">{success}</p>}
      {!loading && !error && property && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-slate-900 p-4 shadow-sm">
            <h2 className="text-xl font-semibold">{property.title}</h2>
            <p className="text-slate-600">
              {property.city}, {property.area}
            </p>
            <p className="mt-2 text-slate-700">{property.description}</p>
            <p className="mt-2 text-lg font-semibold">${property.price.toLocaleString()}</p>
            <p className="text-slate-600">Current status: {statusLabel(property.status)}</p>
            <p className="text-slate-600">
              Agent: {property.agent.firstName} {property.agent.lastName} ({property.agent.email})
            </p>
          </div>

          <div className="rounded-lg bg-slate-900 p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Moderation Actions</h3>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select className="rounded border px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button className="rounded bg-slate-900 px-3 py-1 text-sm text-white" type="button" onClick={() => void updateStatus()}>
                Update Status
              </button>
              <button className="rounded border border-red-300 px-3 py-1 text-sm text-red-700" type="button" onClick={() => void remove()}>
                Delete Property
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-slate-900 p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Images</h3>
            {property.images.length > 0 ? (
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {property.images.map((image) => (
                  <img key={image.id} src={resolveImageUrl(image.imageUrl)} alt={property.title} className="h-40 w-full rounded object-cover" />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-slate-600">No images.</p>
            )}
          </div>

          <div className="rounded-lg bg-slate-900 p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Amenities</h3>
            {property.amenities.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <li key={amenity.id} className="rounded bg-slate-100 px-3 py-1 text-sm">
                    {amenity.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-slate-600">No amenities listed.</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminPropertyDetails

