import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
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
      <PageTitle title="Register" subtitle="Create an account to save homes and contact agents." />
      <Card className="mt-6 max-w-md p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            First Name
          </label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Last Name
          </label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
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
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      </Card>
    </section>
  )
}

export default Register
