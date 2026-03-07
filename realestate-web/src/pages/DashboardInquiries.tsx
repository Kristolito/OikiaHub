import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import useAuthState from '../hooks/useAuthState'
import {
  getAdminInquiries,
  getAgentInquiries,
  getInquiryDetails,
  inquiryStatusLabel,
  type InquiryDetailsResponse,
  type InquiryListItemResponse,
  type InquiryStatus,
  updateInquiryStatus,
} from '../services/inquiriesService'

function DashboardInquiries() {
  const { isAuthenticated, user } = useAuthState()
  const [items, setItems] = useState<InquiryListItemResponse[]>([])
  const [selected, setSelected] = useState<InquiryDetailsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  const canManage = user?.role === 'Agent' || user?.role === 'Admin'

  const load = async () => {
    if (!canManage) {
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = user?.role === 'Admin' ? await getAdminInquiries() : await getAgentInquiries()
      setItems(data)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load inquiries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [user?.role])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!canManage) {
    return <Navigate to="/" replace />
  }

  const openDetails = async (id: number) => {
    setError('')
    try {
      const details = await getInquiryDetails(id)
      setSelected(details)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load inquiry details.')
    }
  }

  const onStatusChange = async (status: InquiryStatus) => {
    if (!selected) {
      return
    }

    setUpdating(true)
    setError('')
    try {
      const updated = await updateInquiryStatus(selected.id, { status })
      setSelected(updated)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update inquiry status.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <section>
      <PageTitle title="Dashboard Inquiries" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          {loading && <p className="text-slate-400">Loading inquiries...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && items.length === 0 && <p className="text-slate-400">No inquiries found.</p>}
          {!loading && !error && items.length > 0 && (
            <div className="space-y-3">
              {items.map((inquiry) => (
                <button
                  key={inquiry.id}
                  type="button"
                  onClick={() => void openDetails(inquiry.id)}
                  className="w-full rounded-lg bg-slate-900 p-4 text-left shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-100">{inquiry.propertyTitle}</p>
                    <span className="rounded bg-black px-2 py-1 text-xs text-slate-200">{inquiryStatusLabel(inquiry.status)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    {inquiry.fullName} - {inquiry.email}
                  </p>
                  <p className="mt-2 text-sm text-slate-200">{inquiry.messagePreview}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-slate-900 p-4 shadow-sm">
          {!selected && <p className="text-slate-400">Select an inquiry to view details.</p>}
          {selected && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-100">{selected.propertyTitle}</h3>
              <p className="text-sm text-slate-300">
                {selected.propertyCity}, {selected.propertyArea} | ${selected.propertyPrice.toLocaleString()}
              </p>
              <p className="text-sm text-slate-300">
                From: {selected.fullName} ({selected.email})
              </p>
              <p className="text-sm text-slate-300">Phone: {selected.phoneNumber || '-'}</p>
              <p className="rounded bg-black p-3 text-sm text-slate-200">{selected.message}</p>
              <label className="text-sm font-medium text-slate-200">Status</label>
              <select
                value={selected.status}
                onChange={(e) => void onStatusChange(Number(e.target.value) as InquiryStatus)}
                disabled={updating}
                className="w-full rounded border border-slate-700 bg-black px-3 py-2 text-slate-100"
              >
                <option value={1}>New</option>
                <option value={2}>Read</option>
                <option value={3}>Replied</option>
                <option value={4}>Closed</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DashboardInquiries

