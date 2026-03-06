import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { getAdminUserById, type AdminUserDetailsResponse } from '../services/adminService'

function AdminUserDetails() {
  const { id } = useParams()
  const [user, setUser] = useState<AdminUserDetailsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const userId = Number(id)
    if (!Number.isFinite(userId) || userId <= 0) {
      setError('Invalid user id.')
      return
    }

    void (async () => {
      setLoading(true)
      setError('')
      try {
        setUser(await getAdminUserById(userId))
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError('User not found.')
        } else {
          setError(err?.response?.data?.message ?? 'Failed to load user details.')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  return (
    <section>
      <PageTitle title="Admin User Details" />
      <Link to="/admin/users" className="mt-3 inline-block text-sm text-slate-600 hover:text-slate-900">
        Back to users
      </Link>
      {loading && <p className="mt-3 text-slate-600">Loading user details...</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}
      {!loading && !error && user && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="text-xl font-semibold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-slate-600">{user.email}</p>
            <p className="text-slate-600">Role: {user.role}</p>
            <p className="text-slate-600">Created: {new Date(user.createdAt).toLocaleString()}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-600">Managed Properties</p>
              <p className="mt-2 text-2xl font-bold">{user.propertyCount}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-600">Submitted Inquiries</p>
              <p className="mt-2 text-2xl font-bold">{user.inquiryCount}</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Agent Profile</h3>
            {user.agentProfile ? (
              <div className="mt-2 space-y-1 text-slate-700">
                <p>Agency: {user.agentProfile.agencyName}</p>
                <p>Phone: {user.agentProfile.phoneNumber}</p>
                <p>Bio: {user.agentProfile.bio || '-'}</p>
              </div>
            ) : (
              <p className="mt-2 text-slate-600">No agent profile for this user.</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminUserDetails
