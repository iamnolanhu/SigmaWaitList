import React from 'react'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useModuleActivation } from '../../hooks/useModuleActivation'
import { Card } from '../ui/card'
import { 
  User, 
  Briefcase, 
  Palette, 
  Globe, 
  Rocket,
  ArrowRight,
  CheckCircle,
  Zap,
  Building,
  CreditCard,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  action: () => void
  priority: number
  completed?: boolean
}

interface QuickActionsProps {
  onNavigate: (view: string) => void
  onShowWizard: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate, onShowWizard }) => {
  const { profile } = useUserProfile()
  const { getCompletedModules, getActiveModules } = useModuleActivation()
  
  const profileCompletion = profile?.completion_percentage || 0
  const completedModules = getCompletedModules()
  const activeModules = getActiveModules()
  
  // Determine quick actions based on user state
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = []
    
    // Priority 1: Complete profile if not done
    if (profileCompletion < 100) {
      actions.push({
        id: 'complete-profile',
        title: 'Complete Your Profile',
        description: `${100 - profileCompletion}% remaining to unlock all features`,
        icon: User,
        color: '#6ad040',
        action: () => onShowWizard(),
        priority: 1
      })
    }
    
    // Priority 2: Start business automation if profile complete but no modules started
    if (profileCompletion >= 80 && completedModules.length === 0 && activeModules.length === 0) {
      actions.push({
        id: 'start-automation',
        title: 'Start Business Automation',
        description: 'Launch your automated business setup',
        icon: Rocket,
        color: '#3b82f6',
        action: () => onNavigate('automation'),
        priority: 2
      })
    }
    
    // Priority 3: Continue active modules
    if (activeModules.length > 0) {
      const activeModule = activeModules[0]
      const moduleIcons: Record<string, React.ElementType> = {
        'Legal Setup': Briefcase,
        'Brand Identity': Palette,
        'Website Creation': Globe,
        'Payment Processing': CreditCard,
        'Business Banking': Building,
        'Marketing Automation': TrendingUp
      }
      
      actions.push({
        id: 'continue-module',
        title: `Continue ${activeModule.module_name}`,
        description: `${activeModule.progress}% complete`,
        icon: moduleIcons[activeModule.module_name] || Zap,
        color: '#f59e0b',
        action: () => onNavigate('automation'),
        priority: 3
      })
    }
    
    // Priority 4: Suggest next module based on completed ones
    const suggestNextModule = () => {
      const completedNames = completedModules.map(m => m.module_name)
      
      if (!completedNames.includes('Legal Setup')) {
        return { name: 'Legal Setup', icon: Briefcase, desc: 'Register your business legally' }
      }
      if (!completedNames.includes('Brand Identity')) {
        return { name: 'Brand Identity', icon: Palette, desc: 'Create your unique brand' }
      }
      if (!completedNames.includes('Website Creation')) {
        return { name: 'Website Creation', icon: Globe, desc: 'Launch your online presence' }
      }
      if (completedNames.includes('Legal Setup') && !completedNames.includes('Business Banking')) {
        return { name: 'Business Banking', icon: Building, desc: 'Set up business banking' }
      }
      return null
    }
    
    const nextModule = suggestNextModule()
    if (nextModule && profileCompletion >= 80) {
      actions.push({
        id: 'next-module',
        title: `Start ${nextModule.name}`,
        description: nextModule.desc,
        icon: nextModule.icon,
        color: '#8b5cf6',
        action: () => onNavigate('automation'),
        priority: 4
      })
    }
    
    // Priority 5: View progress if modules completed
    if (completedModules.length > 0) {
      actions.push({
        id: 'view-progress',
        title: 'View Your Progress',
        description: `${completedModules.length} modules completed`,
        icon: CheckCircle,
        color: '#10b981',
        action: () => onNavigate('dashboard'),
        priority: 5,
        completed: true
      })
    }
    
    // Sort by priority and return top 4
    return actions.sort((a, b) => a.priority - b.priority).slice(0, 4)
  }
  
  const quickActions = getQuickActions()
  
  if (quickActions.length === 0) return null
  
  return (
    <Card className="bg-black/30 backdrop-blur-md border-[#6ad040]/40 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-[#6ad040]" />
        <h2 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
          QUICK ACTIONS
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={action.action}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 group ${
                  action.completed
                    ? 'border-[#6ad040]/50 bg-[#6ad040]/10 hover:bg-[#6ad040]/20'
                    : 'border-[#6ad040]/30 bg-black/20 hover:border-[#6ad040] hover:bg-[#6ad040]/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-1 flex items-center gap-2">
                      {action.title}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                      {action.description}
                    </p>
                  </div>
                </div>
                
                {action.priority === 1 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-300"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                    <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                      {profileCompletion}%
                    </span>
                  </div>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>
      
      {/* Motivational message based on state */}
      <div className="mt-6 p-4 bg-[#6ad040]/10 border border-[#6ad040]/30 rounded-lg">
        <p className="font-['Space_Mono'] text-[#6ad040] text-sm text-center">
          {profileCompletion < 100 
            ? "Complete your profile to unlock the full power of AI automation"
            : completedModules.length === 0
            ? "Your profile is ready! Start automating your business empire"
            : activeModules.length > 0
            ? "Keep going! Your business is being built automatically"
            : "Great progress! Continue building your automated empire"
          }
        </p>
      </div>
    </Card>
  )
}