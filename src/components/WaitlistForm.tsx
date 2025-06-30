import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useWaitlist } from '../hooks/useWaitlist'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

export const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const { loading, success, error, submitEmail, resetState } = useWaitlist()
  const { signUp, signIn, user } = useApp()
  const [isLogin, setIsLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If user wants to sign up/login
    if (password) {
      setAuthError('')
      try {
        const { error } = isLogin 
          ? await signIn(email, password)
          : await signUp(email, password)
        
        if (error) {
          setAuthError(error.message)
        } else {
          // Success - user will be redirected by the app state
          if (!isLogin) {
            // Also add to waitlist for new signups
            await submitEmail(email)
          }
        }
      } catch (err) {
        setAuthError('Authentication failed')
      }
      return
    }
    
    // Regular waitlist signup
    await submitEmail(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error || success) {
      resetState()
    }
    if (authError) {
      setAuthError('')
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (authError) {
      setAuthError('')
    }
  }

  // Reset form after successful submission
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setEmail('')
        setPassword('')
        resetState()
      }, 5000) // Reset after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [success, resetState])

  // If user is already logged in, show different message
  if (user) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="text-center p-6 bg-green-500/10 backdrop-blur-md border border-green-500/30 rounded-lg">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="font-['Space_Mono'] text-green-400 text-lg font-bold mb-2">
            Welcome back, Sigma!
          </p>
          <p className="font-['Space_Mono'] text-green-400/80 text-sm">
            You're logged in and ready to build. Click "Enter App" to access your dashboard.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            disabled={loading || success}
            className={`w-full h-12 lg:h-14 px-6 bg-black/40 backdrop-blur-md border-2 rounded-full text-[#b7ffab] font-['Space_Grotesk'] font-bold text-center placeholder:text-[#b7ffab]/60 focus-visible:ring-2 focus-visible:ring-[#6ad040] focus-visible:border-[#6ad040] focus-visible:shadow-lg focus-visible:shadow-[#6ad040]/30 transition-all duration-300 ${
              error || authError
                ? 'border-red-500/50 focus-visible:ring-red-500 focus-visible:border-red-500' 
                : success 
                ? 'border-green-500/50 focus-visible:ring-green-500 focus-visible:border-green-500'
                : 'border-[#6ad040]/50'
            }`}
            placeholder={success ? "Welcome to the Sigma family!" : "youremail@sigma.com"}
          />
          
          {/* Status icons */}
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-[#6ad040] animate-spin" />
            </div>
          )}
          
          {success && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
          
          {(error || authError) && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>

        {/* Password field (optional) */}
        {password || isLogin ? (
          <div className="relative">
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              disabled={loading || success}
              className="w-full h-12 lg:h-14 px-6 bg-black/40 backdrop-blur-md border-2 rounded-full text-[#b7ffab] font-['Space_Grotesk'] font-bold text-center placeholder:text-[#b7ffab]/60 focus-visible:ring-2 focus-visible:ring-[#6ad040] focus-visible:border-[#6ad040] focus-visible:shadow-lg focus-visible:shadow-[#6ad040]/30 transition-all duration-300 border-[#6ad040]/50"
              placeholder="password"
            />
          </div>
        ) : null}
        <Button 
          type="submit"
          disabled={loading || success || !email.trim() || (!!password && password.length < 6)}
          className={`w-full sm:w-auto font-['Orbitron'] font-black text-lg lg:text-xl px-8 lg:px-12 py-3 lg:py-4 rounded-full border-2 transition-all duration-300 active:scale-95 ${
            success 
              ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/50 hover:shadow-2xl hover:shadow-green-500/60'
              : loading
              ? 'bg-[#6ad040]/50 text-[#161616]/70 border-[#6ad040]/30 cursor-not-allowed'
              : 'bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] border-[#6ad040]/50 hover:scale-105 hover:shadow-2xl hover:shadow-[#6ad040]/60'
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {password ? 'Authenticating...' : 'Joining...'}
            </div>
          ) : success ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Welcome Aboard!
            </div>
          ) : (
            password ? (isLogin ? 'Sign In' : 'Sign Up') : 'Join Waitlist'
          )}
        </Button>
        
        {/* Toggle between signup/login and add password option */}
        <div className="text-center space-y-2">
          {!password && !isLogin && (
            <button
              type="button"
              onClick={() => setPassword(' ')}
              className="text-[#6ad040] hover:text-[#79e74c] font-['Space_Mono'] text-sm underline"
            >
              Want to access the app? Add a password
            </button>
          )}
          
          {password && (
            <div className="flex items-center justify-center gap-4 text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`font-['Space_Mono'] ${!isLogin ? 'text-[#6ad040]' : 'text-[#b7ffab]/60'} hover:text-[#6ad040]`}
              >
                Sign Up
              </button>
              <span className="text-[#b7ffab]/40">|</span>
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`font-['Space_Mono'] ${isLogin ? 'text-[#6ad040]' : 'text-[#b7ffab]/60'} hover:text-[#6ad040]`}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Error message */}
      {(error || authError) && (
        <div className="text-center p-3 bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-lg">
          <p className="font-['Space_Mono'] text-red-400 text-sm">{error || authError}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="text-center p-4 bg-green-500/10 backdrop-blur-md border border-green-500/30 rounded-lg">
          <p className="font-['Space_Mono'] text-green-400 text-sm lg:text-base font-bold mb-2">
            🎉 You're in! Welcome to the Sigma family!
          </p>
          <p className="font-['Space_Mono'] text-green-400/80 text-xs lg:text-sm">
            {password ? "Your account is created! You can now access the app." : "We'll notify you when Sigma is ready to revolutionize your business."}
          </p>
        </div>
      )}
    </div>
  )
}