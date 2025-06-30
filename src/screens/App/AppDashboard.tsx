import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useAIGeneration } from '../../hooks/useAIGeneration'
import { MatrixBackground } from '../../components/MatrixBackground'
import { ProfileDashboard } from '../../components/profile'
import { AutomationDashboard } from '../../components/automation'
import { LegalModule } from '../../components/automation/LegalModule'
import { BrandingModule } from '../../components/automation/BrandingModule'
import { BankingModule } from '../../components/automation/BankingModule'
import { MarketingModule } from '../../components/automation/MarketingModule'
import { PaymentModule } from '../../components/automation/PaymentModule'
import { WebsiteModule } from '../../components/automation/WebsiteModule'
import { Navbar } from '../../components/Navbar'
import { ChatBoxSafe } from '../../components/ChatBoxSafe'
import { ProfileWizard } from '../../components/onboarding/ProfileWizard'
import { ProgressTracker } from '../../components/progress/ProgressTracker'
import { QuickActions } from '../../components/dashboard/QuickActions'
import { Skeleton, SkeletonText } from '../../components/ui/skeleton'
import { useKeyboardShortcuts, globalShortcuts } from '../../hooks/useKeyboardShortcuts'
import { KeyboardShortcutsHelp, ShortcutHint } from '../../components/ui/KeyboardShortcutsHelp'
import { toast } from '../../hooks/useToast'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { 
  CheckCircle, 
  Zap, 
  Activity, 
  TrendingUp, 
  Clock, 
  Users, 
  Cpu,
  Shield,
  Database,
  Settings,
  User,
  Bot,
  Sparkles,
  RefreshCw,
  Target,
  Lightbulb,
  ArrowRight
} from 'lucide-react'

type TabType = 'dashboard' | 'profile' | 'business-setup' | 'brand-identity' | 'website-builder' | 'payment-setup' | 'business-banking' | 'marketing-ai'

export const AppDashboard: React.FC = () => {
  const { user } = useApp()
  const { profile, loading: profileLoading } = useUserProfile()
  const { generateCustom, loading: aiLoading } = useAIGeneration()
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'profile' | 'automation'>('dashboard')
  const [showProfileWizard, setShowProfileWizard] = React.useState(false)
  const [aiSuggestions, setAiSuggestions] = React.useState<{
    dailyTip: string
    actionItems: string[]
    moduleRecommendations: { module: string; reason: string }[]
  } | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false)

  // Remove profile completion restriction - users can access app regardless
  const isProfileComplete = profile && (profile.completion_percentage || 0) >= 80
  // Allow access to app even with incomplete profile

  // Keyboard shortcuts
  const shortcuts = React.useMemo(() => [
    ...globalShortcuts,
    {
      key: 'p',
      cmd: true,
      ctrl: true,
      description: 'Go to Profile',
      action: () => setCurrentView('profile')
    },
    {
      key: 'd',
      cmd: true,
      ctrl: true,
      description: 'Go to Dashboard',
      action: () => setCurrentView('dashboard')
    },
    {
      key: 'a',
      cmd: true,
      ctrl: true,
      description: 'Go to Automation',
      action: () => setCurrentView('automation')
    }
  ], [])

  const { showHelp, getShortcutDisplay } = useKeyboardShortcuts(shortcuts)

  // Listen for save event
  React.useEffect(() => {
    const handleSaveEvent = () => {
      if (currentView === 'profile') {
        toast.info('Save profile', 'Use the save button in the profile section')
      }
    }

    window.addEventListener('saveCurrentForm', handleSaveEvent)
    return () => window.removeEventListener('saveCurrentForm', handleSaveEvent)
  }, [currentView])
  
  // Check if wizard should be shown on first load
  React.useEffect(() => {
    if (profile && !profile.wizard_completed && (profile.completion_percentage ?? 0) < 50 && currentView === 'dashboard') {
      setShowProfileWizard(true)
    }
  }, [profile?.wizard_completed, profile?.completion_percentage, currentView])

  // Generate AI suggestions on mount and when profile changes
  React.useEffect(() => {
    const generateSuggestions = async () => {
      if (!profile || loadingSuggestions || aiSuggestions) return
      
      setLoadingSuggestions(true)
      try {
        const prompt = `Based on this user profile, generate personalized suggestions:
Profile: ${JSON.stringify({
  name: profile.name,
  business_type: profile.business_type,
  region: profile.region,
  time_commitment: profile.time_commitment,
  capital_level: profile.capital_level,
  completion_percentage: profile.completion_percentage
}, null, 2)}

Generate a JSON response with:
1. A daily business tip (1-2 sentences)
2. 3 specific action items they should do today
3. 2 module recommendations with reasons why

Format:
{
  "dailyTip": "Your tip here",
  "actionItems": ["Action 1", "Action 2", "Action 3"],
  "moduleRecommendations": [
    {"module": "Module Name", "reason": "Why this module"},
    {"module": "Module Name", "reason": "Why this module"}
  ]
}`

        const result = await generateCustom(prompt, 'business-planning')
        if (result) {
          try {
            // Remove markdown code blocks if present
            let cleanResult = result
            if (result.includes('```json')) {
              cleanResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            } else if (result.includes('```')) {
              cleanResult = result.replace(/```\n?/g, '').trim()
            }
            
            const suggestions = JSON.parse(cleanResult)
            setAiSuggestions(suggestions)
          } catch (e) {
            console.error('Failed to parse AI suggestions:', e)
            console.log('Raw result:', result)
          }
        }
      } catch (error) {
        console.error('Error generating suggestions:', error)
        
        // Provide fallback suggestions when AI fails
        const fallbackSuggestions = {
          dailyTip: "Focus on one small step today that moves your business forward. Progress beats perfection.",
          actionItems: [
            "Review your business goals and prioritize your top 3 tasks for today",
            "Reach out to one potential customer or network contact",
            "Spend 30 minutes learning about your target market or industry trends"
          ],
          moduleRecommendations: [
            { module: "Business Profile Setup", reason: "Complete your foundational business information" },
            { module: "Legal Structure", reason: "Establish the legal framework for your business" }
          ]
        }
        
        setAiSuggestions(fallbackSuggestions)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    generateSuggestions()
  }, [profile, generateCustom])

  const refreshSuggestions = async () => {
    setAiSuggestions(null)
    setLoadingSuggestions(false)
  }

  // Convert profile to BusinessProfile format for automation
  const businessProfile = profile ? {
    id: profile.id,
    user_id: user?.id || '',
    business_name: profile.name || '',
    business_type: profile.business_type || '',
    industry: profile.business_type || '',
    description: `${profile.business_type} business` || '',
    target_market: '',
    budget_range: profile.capital_level || '',
    timeline: profile.time_commitment || '',
    legal_structure: 'LLC' as const,
    state_of_incorporation: profile.region || ''
  } : undefined

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* Matrix Background Animation */}
      <MatrixBackground className="z-[5]" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/70 via-[#1a1a1a]/50 to-[#1a1a1a]/70 pointer-events-none z-[6]" />

      {/* Enhanced Navbar */}
      <Navbar onNavigate={(section) => {
        if (section === 'profile' || section === 'profile-settings') setCurrentView('profile')
        if (section === 'dashboard') setCurrentView('dashboard')
        if (section === 'automation') setCurrentView('automation')
      }} />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 pt-20">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-1">
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex-1 px-6 py-3 font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider transition-all duration-300 rounded-xl ${
                  currentView === 'dashboard'
                    ? 'bg-[#6ad040] text-[#161616] shadow-lg shadow-[#6ad040]/50'
                    : 'text-[#b7ffab]/60 hover:text-[#b7ffab] hover:bg-[#6ad040]/10'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Dashboard</span>
                  {getShortcutDisplay && (
                    <ShortcutHint shortcut={getShortcutDisplay({ key: 'd', cmd: true, ctrl: true })} />
                  )}
                </div>
              </button>
              <button
                onClick={() => setCurrentView('automation')}
                className={`flex-1 px-6 py-3 font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider transition-all duration-300 rounded-xl ${
                  currentView === 'automation'
                    ? 'bg-[#6ad040] text-[#161616] shadow-lg shadow-[#6ad040]/50'
                    : 'text-[#b7ffab]/60 hover:text-[#b7ffab] hover:bg-[#6ad040]/10'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Automation</span>
                  {getShortcutDisplay && (
                    <ShortcutHint shortcut={getShortcutDisplay({ key: 'a', cmd: true, ctrl: true })} />
                  )}
                </div>
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`flex-1 px-6 py-3 font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider transition-all duration-300 rounded-xl ${
                  currentView === 'profile'
                    ? 'bg-[#6ad040] text-[#161616] shadow-lg shadow-[#6ad040]/50'
                    : 'text-[#b7ffab]/60 hover:text-[#b7ffab] hover:bg-[#6ad040]/10'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                  {getShortcutDisplay && (
                    <ShortcutHint shortcut={getShortcutDisplay({ key: 'p', cmd: true, ctrl: true })} />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
        {currentView === 'profile' ? (
          <ErrorBoundary>
            <div className="max-w-6xl mx-auto">
              <ProfileDashboard />
            </div>
          </ErrorBoundary>
        ) : currentView === 'automation' ? (
          <ErrorBoundary>
            <AutomationDashboard businessProfile={businessProfile} />
          </ErrorBoundary>
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
                {profileLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-2 w-full" />
                    <SkeletonText className="h-3 w-12" />
                  </div>
                ) : (
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
                )}
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

            {/* Quick Actions */}
            <div className="mb-8">
              <QuickActions 
                onNavigate={(view) => setCurrentView(view as 'dashboard' | 'profile' | 'automation')}
                onShowWizard={() => setShowProfileWizard(true)}
              />
            </div>

            {/* Progress Tracker */}
            <div className="mb-8">
              <ProgressTracker />
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
                      onClick={() => setCurrentView('profile')}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                        isProfileComplete 
                          ? 'border-[#6ad040] bg-[#6ad040]/10 hover:bg-[#6ad040]/20' 
                          : 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {isProfileComplete ? (
                          <CheckCircle className="w-5 h-5 text-[#6ad040]" />
                        ) : (
                          <User className="w-5 h-5 text-blue-400" />
                        )}
                        <span className="font-['Space_Grotesk'] font-bold text-sm">
                          {isProfileComplete ? 'PROFILE COMPLETE' : 'SETUP PROFILE'}
                        </span>
                        <ShortcutHint shortcut="⌘P" className="ml-auto" />
                      </div>
                      <p className="font-['Space_Mono'] text-xs opacity-80">
                        {isProfileComplete 
                          ? 'Profile setup complete - click to manage' 
                          : 'Complete your profile for enhanced features'
                        }
                      </p>
                    </button>

                    <button 
                      onClick={() => setCurrentView('automation')}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                        isProfileComplete 
                          ? 'border-[#6ad040] bg-[#6ad040]/10 hover:bg-[#6ad040]/20' 
                          : 'border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className={`w-5 h-5 ${isProfileComplete ? 'text-[#6ad040]' : 'text-yellow-500'}`} />
                        <span className="font-['Space_Grotesk'] font-bold text-sm">
                          START AUTOMATION
                        </span>
                        <ShortcutHint shortcut="⌘A" className="ml-auto" />
                      </div>
                      <p className="font-['Space_Mono'] text-xs opacity-80">
                        {isProfileComplete 
                          ? 'Begin your business automation journey'
                          : 'Complete profile to unlock AI features'
                        }
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

                {/* AI Suggestions Panel */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Bot className="w-6 h-6 text-[#6ad040]" />
                      <h2 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                        AI SUGGESTIONS
                      </h2>
                    </div>
                    <button
                      onClick={refreshSuggestions}
                      disabled={loadingSuggestions || aiLoading}
                      className="text-[#6ad040] hover:text-[#79e74c] disabled:text-[#6ad040]/50 transition-colors"
                      title="Refresh suggestions"
                    >
                      <RefreshCw className={`w-5 h-5 ${loadingSuggestions || aiLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {loadingSuggestions || aiLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                        <span className="font-['Space_Mono'] text-[#6ad040] text-sm">
                          Generating personalized insights...
                        </span>
                      </div>
                    </div>
                  ) : aiSuggestions ? (
                    <div className="space-y-6">
                      {/* Daily Tip */}
                      <div className="bg-[#6ad040]/10 rounded-lg p-4 border border-[#6ad040]/30">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-[#6ad040] mt-0.5" />
                          <div>
                            <h3 className="font-['Space_Grotesk'] font-bold text-[#6ad040] text-sm mb-1">
                              DAILY INSIGHT
                            </h3>
                            <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                              {aiSuggestions.dailyTip}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Items */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-[#6ad040]" />
                          <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">
                            TODAY'S ACTION ITEMS
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {aiSuggestions.actionItems.map((item, index) => (
                            <div key={index} className="flex items-start gap-3 group">
                              <span className="text-[#6ad040] font-['Space_Mono'] text-xs mt-0.5">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm flex-1">
                                {item}
                              </p>
                              <ArrowRight className="w-4 h-4 text-[#6ad040]/50 group-hover:text-[#6ad040] transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Module Recommendations */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-[#6ad040]" />
                          <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">
                            RECOMMENDED MODULES
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {aiSuggestions.moduleRecommendations.map((rec, index) => (
                            <div 
                              key={index}
                              onClick={() => setCurrentView('automation')}
                              className="bg-black/20 rounded-lg p-3 border border-[#6ad040]/30 hover:border-[#6ad040] hover:bg-[#6ad040]/10 transition-all cursor-pointer"
                            >
                              <h4 className="font-['Space_Grotesk'] font-bold text-[#6ad040] text-sm mb-1">
                                {rec.module}
                              </h4>
                              <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-xs">
                                {rec.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-sm">
                        Complete your profile to receive personalized AI suggestions
                      </p>
                    </div>
                  )}
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
              <div className="flex justify-between items-center">
                <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">Codename:</span>
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Mono'] text-[#6ad040] text-sm font-bold">
                    {profile?.name || 'SIGMA_USER'}
                  </span>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="text-[#6ad040] hover:text-[#79e74c] transition-colors"
                    title="Profile Dashboard"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
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
            { name: 'Business Setup', status: isProfileComplete ? 'Ready' : 'Complete Profile First', icon: '⚖️', ready: isProfileComplete, tab: 'business-setup' },
            { name: 'Brand Identity', status: 'Ready', icon: '🎨', ready: isProfileComplete, tab: 'brand-identity' },
            { name: 'Website Builder', status: 'Ready', icon: '🌐', ready: isProfileComplete, tab: 'website-builder' },
            { name: 'Payment Setup', status: 'Ready', icon: '💳', ready: isProfileComplete, tab: 'payment-setup' },
            { name: 'Business Banking', status: 'Ready', icon: '🏦', ready: isProfileComplete, tab: 'business-banking' },
            { name: 'Marketing AI', status: 'Ready', icon: '📈', ready: isProfileComplete, tab: 'marketing-ai' },
          ].map((module, index) => (
            <div
              key={index}
              onClick={() => module.ready && setCurrentView(module.tab as TabType)}
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
                  ⚡ SIGMA AUTOMATION STATUS ⚡
                </h3>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm leading-relaxed opacity-90 mb-4">
                  The full AI Business Partner platform is now operational. Each module provides complete automation 
                  with cutting-edge AI capabilities and the same Matrix aesthetic. Complete your profile to unlock 
                  all automation modules and begin your journey to CEO status.
                </p>
                <div className="inline-flex items-center gap-2 bg-[#6ad040]/20 rounded-full px-4 py-2 border border-[#6ad040]/50">
                  <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                    FULL AUTOMATION SUITE ACTIVE
                  </span>
                </div>
              </div>
            </div>
            
            {/* Keyboard Shortcuts Hint */}
            <div className="mt-4 text-center">
              <p className="font-['Space_Mono'] text-[#6ad040]/60 text-xs">
                Press <ShortcutHint shortcut="?" /> to view keyboard shortcuts
              </p>
            </div>
        </div>
        )}
      </main>

      {/* Sigma AI Chatbox */}
      <ChatBoxSafe />
      
      {/* Profile Wizard Modal */}
      {showProfileWizard && (
        <ProfileWizard 
          onComplete={() => setShowProfileWizard(false)}
          onSkip={() => setShowProfileWizard(false)}
        />
      )}
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        shortcuts={shortcuts}
        isOpen={showHelp}
        onClose={() => {}}
        getShortcutDisplay={getShortcutDisplay}
      />
    </div>
  )
}