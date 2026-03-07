import { useEffect, useMemo, useState, type FormEvent } from 'react'
import PageTitle from '../components/PageTitle'
import useAuthState from '../hooks/useAuthState'
import { resolveImageUrl } from '../services/api'
import {
  deletePropertyImage,
  getPropertyImages,
  reorderPropertyImages,
  setPrimaryPropertyImage,
  uploadPropertyImages,
  type PropertyImageItemResponse,
} from '../services/propertyImagesService'
import {
  createProperty,
  deleteProperty,
  getProperties,
  getProperty,
  updateProperty,
  type SavePropertyRequest,
  type PropertyListItemResponse,
} from '../services/propertyService'

type PropertyFormState = {
  title: string
  description: string
  price: string
  propertyType: string
  listingType: string
  bedrooms: string
  bathrooms: string
  squareMeters: string
  address: string
  postalCode: string
  cityId: string
  areaId: string
  latitude: string
  longitude: string
  yearBuilt: string
  floor: string
  status: string
  amenityIds: string
  imageUrls: string
  primaryImageUrl: string
  agentProfileId: string
}

const defaultForm: PropertyFormState = {
  title: '',
  description: '',
  price: '',
  propertyType: '1',
  listingType: '1',
  bedrooms: '0',
  bathrooms: '0',
  squareMeters: '',
  address: '',
  postalCode: '',
  cityId: '',
  areaId: '',
  latitude: '',
  longitude: '',
  yearBuilt: '',
  floor: '',
  status: '1',
  amenityIds: '',
  imageUrls: '',
  primaryImageUrl: '',
  agentProfileId: '',
}

function Dashboard() {
  const { user } = useAuthState()
  const [items, setItems] = useState<PropertyListItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PropertyFormState>(defaultForm)
  const [images, setImages] = useState<PropertyImageItemResponse[]>([])
  const [imageLoading, setImageLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState('')
  const [imageSuccess, setImageSuccess] = useState('')

  const canManage = useMemo(() => user?.role === 'Admin' || user?.role === 'Agent', [user?.role])

  const loadProperties = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getProperties({ page: 1, pageSize: 20, sortBy: 'newest' })
      setItems(response.items)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load properties.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (canManage) {
      void loadProperties()
    }
  }, [canManage])

  const setField = (key: keyof PropertyFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const parseCsvNumbers = (value: string) =>
    value
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isInteger(x) && x > 0)

  const parseCsvStrings = (value: string) =>
    value
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x.length > 0)

  const toPayload = (): SavePropertyRequest => ({
    title: form.title,
    description: form.description,
    price: Number(form.price),
    propertyType: Number(form.propertyType),
    listingType: Number(form.listingType),
    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    squareMeters: Number(form.squareMeters),
    address: form.address,
    postalCode: form.postalCode || undefined,
    cityId: Number(form.cityId),
    areaId: Number(form.areaId),
    latitude: form.latitude ? Number(form.latitude) : null,
    longitude: form.longitude ? Number(form.longitude) : null,
    yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : null,
    floor: form.floor ? Number(form.floor) : null,
    status: Number(form.status),
    amenityIds: parseCsvNumbers(form.amenityIds),
    imageUrls: parseCsvStrings(form.imageUrls),
    primaryImageUrl: form.primaryImageUrl || null,
    agentProfileId: form.agentProfileId ? Number(form.agentProfileId) : null,
  })

  const resetForm = () => {
    setForm(defaultForm)
    setEditingId(null)
    setImages([])
    setImageError('')
    setImageSuccess('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = toPayload()
      if (!Number.isInteger(payload.cityId) || payload.cityId <= 0) {
        setError('CityId must be a numeric id (for example: 1).')
        return
      }
      if (!Number.isInteger(payload.areaId) || payload.areaId <= 0) {
        setError('AreaId must be a numeric id (for example: 1).')
        return
      }
      if (user?.role === 'Admin' && (!payload.agentProfileId || payload.agentProfileId <= 0)) {
        setError('AgentProfileId is required for Admin and must be a numeric id.')
        return
      }
      if (editingId) {
        await updateProperty(editingId, payload)
      } else {
        await createProperty(payload)
      }

      resetForm()
      await loadProperties()
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors
      if (validationErrors) {
        const messages = Object.values(validationErrors)
          .flatMap((x) => (Array.isArray(x) ? x : [String(x)]))
          .filter(Boolean)
        setError(messages.length > 0 ? messages.join(' | ') : 'Failed to save property.')
      } else {
        setError(err?.response?.data?.message ?? 'Failed to save property.')
      }
    } finally {
      setSaving(false)
    }
  }

  const startEdit = async (id: number) => {
    setError('')
    try {
      const details = await getProperty(id)
      setEditingId(id)
      setImageLoading(true)
      setImageError('')
      setForm({
        title: details.title,
        description: details.description,
        price: String(details.price),
        propertyType: String(details.propertyType),
        listingType: String(details.listingType),
        bedrooms: String(details.bedrooms),
        bathrooms: String(details.bathrooms),
        squareMeters: String(details.squareMeters),
        address: details.address,
        postalCode: details.postalCode ?? '',
        cityId: String(details.cityId),
        areaId: String(details.areaId),
        latitude: details.latitude?.toString() ?? '',
        longitude: details.longitude?.toString() ?? '',
        yearBuilt: details.yearBuilt?.toString() ?? '',
        floor: details.floor?.toString() ?? '',
        status: String(details.status),
        amenityIds: details.amenities.map((a) => a.id).join(','),
        imageUrls: details.images.map((i) => i.imageUrl).join(','),
        primaryImageUrl: details.images.find((i) => i.isPrimary)?.imageUrl ?? '',
        agentProfileId: String(details.agentProfileId),
      })
      const propertyImages = await getPropertyImages(id)
      setImages(propertyImages)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load property details.')
    } finally {
      setImageLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError('')
    try {
      await deleteProperty(id)
      await loadProperties()
      if (editingId === id) {
        resetForm()
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to delete property.')
    }
  }

  const refreshImages = async (propertyId: number) => {
    setImageLoading(true)
    try {
      const data = await getPropertyImages(propertyId)
      setImages(data)
    } finally {
      setImageLoading(false)
    }
  }

  const handleUploadImages = async (files: FileList | null) => {
    if (!editingId || !files || files.length === 0) {
      return
    }

    setImageUploading(true)
    setImageError('')
    setImageSuccess('')
    try {
      const data = await uploadPropertyImages(editingId, files)
      setImages(data)
      setImageSuccess('Images uploaded successfully.')
    } catch (err: any) {
      setImageError(err?.response?.data?.message ?? 'Failed to upload images.')
    } finally {
      setImageUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!editingId) {
      return
    }

    setImageError('')
    setImageSuccess('')
    try {
      await deletePropertyImage(editingId, imageId)
      await refreshImages(editingId)
      setImageSuccess('Image deleted.')
    } catch (err: any) {
      setImageError(err?.response?.data?.message ?? 'Failed to delete image.')
    }
  }

  const handleSetPrimaryImage = async (imageId: number) => {
    if (!editingId) {
      return
    }

    setImageError('')
    setImageSuccess('')
    try {
      const data = await setPrimaryPropertyImage(editingId, imageId)
      setImages(data)
      setImageSuccess('Primary image updated.')
    } catch (err: any) {
      setImageError(err?.response?.data?.message ?? 'Failed to set primary image.')
    }
  }

  const moveImage = async (imageId: number, direction: 'up' | 'down') => {
    if (!editingId || images.length < 2) {
      return
    }

    const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = sorted.findIndex((x) => x.id === imageId)
    if (index < 0) {
      return
    }

    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= sorted.length) {
      return
    }

    const next = [...sorted]
    const temp = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = temp

    try {
      const data = await reorderPropertyImages(editingId, next.map((x) => x.id))
      setImages(data)
    } catch (err: any) {
      setImageError(err?.response?.data?.message ?? 'Failed to reorder images.')
    }
  }

  return (
    <section>
      <PageTitle title="Dashboard" />
      {!canManage && <p className="mt-3 text-slate-400">Property management is available for Admin and Agent users.</p>}
      {canManage && (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">{editingId ? 'Edit Property' : 'Create Property'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg bg-slate-900 p-4 shadow-sm">
              <input className="w-full rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Title" value={form.title} onChange={(e) => setField('title', e.target.value)} />
              <textarea className="w-full rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Description" value={form.description} onChange={(e) => setField('description', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Price" value={form.price} onChange={(e) => setField('price', e.target.value)} />
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Square meters" value={form.squareMeters} onChange={(e) => setField('squareMeters', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Bedrooms" value={form.bedrooms} onChange={(e) => setField('bedrooms', e.target.value)} />
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => setField('bathrooms', e.target.value)} />
              </div>
              <input className="w-full rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Address" value={form.address} onChange={(e) => setField('address', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="CityId" value={form.cityId} onChange={(e) => setField('cityId', e.target.value)} />
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="AreaId" value={form.areaId} onChange={(e) => setField('areaId', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="PropertyType (1-6)" value={form.propertyType} onChange={(e) => setField('propertyType', e.target.value)} />
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="ListingType (1-2)" value={form.listingType} onChange={(e) => setField('listingType', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Status (1-5)" value={form.status} onChange={(e) => setField('status', e.target.value)} />
                <input className="rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="AgentProfileId (Admin)" value={form.agentProfileId} onChange={(e) => setField('agentProfileId', e.target.value)} />
              </div>
              <input className="w-full rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Amenity IDs CSV (e.g. 1,2,3)" value={form.amenityIds} onChange={(e) => setField('amenityIds', e.target.value)} />
              <input className="w-full rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Image URLs CSV" value={form.imageUrls} onChange={(e) => setField('imageUrls', e.target.value)} />
              <input className="w-full rounded border border-slate-700 bg-black px-3 py-2 text-slate-100" placeholder="Primary image URL" value={form.primaryImageUrl} onChange={(e) => setField('primaryImageUrl', e.target.value)} />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Property' : 'Create Property'}
                </button>
                {editingId && (
                  <button className="rounded border border-slate-700 bg-black px-4 py-2 text-slate-100" type="button" onClick={resetForm}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {editingId && (
              <div className="mt-6 rounded-lg bg-slate-900 p-4 shadow-sm">
                <h3 className="text-lg font-semibold">Property Images</h3>
                <div className="mt-3 space-y-3">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => void handleUploadImages(e.target.files)}
                    disabled={imageUploading}
                    className="w-full rounded border border-slate-700 bg-black px-3 py-2 text-slate-100"
                  />
                  {imageUploading && <p className="text-sm text-slate-400">Uploading images...</p>}
                  {imageLoading && <p className="text-sm text-slate-400">Loading images...</p>}
                  {imageError && <p className="text-sm text-red-400">{imageError}</p>}
                  {imageSuccess && <p className="text-sm text-green-400">{imageSuccess}</p>}

                  {!imageLoading && images.length === 0 && <p className="text-sm text-slate-400">No images uploaded yet.</p>}

                  {!imageLoading && images.length > 0 && (
                    <div className="space-y-3">
                      {[...images]
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((image, idx, arr) => (
                          <div key={image.id} className="flex flex-wrap items-center gap-3 rounded border border-slate-700 bg-black p-2">
                            <img src={resolveImageUrl(image.imageUrl)} alt="Property" className="h-20 w-28 rounded object-cover" />
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-slate-300">{image.isPrimary ? 'Primary' : `Order ${image.sortOrder + 1}`}</span>
                              <button type="button" className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-200" onClick={() => void handleSetPrimaryImage(image.id)}>
                                Set Primary
                              </button>
                              <button
                                type="button"
                                className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-200"
                                disabled={idx === 0}
                                onClick={() => void moveImage(image.id, 'up')}
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-200"
                                disabled={idx === arr.length - 1}
                                onClick={() => void moveImage(image.id, 'down')}
                              >
                                Down
                              </button>
                              <button
                                type="button"
                                className="rounded border border-red-600 px-2 py-1 text-xs text-red-400"
                                onClick={() => void handleDeleteImage(image.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Managed Properties</h2>
            {loading && <p className="mt-3 text-slate-400">Loading...</p>}
            {!loading && (
              <div className="mt-4 space-y-3">
                {items.map((property) => (
                  <div key={property.id} className="rounded-lg bg-slate-900 p-4 shadow-sm">
                    <p className="font-semibold">{property.title}</p>
                    <p className="text-sm text-slate-300">
                      {property.city} / {property.area} | {property.price}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-200" type="button" onClick={() => startEdit(property.id)}>
                        Edit
                      </button>
                      <button className="rounded border border-red-600 px-3 py-1 text-sm text-red-400" type="button" onClick={() => void handleDelete(property.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="text-slate-400">No properties yet.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default Dashboard

