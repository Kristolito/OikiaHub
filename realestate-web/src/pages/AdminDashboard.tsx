import { useEffect, useState } from 'react'
import PageTitle from '../components/PageTitle'
import { getAdminDashboard, type AdminDashboardResponse } from '../services/adminService'

const defaultSummary: AdminDashboardResponse = {
  totalUsers: 0,
  totalAgents: 0,
  totalProperties: 0,
  totalPublishedProperties: 0,
  totalDraftProperties: 0,
  totalSoldProperties: 0,
  totalInquiries: 0,
  recentUsersCount: 0,
  recentPropertiesCount: 0,
}

function AdminDashboard() {
  const [summary, setSummary] = useState<AdminDashboardResponse>(defaultSummary)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        setSummary(await getAdminDashboard())
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Failed to load admin dashboard.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const cards = [
    { label: 'Total Users', value: summary.totalUsers },
    { label: 'Total Agents', value: summary.totalAgents },
    { label: 'Total Properties', value: summary.totalProperties },
    { label: 'Published', value: summary.totalPublishedProperties },
    { label: 'Draft', value: summary.totalDraftProperties },
    { label: 'Sold', value: summary.totalSoldProperties },
    { label: 'Total Inquiries', value: summary.totalInquiries },
    { label: 'Recent Users (30d)', value: summary.recentUsersCount },
    { label: 'Recent Properties (30d)', value: summary.recentPropertiesCount },
  ]

  return (
    <section>
      <PageTitle title="Admin Dashboard" />
      {loading && <p className="mt-3 text-slate-400">Loading dashboard...</p>}
      {error && <p className="mt-3 text-red-400">{error}</p>}
      {!loading && !error && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article key={card.label} className="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm">
              <p className="text-sm text-slate-300">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-100">{card.value}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdminDashboard

