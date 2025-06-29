import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { useUserProfile } from '../../hooks/useUserProfile'
import { MatrixBackground } from '../../components/MatrixBackground'
import { ProfileSetup, ProfileSettings } from '../../components/profile'
import { Navbar } from '../../components/Navbar'
import { 
  CheckCircle, 
  Zap, 
  Activity, 
  TrendingUp, 
  Clock, 
  Users, 
  AlertTriangle,
  Cpu,
  Shield,
  Database
} from 'lucide-react'

export const AppDashboard: React.FC = () => {
  const { user } = useApp()
  const { profile, loading: profileLoading } = useUserProfile()
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'profile' | 'profile-settings'>('dashboard')

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
        if (section === 'profile-settings') setCurrentView('profile-settings')
      }} />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 pt-20">
        {currentView === 'profile-settings' ? (
          <ProfileSettings />
        ) : currentView === 'profile' ? (
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
            {/* Command Center Header */}
            <div className="text-center mb-8">
              <h1 className="font-['Orbitron'] font-black text-[#ffff] text-3xl lg:text-5xl mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                SIGMA COMMAND CENTER
              </h1>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-base mb-6 opacity-90">
                Mission Control for AI Business Automation
              </p>
            </div>

            {/* Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* System Status */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl border border-[#6ad040]/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Cpu className="w-5 h-5 text-[#6ad040]" />
                  <span className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">SYSTEM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs">ONLINE</span>
                </div>
              </div>

              {/* Profile Status */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl border border-[#6ad040]/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-[#6ad040]" />
                  <span className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">PROFILE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
                      style={{ width: `${profile?.completion_percentage || 0}%` }}
                    />
                  </div>
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                    {profile?.completion_percentage || 0}%
                  </span>
                </div>
              </div>

              {/* Active Modules */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl border border-[#6ad040]/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-[#6ad040]" />
                  <span className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">MODULES</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">1/7</span>
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs">ACTIVE</span>
                </div>
              </div>

              {/* Last Activity */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl border border-[#6ad040]/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-[#6ad040]" />
                  <span className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">ACTIVITY</span>
                </div>
                <div className="font-['Space_Mono'] text-[#b7ffab] text-xs">
                  Profile Updated
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left Column - Mission Status */}
              <div className="lg:col-span-2 space-y-6">
                {/* Mission Control Panel */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-6 h-6 text-[#6ad040]" />
                    <h2 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                      MISSION STATUS
                    </h2>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button 
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        isProfileComplete 
                          ? 'border-[#6ad040] bg-[#6ad040]/10 hover:bg-[#6ad040]/20 hover:scale-105' 
                          : 'border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {isProfileComplete ? (
                          <CheckCircle className="w-5 h-5 text-[#6ad040]" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="font-['Space_Grotesk'] font-bold text-sm">
                          {isProfileComplete ? 'PROFILE COMPLETE' : 'COMPLETE PROFILE'}
                        </span>
                      </div>
                      <p className="font-['Space_Mono'] text-xs opacity-80">
                        {isProfileComplete 
                          ? 'Ready to begin AI onboarding' 
                          : 'Required to unlock AI features'
                        }
                      </p>
                    </button>

                    <button 
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        isProfileComplete 
                          ? 'border-[#6ad040] bg-[#6ad040]/10 hover:bg-[#6ad040]/20 hover:scale-105' 
                          : 'border-gray-500/50 bg-gray-500/10 cursor-not-allowed'
                      }`}
                      disabled={!isProfileComplete}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className={`w-5 h-5 ${isProfileComplete ? 'text-[#6ad040]' : 'text-gray-500'}`} />
                        <span className="font-['Space_Grotesk'] font-bold text-sm">
                          START AI ONBOARDING
                        </span>
                      </div>
                      <p className="font-['Space_Mono'] text-xs opacity-80">
                        Begin your business automation journey
                      </p>
                    </button>
                  </div>

                  {/* Progress Overview */}
                  <div className="border-t border-[#6ad040]/20 pt-4">
                    <h3 className="font-['Space_Grotesk'] text-[#b7ffab] font-bold mb-4">AUTOMATION PIPELINE</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Profile Setup', completed: isProfileComplete, current: !isProfileComplete },
                        { name: 'AI Onboarding', completed: false, current: isProfileComplete },
                        { name: 'Business Formation', completed: false, current: false },
                        { name: 'Brand Development', completed: false, current: false },
                        { name: 'Digital Presence', completed: false, current: false },
                      ].map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            step.completed ? 'bg-[#6ad040]' : 
                            step.current ? 'bg-yellow-500 animate-pulse' : 
                            'bg-gray-600'
                          }`} />
                          <span className={`font-['Space_Mono'] text-sm ${
                            step.completed ? 'text-[#6ad040]' : 
                            step.current ? 'text-yellow-500' : 
                            'text-[#b7ffab]/60'
                          }`}>
                            {step.name}
                          </span>
                          {step.current && (
                            <span className="font-['Space_Mono'] text-xs text-yellow-500 bg-yellow-500/20 px-2 py-1 rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - System Info */}
              <div className="space-y-6">
                {/* User Info Panel */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-[#6ad040]" />
                    <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                      SIGMA PROFILE
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">Codename:</span>
                      <span className="font-['Space_Mono'] text-[#6ad040] text-sm font-bold">
                        {profile?.name || 'SIGMA_USER'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">Region:</span>
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                        {profile?.region || 'Classified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">Business Type:</span>
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                        {profile?.business_type || 'TBD'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">Stealth Mode:</span>
                      <span className={`font-['Space_Mono'] text-sm ${
                        profile?.stealth_mode ? 'text-[#6ad040]' : 'text-[#b7ffab]/60'
                      }`}>
                        {profile?.stealth_mode ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Analytics */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#6ad040]" />
                    <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                      ANALYTICS
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-['Orbitron'] font-black text-[#6ad040] mb-1">
                        0
                      </div>
                      <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                        BUSINESSES AUTOMATED
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-['Orbitron'] font-bold text-[#6ad040]">
                          24/7
                        </div>
                        <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                          AI UPTIME
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-['Orbitron'] font-bold text-[#6ad040]">
                          100%
                        </div>
                        <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                          SIGMA ENERGY
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Modules */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-[#6ad040]" />
                <h2 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                  AUTOMATION MODULES
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    className={`bg-black/20 backdrop-blur-md rounded-xl border p-4 transition-all duration-300 text-center ${
                      module.ready 
                        ? 'border-[#6ad040] shadow-lg shadow-[#6ad040]/20 hover:scale-105 cursor-pointer' 
                        : 'border-[#6ad040]/40 hover:border-[#6ad040] hover:shadow-lg hover:shadow-[#6ad040]/20'
                    }`}
                  >
                    <div className="text-3xl mb-2">{module.icon}</div>
                    <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-1">
                      {module.name}
                    </h3>
                    <p className={`font-['Space_Mono'] text-xs ${
                      module.ready ? 'text-[#6ad040] font-bold' : 'text-[#6ad040]'
                    }`}>
                      {module.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Development Status */}
            <div className="mt-8 text-center">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6 max-w-3xl mx-auto">
                <h3 className="font-['Orbitron'] font-bold text-[#6ad040] text-xl mb-4">
                  ⚡ SIGMA DEVELOPMENT STATUS ⚡
                </h3>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm leading-relaxed opacity-90 mb-4">
                  The full AI Business Partner platform is in active development. Each module will be implemented 
                  with cutting-edge AI capabilities and the same Matrix aesthetic. Complete your profile to unlock 
                  the AI Onboarding module and begin your automation journey.
                </p>
                <div className="inline-flex items-center gap-2 bg-[#6ad040]/20 rounded-full px-4 py-2 border border-[#6ad040]/50">
                  <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                    BUILDING THE FUTURE OF BUSINESS AUTOMATION
                  </span>
                </div>
              </div>
            </div>
        </div>
        )}
      </main>
    </div>
  )
}