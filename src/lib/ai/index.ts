// AI Service Exports
export * from './config'
export * from './openrouter'
export * from './prompts'

// Re-export commonly used items for convenience
export { OpenRouterService } from './openrouter'
export { PromptTemplates, type PromptTemplate, type PromptContext } from './prompts'
export { 
  AI_CONFIG, 
  AI_MODELS, 
  getAPIKeys, 
  validateAPIKeys, 
  getOptimalModel 
} from './config'