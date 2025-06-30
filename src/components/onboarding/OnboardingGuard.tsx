import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { ProfileWizard } from './ProfileWizard'
import { MatrixBackground } from '../MatrixBackground'
import { Loader2 } from 'lucide-react'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, loading, needsOnboarding, isOnboarding, completeOnboarding } = useApp()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#6ad040] animate-spin" />
          <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user, show children (landing page)
  if (!user) {
    return <>{children}</>
  }

  // If user needs onboarding, show onboarding flow
  if (needsOnboarding && isOnboarding) {
    return (
      <div className="min-h-screen bg-black">
        <MatrixBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <img src="/sigmaguy.svg" alt="BasedSigma" className="w-16 h-16 mx-auto mb-4" />
              <h1 className="font-['Orbitron'] font-bold text-[#b7ffab] text-2xl mb-2">
                Welcome to BasedSigma
              </h1>
              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                Let's get you set up to build your business empire
              </p>
            </div>
            
            <ProfileWizard 
              onComplete={completeOnboarding}
              onSkip={() => {
                // Allow skipping for now but mark as incomplete
                completeOnboarding()
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // User is fully set up, show main app
  return <>{children}</>
}