import React, { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useUserProfile } from '../../hooks/useUserProfile'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { 
  User, 
  Briefcase, 
  Target, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Globe,
  Zap,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileWizardProps {
  onComplete?: () => void
  onSkip?: () => void
}

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Business Interests', icon: Briefcase },
  { id: 3, title: 'Skill Assessment', icon: Target },
  { id: 4, title: 'Preferences', icon: Settings }
]

export const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete, onSkip }) => {
  const { user } = useApp()
  const { profile, updateProfile } = useUserProfile()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    name: profile?.name || '',
    bio: profile?.bio || '',
    profile_picture_url: profile?.profile_picture_url || '',
    
    // Step 2: Business Interests
    industry: profile?.industry || '',
    business_goals: profile?.business_goals || [],
    
    // Step 3: Skill Assessment
    skill_level: profile?.skill_level || 'beginner',
    
    // Step 4: Preferences
    stealth_mode: profile?.stealth_mode || false,
    notification_preferences: profile?.notification_preferences || {
      email: true,
      push: true,
      in_app: true,
      marketing: false
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const industries = [
    'Technology', 'E-commerce', 'Healthcare', 'Finance', 'Education',
    'Real Estate', 'Marketing', 'Consulting', 'Manufacturing', 'Other'
  ]

  const businessGoals = [
    'Launch MVP', 'Scale Operations', 'Automate Workflows', 'Build Brand',
    'Generate Revenue', 'Raise Funding', 'Expand Market', 'Build Team'
  ]

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.name?.trim()) newErrors.name = 'Name is required'
        if (!formData.bio?.trim()) newErrors.bio = 'Bio is required'
        break
      case 2:
        if (!formData.industry) newErrors.industry = 'Please select an industry'
        if (formData.business_goals.length === 0) newErrors.business_goals = 'Select at least one goal'
        break
      case 3:
        if (!formData.skill_level) newErrors.skill_level = 'Please select your skill level'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      } else {
        handleComplete()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await updateProfile({
        ...formData,
        wizard_completed: true,
        wizard_step: steps.length,
        wizard_data: formData
      })
      onComplete?.()
    } catch (error) {
      console.error('Error completing wizard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      await updateProfile({
        wizard_step: currentStep,
        wizard_data: formData
      })
      onSkip?.()
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      business_goals: prev.business_goals.includes(goal)
        ? prev.business_goals.filter(g => g !== goal)
        : [...prev.business_goals, goal]
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-['Orbitron'] font-bold text-2xl text-[#b7ffab] mb-2">
                Let's get to know you
              </h3>
              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                Your personal information helps us tailor your experience
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Your Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Sigma"
                  className="bg-black/50 border-[#6ad040]/50 text-[#b7ffab] placeholder-[#b7ffab]/30"
                />
                {errors.name && (
                  <p className="font-['Space_Mono'] text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself and your entrepreneurial journey..."
                  rows={4}
                  className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/50 rounded-lg text-[#b7ffab] placeholder-[#b7ffab]/30 focus:outline-none focus:border-[#6ad040] transition-colors resize-none"
                />
                {errors.bio && (
                  <p className="font-['Space_Mono'] text-red-500 text-xs mt-1">{errors.bio}</p>
                )}
              </div>

              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Profile Picture (Optional)
                </label>
                <div className="flex items-center gap-4">
                  {formData.profile_picture_url ? (
                    <img 
                      src={formData.profile_picture_url} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full border-2 border-[#6ad040]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-[#6ad040]/50 bg-black/30 flex items-center justify-center">
                      <User className="w-8 h-8 text-[#6ad040]/50" />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#6ad040]/50 text-[#b7ffab] hover:border-[#6ad040] hover:bg-[#6ad040]/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-['Orbitron'] font-bold text-2xl text-[#b7ffab] mb-2">
                Business Interests
              </h3>
              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                Help us understand your business aspirations
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:outline-none focus:border-[#6ad040] transition-colors"
                >
                  <option value="">Select an industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="font-['Space_Mono'] text-red-500 text-xs mt-1">{errors.industry}</p>
                )}
              </div>

              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-3 block">
                  Business Goals (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {businessGoals.map(goal => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-['Space_Mono'] ${
                        formData.business_goals.includes(goal)
                          ? 'border-[#6ad040] bg-[#6ad040]/20 text-[#6ad040]'
                          : 'border-[#6ad040]/30 bg-black/30 text-[#b7ffab]/70 hover:border-[#6ad040]/50'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                {errors.business_goals && (
                  <p className="font-['Space_Mono'] text-red-500 text-xs mt-2">{errors.business_goals}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-['Orbitron'] font-bold text-2xl text-[#b7ffab] mb-2">
                Skill Assessment
              </h3>
              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                This helps us provide the right level of guidance
              </p>
            </div>

            <div className="space-y-4">
              <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-3 block">
                How would you rate your business experience?
              </label>
              
              <div className="space-y-3">
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'New to business, eager to learn' },
                  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience, looking to scale' },
                  { value: 'advanced', label: 'Advanced', desc: 'Experienced entrepreneur, seeking automation' },
                  { value: 'expert', label: 'Expert', desc: 'Serial entrepreneur, optimizing operations' }
                ].map(level => (
                  <button
                    key={level.value}
                    onClick={() => setFormData({ ...formData, skill_level: level.value })}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      formData.skill_level === level.value
                        ? 'border-[#6ad040] bg-[#6ad040]/20'
                        : 'border-[#6ad040]/30 bg-black/30 hover:border-[#6ad040]/50'
                    }`}
                  >
                    <div className="font-['Space_Grotesk'] font-bold text-[#b7ffab] mb-1">
                      {level.label}
                    </div>
                    <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                      {level.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-['Orbitron'] font-bold text-2xl text-[#b7ffab] mb-2">
                Preferences
              </h3>
              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                Customize your BasedSigma experience
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-black/30 rounded-lg p-4 border border-[#6ad040]/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#6ad040]" />
                    <div>
                      <div className="font-['Space_Grotesk'] font-bold text-[#b7ffab]">
                        Stealth Mode
                      </div>
                      <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                        Keep your business activities private
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, stealth_mode: !formData.stealth_mode })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.stealth_mode ? 'bg-[#6ad040]' : 'bg-[#6ad040]/30'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      formData.stealth_mode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab]">
                  Notification Preferences
                </h4>
                
                {[
                  { key: 'email', label: 'Email Notifications', icon: Zap },
                  { key: 'push', label: 'Push Notifications', icon: Zap },
                  { key: 'in_app', label: 'In-App Notifications', icon: Zap },
                  { key: 'marketing', label: 'Marketing Updates', icon: Zap }
                ].map(pref => (
                  <div key={pref.key} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <pref.icon className="w-4 h-4 text-[#6ad040]" />
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                        {pref.label}
                      </span>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        notification_preferences: {
                          ...formData.notification_preferences,
                          [pref.key]: !formData.notification_preferences[pref.key as keyof typeof formData.notification_preferences]
                        }
                      })}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        formData.notification_preferences[pref.key as keyof typeof formData.notification_preferences]
                          ? 'bg-[#6ad040]' : 'bg-[#6ad040]/30'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        formData.notification_preferences[pref.key as keyof typeof formData.notification_preferences]
                          ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-[#1a1a1a]/95 border-[#6ad040] shadow-2xl shadow-[#6ad040]/20">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center gap-2 ${
                    step.id <= currentStep ? 'text-[#6ad040]' : 'text-[#6ad040]/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      step.id < currentStep 
                        ? 'bg-[#6ad040] border-[#6ad040]' 
                        : step.id === currentStep
                        ? 'border-[#6ad040] bg-[#6ad040]/20'
                        : 'border-[#6ad040]/30'
                    }`}>
                      {step.id < currentStep ? (
                        <Check className="w-4 h-4 text-black" />
                      ) : (
                        <span className="font-['Space_Mono'] text-xs font-bold">
                          {step.id}
                        </span>
                      )}
                    </div>
                    <span className={`font-['Space_Mono'] text-xs hidden sm:inline ${
                      step.id <= currentStep ? 'text-[#b7ffab]' : 'text-[#b7ffab]/30'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 transition-all duration-300 ${
                      step.id < currentStep ? 'bg-[#6ad040]' : 'bg-[#6ad040]/30'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <button
              onClick={handleSkip}
              className="text-[#b7ffab]/50 hover:text-[#b7ffab] transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleSkip}
              className="font-['Space_Mono'] text-[#b7ffab]/50 hover:text-[#b7ffab] text-sm transition-colors"
              disabled={loading}
            >
              Complete Later
            </button>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                  className="border-[#6ad040]/50 text-[#b7ffab] hover:border-[#6ad040] hover:bg-[#6ad040]/10"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-[#6ad040] text-black hover:bg-[#79e74c] font-['Space_Grotesk'] font-bold"
              >
                {currentStep === steps.length ? (
                  <>
                    Complete
                    <Check className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}