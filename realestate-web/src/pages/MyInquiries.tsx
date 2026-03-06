import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import useAuthState from '../hooks/useAuthState'
import { getMyInquiries, inquiryStatusLabel, type InquiryListItemResponse } from '../services/inquiriesService'

function MyInquiries() {
  const { isAuthenticated } = useAuthState()
  const [items, setItems] = useState<InquiryListItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    void (async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getMyInquiries()
        setItems(data)
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Failed to load inquiries.')
      } finally {
        setLoading(false)
      }
    })()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <section>
      <PageTitle title="My Inquiries" />
      <div className="mt-6">
        {loading && <p className="text-slate-600">Loading inquiries...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-slate-600">You have not submitted any inquiries yet.</p>}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map((inquiry) => (
              <article key={inquiry.id} className="rounded-lg bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{inquiry.propertyTitle}</h3>
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs">{inquiryStatusLabel(inquiry.status)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{new Date(inquiry.createdAt).toLocaleString()}</p>
                <p className="mt-2 text-sm text-slate-700">{inquiry.messagePreview}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default MyInquiries
