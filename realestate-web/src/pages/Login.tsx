import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import useAuthState from '../hooks/useAuthState'
import { login } from '../services/authService'

function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setDebugInfo('')
    setLoading(true)

    try {
      const response = await login({ email, password })
      setAuth(response)
      navigate('/dashboard')
    } catch (err: any) {
      const responseMessage = err?.response?.data?.message
      setError(responseMessage ?? 'Login failed. Please check your credentials.')

      const status = err?.response?.status ?? 'N/A'
      const url = err?.config?.baseURL && err?.config?.url
        ? `${err.config.baseURL}${err.config.url}`
        : err?.config?.url ?? 'N/A'
      const rawData = err?.response?.data ? JSON.stringify(err.response.data) : 'N/A'
      const networkMessage = err?.message ?? 'N/A'
      setDebugInfo(`Status: ${status} | URL: ${url}\nMessage: ${networkMessage}\nResponse: ${rawData}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <PageTitle title="Login" subtitle="Sign in to manage listings, favorites, and inquiries." />
      <Card className="mt-6 max-w-md p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {debugInfo && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {debugInfo}
          </pre>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      </Card>
    </section>
  )
}

export default Login
