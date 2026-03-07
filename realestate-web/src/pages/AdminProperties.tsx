import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import {
  deleteAdminProperty,
  getAdminProperties,
  updateAdminPropertyStatus,
  type AdminPropertyListItemResponse,
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

function AdminProperties() {
  const [properties, setProperties] = useState<AdminPropertyListItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusByProperty, setStatusByProperty] = useState<Record<number, number>>({})

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminProperties()
      setProperties(data)
      const map: Record<number, number> = {}
      data.forEach((x) => {
        map[x.id] = x.status
      })
      setStatusByProperty(map)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load properties.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const updateStatus = async (id: number) => {
    const nextStatus = statusByProperty[id]
    setError('')
    setSuccess('')
    try {
      await updateAdminPropertyStatus(id, nextStatus)
      setSuccess('Property status updated.')
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)))
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update property status.')
    }
  }

  const remove = async (id: number) => {
    setError('')
    setSuccess('')
    try {
      await deleteAdminProperty(id)
      setSuccess('Property deleted.')
      setProperties((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to delete property.')
    }
  }

  return (
    <section>
      <PageTitle title="Admin Property Moderation" />
      {loading && <p className="mt-3 text-slate-400">Loading properties...</p>}
      {error && <p className="mt-3 text-red-400">{error}</p>}
      {success && <p className="mt-3 text-green-400">{success}</p>}
      {!loading && !error && properties.length === 0 && <p className="mt-3 text-slate-400">No properties found.</p>}
      {!loading && !error && properties.length > 0 && (
        <div className="mt-6 space-y-3">
          {properties.map((property) => (
            <article key={property.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{property.title}</h3>
                  <p className="text-sm text-slate-300">
                    {property.city}, {property.area}
                  </p>
                  <p className="text-sm text-slate-300">
                    Agent: {property.agentName} ({property.agentEmail})
                  </p>
                  <p className="text-sm text-slate-300">Price: ${property.price.toLocaleString()}</p>
                  <p className="text-sm text-slate-300">Current status: {statusLabel(property.status)}</p>
                </div>
                <Link to={`/admin/properties/${property.id}`} className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-200">
                  Review
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                  value={statusByProperty[property.id] ?? property.status}
                  onChange={(e) =>
                    setStatusByProperty((prev) => ({
                      ...prev,
                      [property.id]: Number(e.target.value),
                    }))
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button className="rounded bg-slate-900 px-3 py-1 text-sm text-white" type="button" onClick={() => void updateStatus(property.id)}>
                  Update Status
                </button>
                <button
                  className="rounded border border-red-600 px-3 py-1 text-sm text-red-400"
                  type="button"
                  onClick={() => void remove(property.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdminProperties
