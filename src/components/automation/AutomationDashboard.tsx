import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { useApp } from '../../contexts/AppContext'
import { LegalModule } from './LegalModule'
import { BrandingModule } from './BrandingModule'
import { WebsiteModule } from './WebsiteModule'
import { PaymentModule } from './PaymentModule'
import { MarketingModule } from './MarketingModule'
import { BankingModule } from './BankingModule'
import { type BusinessProfile, type LegalDocument, type BrandAsset, type WebsiteConfig, type PaymentSetup, type MarketingCampaign } from '../../lib/businessAutomation'
import { trackEvent } from '../../lib/analytics'
import { useModuleActivation } from '../../hooks/useModuleActivation'
import { getModuleById, getModulesByCategory, ModuleCategory } from '../../lib/modules/moduleDefinitions'
import { 
  Zap, 
  Scale, 
  Palette, 
  Globe, 
  CreditCard, 
  TrendingUp, 
  Building2,
  CheckCircle,
  Clock,
  ArrowRight,
  Lock,
  Pause,
  Play,
  AlertCircle,
  User,
  Building,
  Calculator
} from 'lucide-react'

interface AutomationDashboardProps {
  businessProfile?: BusinessProfile
}

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ businessProfile }) => {
  const { } = useApp()
  const [currentModule, setCurrentModule] = useState<string | null>(null)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [moduleData, setModuleData] = useState<{
    legal?: LegalDocument[]
    branding?: BrandAsset[]
    website?: WebsiteConfig
    payment?: PaymentSetup
    marketing?: MarketingCampaign[]
    banking?: any
  }>({})
  
  const {
    modules: moduleActivations,
    activateModule,
    updateModuleProgress,
    getModuleStatus,
    getModuleProgress,
    checkDependencies,
    getCompletedModules
  } = useModuleActivation()

  // Sync completed modules with activation status
  useEffect(() => {
    const completed = getCompletedModules()
    setCompletedModules(new Set(completed.map(m => m.module_id)))
  }, [moduleActivations])

  // Define icon mapping for lucide icons
  const iconMap: Record<string, React.ElementType> = {
    'Scale': Scale,
    'Palette': Palette,
    'Globe': Globe,
    'CreditCard': CreditCard,
    'Building': Building2,
    'TrendingUp': TrendingUp,
    'FileText': AlertCircle,
    'Shield': Lock,
    'FileImage': AlertCircle,
    'Calculator': Calculator,
    'Mail': AlertCircle,
    'Share2': AlertCircle,
    'DollarSign': AlertCircle,
    'Users': AlertCircle,
    'BarChart': AlertCircle,
    'Cpu': AlertCircle,
    'Sparkles': AlertCircle,
    'User': User,
    'Target': AlertCircle
  }

  // Map old module IDs to new module IDs for display
  const moduleIdMap: Record<string, string> = {
    'legal': 'MOD_201',      // Legal Structure Setup
    'branding': 'MOD_301',   // Brand Identity
    'website': 'MOD_501',    // Website Builder
    'payment': 'MOD_402',    // Payment Processing
    'banking': 'MOD_401',    // Business Banking
    'marketing': 'MOD_503'   // Email Marketing
  }

  // Get modules we want to display
  const displayModuleIds = Object.values(moduleIdMap)
  const modules = displayModuleIds.map(moduleId => {
    const moduleDef = getModuleById(moduleId)
    if (!moduleDef) return null
    
    return {
      id: moduleId,
      title: moduleDef.displayName,
      description: moduleDef.description,
      icon: iconMap[moduleDef.icon] || AlertCircle,
      color: moduleId === 'MOD_201' ? '#6ad040' :
             moduleId === 'MOD_301' ? '#8b5cf6' :
             moduleId === 'MOD_501' ? '#3b82f6' :
             moduleId === 'MOD_402' ? '#10b981' :
             moduleId === 'MOD_401' ? '#f59e0b' :
             moduleId === 'MOD_503' ? '#ef4444' : '#6ad040',
      estimated_time: moduleDef.estimatedTime || '30 minutes',
      dependencies: moduleDef.dependencies || []
    }
  }).filter(Boolean) as Array<{
    id: string
    title: string
    description: string
    icon: React.ElementType
    color: string
    estimated_time: string
    dependencies: string[]
  }>

  const handleModuleComplete = async (moduleId: string, data: any) => {
    setCompletedModules(prev => new Set([...prev, moduleId]))
    setModuleData(prev => ({ ...prev, [moduleId]: data }))
    
    // Update module progress to 100%
    await updateModuleProgress(moduleId, 100, { completedData: data })
    
    setCurrentModule(null)
    
    trackEvent('automation_module_completed', {
      module_id: moduleId,
      business_name: businessProfile?.business_name
    })
  }

  const startFullAutomation = async () => {
    if (!businessProfile) return
    
    // Start with legal module and activate it
    const firstModule = modules[0]
    await activateModule(firstModule.id, {
      business_profile: businessProfile,
      started_at: new Date().toISOString()
    })
    
    setCurrentModule(firstModule.id)
    
    trackEvent('full_automation_started', {
      business_name: businessProfile.business_name,
      module_count: modules.length
    })
  }

  const startModule = async (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    // Check dependencies
    const hasDependencies = module.dependencies.every(dep => completedModules.has(dep))
    if (!hasDependencies) {
      alert('Please complete required modules first!')
      return
    }

    // Activate module
    await activateModule(moduleId, {
      business_profile: businessProfile,
      started_at: new Date().toISOString()
    })

    setCurrentModule(moduleId)
  }

  const getNextModule = () => {
    const incompleteModules = modules.filter(m => !completedModules.has(m.id))
    return incompleteModules[0]?.id || null
  }

  const totalEstimatedTime = modules.reduce((total, module) => {
    const time = parseInt(module.estimated_time)
    return total + time
  }, 0)

  const completionPercentage = Math.round((completedModules.size / modules.length) * 100)

  if (currentModule) {
    const moduleProps = {
      businessProfile,
      onComplete: (data: any) => handleModuleComplete(currentModule, data)
    }

    // Map module IDs to their corresponding components
    switch (currentModule) {
      case 'MOD_201': // Legal Structure Setup
        return <LegalModule {...moduleProps} />
      case 'MOD_301': // Brand Identity
        return <BrandingModule {...moduleProps} />
      case 'MOD_501': // Website Builder
        return <WebsiteModule {...moduleProps} brandAssets={moduleData['MOD_301']} />
      case 'MOD_402': // Payment Processing
        return <PaymentModule {...moduleProps} />
      case 'MOD_503': // Email Marketing
        return <MarketingModule {...moduleProps} brandAssets={moduleData['MOD_301']} />
      case 'MOD_401': // Business Banking
        return <BankingModule {...moduleProps} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Zap className="w-8 h-8 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl">
            BUSINESS AUTOMATION CENTER
          </h2>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base opacity-90 mb-4">
          Complete business setup automation. From 0 to CEO while you sleep.
        </p>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm font-['Space_Mono'] text-[#b7ffab] mb-2">
            <span>Progress</span>
            <span className="text-[#6ad040] font-bold">{completionPercentage}%</span>
          </div>
          <div className="h-3 bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-['Space_Mono'] text-[#b7ffab]/60 mt-1">
            <span>{completedModules.size} of {modules.length} modules</span>
            <span>~{totalEstimatedTime} min total</span>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      {completedModules.size === 0 && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl mb-4">
              Ready to Automate Your Business?
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm mb-6 max-w-2xl mx-auto">
              Sigma will handle everything from legal paperwork to marketing campaigns. 
              Sit back and watch your business come to life automatically.
            </p>
            <Button
              onClick={startFullAutomation}
              className="font-['Orbitron'] font-black text-lg px-8 py-4 rounded-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] border-2 border-[#6ad040]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6ad040]/60"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Full Automation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon
          const isCompleted = completedModules.has(module.id)
          const isNext = getNextModule() === module.id
          const status = getModuleStatus(module.id)
          const progress = getModuleProgress(module.id)
          const hasDependencies = module.dependencies.every(dep => completedModules.has(dep))
          
          return (
            <Card 
              key={module.id} 
              className={`bg-black/30 backdrop-blur-md border rounded-2xl transition-all duration-300 ${
                !hasDependencies ? 'opacity-60' : 'hover:scale-105 hover:-translate-y-2 cursor-pointer'
              } ${
                isCompleted 
                  ? 'border-[#6ad040] shadow-lg shadow-[#6ad040]/20' 
                  : status === 'active'
                  ? 'border-blue-500/60 shadow-lg shadow-blue-500/20'
                  : status === 'paused'
                  ? 'border-orange-500/60 shadow-lg shadow-orange-500/20'
                  : isNext
                  ? 'border-yellow-500/60 shadow-lg shadow-yellow-500/20'
                  : 'border-[#6ad040]/40 hover:border-[#6ad040] hover:shadow-lg hover:shadow-[#6ad040]/20'
              }`}
              onClick={() => hasDependencies && startModule(module.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${module.color}20` }}>
                    <Icon className="w-6 h-6" style={{ color: module.color }} />
                  </div>
                  
                  {!hasDependencies ? (
                    <Lock className="w-6 h-6 text-[#b7ffab]/40" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-[#6ad040]" />
                  ) : status === 'active' ? (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <Play className="w-4 h-4 text-[#161616]" />
                    </div>
                  ) : status === 'paused' ? (
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Pause className="w-4 h-4 text-[#161616]" />
                    </div>
                  ) : isNext ? (
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-[#161616]" />
                    </div>
                  ) : (
                    <Clock className="w-6 h-6 text-[#b7ffab]/40" />
                  )}
                </div>

                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg mb-2">
                  {module.title}
                </h3>
                
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm mb-4">
                  {module.description}
                </p>

                {!hasDependencies && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <p className="font-['Space_Mono'] text-orange-500 text-xs">
                        Requires: {module.dependencies.map(dep => {
                          const depModule = modules.find(m => m.id === dep)
                          return depModule?.title
                        }).filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {status === 'active' && progress > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-['Space_Mono'] text-[#6ad040] text-xs">Progress</span>
                      <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                    ~{module.estimated_time}
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-['Space_Mono'] font-bold ${
                    isCompleted 
                      ? 'bg-[#6ad040]/20 text-[#6ad040]' 
                      : status === 'active'
                      ? 'bg-blue-500/20 text-blue-500'
                      : status === 'paused'
                      ? 'bg-orange-500/20 text-orange-500'
                      : !hasDependencies
                      ? 'bg-gray-500/20 text-gray-500'
                      : isNext
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-[#b7ffab]/20 text-[#b7ffab]/60'
                  }`}>
                    {isCompleted ? 'COMPLETE' : 
                     status === 'active' ? 'ACTIVE' :
                     status === 'paused' ? 'PAUSED' :
                     !hasDependencies ? 'LOCKED' :
                     isNext ? 'NEXT' : 'PENDING'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completion Summary */}
      {completedModules.size > 0 && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                Automation Progress
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(completedModules).map(moduleId => {
                const module = modules.find(m => m.id === moduleId)
                if (!module) return null
                
                const Icon = module.icon
                
                return (
                  <div key={moduleId} className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[#6ad040]" />
                      <div>
                        <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">
                          {module.title}
                        </h4>
                        <p className="font-['Space_Mono'] text-[#6ad040] text-xs">
                          Completed
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {completedModules.size === modules.length && (
              <div className="mt-6 p-4 bg-[#6ad040]/10 border border-[#6ad040]/30 rounded-lg text-center">
                <h4 className="font-['Orbitron'] font-bold text-[#6ad040] text-lg mb-2">
                  🎉 AUTOMATION COMPLETE!
                </h4>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                  Your business is now fully automated and ready to scale. Welcome to the sigma lifestyle!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}