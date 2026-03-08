import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { resolveImageUrl } from '../services/api'
import { getAgentProfile, type AgentProfileResponse } from '../services/agentService'

function AgentProfile() {
  const { id } = useParams()
  const [agent, setAgent] = useState<AgentProfileResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const agentId = Number(id)
    if (!Number.isFinite(agentId) || agentId <= 0) {
      setError('Invalid agent id.')
      return
    }

    void (async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getAgentProfile(agentId)
        setAgent(response)
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError('Agent not found.')
        } else {
          setError(err?.response?.data?.message ?? 'Failed to load agent profile.')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  return (
    <section>
      <PageTitle title="Agent Profile" subtitle="Contact details and recent published listings." />
      {loading && <p className="mt-4 text-slate-400">Loading agent profile...</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {!loading && !error && agent && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-700 bg-black">
                {agent.profileImageUrl ? (
                  <img src={resolveImageUrl(agent.profileImageUrl)} alt={`${agent.firstName} ${agent.lastName}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">No photo</div>
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-slate-100">
                  {agent.firstName} {agent.lastName}
                </h2>
                <p className="text-slate-300">{agent.agencyName}</p>
                <p className="text-sm text-slate-400">{agent.email}</p>
                <p className="text-sm text-slate-400">{agent.phoneNumber}</p>
                <p className="text-sm text-slate-400">{agent.publishedPropertyCount} published listings</p>
              </div>
            </div>
            {agent.bio && <p className="mt-4 text-slate-300">{agent.bio}</p>}
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-100">Latest Listings</h3>
            {agent.properties.length === 0 && (
              <p className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-4 text-slate-400">No published listings yet.</p>
            )}
            {agent.properties.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {agent.properties.map((property) => (
                  <article key={property.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="relative aspect-[16/10] bg-black">
                      {property.primaryImageUrl ? (
                        <img src={resolveImageUrl(property.primaryImageUrl)} alt={property.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">No image</div>
                      )}
                    </div>
                    <div className="space-y-2 p-4">
                      <h4 className="line-clamp-1 text-lg font-semibold text-slate-100">{property.title}</h4>
                      <p className="text-sm text-slate-400">
                        {property.city}, {property.area}
                      </p>
                      <p className="text-sm text-slate-300">
                        {property.bedrooms} bd | {property.bathrooms} ba | {property.squareMeters} sqm
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-slate-100">${property.price.toLocaleString()}</p>
                        <Link to={`/properties/${property.id}`} className="rounded-lg border border-slate-700 bg-black px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800">
                          View
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default AgentProfile
