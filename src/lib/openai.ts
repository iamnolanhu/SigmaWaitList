import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
})

export interface SuggestionContext {
  pageName: string
  pageType: string
  moduleType?: string
  userProfile?: {
    name?: string
    email?: string
    businessInfo?: {
      businessName?: string
      industry?: string
      legalStructure?: string
      state?: string
      description?: string
      targetAudience?: string
      businessStage?: string
    }
    completion?: number
  }
  currentFormFields?: Record<string, any>
  recentActivity?: string[]
}

export const generateSmartSuggestions = async (context: SuggestionContext): Promise<string[]> => {
  try {
    const prompt = buildContextPrompt(context)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert business advisor helping entrepreneurs set up their businesses. Generate exactly 4 highly specific, actionable suggestions based on the user's current context. Focus on practical business advice like:
          - Business name generation and availability checking
          - LLC vs Corporation structure recommendations
          - Best states for incorporation based on their business type
          - Business description and tagline creation
          - Tax implications and benefits
          - Legal document preparation
          - Industry-specific recommendations
          
          Each suggestion should be:
          1. A complete question or request the user can click to send
          2. Directly relevant to their current module/task
          3. Personalized based on their business information
          4. Progressively helpful (from basic to advanced)
          5. Under 80 characters each
          
          Format: Return only a JSON array of 4 strings, no other text.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    try {
      const suggestions = JSON.parse(response)
      if (Array.isArray(suggestions) && suggestions.length === 4) {
        return suggestions
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e)
    }

    // Fallback suggestions
    return getDefaultSuggestions(context)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return getDefaultSuggestions(context)
  }
}

function buildContextPrompt(context: SuggestionContext): string {
  const { pageName, moduleType, userProfile } = context
  const business = userProfile?.businessInfo
  
  let prompt = `User Context:
- Current Page: ${pageName}
- Module Type: ${moduleType || 'general'}
- User Name: ${userProfile?.name || 'Not provided'}
- Business Name: ${business?.businessName || 'Not set'}
- Industry: ${business?.industry || 'Not specified'}
- Legal Structure: ${business?.legalStructure || 'Not chosen'}
- State: ${business?.state || 'Not specified'}
- Business Stage: ${business?.businessStage || 'Just starting'}
- Target Audience: ${business?.targetAudience || 'Not defined'}
- Profile Completion: ${userProfile?.completion || 0}%
`

  // Add page-specific context
  switch (moduleType) {
    case 'legal':
      prompt += `
The user is setting up their business legal structure. Focus on:
- ${!business?.businessName ? 'Generating creative, available business names for their industry' : `Checking if "${business.businessName}" is available in their state`}
- ${!business?.legalStructure ? 'Recommending LLC vs S-Corp vs C-Corp based on their specific needs' : `Setting up their ${business.legalStructure} in ${business?.state || 'their state'}`}
- Best states for incorporation (Delaware, Wyoming, Nevada vs home state)
- Tax implications and annual fees for each structure
- Required legal documents (Operating Agreement, Bylaws, etc.)
- EIN application and state registration process

Industry context: ${business?.industry || 'Not specified'}
Business stage: ${business?.businessStage || 'Just starting'}`
      break

    case 'branding':
      prompt += `
The user is creating their brand identity. Focus on:
- Logo concepts that reflect ${business?.industry || 'their industry'}
- Color psychology for ${business?.targetAudience || 'their target audience'}
- Brand voice and messaging that resonates
- Tagline and slogan creation
- Business card and letterhead design
- Brand guidelines document

Current business: ${business?.businessName || 'Not named yet'}
Description: ${business?.description || 'Not provided'}`
      break

    case 'banking':
      prompt += `
The user is setting up business banking. Focus on:
- Best business checking accounts with low/no fees
- Required documents for ${business?.legalStructure || 'their business type'}
- Business credit card recommendations for startups
- Bookkeeping and accounting setup
- Cash flow management tips
- Business credit building strategies

Business type: ${business?.legalStructure || 'Not specified'}
Location: ${business?.state || 'Not specified'}`
      break

    case 'website':
      prompt += `
The user is building their business website. Focus on:
- Domain name suggestions for ${business?.businessName || 'their business'}
- Website structure for ${business?.industry || 'their industry'}
- Homepage copy that converts visitors
- SEO keywords for ${business?.targetAudience || 'their market'}
- Call-to-action optimization
- Mobile-responsive design tips

Target audience: ${business?.targetAudience || 'Not defined'}`
      break

    case 'marketing':
      prompt += `
The user is setting up marketing automation. Focus on:
- Social media strategy for ${business?.industry || 'their industry'}
- Content calendar for ${business?.targetAudience || 'their audience'}
- Email marketing sequences that convert
- Customer acquisition channels
- Marketing budget allocation
- Analytics and KPI tracking

Business stage: ${business?.businessStage || 'Just starting'}`
      break

    case 'payment':
      prompt += `
The user is setting up payment processing. Focus on:
- Stripe vs Square vs PayPal for ${business?.industry || 'their business'}
- Processing fees comparison
- Invoice template creation
- Recurring payment setup
- International payment options
- PCI compliance requirements

Business type: ${business?.businessName || 'their business'}`
      break
  }

  prompt += `\n\nGenerate 4 specific business questions/requests they should ask. Make them actionable and valuable for their current situation.`
  
  return prompt
}

function getDefaultSuggestions(context: SuggestionContext): string[] {
  const { moduleType, userProfile } = context
  const businessName = userProfile?.businessInfo?.businessName || 'my business'
  
  const defaultSuggestions: Record<string, string[]> = {
    legal: [
      `Should ${businessName} be an LLC or Corporation?`,
      "What are the best states for LLC tax savings?",
      "Generate operating agreement for my business",
      "How do I get an EIN number today?"
    ],
    branding: [
      `Create 3 logo concepts for ${businessName}`,
      "What colors convert best in my industry?",
      "Write a memorable tagline under 10 words",
      "Design modern business card template"
    ],
    banking: [
      "Compare Chase vs Bank of America for business",
      "Which banks have no monthly fees?",
      "How to build business credit fast?",
      "Best cash back business credit cards?"
    ],
    website: [
      "Create 5-page website outline",
      "Write homepage copy that converts",
      "Find top 10 SEO keywords for my business",
      "Make my site mobile-friendly"
    ],
    marketing: [
      "Create 30-day content calendar",
      "Write 5-email welcome sequence",
      "Find my ideal customer profile",
      "Set up Google My Business listing"
    ],
    payment: [
      "Compare Stripe vs Square fees",
      "Accept payments without a website?",
      "Create professional invoices",
      "Calculate fees on $10k/month"
    ]
  }
  
  return defaultSuggestions[moduleType || ''] || [
    "Help me with my current task",
    "What should I do next?",
    "Guide me through this process",
    "Show me best practices"
  ]
}

// Generate auto-fill prompt with full context
export const generateAutoFillPrompt = async (context: SuggestionContext): Promise<string> => {
  try {
    const prompt = `Generate a comprehensive auto-fill request for the ${context.pageName} page.
    
User Profile:
- Business: ${context.userProfile?.businessInfo?.businessName || 'Not set'}
- Industry: ${context.userProfile?.businessInfo?.industry || 'Not specified'}
- Stage: ${context.userProfile?.businessInfo?.businessStage || 'Just starting'}

Create a single, detailed prompt that will help complete all fields on this ${context.moduleType} module. Make it specific and actionable.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'Generate a comprehensive, specific prompt for auto-filling a business form. Be detailed and include all necessary information requests.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    return completion.choices[0]?.message?.content || getDefaultAutoFillPrompt(context)
  } catch (error) {
    console.error('Failed to generate auto-fill prompt:', error)
    return getDefaultAutoFillPrompt(context)
  }
}

function getDefaultAutoFillPrompt(context: SuggestionContext): string {
  const businessName = context.userProfile?.businessInfo?.businessName || 'my business'
  return `Please help me complete the ${context.pageName} setup for ${businessName}. Analyze my profile and auto-fill all required fields with intelligent suggestions based on my industry and business stage.`
}