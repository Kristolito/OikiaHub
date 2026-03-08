import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FavoriteButton from '../components/FavoriteButton'
import PageTitle from '../components/PageTitle'
import useAuthState from '../hooks/useAuthState'
import { checkFavorite } from '../services/favoritesService'
import { createInquiry } from '../services/inquiriesService'
import { resolveImageUrl } from '../services/api'
import { getProperty, type PropertyDetailsResponse } from '../services/propertyService'
import { addRecentlyViewed } from '../services/recentlyViewedService'

const propertyStatusLabels: Record<number, string> = {
  1: 'Draft',
  2: 'Published',
  3: 'Sold',
  4: 'Rented',
  5: 'Archived',
}

function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthState()
  const [property, setProperty] = useState<PropertyDetailsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [inquiryLoading, setInquiryLoading] = useState(false)
  const [inquirySuccess, setInquirySuccess] = useState('')
  const [inquiryError, setInquiryError] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [downPayment, setDownPayment] = useState('20')
  const [interestRate, setInterestRate] = useState('4.5')
  const [loanYears, setLoanYears] = useState('25')

  useEffect(() => {
    if (user) {
      setFullName(`${user.firstName} ${user.lastName}`.trim())
      setEmail(user.email)
    }
  }, [user])

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
        const response = await getProperty(propertyId)
        setProperty(response)
        addRecentlyViewed({
          id: response.id,
          title: response.title,
          price: response.price,
          city: response.city,
          area: response.area,
          bedrooms: response.bedrooms,
          bathrooms: response.bathrooms,
          squareMeters: response.squareMeters,
          listingType: response.listingType,
          primaryImageUrl: response.images.find((x) => x.isPrimary)?.imageUrl ?? response.images[0]?.imageUrl ?? null,
        })
        if (isAuthenticated) {
          const favoriteStatus = await checkFavorite(propertyId)
          setIsFavorited(favoriteStatus.isFavorited)
        } else {
          setIsFavorited(false)
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError('Property not found.')
        } else {
          setError(err?.response?.data?.message ?? 'Failed to load property.')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isAuthenticated])

  const hasCoordinates =
    property &&
    typeof property.latitude === 'number' &&
    typeof property.longitude === 'number' &&
    Number.isFinite(property.latitude) &&
    Number.isFinite(property.longitude)

  const latitude = hasCoordinates ? property.latitude! : null
  const longitude = hasCoordinates ? property.longitude! : null

  const mapEmbedUrl =
    hasCoordinates && latitude !== null && longitude !== null
      ? (() => {
          const delta = 0.01
          const left = longitude - delta
          const right = longitude + delta
          const top = latitude + delta
          const bottom = latitude - delta
          return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`
        })()
      : null

  const googleMapsUrl =
    hasCoordinates && latitude !== null && longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : null

  const monthlyPayment = (() => {
    if (!property) {
      return null
    }

    const depositPercent = Number(downPayment)
    const annualRate = Number(interestRate)
    const years = Number(loanYears)

    if (!Number.isFinite(depositPercent) || !Number.isFinite(annualRate) || !Number.isFinite(years) || years <= 0) {
      return null
    }

    const principal = Number(property.price) * (1 - Math.max(0, Math.min(100, depositPercent)) / 100)
    const monthlyRate = annualRate / 100 / 12
    const totalPayments = years * 12

    if (principal <= 0) {
      return 0
    }

    if (monthlyRate <= 0) {
      return principal / totalPayments
    }

    const factor = Math.pow(1 + monthlyRate, totalPayments)
    return (principal * monthlyRate * factor) / (factor - 1)
  })()

  return (
    <section>
      <PageTitle title="Property Details" />
      {loading && <p className="mt-3 text-slate-600 dark:text-slate-400">Loading property...</p>}
      {error && <p className="mt-3 text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && property && (
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{property.title}</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {property.city}, {property.area}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">${property.price.toLocaleString()}</p>
            <p className="text-slate-700 dark:text-slate-300">{property.description}</p>
            <FavoriteButton propertyId={property.id} isFavorited={isFavorited} onChanged={setIsFavorited} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {property.images.length > 0 ? (
              property.images.map((image) => (
                <img key={image.id} src={resolveImageUrl(image.imageUrl)} alt={property.title} className="h-44 w-full rounded-lg object-cover" />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-slate-500 dark:border-slate-700 dark:text-slate-400">No images available.</div>
            )}
          </div>

          <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm   sm:grid-cols-2">
            <p>Bedrooms: {property.bedrooms}</p>
            <p>Bathrooms: {property.bathrooms}</p>
            <p>Square Meters: {property.squareMeters}</p>
            <p>Address: {property.address}</p>
            <p>Postal Code: {property.postalCode || '-'}</p>
            <p>Year Built: {property.yearBuilt ?? '-'}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-100">Location</h3>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-700 bg-black px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
            {mapEmbedUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-700">
                <iframe
                  title="Property Location Map"
                  src={mapEmbedUrl}
                  className="h-72 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Map is unavailable for this listing because coordinates are missing.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm  ">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Amenities</h3>
            {property.amenities.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <li key={amenity.id} className="rounded bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">
                    {amenity.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-slate-600 dark:text-slate-400">No amenities listed.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm  ">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Agent</h3>
            <p className="mt-1">
              {property.agent.firstName} {property.agent.lastName}
            </p>
            <p className="text-slate-600 dark:text-slate-400">{property.agent.email}</p>
            <p className="text-slate-600 dark:text-slate-400">{property.agent.phoneNumber}</p>
            <p className="text-slate-600 dark:text-slate-400">{property.agent.agencyName}</p>
            <Link
              to={`/agents/${property.agent.id}`}
              className="mt-3 inline-flex rounded-lg border border-slate-700 bg-black px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
            >
              View Agent Profile
            </Link>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-100">Mortgage Calculator</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="text-slate-400">Down payment %</span>
                <input
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-slate-100"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-400">Interest rate %</span>
                <input
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-slate-100"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-400">Loan term (years)</span>
                <input
                  value={loanYears}
                  onChange={(e) => setLoanYears(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-slate-100"
                />
              </label>
            </div>
            <p className="mt-4 text-sm text-slate-400">Estimated monthly payment</p>
            <p className="text-2xl font-bold text-slate-100">
              {monthlyPayment === null ? '-' : `$${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-100">Listing Timeline</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Listed:</span>{' '}
                {new Date(property.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="text-slate-400">Last update:</span>{' '}
                {new Date(property.updatedAt).toLocaleString()}
              </p>
              <p>
                <span className="text-slate-400">Current status:</span>{' '}
                {propertyStatusLabels[property.status] ?? `Status ${property.status}`}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm  ">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Contact Agent</h3>
            <form
              className="mt-3 space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (!isAuthenticated) {
                  navigate('/login')
                  return
                }
                if (!property) {
                  return
                }

                void (async () => {
                  setInquiryLoading(true)
                  setInquiryError('')
                  setInquirySuccess('')
                  try {
                    await createInquiry({
                      propertyId: property.id,
                      fullName,
                      email,
                      phoneNumber,
                      message,
                    })
                    setMessage('')
                    setInquirySuccess('Inquiry submitted successfully.')
                  } catch (err: any) {
                    const validationErrors = err?.response?.data?.errors
                    if (validationErrors) {
                      const first = Object.values(validationErrors)[0] as string[] | undefined
                      setInquiryError(first?.[0] ?? 'Failed to submit inquiry.')
                    } else {
                      setInquiryError(err?.response?.data?.message ?? 'Failed to submit inquiry.')
                    }
                  } finally {
                    setInquiryLoading(false)
                  }
                })()
              }}
            >
              <input className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 dark:border-slate-700 " placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 dark:border-slate-700 " placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 dark:border-slate-700 " placeholder="Phone Number (optional)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              <textarea className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 dark:border-slate-700 " placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
              {inquiryError && <p className="text-sm text-red-600">{inquiryError}</p>}
              {inquirySuccess && <p className="text-sm text-green-700">{inquirySuccess}</p>}
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900" disabled={inquiryLoading}>
                {inquiryLoading ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default PropertyDetails

