import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface FormField {
  name: string
  value: any
  type: string
  label?: string
  options?: Array<{ value: string; label: string }>
  required?: boolean
}

interface FormData {
  [key: string]: any
}

interface FormContextType {
  // Current active form data
  activeFormId: string | null
  formFields: FormField[]
  formData: FormData
  
  // Form registration and updates
  registerForm: (formId: string, fields: FormField[]) => void
  unregisterForm: (formId: string) => void
  updateFormField: (fieldName: string, value: any) => void
  updateMultipleFields: (updates: FormData) => void
  
  // Auto-fill status
  isAutoFilling: boolean
  autoFilledFields: string[]
  
  // Get form info for AI
  getFormContext: () => {
    formId: string | null
    fields: FormField[]
    currentValues: FormData
  }
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider')
  }
  return context
}

interface FormProviderProps {
  children: React.ReactNode
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [activeFormId, setActiveFormId] = useState<string | null>(null)
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [formData, setFormData] = useState<FormData>({})
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([])

  // Register a form with its fields
  const registerForm = useCallback((formId: string, fields: FormField[]) => {
    setActiveFormId(formId)
    setFormFields(fields)
    
    // Initialize form data with current field values
    const initialData: FormData = {}
    fields.forEach(field => {
      initialData[field.name] = field.value || ''
    })
    setFormData(initialData)
  }, [])

  // Unregister form when component unmounts
  const unregisterForm = useCallback((formId: string) => {
    if (activeFormId === formId) {
      setActiveFormId(null)
      setFormFields([])
      setFormData({})
      setAutoFilledFields([])
    }
  }, [activeFormId])

  // Update a single form field
  const updateFormField = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }, [])

  // Update multiple fields at once (used for auto-fill)
  const updateMultipleFields = useCallback((updates: FormData) => {
    setIsAutoFilling(true)
    setAutoFilledFields(Object.keys(updates))
    
    // Animate the auto-fill
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        ...updates
      }))
      
      // Clear auto-fill status after animation
      setTimeout(() => {
        setIsAutoFilling(false)
      }, 1000)
    }, 300)
  }, [])

  // Get current form context for AI
  const getFormContext = useCallback(() => {
    return {
      formId: activeFormId,
      fields: formFields,
      currentValues: formData
    }
  }, [activeFormId, formFields, formData])

  // Clear auto-filled fields after a delay
  useEffect(() => {
    if (autoFilledFields.length > 0) {
      const timer = setTimeout(() => {
        setAutoFilledFields([])
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [autoFilledFields])

  const value: FormContextType = {
    activeFormId,
    formFields,
    formData,
    registerForm,
    unregisterForm,
    updateFormField,
    updateMultipleFields,
    isAutoFilling,
    autoFilledFields,
    getFormContext
  }

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  )
}

// Hook for forms to register themselves
export const useFormRegistration = (formId: string, fields: FormField[]) => {
  const { registerForm, unregisterForm, formData, updateFormField, autoFilledFields } = useFormContext()

  useEffect(() => {
    registerForm(formId, fields)
    
    return () => {
      unregisterForm(formId)
    }
  }, [formId, registerForm, unregisterForm]) // Remove 'fields' dependency to prevent infinite loop

  return {
    formData,
    updateFormField,
    autoFilledFields,
    isFieldAutoFilled: (fieldName: string) => autoFilledFields.includes(fieldName)
  }
}