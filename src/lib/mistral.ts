// Mistral AI integration for business automation chatbot
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
  type: 'legal' | 'branding' | 'website' | 'payment' | 'banking' | 'marketing' | 'general' | 'onboarding'
  confidence: number
  action: string
  parameters?: Record<string, any>
}

class MistralAI {
  private apiKey: string
  private baseURL = 'https://api.mistral.ai/v1'

  constructor() {
    this.apiKey = import.meta.env.VITE_MISTRAL_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Mistral API key not found. Chatbot will use mock responses.')
    }
  }

  private getSystemPrompt(): string {
    return `You are Sigma AI, a business automation assistant with a confident, efficient "sigma" personality. You help entrepreneurs start and scale their businesses through AI automation.

Your capabilities include:
- Legal paperwork and business registration
- Branding and logo design
- Website creation and deployment
- Payment processing setup
- Business banking solutions
- Marketing automation

When users ask for help, analyze their intent and respond with:
1. A helpful, confident response in the Sigma personality (direct, no-nonsense, results-focused)
2. Specific next steps they can take
3. How Sigma can automate the process for them

Always maintain the "sigma" energy - be confident, efficient, and focused on results. Use phrases like "Let's get this done" or "Time to level up your business" when appropriate.

If the user's request relates to business automation, identify the specific module they need and guide them toward it.`
  }

  async chat(messages: MistralMessage[]): Promise<string> {
    if (!this.apiKey) {
      return this.getMockResponse(messages[messages.length - 1]?.content || '')
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            ...messages
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`)
      }

      const data: MistralResponse = await response.json()
      return data.choices[0]?.message?.content || 'Sorry, I encountered an error. Please try again.'
    } catch (error) {
      console.error('Mistral API error:', error)
      return this.getMockResponse(messages[messages.length - 1]?.content || '')
    }
  }

  private getMockResponse(userMessage: string): string {
    const message = userMessage.toLowerCase()
    
    if (message.includes('crypto') || message.includes('blockchain')) {
      return "🚀 Crypto business? Now we're talking sigma energy! Here's what we'll automate for you:\n\n• Legal compliance for crypto operations\n• Brand identity that screams innovation\n• Website with crypto payment integration\n• Marketing that reaches the right investors\n\nReady to build the next big thing? Let's start with your business profile setup."
    }
    
    if (message.includes('don\'t know') || message.includes('where to start') || message.includes('help')) {
      return "💪 Every sigma starts somewhere. Here's your roadmap:\n\n1. **Profile Setup** - Tell us about your vision\n2. **AI Onboarding** - We'll analyze your market\n3. **Automated Setup** - Legal, branding, website - all handled\n4. **Launch** - Go live while you sleep\n\nNo more tutorial hell. Just results. Ready to begin?"
    }
    
    if (message.includes('register') || message.includes('legal') || message.includes('llc') || message.includes('corporation')) {
      return "⚖️ Legal paperwork? Consider it handled. Sigma automates:\n\n• Business entity formation (LLC, Corp, etc.)\n• EIN registration\n• Operating agreements\n• Compliance documentation\n\nNo lawyers needed. No paperwork stress. Just your business, legally bulletproof. Want to start the legal automation process?"
    }
    
    if (message.includes('brand') || message.includes('logo') || message.includes('design')) {
      return "🎨 Time to build a brand that doesn't look like Canva threw up. Sigma creates:\n\n• AI-generated logos that actually convert\n• Color palettes based on psychology\n• Complete brand guidelines\n• Marketing assets that work\n\nYour brand will have that sigma energy. Ready to see what we can create?"
    }
    
    if (message.includes('website') || message.includes('online') || message.includes('digital')) {
      return "🌐 Websites that convert, not just exist. Sigma builds:\n\n• High-converting landing pages\n• E-commerce integration\n• SEO optimization\n• Mobile-first design\n\nBring all the sigma to your backyard. Want to see your website come to life?"
    }
    
    if (message.includes('payment') || message.includes('stripe') || message.includes('money')) {
      return "💳 Payment processing that actually works. Sigma sets up:\n\n• Stripe integration\n• Multiple payment methods\n• Subscription management\n• International payments\n\nNo more lost sales due to payment issues. Ready to start collecting that sigma revenue?"
    }
    
    if (message.includes('marketing') || message.includes('customers') || message.includes('sales')) {
      return "📈 Marketing that runs itself. Sigma automates:\n\n• Social media campaigns\n• Email sequences\n• Content creation\n• Lead generation\n\nPromoting your business is now a piece of cake. Want to see the marketing magic?"
    }
    
    return "👋 Welcome to Sigma! I'm here to automate your entire business setup. Whether you need legal paperwork, branding, websites, or marketing - I've got you covered.\n\nWhat's your business vision? Let's turn it into reality while you sleep. 💪"
  }

  analyzeIntent(message: string): BusinessIntent {
    const msg = message.toLowerCase()
    
    if (msg.includes('legal') || msg.includes('register') || msg.includes('llc') || msg.includes('corporation')) {
      return {
        type: 'legal',
        confidence: 0.9,
        action: 'start_legal_setup'
      }
    }
    
    if (msg.includes('brand') || msg.includes('logo') || msg.includes('design')) {
      return {
        type: 'branding',
        confidence: 0.9,
        action: 'start_branding_process'
      }
    }
    
    if (msg.includes('website') || msg.includes('online') || msg.includes('digital')) {
      return {
        type: 'website',
        confidence: 0.9,
        action: 'start_website_builder'
      }
    }
    
    if (msg.includes('payment') || msg.includes('stripe') || msg.includes('money')) {
      return {
        type: 'payment',
        confidence: 0.9,
        action: 'setup_payment_processing'
      }
    }
    
    if (msg.includes('bank') || msg.includes('banking')) {
      return {
        type: 'banking',
        confidence: 0.9,
        action: 'setup_business_banking'
      }
    }
    
    if (msg.includes('marketing') || msg.includes('customers') || msg.includes('sales')) {
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