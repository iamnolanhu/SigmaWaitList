import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, XCircle } from 'lucide-react'
import { AuthService, PasswordStrength } from '../../lib/api/authService'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'

interface SignupFormProps {
  onSuccess?: () => void
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [], isValid: false })

  useEffect(() => {
    if (password) {
      const strength = AuthService.checkPasswordStrength(password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength({ score: 0, feedback: [], isValid: false })
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!passwordStrength.isValid) {
      setError('Please choose a stronger password')
      return
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setLoading(true)

    try {
      const result = await AuthService.signUp(email, password)
      
      if (result.error) {
        setError(result.error)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-400">Create Account</h2>
          <p className="text-gray-400 mt-2">Join the BasedSigma community</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-10 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {password && (
            <div className="mt-3">
              <PasswordStrengthIndicator strength={passwordStrength} />
              {passwordStrength.feedback.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-400">Password must include:</p>
                  {passwordStrength.feedback.map((item, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs">
                      <XCircle className="h-3 w-3 text-red-400" />
                      <span className="text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 bg-gray-900 border-gray-700 rounded text-green-500 focus:ring-green-500 focus:ring-offset-0 focus:ring-2"
            />
            <span className="text-sm text-gray-300">
              I agree to the{' '}
              <Link to="/terms" className="text-green-400 hover:text-green-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-green-400 hover:text-green-300 underline">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !passwordStrength.isValid || !acceptTerms}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <div className="text-center">
          <span className="text-gray-400">Already have an account? </span>
          <Link
            to="/login"
            className="text-green-400 hover:text-green-300 transition-colors font-medium"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}