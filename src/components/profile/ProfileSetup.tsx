import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useApp } from '../../contexts/AppContext'
import { trackEvent } from '../../lib/analytics'
import { CheckCircle, User, Globe, Briefcase, Clock, DollarSign, Shield, Loader2, Save, RefreshCw, Database } from 'lucide-react'

export const ProfileSetup: React.FC = () => {
  const { user } = useApp()
  const { profile, loading, updateProfile, loadProfile } = useUserProfile()
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    business_type: '',
    time_commitment: '',
    capital_level: '',
    stealth_mode: false
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      const newFormData = {
        name: profile.name || '',
        region: profile.region || '',
        business_type: profile.business_type || '',
        time_commitment: profile.time_commitment || '',
        capital_level: profile.capital_level || '',
        stealth_mode: profile.stealth_mode || false
      }
      setFormData(newFormData)
      console.log('Profile loaded, updating form:', newFormData)
    }
  }, [profile])

  // Validate form whenever formData changes
  useEffect(() => {
    const isValid = !!(
      formData.name.trim() &&
      formData.region &&
      formData.business_type &&
      formData.time_commitment &&
      formData.capital_level
    )
    setIsFormValid(isValid)
    console.log('Form validation:', { isValid, formData })
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      setSaveError('Please fill in all required fields')
      return
    }

    setSaving(true)
    setSaveSuccess(false)
    setSaveError('')

    try {
      console.log('Attempting to save profile:', formData)
      
      const { data, error } = await updateProfile(formData)
      
      if (error) {
        setSaveError(error)
        console.error('Profile save error:', error)
      } else {
        setSaveSuccess(true)
        console.log('Profile saved successfully:', data)
        
        // Track successful profile update
        trackEvent('profile_updated', {
          user_id: user?.id,
          completion_percentage: data?.completion_percentage || 0,
          has_business_type: !!formData.business_type,
          has_region: !!formData.region
        })
        
        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile')
      console.error('Profile save exception:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      console.log('Form data updated:', { field, value, newData })
      return newData
    })
    // Clear any previous errors when user starts typing
    if (saveError) setSaveError('')
  }

  const handleRefresh = async () => {
    setSaving(true)
    try {
      await loadProfile()
      console.log('Profile refreshed')
    } finally {
      setSaving(false)
    }
  }

  const businessTypes = [
    'E-commerce',
    'SaaS/Software',
    'Consulting',
    'Content Creation',
    'Freelancing',
    'Physical Products',
    'Cryptocurrency/Blockchain',
    'Healthcare',
    'Finance',
    'Education',
    'Real Estate',
    'Food & Beverage',
    'Other'
  ]

  const timeCommitments = [
    'Part-time (10-20 hrs/week)',
    'Full-time (40+ hrs/week)', 
    'Weekend warrior (5-10 hrs/week)',
    'Flexible/Variable'
  ]

  const capitalLevels = [
    'Bootstrap ($0-1K)',
    'Self-funded ($1K-10K)',
    'Funded ($10K+)',
    'Seeking investment'
  ]

  const regions = [
    'North America',
    'Europe',
    'Asia-Pacific',
    'Latin America',
    'Africa',
    'Middle East',
    'Other'
  ]

  const completionPercentage = profile?.completion_percentage || 0
  const isConnected = !!user && !loading

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl drop-shadow-lg drop-shadow-[#6ad040]/50">
            SIGMA PROFILE SETUP
          </h2>
          <Button
            onClick={handleRefresh}
            disabled={saving}
            className="p-2 h-auto bg-transparent hover:bg-[#6ad040]/20 text-[#6ad040] border border-[#6ad040]/50"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm opacity-90">
          Configure your business automation preferences
        </p>
        
        {/* Progress Indicator */}
        <div className="mt-4 bg-black/30 backdrop-blur-md rounded-full p-1 max-w-sm mx-auto">
          <div className="flex items-center justify-between text-xs font-['Space_Mono'] text-[#b7ffab] px-4 py-2">
            <span>Progress</span>
            <span className="text-[#6ad040] font-bold">{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-500/10 backdrop-blur-md border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-['Space_Mono'] text-green-400 text-sm font-bold">
                Profile saved successfully!
              </p>
              <p className="font-['Space_Mono'] text-green-300 text-xs">
                Your automation preferences have been updated and synced to the database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <div>
              <p className="font-['Space_Mono'] text-red-400 text-sm font-bold">
                Save failed
              </p>
              <p className="font-['Space_Mono'] text-red-300 text-xs">
                {saveError}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                Basic Information
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Name (or Business Name) *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your sigma name..."
                  className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
                />
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Region *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">Select your region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                Business Profile
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.business_type}
                  onChange={(e) => handleInputChange('business_type', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">Select business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Time Commitment *
                </label>
                <select
                  value={formData.time_commitment}
                  onChange={(e) => handleInputChange('time_commitment', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">How much time can you dedicate?</option>
                  {timeCommitments.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Capital Level *
                </label>
                <select
                  value={formData.capital_level}
                  onChange={(e) => handleInputChange('capital_level', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">Available capital?</option>
                  {capitalLevels.map(capital => (
                    <option key={capital} value={capital}>{capital}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                Privacy & Stealth Mode
              </h3>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
              <div>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm font-bold">
                  Stealth Mode
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  Enhanced privacy features for anonymous business building
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('stealth_mode', !formData.stealth_mode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.stealth_mode ? 'bg-[#6ad040]' : 'bg-black/50'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    formData.stealth_mode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={saving || !isConnected || !isFormValid}
          className="w-full font-['Orbitron'] font-black text-lg px-8 py-4 rounded-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] border-2 border-[#6ad040]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6ad040]/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving Profile...
            </>
          ) : !isConnected ? (
            <>
              <Database className="w-5 h-5 mr-2" />
              Connecting...
            </>
          ) : !isFormValid ? (
            <>
              <Save className="w-5 h-5 mr-2" />
              Fill Required Fields
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Profile
            </>
          )}
        </Button>

        {/* Form Validation Status */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-black/30 rounded-full px-4 py-2 border border-[#6ad040]/30">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#6ad040] animate-pulse' : 'bg-gray-500'}`} />
            <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">
              {isConnected ? 'Connected to Database' : 'Connecting...'}
            </span>
          </div>
          
          {!isFormValid && (
            <div className="text-xs font-['Space_Mono'] text-yellow-400">
              Required: Name, Region, Business Type, Time Commitment, Capital Level
            </div>
          )}
        </div>
      </form>
    </div>
  )
}