export interface PasswordStrength {
  score: number
  feedback: string[]
  isValid: boolean
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[^a-zA-Z\d]/.test(password)
  }

  let score = 0
  const feedback: string[] = []

  // Check each requirement
  if (requirements.minLength) {
    score += 1
  } else {
    feedback.push('At least 8 characters')
  }

  if (requirements.hasLowercase) {
    score += 1
  } else {
    feedback.push('Lowercase letter')
  }

  if (requirements.hasUppercase) {
    score += 1
  } else {
    feedback.push('Uppercase letter')
  }

  if (requirements.hasNumber) {
    score += 1
  } else {
    feedback.push('Number')
  }

  if (requirements.hasSpecialChar) {
    score += 1
  } else {
    feedback.push('Special character')
  }

  // Password is valid if it meets at least 3 requirements including minimum length
  const isValid = score >= 3 && requirements.minLength

  return {
    score,
    feedback,
    isValid,
    requirements
  }
}

export const generatePasswordStrengthMessage = (strength: PasswordStrength): string => {
  if (strength.score === 0) return 'Very weak password'
  if (strength.score === 1) return 'Weak password'
  if (strength.score === 2) return 'Fair password'
  if (strength.score === 3) return 'Good password'
  if (strength.score === 4) return 'Strong password'
  if (strength.score === 5) return 'Very strong password'
  return 'Invalid password'
}

export const getPasswordRequirements = (): string[] => {
  return [
    'At least 8 characters long',
    'Contains at least one uppercase letter (A-Z)',
    'Contains at least one lowercase letter (a-z)',
    'Contains at least one number (0-9)',
    'Contains at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)'
  ]
}