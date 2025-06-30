import React, { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { MatrixBackground } from '../../components/MatrixBackground'
import { Navbar } from '../../components/Navbar'
import { Sidebar } from '../../components/Sidebar'
import { 
  Shield, 
  FileText, 
  ArrowLeft,
  Zap,
  CheckCircle
} from 'lucide-react'

export const LegalSetup: React.FC = () => {
  const { user } = useApp()
  const [formData, setFormData] = useState({
    businessName: '',
    legalStructure: '',
    jurisdiction: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleModuleNavigation = (moduleId: string) => {
    switch (moduleId) {
      case 'dashboard':
        window.location.href = '/app'
        break
      case 'profile':
        window.location.href = '/app?view=profile'
        break
      case 'legal-setup':
        // Already on legal setup
        break
      default:
        // Handle other modules
        console.log('Navigating to:', moduleId)
        break
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* Matrix Background Animation */}
      <MatrixBackground className="z-[5]" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/70 via-[#1a1a1a]/50 to-[#1a1a1a]/70 pointer-events-none z-[6]" />

      {/* Enhanced Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-[#6ad040] hover:text-[#79e74c] font-['Space_Mono'] text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar 
                currentModule="legal-setup"
                onNavigate={handleModuleNavigation}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-[#6ad040]" />
                  <h1 className="font-['Orbitron'] font-black text-[#ffff] text-3xl lg:text-4xl drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                    LEGAL FOUNDATION
                  </h1>
                </div>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-base mb-6 opacity-90">
                  Establish your business legally with AI-powered recommendations and stealth options
                </p>
              </div>

              {/* Form Container */}
              <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-[#6ad040]" />
                  <h2 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                    BUSINESS STRUCTURE
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Business Name */}
                  <div>
                    <label className="block font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/40 rounded-xl text-[#ffff] font-['Space_Mono'] text-sm focus:outline-none focus:border-[#6ad040] focus:ring-1 focus:ring-[#6ad040]/20 transition-all duration-300"
                      placeholder="Enter your business name"
                      required
                    />
                  </div>

                  {/* Legal Structure */}
                  <div>
                    <label className="block font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold mb-2">
                      Legal Structure
                    </label>
                    <select
                      value={formData.legalStructure}
                      onChange={(e) => handleInputChange('legalStructure', e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/40 rounded-xl text-[#ffff] font-['Space_Mono'] text-sm focus:outline-none focus:border-[#6ad040] focus:ring-1 focus:ring-[#6ad040]/20 transition-all duration-300"
                      required
                    >
                      <option value="">Select legal structure</option>
                      <option value="llc">LLC</option>
                      <option value="c-corporation">C-Corporation</option>
                      <option value="b-corporation">B-Corporation</option>
                      <option value="s-corporation">S-Corporation</option>
                      <option value="sole-proprietorship">Sole Proprietorship</option>
                    </select>
                  </div>

                  {/* Jurisdiction */}
                  <div>
                    <label className="block font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold mb-2">
                      Jurisdiction
                    </label>
                    <select
                      value={formData.jurisdiction}
                      onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-[#6ad040]/40 rounded-xl text-[#ffff] font-['Space_Mono'] text-sm focus:outline-none focus:border-[#6ad040] focus:ring-1 focus:ring-[#6ad040]/20 transition-all duration-300"
                      required
                    >
                      <option value="">Select jurisdiction</option>
                      <option value="delaware">Delaware</option>
                      <option value="wyoming">Wyoming</option>
                      <option value="nevada">Nevada</option>
                      <option value="california">California</option>
                      <option value="new-york">New York</option>
                      <option value="texas">Texas</option>
                      <option value="florida">Florida</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] hover:from-[#79e74c] hover:to-[#6ad040] text-black font-['Space_Grotesk'] font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#6ad040]/20"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        ESTABLISH LEGAL FOUNDATION
                      </div>
                    </button>
                  </div>
                </form>
              </div>

              {/* Info Panel */}
              <div className="mt-8 bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-[#6ad040]" />
                  <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                    AI RECOMMENDATIONS
                  </h3>
                </div>
                <div className="space-y-3">
                  <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
                    <span className="text-[#6ad040] font-bold">Delaware LLC:</span> Recommended for most businesses due to strong legal protections and tax benefits.
                  </p>
                  <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
                    <span className="text-[#6ad040] font-bold">Wyoming LLC:</span> Best for privacy-focused businesses with no state income tax.
                  </p>
                  <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
                    <span className="text-[#6ad040] font-bold">C-Corporation:</span> Ideal for businesses planning to raise venture capital or go public.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 