import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAIGeneration } from '../../hooks/useAIGeneration'
import { useUserProfile } from '../../hooks/useUserProfile'
import { PromptContext } from '../../lib/ai/prompts'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Bot, Sparkles, ChevronRight, ChevronLeft, Loader2, CheckCircle } from 'lucide-react'

interface OnboardingStep {
  id: string
  question: string
  type: 'single' | 'multiple' | 'text' | 'range'
  options?: string[]
  key: string
  helpText?: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'goals',
    question: "What's your primary goal with BasedSigma?",
    type: 'single',
    options: [
      'Start a new business from scratch',
      'Grow my existing business',
      'Automate business operations',
      'Find the right business idea',
      'Learn entrepreneurship skills'
    ],
    key: 'primary_goal',
    helpText: 'This helps us personalize your experience'
  },
  {
    id: 'experience',
    question: 'What best describes your business experience?',
    type: 'single',
    options: [
      'Complete beginner',
      'Some side projects',
      'Running a small business',
      'Experienced entrepreneur',
      'Corporate professional transitioning'
    ],
    key: 'experience_level'
  },
  {
    id: 'interests',
    question: 'Which industries interest you most?',
    type: 'multiple',
    options: [
      'Technology & Software',
      'E-commerce & Retail',
      'Health & Wellness',
      'Education & Training',
      'Creative & Media',
      'Finance & Consulting',
      'Food & Hospitality',
      'Real Estate',
      'Other'
    ],
    key: 'industry_interests',
    helpText: 'Select up to 3 that excite you most'
  },
  {
    id: 'skills',
    question: 'What are your strongest skills?',
    type: 'multiple',
    options: [
      'Technical/Programming',
      'Sales & Marketing',
      'Design & Creative',
      'Writing & Content',
      'Finance & Analytics',
      'Operations & Management',
      'Teaching & Coaching',
      'Problem Solving'
    ],
    key: 'skills',
    helpText: 'We\'ll suggest business ideas that leverage your strengths'
  },
  {
    id: 'challenges',
    question: 'What\'s your biggest challenge right now?',
    type: 'single',
    options: [
      'Finding the right idea',
      'Limited time availability',
      'Limited capital/funding',
      'Technical knowledge',
      'Marketing & sales',
      'Legal & compliance',
      'Building a team'
    ],
    key: 'main_challenge'
  },
  {
    id: 'commitment',
    question: 'How much time can you dedicate weekly?',
    type: 'single',
    options: [
      'Less than 10 hours',
      '10-20 hours',
      '20-40 hours',
      'Full-time (40+ hours)'
    ],
    key: 'time_commitment'
  },
  {
    id: 'timeline',
    question: 'When do you want to see results?',
    type: 'single',
    options: [
      'ASAP (1-3 months)',
      'Soon (3-6 months)',
      'This year (6-12 months)',
      'Long-term (1+ years)'
    ],
    key: 'timeline'
  }
]

export const AIOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const { generateCustom } = useAIGeneration()
  const { updateProfile } = useUserProfile()

  const currentQuestion = ONBOARDING_STEPS[currentStep]
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  const handleAnswer = useCallback((value: string | string[]) => {
    if (currentQuestion.type === 'multiple') {
      setSelectedOptions(value as string[])
    } else {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.key]: value
      }))
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setTimeout(() => setCurrentStep(prev => prev + 1), 300)
      } else {
        generateSuggestionsAndComplete()
      }
    }
  }, [currentQuestion, currentStep])

  const handleMultipleSubmit = useCallback(() => {
    if (selectedOptions.length > 0) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.key]: selectedOptions
      }))
      setSelectedOptions([])
      
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        generateSuggestionsAndComplete()
      }
    }
  }, [selectedOptions, currentQuestion, currentStep])

  const generateSuggestionsAndComplete = useCallback(async () => {
    setIsGenerating(true)
    
    try {
      const prompt = `Based on this user's onboarding responses, provide personalized recommendations:

${JSON.stringify(answers, null, 2)}

Generate:
1. Top 3 business ideas tailored to their profile
2. Recommended first steps (specific actions)
3. Modules they should focus on first
4. Potential challenges to watch out for
5. Success tips based on their situation

Format as JSON with these keys:
{
  "business_ideas": [
    {
      "name": "Business idea name",
      "description": "2-3 sentence description",
      "why_suitable": "Why this fits their profile",
      "first_step": "Immediate action to take"
    }
  ],
  "first_steps": ["Step 1", "Step 2", "Step 3"],
  "recommended_modules": ["module1", "module2", "module3"],
  "watch_out_for": ["Challenge 1", "Challenge 2"],
  "success_tips": ["Tip 1", "Tip 2", "Tip 3"]
}`

      const result = await generateCustom(prompt, 'business-planning')
      
      if (result) {
        try {
          const parsed = JSON.parse(result)
          setSuggestions(parsed)
          setShowSuggestions(true)
          
          await updateProfile({
            wizard_completed: true,
            wizard_data: {
              onboarding_data: answers,
              ai_suggestions: parsed
            }
          })
        } catch (e) {
          console.error('Failed to parse AI suggestions:', e)
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [answers, generateCustom, updateProfile])

  const handleComplete = useCallback(() => {
    onComplete()
  }, [onComplete])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const toggleOption = useCallback((option: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(o => o !== option)
      }
      if (prev.length < 3) {
        return [...prev, option]
      }
      return prev
    })
  }, [])

  if (showSuggestions && suggestions) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black flex items-center justify-center p-4"
      >
        <Card className="max-w-4xl w-full bg-gray-900 border-green-500/20 p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-4"
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Your Personalized Roadmap</h2>
            <p className="text-gray-400">Based on your profile, here's what we recommend</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-green-400 mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Business Ideas For You
              </h3>
              <div className="space-y-3">
                {suggestions.business_ideas?.map((idea: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                  >
                    <h4 className="font-semibold text-white mb-1">{idea.name}</h4>
                    <p className="text-gray-400 text-sm mb-2">{idea.description}</p>
                    <p className="text-green-400 text-sm mb-2">
                      <strong>Why it suits you:</strong> {idea.why_suitable}
                    </p>
                    <p className="text-gray-300 text-sm">
                      <strong>First step:</strong> {idea.first_step}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3">Your First Steps</h3>
                <ol className="space-y-2">
                  {suggestions.first_steps?.map((step: string, index: number) => (
                    <motion.li
                      key={index}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start text-gray-300"
                    >
                      <span className="text-green-500 mr-2">{index + 1}.</span>
                      {step}
                    </motion.li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3">Focus On These Modules</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.recommended_modules?.map((module: string, index: number) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm"
                    >
                      {module}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Watch Out For</h3>
              <ul className="space-y-1">
                {suggestions.watch_out_for?.map((challenge: string, index: number) => (
                  <li key={index} className="text-gray-400 text-sm flex items-start">
                    <span className="text-yellow-500 mr-2">⚠️</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-6 rounded-lg border border-green-500/20">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Success Tips</h3>
              <ul className="space-y-2">
                {suggestions.success_tips?.map((tip: string, index: number) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Start Building Your Business
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black flex items-center justify-center p-4"
    >
      <Card className="max-w-2xl w-full bg-gray-900 border-green-500/20">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Bot className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Business Assistant</h1>
                <p className="text-gray-400 text-sm">Let's find the perfect business for you</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.helpText && (
                  <p className="text-gray-400 text-sm">{currentQuestion.helpText}</p>
                )}
              </div>

              {currentQuestion.type === 'single' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-green-500 rounded-lg transition-all duration-200"
                    >
                      <span className="text-gray-200">{option}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'multiple' && (
                <>
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option) => (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleOption(option)}
                        className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                          selectedOptions.includes(option)
                            ? 'bg-green-500/20 border-green-500 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-green-500/50 text-gray-200'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          {option}
                          {selectedOptions.includes(option) && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm">
                      {selectedOptions.length}/3 selected
                    </p>
                    <Button
                      onClick={handleMultipleSubmit}
                      disabled={selectedOptions.length === 0}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500"
                    >
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-gray-400 hover:text-white disabled:text-gray-600"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </Card>

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <Card className="bg-gray-900 border-green-500/20 p-8 max-w-md text-center">
            <Loader2 className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Creating Your Personalized Plan
            </h3>
            <p className="text-gray-400">
              Our AI is analyzing your profile and generating tailored recommendations...
            </p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}