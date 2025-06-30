import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { AuthService } from '../../lib/api/authService'

interface EmailVerificationProps {
  email?: string
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ email: propEmail }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  
  const email = propEmail || searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  useEffect(() => {
    // Auto-verify if token is present in URL
    if (token && email) {
      handleVerifyToken()
    }
  }, [token, email])

  useEffect(() => {
    // Check if email is already verified
    const checkVerification = async () => {
      const isVerified = await AuthService.isEmailVerified()
      if (isVerified) {
        setVerified(true)
      }
    }
    checkVerification()
  }, [])

  useEffect(() => {
    // Handle resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerifyToken = async () => {
    setVerifying(true)
    setError(null)

    try {
      const result = await AuthService.verifyEmail(token, email)
      
      if (result.error) {
        setError(result.error)
      } else {
        setVerified(true)
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return

    setLoading(true)
    setError(null)

    try {
      const result = await AuthService.sendVerificationEmail(email)
      
      if (result.error) {
        setError(result.error)
      } else {
        setResendCooldown(60) // 60 second cooldown
      }
    } catch (err) {
      setError('Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-8">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-400 mb-2">Email Verified!</h2>
          <p className="text-gray-300">
            Your email has been successfully verified. Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <RefreshCw className="h-16 w-16 text-green-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
          <p className="text-gray-400">Please wait while we verify your email address.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="text-center mb-6">
          <Mail className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
          <p className="text-gray-400">
            {email ? `We've sent a verification email to ${email}` : 'Please check your email for the verification link'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Didn't receive the email?</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes for the email to arrive</li>
            </ul>
          </div>

          {email && (
            <button
              onClick={handleResendEmail}
              disabled={loading || resendCooldown > 0}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : loading
                ? 'Sending...'
                : 'Resend verification email'}
            </button>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-green-400 hover:text-green-300 transition-colors text-sm"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}