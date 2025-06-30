import React from 'react'

interface PasswordStrengthIndicatorProps {
  strength: {
    score: number
    feedback: string[]
    isValid: boolean
  }
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength }) => {
  const getStrengthLabel = () => {
    switch (strength.score) {
      case 0: return 'Very Weak'
      case 1: return 'Weak'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Strong'
      case 5: return 'Very Strong'
      default: return 'Very Weak'
    }
  }

  const getStrengthColor = () => {
    switch (strength.score) {
      case 0: return 'bg-red-500'
      case 1: return 'bg-orange-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-green-500'
      case 4: return 'bg-green-600'
      case 5: return 'bg-green-700'
      default: return 'bg-gray-500'
    }
  }

  const getTextColor = () => {
    switch (strength.score) {
      case 0: return 'text-red-400'
      case 1: return 'text-orange-400'
      case 2: return 'text-yellow-400'
      case 3: return 'text-green-400'
      case 4: return 'text-green-500'
      case 5: return 'text-green-600'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Password strength:</span>
        <span className={`text-xs font-medium ${getTextColor()}`}>
          {getStrengthLabel()}
        </span>
      </div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index < strength.score
                ? getStrengthColor()
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}