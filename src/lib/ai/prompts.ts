import { CompleteProfile } from '../api/profileService'

export interface PromptTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: string[]
  description: string
}

export interface PromptContext {
  userProfile?: Partial<CompleteProfile>
  businessIdea?: string
  industry?: string
  targetAudience?: string
  budget?: string
  timeline?: string
  goals?: string[]
  customData?: Record<string, any>
}

export class PromptTemplates {
  private static templates: Map<string, PromptTemplate> = new Map()

  static {
    this.initializeTemplates()
  }

  private static initializeTemplates() {
    const templates: PromptTemplate[] = [
      // Business Ideation Templates
      {
        id: 'business_ideation_basic',
        name: 'Business Idea Generator',
        category: 'ideation',
        template: `Generate 5 innovative business ideas based on the following profile:

Skills/Expertise: {{skills}}
Available Time: {{time_commitment}}
Budget: {{capital_level}}
Location: {{region}}
Interests: {{interests}}

For each idea, provide:
1. Business concept (2-3 sentences)
2. Target market
3. Revenue model
4. Startup requirements
5. Why it's suitable for this profile

Focus on practical, implementable ideas that match the person's constraints.`,
        variables: ['skills', 'time_commitment', 'capital_level', 'region', 'interests'],
        description: 'Generate personalized business ideas based on user profile'
      },
      {
        id: 'business_validation',
        name: 'Business Idea Validator',
        category: 'ideation',
        template: `Validate the following business idea: "{{business_idea}}"

Context:
- Industry: {{industry}}
- Target Market: {{target_audience}}
- Budget: {{budget}}
- Timeline: {{timeline}}

Provide a comprehensive validation covering:
1. Market Demand Analysis (score 1-10)
2. Competition Assessment (score 1-10)
3. Financial Viability (score 1-10)
4. Implementation Complexity (score 1-10)
5. Growth Potential (score 1-10)

For each score, provide:
- Detailed reasoning
- Key risks and mitigation strategies
- Actionable next steps

Overall recommendation: GO / PIVOT / NO-GO with explanation`,
        variables: ['business_idea', 'industry', 'target_audience', 'budget', 'timeline'],
        description: 'Validate and score a business idea'
      },

      // Legal Structure Templates
      {
        id: 'legal_structure_recommendation',
        name: 'Legal Structure Advisor',
        category: 'legal',
        template: `Recommend the optimal legal structure for a business with these characteristics:

Business Type: {{business_type}}
Location: {{region}}
Number of Founders: {{founder_count}}
Funding Plans: {{funding_plans}}
Liability Concerns: {{liability_concerns}}
Tax Considerations: {{tax_preferences}}

Provide recommendations for:
1. Recommended legal structure (LLC, C-Corp, S-Corp, etc.)
2. Reasons for this recommendation
3. Pros and cons specific to this situation
4. Setup requirements and costs
5. Tax implications
6. Future flexibility considerations
7. Action steps to implement

Be specific to the jurisdiction and business type.`,
        variables: ['business_type', 'region', 'founder_count', 'funding_plans', 'liability_concerns', 'tax_preferences'],
        description: 'Get legal structure recommendations'
      },
      {
        id: 'legal_checklist',
        name: 'Legal Compliance Checklist',
        category: 'legal',
        template: `Create a comprehensive legal compliance checklist for:

Business Type: {{business_type}}
Industry: {{industry}}
Location: {{region}}
Business Model: {{business_model}}
Employee Count: {{employee_count}}

Generate a prioritized checklist including:
1. Business Registration Requirements
2. Licenses and Permits Needed
3. Tax Registration Requirements
4. Employment Law Compliance
5. Industry-Specific Regulations
6. Data Privacy Requirements
7. Intellectual Property Protections
8. Contract Templates Needed
9. Insurance Requirements
10. Ongoing Compliance Calendar

For each item, provide:
- Specific requirement
- Deadline/Timeline
- Cost estimate
- Where/How to complete
- Consequences of non-compliance`,
        variables: ['business_type', 'industry', 'region', 'business_model', 'employee_count'],
        description: 'Generate legal compliance checklist'
      },

      // Market Analysis Templates
      {
        id: 'market_analysis',
        name: 'Market Analysis Generator',
        category: 'market',
        template: `Conduct a comprehensive market analysis for:

Industry: {{industry}}
Product/Service: {{product_service}}
Target Location: {{region}}
Target Demographics: {{target_demographics}}

Provide detailed analysis of:
1. Market Size & Growth Rate
   - Current market value
   - 5-year growth projection
   - Key growth drivers

2. Customer Analysis
   - Primary customer segments
   - Customer needs and pain points
   - Buying behavior patterns
   - Price sensitivity

3. Competitive Landscape
   - Major competitors (top 5)
   - Market share distribution
   - Competitive advantages/disadvantages
   - Market gaps and opportunities

4. Industry Trends
   - Emerging technologies
   - Regulatory changes
   - Consumer preference shifts
   - Future disruption risks

5. Entry Strategy Recommendations
   - Optimal market positioning
   - Differentiation opportunities
   - Go-to-market approach
   - Success metrics`,
        variables: ['industry', 'product_service', 'region', 'target_demographics'],
        description: 'Generate comprehensive market analysis'
      },
      {
        id: 'competitor_analysis',
        name: 'Competitor Deep Dive',
        category: 'market',
        template: `Analyze the competitive landscape for {{business_type}} in {{region}}:

Direct Competitors to Analyze: {{competitor_names}}
Our Unique Value Proposition: {{uvp}}

For each competitor, provide:
1. Business Model Analysis
2. Pricing Strategy
3. Marketing Channels Used
4. Customer Reviews Summary
5. Strengths and Weaknesses
6. Market Positioning

Competitive Strategy Recommendations:
1. Differentiation Opportunities
2. Pricing Strategy
3. Marketing Approach
4. Partnership Opportunities
5. Competitive Advantages to Develop

Include a SWOT analysis comparing our position to competitors.`,
        variables: ['business_type', 'region', 'competitor_names', 'uvp'],
        description: 'Deep competitive analysis'
      },

      // Brand Identity Templates
      {
        id: 'brand_identity',
        name: 'Brand Identity Creator',
        category: 'branding',
        template: `Create a complete brand identity for:

Business Name: {{business_name}}
Industry: {{industry}}
Target Audience: {{target_audience}}
Brand Personality Traits: {{personality_traits}}
Core Values: {{core_values}}

Develop:
1. Brand Story
   - Origin narrative
   - Mission statement
   - Vision statement
   - Brand promise

2. Visual Identity Guidelines
   - Color palette (primary & secondary)
   - Typography recommendations
   - Logo style direction
   - Imagery style

3. Brand Voice & Tone
   - Communication style
   - Key messages
   - Do's and don'ts
   - Example phrases

4. Brand Applications
   - Website design principles
   - Social media presence
   - Marketing materials
   - Customer touchpoints

Make it memorable, authentic, and aligned with the target audience.`,
        variables: ['business_name', 'industry', 'target_audience', 'personality_traits', 'core_values'],
        description: 'Create complete brand identity'
      },
      {
        id: 'brand_messaging',
        name: 'Brand Messaging Framework',
        category: 'branding',
        template: `Develop a brand messaging framework for {{business_name}}:

Value Proposition: {{value_proposition}}
Target Audience: {{target_audience}}
Key Differentiators: {{differentiators}}

Create:
1. Elevator Pitch (30 seconds)
2. One-Page Company Description
3. Tagline Options (5 variations)
4. Key Marketing Messages
   - For customers
   - For investors
   - For partners
   - For employees

5. Content Pillars
   - Educational topics
   - Thought leadership angles
   - Community engagement themes

6. Crisis Communication Templates
   - Service disruption
   - Negative feedback response
   - PR crisis management

Ensure consistency across all messaging while adapting tone for each audience.`,
        variables: ['business_name', 'value_proposition', 'target_audience', 'differentiators'],
        description: 'Develop brand messaging framework'
      },

      // Marketing Strategy Templates
      {
        id: 'content_marketing_plan',
        name: 'Content Marketing Planner',
        category: 'marketing',
        template: `Create a 90-day content marketing plan for:

Business: {{business_name}}
Industry: {{industry}}
Target Audience: {{target_audience}}
Marketing Goals: {{marketing_goals}}
Budget: {{budget}}

Develop:
1. Content Strategy
   - Content themes and pillars
   - Content types and formats
   - Publishing frequency
   - Distribution channels

2. Monthly Content Calendar
   - Week-by-week topics
   - Content formats
   - Publication schedule
   - Promotion plan

3. Content Creation Guidelines
   - SEO keywords to target
   - Content templates
   - Visual requirements
   - Call-to-action strategies

4. Performance Metrics
   - KPIs to track
   - Analytics setup
   - Reporting schedule
   - Optimization triggers

Include specific content ideas and headlines for the first month.`,
        variables: ['business_name', 'industry', 'target_audience', 'marketing_goals', 'budget'],
        description: 'Create content marketing plan'
      },
      {
        id: 'social_media_strategy',
        name: 'Social Media Strategy Builder',
        category: 'marketing',
        template: `Design a social media strategy for {{business_name}}:

Target Platforms: {{platforms}}
Target Audience: {{target_audience}}
Brand Voice: {{brand_voice}}
Monthly Budget: {{budget}}

Create:
1. Platform-Specific Strategies
   - Content types for each platform
   - Posting frequency
   - Engagement tactics
   - Growth strategies

2. Content Mix (percentage breakdown)
   - Educational content
   - Promotional content
   - User-generated content
   - Behind-the-scenes
   - Interactive content

3. Community Management
   - Response time goals
   - Engagement strategies
   - Crisis management
   - Influencer outreach

4. Paid Advertising Strategy
   - Ad types and formats
   - Targeting parameters
   - Budget allocation
   - Performance benchmarks

5. Monthly Calendar Template
   - Theme days
   - Campaign schedule
   - Key dates to leverage

Include 10 specific post ideas with captions for the first week.`,
        variables: ['business_name', 'platforms', 'target_audience', 'brand_voice', 'budget'],
        description: 'Build social media strategy'
      }
    ]

    templates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  static getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id)
  }

  static getTemplatesByCategory(category: string): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category)
  }

  static getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values())
  }

  static fillTemplate(templateId: string, context: PromptContext): string {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    let filled = template.template
    const data: Record<string, any> = {
      ...context.customData,
      ...context.userProfile,
      business_idea: context.businessIdea,
      industry: context.industry,
      target_audience: context.targetAudience,
      budget: context.budget,
      timeline: context.timeline,
      goals: context.goals?.join(', ')
    }

    template.variables.forEach(variable => {
      const value = data[variable] || `[${variable}]`
      const regex = new RegExp(`{{${variable}}}`, 'g')
      filled = filled.replace(regex, String(value))
    })

    return filled
  }

  static generatePrompt(
    templateId: string,
    context: PromptContext,
    additionalInstructions?: string
  ): string {
    const filledTemplate = this.fillTemplate(templateId, context)
    
    if (additionalInstructions) {
      return `${filledTemplate}\n\nAdditional Instructions:\n${additionalInstructions}`
    }
    
    return filledTemplate
  }

  static searchTemplates(query: string): PromptTemplate[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.templates.values()).filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.category.toLowerCase().includes(lowerQuery)
    )
  }
}