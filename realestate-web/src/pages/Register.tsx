import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import useAuthState from '../hooks/useAuthState'
import { register } from '../services/authService'

function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthState()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      })
      setAuth(response)
      navigate('/dashboard')
    } catch (err: any) {
      const message = err?.response?.data?.message
      const validationErrors = err?.response?.data?.errors
      if (message) {
        setError(message)
      } else if (validationErrors) {
        const firstError = Object.values(validationErrors)[0] as string[] | undefined
        setError(firstError?.[0] ?? 'Registration failed.')
      } else {
        setError('Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <PageTitle title="Register" />
      <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>
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
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </section>
  )
}

export default Register
