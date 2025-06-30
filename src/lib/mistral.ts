// Enhanced Mistral AI integration for business automation chatbot
interface MistralMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface MistralResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface BusinessIntent {
  type: 'legal' | 'branding' | 'website' | 'payment' | 'banking' | 'marketing' | 'general' | 'onboarding' | 'profile'
  confidence: number
  action: string
  parameters?: Record<string, any>
}

class MistralAI {
  private apiKey: string
  private baseURL = 'https://api.mistral.ai/v1'

  constructor() {
    this.apiKey = import.meta.env.VITE_MISTRAL_API_KEY || ''
    if (!this.apiKey || this.apiKey === 'your-mistral-api-key') {
      console.warn('Mistral API key not found. Chatbot will use enhanced mock responses.')
    }
  }

  private getSystemPrompt(formContext?: any): string {
    const basePrompt = `You are Sigma AI, a business automation assistant with a confident, efficient "sigma" personality. You help entrepreneurs start and scale their businesses through AI automation.

Your capabilities include:
- Legal paperwork and business registration (LLC, Corporation, EIN, licenses)
- Branding and logo design (colors, typography, brand guidelines)
- Website creation and deployment (templates, SEO, domains)
- Payment processing setup (Stripe, PayPal, merchant services)
- Business banking solutions (account types, bank recommendations)
- Marketing automation (social media, email, content campaigns)

When users ask for help, analyze their intent and respond with:
1. A helpful, confident response in the Sigma personality (direct, no-nonsense, results-focused)
2. Specific next steps they can take
3. How Sigma can automate the process for them

Always maintain the "sigma" energy - be confident, efficient, and focused on results. Use phrases like "Let's get this done" or "Time to level up your business" when appropriate.

If the user's request relates to business automation, identify the specific module they need and guide them toward it. Be specific about what Sigma can deliver in each area.

For profile-related questions, guide users to complete their profile setup for personalized automation.`

    // Add form context if available
    if (formContext && formContext.formId) {
      return basePrompt + `

IMPORTANT: The user is currently filling out the ${formContext.formId} form. Stay focused on helping them complete this form.

Available form fields:
${formContext.fields.map((f: any) => `- ${f.name} (${f.type}): ${f.label || f.name}`).join('\n')}

Current values:
${JSON.stringify(formContext.currentValues, null, 2)}

When the user asks for help with the form or provides information that matches form fields, include a special JSON block in your response with the format:
\`\`\`json
{
  "formData": {
    "field_name": "value",
    "another_field": "value"
  }
}
\`\`\`

Focus on helping the user complete the current form. If they ask unrelated questions, gently redirect them to finish the form first.`
    }

    return basePrompt
  }

  async chat(messages: MistralMessage[], formContext?: any): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your-mistral-api-key') {
      return this.getEnhancedMockResponse(messages[messages.length - 1]?.content || '', formContext)
    }

    try {
      const requestBody = {
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: this.getSystemPrompt(formContext) },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      }

      console.log('Sending request to Mistral API:', {
        url: `${this.baseURL}/chat/completions`,
        model: requestBody.model,
        messageCount: requestBody.messages.length
      })

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Mistral API error ${response.status}:`, errorText)
        
        if (response.status === 422) {
          console.error('422 Error - Request validation failed')
          return 'I encountered a configuration issue. Using enhanced offline mode: ' + this.getEnhancedMockResponse(messages[messages.length - 1]?.content || '')
        }
        
        if (response.status === 401) {
          console.error('401 Error - Authentication failed')
          return 'Authentication failed. Using enhanced offline mode: ' + this.getEnhancedMockResponse(messages[messages.length - 1]?.content || '')
        }
        
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`)
      }

      const data: MistralResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices returned from Mistral API')
      }

      return data.choices[0]?.message?.content || 'Sorry, I encountered an error. Please try again.'
    } catch (error) {
      console.error('Mistral API error:', error)
      return 'I encountered a technical issue. Using enhanced offline mode: ' + this.getEnhancedMockResponse(messages[messages.length - 1]?.content || '')
    }
  }

  private getEnhancedMockResponse(userMessage: string, formContext?: any): string {
    const message = userMessage.toLowerCase()
    
    // If we have form context, focus on helping with the form
    if (formContext && formContext.formId) {
      return this.getFormFocusedResponse(userMessage, formContext)
    }
    
    // Profile and setup related
    if (message.includes('profile') || message.includes('setup') || message.includes('complete')) {
      return "💪 Your profile is the foundation of everything! Here's what I need to automate your business:\n\n• **Name/Business Name** - What should I call your empire?\n• **Region** - Where are we building this?\n• **Business Type** - What industry are we dominating?\n• **Time Commitment** - How much time can you dedicate?\n• **Capital Level** - What's your budget range?\n\nOnce your profile is complete, I'll unlock ALL automation modules. Ready to fill it out?"
    }
    
    // Crypto and blockchain
    if (message.includes('crypto') || message.includes('blockchain') || message.includes('web3')) {
      return "🚀 Crypto business? Now we're talking sigma energy! Here's your complete automation roadmap:\n\n**Legal Setup:**\n• LLC formation with crypto-friendly jurisdiction\n• Compliance documentation for digital assets\n• Terms of service for crypto operations\n\n**Brand Identity:**\n• Futuristic logo design\n• Tech-forward color schemes\n• Web3 brand guidelines\n\n**Digital Presence:**\n• Crypto-optimized website\n• Web3 wallet integration\n• DeFi-ready payment systems\n\n**Marketing:**\n• Crypto community engagement\n• Twitter/X growth strategy\n• Discord community building\n\nReady to build the next big thing? Let's start with your profile setup!"
    }
    
    // Legal automation
    if (message.includes('register') || message.includes('legal') || message.includes('llc') || message.includes('corporation') || message.includes('ein')) {
      return "⚖️ Legal paperwork? Consider it handled. Sigma's legal automation includes:\n\n**Business Formation:**\n• LLC or Corporation setup\n• Articles of Incorporation/Organization\n• Operating Agreements\n• EIN application (100% free through IRS)\n\n**Compliance Documents:**\n• Business license applications\n• Industry-specific permits\n• Terms of Service templates\n• Privacy Policy generation\n\n**State-Specific Requirements:**\n• Delaware, Wyoming, Nevada optimization\n• Local jurisdiction compliance\n• Registered agent recommendations\n\nNo lawyers needed. No paperwork stress. Just your business, legally bulletproof. Want to start the legal automation process?"
    }
    
    // Branding automation
    if (message.includes('brand') || message.includes('logo') || message.includes('design') || message.includes('colors')) {
      return "🎨 Time to build a brand that doesn't look like Canva threw up. Sigma's branding automation creates:\n\n**Visual Identity:**\n• AI-generated logos (3 unique concepts)\n• Psychology-based color palettes\n• Professional typography systems\n• Complete brand guidelines\n\n**Brand Strategy:**\n• Industry-specific personality\n• Voice and tone guidelines\n• Messaging frameworks\n• Competitor differentiation\n\n**Marketing Assets:**\n• Business card designs\n• Social media templates\n• Website color schemes\n• Brand usage guidelines\n\nYour brand will have that sigma energy that converts. Ready to see what we can create?"
    }
    
    // Website automation
    if (message.includes('website') || message.includes('online') || message.includes('digital') || message.includes('domain')) {
      return "🌐 Websites that convert, not just exist. Sigma's website automation builds:\n\n**Professional Websites:**\n• Industry-optimized templates\n• Mobile-first responsive design\n• Lightning-fast loading speeds\n• Professional domain suggestions\n\n**E-commerce Ready:**\n• Product catalogs\n• Shopping cart integration\n• Inventory management\n• Order processing\n\n**SEO Optimized:**\n• Search engine optimization\n• Local business listings\n• Google Analytics setup\n• Performance monitoring\n\n**Features:**\n• Contact forms\n• Appointment booking\n• Client portals\n• Blog systems\n\nBring all the sigma to your backyard. Want to see your website come to life?"
    }
    
    // Payment processing
    if (message.includes('payment') || message.includes('stripe') || message.includes('money') || message.includes('checkout')) {
      return "💳 Payment processing that actually works. Sigma's payment automation sets up:\n\n**Stripe Integration:**\n• Complete Stripe account setup\n• Payment form integration\n• Subscription management\n• Invoice generation\n\n**Multiple Payment Methods:**\n• Credit/debit cards\n• Bank transfers (ACH)\n• Digital wallets (Apple Pay, Google Pay)\n• International payments\n\n**Advanced Features:**\n• Recurring billing\n• Payment analytics\n• Fraud protection\n• Tax calculation\n\n**Security:**\n• PCI compliance\n• SSL encryption\n• Secure tokenization\n• Real-time monitoring\n\nNo more lost sales due to payment issues. Ready to start collecting that sigma revenue?"
    }
    
    // Banking automation
    if (message.includes('bank') || message.includes('banking') || message.includes('account') || message.includes('business bank')) {
      return "🏦 Skip the bank small talk and get your business running. Sigma's banking automation provides:\n\n**Bank Recommendations:**\n• Chase Business (established companies)\n• Mercury (tech startups)\n• Novo (small businesses)\n• Bank of America (nationwide presence)\n\n**Account Setup:**\n• Business checking accounts\n• High-yield savings\n• Merchant services\n• Business credit cards\n\n**Required Documents:**\n• EIN documentation\n• Business formation papers\n• Operating agreements\n• Initial deposit guidance\n\n**Features:**\n• Online banking setup\n• Mobile app configuration\n• Accounting software integration\n• Automatic transfers\n\nYour business banking, streamlined and professional. Ready to get started?"
    }
    
    // Marketing automation
    if (message.includes('marketing') || message.includes('customers') || message.includes('sales') || message.includes('social media')) {
      return "📈 Marketing that runs itself. Sigma's marketing automation creates:\n\n**Social Media Campaigns:**\n• LinkedIn professional content\n• Twitter/X engagement strategy\n• Instagram visual content\n• Facebook business presence\n\n**Email Marketing:**\n• Welcome email sequences\n• Newsletter campaigns\n• Customer onboarding\n• Win-back campaigns\n\n**Content Strategy:**\n• Blog post topics\n• SEO optimization\n• Industry thought leadership\n• Case study templates\n\n**Analytics & Optimization:**\n• Performance tracking\n• A/B testing\n• Conversion optimization\n• ROI measurement\n\nPromoting your business is now a piece of cake. Want to see the marketing magic?"
    }
    
    // General help and getting started
    if (message.includes('start') || message.includes('begin') || message.includes('help') || message.includes('don\'t know') || message.includes('where')) {
      return "👋 Welcome to Sigma! I'm here to automate your entire business setup. Here's your roadmap to CEO status:\n\n**Step 1: Profile Setup** (2 minutes)\n• Tell me about your business vision\n• Choose your industry and region\n• Set your time and budget preferences\n\n**Step 2: Full Automation** (30 minutes total)\n• Legal: Business formation + EIN\n• Branding: Logo + brand guidelines\n• Website: Professional site + SEO\n• Payments: Stripe + merchant services\n• Banking: Account recommendations\n• Marketing: Social media + email campaigns\n\n**Step 3: Launch** (You sleep, I work)\n• Everything goes live automatically\n• Monitoring and optimization\n• Ongoing support and updates\n\nNo more tutorial hell. Just results. Ready to complete your profile and begin?"
    }
    
    // Default response
    return "💪 I'm Sigma AI, your business automation partner! I can handle:\n\n• **Legal Setup** - LLC/Corp formation, EIN, licenses\n• **Branding** - Logos, colors, brand guidelines\n• **Website** - Professional sites that convert\n• **Payments** - Stripe integration, merchant services\n• **Banking** - Business accounts, recommendations\n• **Marketing** - Social media, email, content\n\nWhat's your business vision? Let's turn it into reality while you sleep! 🚀\n\n*Tip: Complete your profile first to unlock personalized automation.*"
  }

  private getFormFocusedResponse(userMessage: string, formContext: any): string {
    const message = userMessage.toLowerCase()
    const formId = formContext.formId
    
    // Extract form filling suggestions based on the message
    let formData: any = {}
    let responseText = ""
    
    // Legal form specific responses
    if (formId.includes('legal') || formId.includes('business')) {
      if (message.includes('llc') || message.includes('limited liability')) {
        formData = {
          legal_structure: 'LLC',
          ...(!formContext.currentValues.state && { state: 'Delaware' })
        }
        responseText = "✅ LLC is a great choice! It provides personal liability protection while keeping things simple. Delaware is the most popular state for LLCs due to business-friendly laws and tax benefits."
      } else if (message.includes('corporation') || message.includes('corp')) {
        formData = {
          legal_structure: 'Corporation',
          ...(!formContext.currentValues.state && { state: 'Delaware' })
        }
        responseText = "🏢 Corporation structure selected! This is ideal if you plan to raise investment or go public. Delaware is the gold standard for corporations."
      } else if (message.includes('best state') || message.includes('where to incorporate')) {
        responseText = "📍 Top states for incorporation:\n\n• **Delaware** - Best for corporations and LLCs, business-friendly laws\n• **Wyoming** - No state income tax, strong privacy protection\n• **Nevada** - No state income tax, minimal reporting requirements\n• **Your Home State** - Simplest if doing business locally\n\nWhich state works best for your business?"
      }
    }
    
    // Business profile form
    if (formId.includes('profile') || formId.includes('business')) {
      if (message.includes('name')) {
        responseText = "💡 For a strong business name:\n• Make it memorable and easy to spell\n• Check domain availability\n• Avoid trends that might age poorly\n• Consider your target audience\n\nWhat industry are you in? I can suggest some creative names!"
      } else if (message.includes('description')) {
        responseText = "📝 I'll help craft a compelling business description. Tell me:\n• What problem do you solve?\n• Who is your target customer?\n• What makes you unique?\n\nI'll turn this into professional copy!"
      }
    }
    
    // Add form data to response if we have any
    if (Object.keys(formData).length > 0) {
      responseText += `\n\n\`\`\`json\n{\n  "formData": ${JSON.stringify(formData, null, 2)}\n}\n\`\`\``
    }
    
    // Default form help
    if (!responseText) {
      responseText = `💪 I see you're working on the ${formId} form. I'm here to help you fill it out quickly!\n\nTell me what you need help with, or share your business details and I'll suggest the best options for each field.`
    }
    
    return responseText
  }

  analyzeIntent(message: string): BusinessIntent {
    const msg = message.toLowerCase()
    
    if (msg.includes('profile') || msg.includes('setup') || msg.includes('complete')) {
      return {
        type: 'profile',
        confidence: 0.9,
        action: 'complete_profile_setup'
      }
    }
    
    if (msg.includes('legal') || msg.includes('register') || msg.includes('llc') || msg.includes('corporation') || msg.includes('ein')) {
      return {
        type: 'legal',
        confidence: 0.9,
        action: 'start_legal_setup'
      }
    }
    
    if (msg.includes('brand') || msg.includes('logo') || msg.includes('design') || msg.includes('colors')) {
      return {
        type: 'branding',
        confidence: 0.9,
        action: 'start_branding_process'
      }
    }
    
    if (msg.includes('website') || msg.includes('online') || msg.includes('digital') || msg.includes('domain')) {
      return {
        type: 'website',
        confidence: 0.9,
        action: 'start_website_builder'
      }
    }
    
    if (msg.includes('payment') || msg.includes('stripe') || msg.includes('money') || msg.includes('checkout')) {
      return {
        type: 'payment',
        confidence: 0.9,
        action: 'setup_payment_processing'
      }
    }
    
    if (msg.includes('bank') || msg.includes('banking') || msg.includes('account')) {
      return {
        type: 'banking',
        confidence: 0.9,
        action: 'setup_business_banking'
      }
    }
    
    if (msg.includes('marketing') || msg.includes('customers') || msg.includes('sales') || msg.includes('social')) {
      return {
        type: 'marketing',
        confidence: 0.9,
        action: 'start_marketing_automation'
      }
    }
    
    if (msg.includes('start') || msg.includes('begin') || msg.includes('help') || msg.includes('don\'t know')) {
      return {
        type: 'onboarding',
        confidence: 0.8,
        action: 'start_onboarding_process'
      }
    }
    
    return {
      type: 'general',
      confidence: 0.5,
      action: 'provide_general_help'
    }
  }
}

export const mistralAI = new MistralAI()
export type { MistralMessage, BusinessIntent }