import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import useAuthState from '../hooks/useAuthState'
import { login } from '../services/authService'

function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login({ email, password })
      setAuth(response)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <PageTitle title="Login" />
      <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}

export default Login
