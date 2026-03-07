import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthState from '../hooks/useAuthState'
import { addFavorite, removeFavorite } from '../services/favoritesService'

type FavoriteButtonProps = {
  propertyId: number
  isFavorited: boolean
  onChanged?: (isFavorited: boolean) => void
}

function FavoriteButton({ propertyId, isFavorited, onChanged }: FavoriteButtonProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthState()
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(isFavorited)

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      if (active) {
        await removeFavorite(propertyId)
        setActive(false)
        onChanged?.(false)
      } else {
        await addFavorite(propertyId)
        setActive(true)
        onChanged?.(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading}
      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
    >
      {loading ? 'Saving...' : active ? 'Saved' : 'Save'}
    </button>
  )
}

export default FavoriteButton
