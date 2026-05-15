import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { loginUser } from '../api/auth'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await loginUser(email, password)
      login(user)

      // Route based on role
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/teacher')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center
      justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex
            items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">
            EduConnect
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            School management & WhatsApp automation
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>
              Enter your school email and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50
                  border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500
                    flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@stmarys.edu"
                  required
                  className="w-full px-3 py-2 border border-slate-200
                    rounded-lg text-sm focus:outline-none
                    focus:ring-2 focus:ring-blue-500
                    focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 border border-slate-200
                    rounded-lg text-sm focus:outline-none
                    focus:ring-2 focus:ring-blue-500
                    focus:border-transparent"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-3">
                Demo credentials
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@stmarys.edu')
                    setPassword('admin@123')
                  }}
                  className="text-xs px-3 py-1.5 bg-slate-100
        hover:bg-slate-200 rounded-full text-slate-600
        transition-colors"
                >
                  Admin login
                </button>
              </div>
            </div>

          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          St. Mary's School · EduConnect v1.0
        </p>
      </div>
    </div>
  )
}