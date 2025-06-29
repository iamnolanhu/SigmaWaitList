import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { useUserProfile } from '../../hooks/useUserProfile'
import { MatrixBackground } from '../../components/MatrixBackground'
import { ProfileSetup } from '../../components/profile'
import { Navbar } from '../../components/Navbar'
import { CheckCircle } from 'lucide-react'

export const AppDashboard: React.FC = () => {
  const { user } = useApp()
  const { profile, loading: profileLoading } = useUserProfile()
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'profile'>('dashboard')

  // If profile is incomplete, show profile setup
  const isProfileComplete = profile && (profile.completion_percentage || 0) >= 80
  const shouldShowProfileSetup = !profileLoading && !isProfileComplete && currentView === 'dashboard'

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* Matrix Background Animation */}
      <MatrixBackground className="z-[5]" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/70 via-[#1a1a1a]/50 to-[#1a1a1a]/70 pointer-events-none z-[6]" />

      {/* Enhanced Navbar */}
      <Navbar onNavigate={(section) => {
        if (section === 'profile') setCurrentView('profile')
      }} />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 pt-20">
        {currentView === 'profile' ? (
          <ProfileSetup />
        ) : shouldShowProfileSetup ? (
          <div className="max-w-2xl mx-auto">
            {/* Profile Setup Prompt */}
            <div className="text-center mb-8">
              <h1 className="font-['Orbitron'] font-black text-[#ffff] text-3xl lg:text-4xl mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50">
                WELCOME TO SIGMA
              </h1>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-lg mb-6 opacity-90">
                Let's set up your profile to personalize your business automation experience
              </p>
            </div>
            <ProfileSetup />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="font-['Orbitron'] font-black text-[#ffff] text-4xl lg:text-6xl mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
              SIGMA COMMAND CENTER
            </h1>
            <p className="font-['Space_Mono'] text-[#b7ffab] text-lg mb-6 opacity-90">
              Your AI business automation platform is ready for action
            </p>
            
            {/* Profile Status */}
            {profile && (
              <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-6 py-3 border border-[#6ad040]/40">
                <CheckCircle className="w-5 h-5 text-[#6ad040]" />
                <span className="font-['Space_Grotesk'] text-[#6ad040] font-bold">
                  PROFILE {profile.completion_percentage}% COMPLETE
                </span>
              </div>
            )}
          </div>

          {/* Coming Soon Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'AI Onboarding', status: isProfileComplete ? 'Ready' : 'Complete Profile First', icon: '🤖', ready: isProfileComplete },
              { name: 'Legal Setup', status: 'Coming Soon', icon: '⚖️' },
              { name: 'Business Branding', status: 'Coming Soon', icon: '🎨' },
              { name: 'Website Builder', status: 'Coming Soon', icon: '🌐' },
              { name: 'Payment Processing', status: 'Coming Soon', icon: '💳' },
              { name: 'Business Banking', status: 'Coming Soon', icon: '🏦' },
              { name: 'Marketing AI', status: 'Coming Soon', icon: '📈' },
            ].map((module, index) => (
              <div
                key={index}
                className={`bg-black/30 backdrop-blur-md rounded-2xl border p-6 transition-all duration-300 ${
                  module.ready 
                    ? 'border-[#6ad040] shadow-lg shadow-[#6ad040]/20 hover:scale-105 cursor-pointer' 
                    : 'border-[#6ad040]/40 hover:border-[#6ad040] hover:shadow-lg hover:shadow-[#6ad040]/20'
                }`}
              >
                <div className="text-4xl mb-4">{module.icon}</div>
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg mb-2">
                  {module.name}
                </h3>
                <p className={`font-['Space_Mono'] text-sm ${
                  module.ready ? 'text-[#6ad040] font-bold' : 'text-[#6ad040]'
                }`}>
                  {module.status}
                </p>
              </div>
            ))}
          </div>

          {/* Development Note */}
          <div className="mt-12 text-center">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-8 max-w-2xl mx-auto">
              <h3 className="font-['Orbitron'] font-bold text-[#6ad040] text-xl mb-4">
                DEVELOPMENT IN PROGRESS
              </h3>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm leading-relaxed opacity-90">
                The Sigma AI Business Partner platform is being built module by module. 
                Each feature will be implemented with the same Matrix aesthetic and sigma energy you love.
                Check back soon for updates as we bring the full automation platform online.
              </p>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  )
}