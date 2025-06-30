// Module Definitions - Central source of truth for all modules in the system

export interface ModuleDefinition {
  id: string // Fixed ID for the module
  name: string
  displayName: string
  description: string
  category: ModuleCategory
  icon: string // Lucide icon name
  order: number // Display order within category
  dependencies?: string[] // Module IDs that must be completed first
  estimatedTime?: string // e.g., "30 min", "2 hours"
  subModules?: SubModule[]
  metadata?: {
    requiresProfile?: boolean
    requiresBusinessInfo?: boolean
    externalIntegrations?: string[]
    outputDocuments?: string[]
  }
}

export interface SubModule {
  id: string
  name: string
  displayName: string
  description: string
  order: number
  required: boolean
}

export enum ModuleCategory {
  FOUNDATION = 'foundation',
  LEGAL = 'legal',
  BRANDING = 'branding',
  OPERATIONS = 'operations',
  MARKETING = 'marketing',
  FINANCE = 'finance',
  GROWTH = 'growth',
  AUTOMATION = 'automation'
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  // Foundation Modules (100 series)
  {
    id: 'MOD_101',
    name: 'business_profile',
    displayName: 'Business Profile Setup',
    description: 'Create your comprehensive business profile with AI assistance',
    category: ModuleCategory.FOUNDATION,
    icon: 'User',
    order: 1,
    estimatedTime: '15 min',
    subModules: [
      { id: 'SUB_101_1', name: 'basic_info', displayName: 'Basic Information', description: 'Business name, industry, location', order: 1, required: true },
      { id: 'SUB_101_2', name: 'business_model', displayName: 'Business Model', description: 'Revenue streams, target market', order: 2, required: true },
      { id: 'SUB_101_3', name: 'team_structure', displayName: 'Team Structure', description: 'Founders, employees, advisors', order: 3, required: false }
    ]
  },
  {
    id: 'MOD_102',
    name: 'vision_mission',
    displayName: 'Vision & Mission',
    description: 'Define your business purpose and long-term goals',
    category: ModuleCategory.FOUNDATION,
    icon: 'Target',
    order: 2,
    dependencies: ['MOD_101'],
    estimatedTime: '20 min'
  },

  // Legal Modules (200 series)
  {
    id: 'MOD_201',
    name: 'legal_structure',
    displayName: 'Legal Structure Setup',
    description: 'Choose and establish your business legal structure',
    category: ModuleCategory.LEGAL,
    icon: 'Scale',
    order: 1,
    dependencies: ['MOD_101'],
    estimatedTime: '45 min',
    subModules: [
      { id: 'SUB_201_1', name: 'structure_selection', displayName: 'Structure Selection', description: 'LLC, Corp, Partnership analysis', order: 1, required: true },
      { id: 'SUB_201_2', name: 'state_registration', displayName: 'State Registration', description: 'Register in your state', order: 2, required: true },
      { id: 'SUB_201_3', name: 'ein_application', displayName: 'EIN Application', description: 'Federal tax ID number', order: 3, required: true }
    ],
    metadata: {
      outputDocuments: ['Articles of Organization', 'Operating Agreement', 'EIN Confirmation']
    }
  },
  {
    id: 'MOD_202',
    name: 'legal_documents',
    displayName: 'Legal Documents',
    description: 'Generate essential legal documents for your business',
    category: ModuleCategory.LEGAL,
    icon: 'FileText',
    order: 2,
    dependencies: ['MOD_201'],
    estimatedTime: '1 hour',
    subModules: [
      { id: 'SUB_202_1', name: 'terms_conditions', displayName: 'Terms & Conditions', description: 'Website and service terms', order: 1, required: true },
      { id: 'SUB_202_2', name: 'privacy_policy', displayName: 'Privacy Policy', description: 'Data protection policy', order: 2, required: true },
      { id: 'SUB_202_3', name: 'contracts', displayName: 'Contract Templates', description: 'Client and vendor contracts', order: 3, required: false }
    ]
  },
  {
    id: 'MOD_203',
    name: 'compliance',
    displayName: 'Compliance & Licensing',
    description: 'Ensure compliance with regulations and obtain necessary licenses',
    category: ModuleCategory.LEGAL,
    icon: 'Shield',
    order: 3,
    dependencies: ['MOD_201'],
    estimatedTime: '2 hours'
  },

  // Branding Modules (300 series)
  {
    id: 'MOD_301',
    name: 'brand_identity',
    displayName: 'Brand Identity',
    description: 'Create your visual identity and brand guidelines',
    category: ModuleCategory.BRANDING,
    icon: 'Palette',
    order: 1,
    dependencies: ['MOD_102'],
    estimatedTime: '1 hour',
    subModules: [
      { id: 'SUB_301_1', name: 'logo_design', displayName: 'Logo Design', description: 'AI-generated logo concepts', order: 1, required: true },
      { id: 'SUB_301_2', name: 'color_palette', displayName: 'Color Palette', description: 'Brand colors and usage', order: 2, required: true },
      { id: 'SUB_301_3', name: 'typography', displayName: 'Typography', description: 'Font selection and hierarchy', order: 3, required: true },
      { id: 'SUB_301_4', name: 'brand_voice', displayName: 'Brand Voice', description: 'Tone and messaging guidelines', order: 4, required: false }
    ]
  },
  {
    id: 'MOD_302',
    name: 'marketing_materials',
    displayName: 'Marketing Materials',
    description: 'Design business cards, letterheads, and presentations',
    category: ModuleCategory.BRANDING,
    icon: 'FileImage',
    order: 2,
    dependencies: ['MOD_301'],
    estimatedTime: '45 min'
  },

  // Operations Modules (400 series)
  {
    id: 'MOD_401',
    name: 'business_banking',
    displayName: 'Business Banking',
    description: 'Set up business banking and financial accounts',
    category: ModuleCategory.OPERATIONS,
    icon: 'Building',
    order: 1,
    dependencies: ['MOD_201'],
    estimatedTime: '30 min',
    metadata: {
      externalIntegrations: ['Banks', 'Credit Unions']
    }
  },
  {
    id: 'MOD_402',
    name: 'payment_processing',
    displayName: 'Payment Processing',
    description: 'Set up payment acceptance for your business',
    category: ModuleCategory.OPERATIONS,
    icon: 'CreditCard',
    order: 2,
    dependencies: ['MOD_401'],
    estimatedTime: '45 min',
    metadata: {
      externalIntegrations: ['Stripe', 'Square', 'PayPal']
    }
  },
  {
    id: 'MOD_403',
    name: 'accounting_setup',
    displayName: 'Accounting Setup',
    description: 'Initialize bookkeeping and accounting systems',
    category: ModuleCategory.OPERATIONS,
    icon: 'Calculator',
    order: 3,
    dependencies: ['MOD_401'],
    estimatedTime: '1 hour',
    metadata: {
      externalIntegrations: ['QuickBooks', 'Xero', 'FreshBooks']
    }
  },

  // Marketing Modules (500 series)
  {
    id: 'MOD_501',
    name: 'website_builder',
    displayName: 'Website Builder',
    description: 'Create your professional business website',
    category: ModuleCategory.MARKETING,
    icon: 'Globe',
    order: 1,
    dependencies: ['MOD_301'],
    estimatedTime: '2 hours',
    subModules: [
      { id: 'SUB_501_1', name: 'domain_setup', displayName: 'Domain Setup', description: 'Register and configure domain', order: 1, required: true },
      { id: 'SUB_501_2', name: 'page_creation', displayName: 'Page Creation', description: 'Homepage, About, Services', order: 2, required: true },
      { id: 'SUB_501_3', name: 'seo_optimization', displayName: 'SEO Optimization', description: 'Search engine optimization', order: 3, required: true }
    ]
  },
  {
    id: 'MOD_502',
    name: 'social_media',
    displayName: 'Social Media Presence',
    description: 'Establish and optimize social media profiles',
    category: ModuleCategory.MARKETING,
    icon: 'Share2',
    order: 2,
    dependencies: ['MOD_301'],
    estimatedTime: '1 hour'
  },
  {
    id: 'MOD_503',
    name: 'email_marketing',
    displayName: 'Email Marketing',
    description: 'Set up email marketing and automation',
    category: ModuleCategory.MARKETING,
    icon: 'Mail',
    order: 3,
    dependencies: ['MOD_501'],
    estimatedTime: '45 min',
    metadata: {
      externalIntegrations: ['Mailchimp', 'ConvertKit', 'SendGrid']
    }
  },
  {
    id: 'MOD_504',
    name: 'content_strategy',
    displayName: 'Content Strategy',
    description: 'Develop content calendar and marketing strategy',
    category: ModuleCategory.MARKETING,
    icon: 'FileText',
    order: 4,
    dependencies: ['MOD_502'],
    estimatedTime: '1 hour'
  },

  // Finance Modules (600 series)
  {
    id: 'MOD_601',
    name: 'financial_projections',
    displayName: 'Financial Projections',
    description: 'Create revenue forecasts and financial models',
    category: ModuleCategory.FINANCE,
    icon: 'TrendingUp',
    order: 1,
    dependencies: ['MOD_102', 'MOD_403'],
    estimatedTime: '2 hours'
  },
  {
    id: 'MOD_602',
    name: 'funding_preparation',
    displayName: 'Funding Preparation',
    description: 'Prepare for investor meetings and funding rounds',
    category: ModuleCategory.FINANCE,
    icon: 'DollarSign',
    order: 2,
    dependencies: ['MOD_601'],
    estimatedTime: '3 hours',
    subModules: [
      { id: 'SUB_602_1', name: 'pitch_deck', displayName: 'Pitch Deck', description: 'Investor presentation', order: 1, required: true },
      { id: 'SUB_602_2', name: 'financial_statements', displayName: 'Financial Statements', description: 'P&L, Balance Sheet, Cash Flow', order: 2, required: true },
      { id: 'SUB_602_3', name: 'investor_documents', displayName: 'Investor Documents', description: 'Term sheets, cap table', order: 3, required: false }
    ]
  },

  // Growth Modules (700 series)
  {
    id: 'MOD_701',
    name: 'customer_acquisition',
    displayName: 'Customer Acquisition',
    description: 'Develop strategies to attract and convert customers',
    category: ModuleCategory.GROWTH,
    icon: 'Users',
    order: 1,
    dependencies: ['MOD_504'],
    estimatedTime: '1.5 hours'
  },
  {
    id: 'MOD_702',
    name: 'analytics_setup',
    displayName: 'Analytics & Tracking',
    description: 'Set up business analytics and KPI tracking',
    category: ModuleCategory.GROWTH,
    icon: 'BarChart',
    order: 2,
    dependencies: ['MOD_501'],
    estimatedTime: '1 hour',
    metadata: {
      externalIntegrations: ['Google Analytics', 'Mixpanel', 'Segment']
    }
  },

  // Automation Modules (800 series)
  {
    id: 'MOD_801',
    name: 'workflow_automation',
    displayName: 'Workflow Automation',
    description: 'Automate repetitive business processes',
    category: ModuleCategory.AUTOMATION,
    icon: 'Cpu',
    order: 1,
    dependencies: ['MOD_403', 'MOD_503'],
    estimatedTime: '2 hours',
    metadata: {
      externalIntegrations: ['Zapier', 'Make', 'n8n']
    }
  },
  {
    id: 'MOD_802',
    name: 'ai_integration',
    displayName: 'AI Integration',
    description: 'Integrate AI tools for business efficiency',
    category: ModuleCategory.AUTOMATION,
    icon: 'Sparkles',
    order: 2,
    dependencies: ['MOD_801'],
    estimatedTime: '1.5 hours'
  }
]

// Helper functions
export const getModuleById = (moduleId: string): ModuleDefinition | undefined => {
  return MODULE_DEFINITIONS.find(m => m.id === moduleId)
}

export const getModulesByCategory = (category: ModuleCategory): ModuleDefinition[] => {
  return MODULE_DEFINITIONS.filter(m => m.category === category).sort((a, b) => a.order - b.order)
}

export const getModuleDependencies = (moduleId: string): ModuleDefinition[] => {
  const module = getModuleById(moduleId)
  if (!module?.dependencies) return []
  return module.dependencies.map(getModuleById).filter(Boolean) as ModuleDefinition[]
}

export const getNextModules = (completedModuleIds: string[]): ModuleDefinition[] => {
  return MODULE_DEFINITIONS.filter(module => {
    // Module not yet completed
    if (completedModuleIds.includes(module.id)) return false
    
    // All dependencies satisfied
    if (module.dependencies) {
      return module.dependencies.every(dep => completedModuleIds.includes(dep))
    }
    
    return true
  })
}

export const getModuleProgress = (moduleId: string, completedSubModules: string[]): number => {
  const module = getModuleById(moduleId)
  if (!module?.subModules?.length) return 0
  
  const requiredSubModules = module.subModules.filter(sm => sm.required)
  const completedRequired = requiredSubModules.filter(sm => completedSubModules.includes(sm.id))
  
  return Math.round((completedRequired.length / requiredSubModules.length) * 100)
}

export const getCategoryProgress = (category: ModuleCategory, completedModuleIds: string[]): number => {
  const categoryModules = getModulesByCategory(category)
  const completedCount = categoryModules.filter(m => completedModuleIds.includes(m.id)).length
  
  return Math.round((completedCount / categoryModules.length) * 100)
}

// Module ID naming convention:
// MOD_XYZ where:
// X = Category (1-8)
// YZ = Sequential number within category
// 
// Sub-module IDs:
// SUB_XYZ_N where N is the sub-module number