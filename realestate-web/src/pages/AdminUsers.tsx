import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { getAdminUsers, type AdminUserListItemResponse } from '../services/adminService'

function AdminUsers() {
  const [users, setUsers] = useState<AdminUserListItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        setUsers(await getAdminUsers())
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Failed to load users.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <section>
      <PageTitle title="Admin Users" />
      {loading && <p className="mt-3 text-slate-600">Loading users...</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}
      {!loading && !error && users.length === 0 && <p className="mt-3 text-slate-600">No users found.</p>}
      {!loading && !error && users.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/users/${user.id}`} className="rounded border px-3 py-1 text-xs">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminUsers
