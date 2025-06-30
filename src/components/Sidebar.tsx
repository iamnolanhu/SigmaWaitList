import React from 'react'
import { 
  Brain,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Building,
  TrendingUp,
  Settings,
  Home,
  User
} from 'lucide-react'

interface SidebarProps {
  currentModule?: string
  onNavigate?: (module: string) => void
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentModule = 'dashboard',
  onNavigate,
  className = ''
}) => {
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, status: 'Active', active: currentModule === 'dashboard' },
    { id: 'ai-onboarding', name: 'AI Onboarding', icon: Brain, status: 'Coming Soon', active: currentModule === 'ai-onboarding' },
    { id: 'legal-setup', name: 'Legal Setup', icon: Shield, status: currentModule === 'legal-setup' ? 'Active' : 'Coming Soon', active: currentModule === 'legal-setup' },
    { id: 'business-branding', name: 'Business Branding', icon: Palette, status: 'Coming Soon', active: currentModule === 'business-branding' },
    { id: 'website-builder', name: 'Website Builder', icon: Globe, status: 'Coming Soon', active: currentModule === 'website-builder' },
    { id: 'payment-processing', name: 'Payment Processing', icon: CreditCard, status: 'Coming Soon', active: currentModule === 'payment-processing' },
    { id: 'business-banking', name: 'Business Banking', icon: Building, status: 'Coming Soon', active: currentModule === 'business-banking' },
    { id: 'marketing-ai', name: 'Marketing AI', icon: TrendingUp, status: 'Coming Soon', active: currentModule === 'marketing-ai' },
  ]

  const handleModuleClick = (moduleId: string) => {
    if (onNavigate) {
      onNavigate(moduleId)
    }
  }

  const getActiveCount = () => {
    return navigationItems.filter(item => item.status === 'Active').length
  }

  return (
    <div className={`bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6 sticky top-8 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-5 h-5 text-[#6ad040]" />
        <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
          MODULES
        </h3>
      </div>
      
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleModuleClick(item.id)}
              className={`w-full p-3 rounded-xl border transition-all duration-300 text-left hover:scale-105 ${
                item.active
                  ? 'border-[#6ad040] bg-[#6ad040]/10 hover:bg-[#6ad040]/20' 
                  : 'border-[#6ad040]/40 bg-black/20 hover:border-[#6ad040]/60 hover:bg-[#6ad040]/5'
              }`}
              disabled={item.status === 'Coming Soon'}
            >
              <div className="flex items-center gap-3 mb-1">
                <IconComponent className={`w-4 h-4 ${
                  item.active ? 'text-[#6ad040]' : 'text-[#6ad040]/60'
                }`} />
                <span className={`font-['Space_Grotesk'] font-bold text-sm ${
                  item.active ? 'text-[#6ad040]' : 'text-[#b7ffab]/80'
                }`}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-['Space_Mono'] text-xs ${
                  item.active ? 'text-[#6ad040]' : 'text-[#6ad040]/60'
                }`}>
                  {item.status}
                </span>
                {item.active && (
                  <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Module Progress */}
      <div className="mt-6 pt-4 border-t border-[#6ad040]/20">
        <div className="flex justify-between items-center mb-2">
          <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">PROGRESS</span>
          <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
            {getActiveCount()}/{navigationItems.length}
          </span>
        </div>
        <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
            style={{ width: `${(getActiveCount() / navigationItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-[#6ad040]/20">
        <h4 className="font-['Space_Grotesk'] text-[#b7ffab] font-bold text-sm mb-3">
          QUICK ACTIONS
        </h4>
        <div className="space-y-2">
          <button
            onClick={() => handleModuleClick('profile')}
            className="w-full p-2 rounded-lg border border-[#6ad040]/40 bg-black/20 hover:bg-[#6ad040]/10 hover:border-[#6ad040]/60 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#6ad040]" />
              <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">Profile Settings</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
} 