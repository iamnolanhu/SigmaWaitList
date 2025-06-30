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
  Globe,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileWizardProps {
  onComplete?: () => void
  onSkip?: () => void
}

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Business Setup', icon: Briefcase },
  { id: 3, title: 'Experience & Goals', icon: Target },
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
    
    // Step 2: Business Setup
    business_type: profile?.business_type || '',
    industry: profile?.industry || '',
    time_commitment: profile?.time_commitment || '',
    
    // Step 3: Experience & Goals
    skill_level: profile?.skill_level || 'beginner',
    capital_level: profile?.capital_level || '',
    
    // Step 4: Preferences
    region: profile?.region || '',
    language: profile?.language || 'en',
    stealth_mode: profile?.stealth_mode || false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const businessTypes = [
    'Solo Entrepreneur', 'Small Team (2-5)', 'Startup', 'Growing Business', 
    'Side Hustle', 'Freelancer/Consultant', 'E-commerce Store', 'SaaS/Tech Company'
  ]

  const industries = [
    'Technology & Software', 'E-commerce & Retail', 'Healthcare & Wellness', 
    'Finance & Fintech', 'Education & Training', 'Real Estate', 
    'Marketing & Advertising', 'Consulting & Services', 'Manufacturing', 
    'Food & Hospitality', 'Creative & Media', 'Other'
  ]

  const timeCommitments = [
    'Part-time (10-20 hrs/week)', 'Full-time (40+ hrs/week)', 
    'Weekends only', 'Flexible hours', 'Just getting started'
  ]

  const skillLevels = [
    'Complete beginner', 'Some business experience', 
    'Running a small business', 'Experienced entrepreneur'
  ]

  const capitalLevels = [
    'Bootstrap/No funding', 'Under $1K', '$1K - $10K', 
    '$10K - $50K', '$50K+', 'Seeking investors'
  ]

  const regions = [
    'United States', 'Canada', 'United Kingdom', 'European Union', 
    'Australia/New Zealand', 'Asia Pacific', 'Latin America', 'Other'
  ]

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.name?.trim()) newErrors.name = 'Name is required'
        if (!formData.bio?.trim()) newErrors.bio = 'Tell us a bit about yourself'
        break
      case 2:
        if (!formData.business_type) newErrors.business_type = 'Please select your business type'
        if (!formData.industry) newErrors.industry = 'Please select an industry'
        if (!formData.time_commitment) newErrors.time_commitment = 'Please select your time commitment'
        break
      case 3:
        if (!formData.skill_level) newErrors.skill_level = 'Please select your experience level'
        if (!formData.capital_level) newErrors.capital_level = 'Please select your capital level'
        break
      case 4:
        if (!formData.region) newErrors.region = 'Please select your region'
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
      // Calculate completion percentage based on filled fields
      const totalFields = 9
      const completedFields = Object.values(formData).filter(value => value && value !== '').length
      const completionPercentage = Math.round((completedFields / totalFields) * 100)
      
      await updateProfile({
        ...formData,
        completion_percentage: Math.max(completionPercentage, 25),
        wizard_completed: true,
        wizard_step: steps.length,
        wizard_data: formData,
        updated_at: new Date().toISOString()
      })
      onComplete?.()
    } catch (error) {
      console.error('Error completing wizard:', error)
    } finally {
      setLoading(false)
    }
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
                Tell us about yourself to personalize your experience
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
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-['Orbitron'] font-bold text-2xl text-[#b7ffab] mb-2">
                Business Setup
              </h3>
              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                Tell us about your business goals and commitment
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Business Type
                </label>
                <select
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:outline-none focus:border-[#6ad040] transition-colors"
                >
                  <option value="">Select your business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.business_type && (
                  <p className="font-['Space_Mono'] text-red-500 text-xs mt-1">{errors.business_type}</p>
                )}
              </div>

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
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Time Commitment
                </label>
                <select
                  value={formData.time_commitment}
                  onChange={(e) => setFormData({ ...formData, time_commitment: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:outline-none focus:border-[#6ad040] transition-colors"
                >
                  <option value="">Select your time commitment</option>
                  {timeCommitments.map(commitment => (
                    <option key={commitment} value={commitment}>{commitment}</option>
                  ))}
                </select>
                {errors.time_commitment && (
                  <p className="font-['Space_Mono'] text-red-500 text-xs mt-1">{errors.time_commitment}</p>
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
                Experience & Goals
              </h3>
              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                Help us tailor the experience to your level
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Experience Level
                </label>
                <select
                  value={formData.skill_level}
                  onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:outline-none focus:border-[#6ad040] transition-colors"
                >
                  <option value="">Select your experience level</option>
                  {skillLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.skill_level && (
                  <p className="font-['Space_Mono'] text-red-500 text-xs mt-1">{errors.skill_level}</p>
                )}
              </div>

              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Available Capital
                </label>
                <select
                  value={formData.capital_level}
                  onChange={(e) => setFormData({ ...formData, capital_level: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:outline-none focus:border-[#6ad040] transition-colors"
                >
                  <option value="">Select your capital level</option>
                  {capitalLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.capital_level && (
                  <p className="font-['Space_Mono'] text-red-500 text-xs mt-1">{errors.capital_level}</p>
                )}
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
                Finalize your BasedSigma setup
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Region
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:outline-none focus:border-[#6ad040] transition-colors"
                >
                  <option value="">Select your region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                {errors.region && (
                  <p className="font-['Space_Mono'] text-red-500 text-xs mt-1">{errors.region}</p>
                )}
              </div>

              <div>
                <label className="font-['Space_Mono'] text-[#b7ffab] text-sm mb-2 block">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:outline-none focus:border-[#6ad040] transition-colors"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div className="bg-black/30 rounded-lg p-4 border border-[#6ad040]/30">
                <div className="flex items-center justify-between">
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
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      formData.stealth_mode ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
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
              onClick={onSkip || (() => {})}
              className="font-['Space_Mono'] text-[#b7ffab]/60 hover:text-[#b7ffab] text-sm transition-colors"
            >
              Skip for now
            </button>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
                className="border-[#6ad040]/50 text-[#b7ffab] hover:border-[#6ad040] hover:bg-[#6ad040]/10"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-[#6ad040] text-black hover:bg-[#79e74c] font-['Space_Grotesk'] font-bold"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentStep === steps.length ? (
                <>
                  Complete Setup
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
      </Card>
    </div>
  )
}