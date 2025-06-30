import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { MatrixBackground } from '../../components/MatrixBackground'
import { useApp } from '../../contexts/AppContext'
import { Navbar } from '../../components/Navbar'
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { trackEvent } from '../../lib/analytics'

export const Login = (): JSX.Element => {
  const navigate = useNavigate()
  const { user, signIn, signUp } = useApp()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password)

      if (result.error) {
        setError(result.error)
        trackEvent('auth_error', { 
          type: isLogin ? 'login' : 'signup', 
          error: result.error 
        })
      } else {
        if (isLogin) {
          setSuccess('Login successful! Redirecting to dashboard...')
          trackEvent('login_success')
          // The AppContext will handle the redirect
        } else {
          setSuccess('Account created! Please check your email to verify your account.')
          trackEvent('signup_success')
          setIsLogin(true) // Switch to login form
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      trackEvent('auth_error', { 
        type: isLogin ? 'login' : 'signup', 
        error: err.message 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToWaitlist = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* Matrix Background Animation */}
      <MatrixBackground className="z-[5]" />
      
      {/* Subtle overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/70 via-[#1a1a1a]/50 to-[#1a1a1a]/70 pointer-events-none z-[6]" />

      {/* Top radial gradient accent */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vw] h-[60vh] pointer-events-none z-[7]">
        <div className="w-full h-full rounded-full [background:radial-gradient(50%_50%_at_50%_50%,rgba(106,208,64,0.15)_0%,rgba(106,208,64,0.08)_30%,rgba(27,27,27,0)_70%)]" />
      </div>

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Enhanced Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center pt-16 md:pt-20">
          <div className="w-full max-w-md mx-auto px-4">
            {/* Back to Waitlist Button */}
            <div className="mb-8">
              <button
                onClick={handleBackToWaitlist}
                className="flex items-center gap-2 text-[#b7ffab] hover:text-[#6ad040] transition-all duration-300 font-['Space_Mono'] text-sm hover:drop-shadow-lg hover:drop-shadow-[#6ad040]/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Waitlist
              </button>
            </div>

            {/* Login Card */}
            <Card className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 shadow-2xl shadow-[#6ad040]/20 overflow-hidden">
              <CardContent className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  {/* Logo */}
                  <div className="w-32 h-8 mx-auto mb-4 bg-[url(/SigmaLogo.svg)] bg-contain bg-no-repeat bg-center filter drop-shadow-lg" />
                  
                  <h1 className="font-['Orbitron'] font-black text-[#ffff] text-2xl mb-2 drop-shadow-lg drop-shadow-[#6ad040]/50">
                    {isLogin ? 'SIGMA LOGIN' : 'JOIN THE SIGMA REVOLUTION'}
                  </h1>
                  
                  <p className="font-['Space_Mono'] text-[#b7ffab] text-sm opacity-90">
                    {isLogin 
                      ? 'Access your business automation dashboard' 
                      : 'Create your account and start building'
                    }
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block font-['Space_Mono'] text-[#b7ffab] text-sm font-bold mb-2">
                      EMAIL
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      className="bg-black/40 border-[#6ad040]/40 text-[#b7ffab] placeholder-[#b7ffab]/50 focus:border-[#6ad040] focus:ring-[#6ad040]/20 disabled:opacity-50"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block font-['Space_Mono'] text-[#b7ffab] text-sm font-bold mb-2">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="bg-black/40 border-[#6ad040]/40 text-[#b7ffab] placeholder-[#b7ffab]/50 focus:border-[#6ad040] focus:ring-[#6ad040]/20 pr-12 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b7ffab]/50 hover:text-[#6ad040] transition-colors disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                      <p className="font-['Space_Mono'] text-red-400 text-sm">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="bg-[#6ad040]/20 border border-[#6ad040]/40 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#6ad040] flex-shrink-0" />
                        <p className="font-['Space_Mono'] text-[#6ad040] text-sm">
                          {success}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Orbitron'] font-black text-base px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_6px_rgba(106,208,64,0.5)] border border-[#6ad040]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isLogin ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}
                      </div>
                    ) : (
                      isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'
                    )}
                  </Button>
                </form>

                {/* Toggle Login/Signup */}
                <div className="mt-6 text-center">
                  <p className="font-['Space_Mono'] text-[#b7ffab] text-sm opacity-80">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError('')
                      setSuccess('')
                    }}
                    disabled={loading}
                    className="font-['Space_Mono'] text-[#6ad040] hover:text-[#79e74c] text-sm font-bold transition-colors duration-300 hover:drop-shadow-lg hover:drop-shadow-[#6ad040]/50 disabled:opacity-50"
                  >
                    {isLogin ? 'CREATE ACCOUNT' : 'SIGN IN'}
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-[#6ad040]/20">
                  <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs text-center leading-relaxed">
                    By {isLogin ? 'signing in' : 'creating an account'}, you agree to our terms of service and privacy policy.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="font-['Space_Mono'] text-[#b7ffab]/40 text-xs">
                Built with <span className="text-[#6ad040]">⚡</span> for the Sigmas
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 