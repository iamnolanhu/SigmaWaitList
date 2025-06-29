# BOLT.NEW MEGA PROMPT - BasedSigma AI Business Automation Platform

Create a comprehensive AI business automation platform called "BasedSigma" - a command center for solo entrepreneurs that enables founders to ideate, legally register, brand, market, and monetize a business in under 10 minutes using the power of AI.

## CORE FUNCTIONALITY

**Primary Feature:** AI-powered business automation platform with 24-hour MVP implementation
**Target Users:** "Sigma" entrepreneurs, solo founders, serial entrepreneurs seeking rapid business setup
**Brand Personality:** Matrix-themed cyberpunk aesthetic with anti-establishment "sigma" culture

**Key User Stories:**
- As a solo entrepreneur, I want to create a complete business setup so that I can launch in under 10 minutes
- As a "sigma" founder, I want AI to handle all the bureaucratic BS so that I can focus on building
- As a stealth entrepreneur, I want privacy-focused business setup so that I can operate anonymously
- As a time-conscious founder, I want automated legal, branding, and marketing so that I don't waste time on tutorials

## TECHNICAL REQUIREMENTS

**Frontend Framework:** React 18+ with TypeScript + Vite
**Styling:** TailwindCSS with Matrix-themed cyberpunk design system
**State Management:** Zustand for client state + Supabase real-time
**Routing:** React Router with protected routes

**Backend Integration:**
- Supabase for backend services (database, auth, real-time, storage)
- Row Level Security (RLS) policies for multi-tenant data protection
- Real-time subscriptions for live AI processing updates

**AI Integration (Flexible Model Switching):**
- OpenAI GPT-4.1-mini (primary - cost-effective for most tasks)
- OpenAI GPT-4o (premium tasks requiring advanced reasoning)
- Claude Haiku via OpenRouter (quick responses, validations)
- Claude Sonnet via OpenRouter (creative content, marketing copy)
- Replicate DALL·E 3 (logo and visual asset generation)

**Authentication System:**
- Supabase Email/password authentication
- Google OAuth integration
- User profile management with business preferences
- Protected routes with role-based access

**Environment Variables (Already Configured):**
```bash
VITE_SUPABASE_URL=https://glvisslflyitbrxyckln.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdsdmlzc2xmbHlpdGJyeHlja2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczODE4OTIsImV4cCI6MjA2Mjk1Nzg5Mn0.W3ZStD_EdgbRf7RT5fAt5yD4g8s7BYoTOSSPMb8EjUo
VITE_GA_MEASUREMENT_ID=G-CX7XLVRHT1
VITE_OPENAI_API_KEY=[to_be_added]
VITE_OPENROUTER_API_KEY=[to_be_added]
VITE_REPLICATE_API_KEY=[to_be_added]
```

## DATABASE SCHEMA (SUPABASE)

```sql
-- Extend existing users table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  language TEXT DEFAULT 'en',
  region TEXT,
  stealth_mode BOOLEAN DEFAULT false,
  sdg_goals TEXT[], -- UN Sustainable Development Goals
  low_tech_access BOOLEAN DEFAULT false,
  business_type TEXT,
  time_commitment TEXT,
  capital_level TEXT,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business branding data
CREATE TABLE branding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  business_name TEXT,
  tagline TEXT,
  domain_ideas TEXT[],
  logo_url TEXT,
  color_palette JSONB,
  font_selections JSONB,
  brand_kit_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal documentation
CREATE TABLE legal_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  document_type TEXT, -- LLC, Corp, Terms, Privacy
  jurisdiction TEXT,
  burner_name TEXT, -- Stealth mode alias
  address TEXT,
  pdf_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing automation
CREATE TABLE marketing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  audience_definition TEXT,
  brand_tone TEXT,
  landing_page_copy TEXT,
  email_sequence JSONB,
  ad_copy JSONB, -- Social media ads
  mailerlite_campaign_id TEXT,
  performance_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue/monetization
CREATE TABLE revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  stripe_checkout_url TEXT,
  donation_percentage DECIMAL(5,2),
  product_type TEXT, -- one-time, subscription, hybrid
  pricing_strategy JSONB,
  revenue_projections JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI insights and transparency
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  swot_analysis JSONB,
  gtm_strategy TEXT,
  pricing_recommendations JSONB,
  impact_score DECIMAL(3,1),
  ai_transparency JSONB, -- Prompts, reasoning, confidence
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own branding" ON branding FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own legal docs" ON legal_docs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own marketing" ON marketing FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own revenue" ON revenue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own insights" ON ai_insights FOR ALL USING (auth.uid() = user_id);
```

## UI/UX REQUIREMENTS - MATRIX SIGMA AESTHETIC

**Design System:**
```css
/* Matrix-Inspired Color Palette */
:root {
  --background-primary: #1a1a1a;
  --background-secondary: #0f0f0f;
  --surface-card: rgba(0, 0, 0, 0.3);
  --border-default: rgba(106, 208, 64, 0.4);
  
  --matrix-green: #6ad040;
  --electric-blue: #00ffff;
  --neon-green: #79e74c;
  --royal-purple: #8b5cf6;
  --text-primary: #b7ffab;
  --text-secondary: #ffffff;
  --text-muted: rgba(183, 255, 171, 0.6);
}

/* Typography Stack */
@import url("https://fonts.googleapis.com/css?family=Orbitron:900,600|Space+Mono:400|Space+Grotesk:700|Azeret+Mono:500");

.font-heading { font-family: 'Orbitron', sans-serif; } /* Futuristic headings */
.font-body { font-family: 'Space Mono', monospace; } /* Technical body text */
.font-accent { font-family: 'Space Grotesk', sans-serif; } /* Modern accents */
.font-code { font-family: 'Azeret Mono', monospace; } /* Code displays */

/* Matrix Animations */
@keyframes matrix-glow {
  0%, 100% { 
    text-shadow: 0 0 3px rgba(106, 208, 64, 0.5),
                 0 0 4px rgba(106, 208, 64, 0.2),
                 0 0 6px rgba(106, 208, 64, 0.1);
  }
  50% { 
    text-shadow: 0 0 4px rgba(106, 208, 64, 0.7),
                 0 0 8px rgba(106, 208, 64, 0.5),
                 0 0 12px rgba(106, 208, 64, 0.4);
  }
}

.matrix-glow { animation: matrix-glow 2s ease-in-out infinite; }
.glitch-hover:hover { animation: glitch-effect 0.5s infinite; }
```

**Layout Structure:**
- Sidebar navigation (collapsible) with module icons
- Main content area with scrollable sections
- Sticky top bar with progress indicator and user menu
- Matrix background animation with falling characters
- Mobile-responsive with bottom navigation

## CORE MODULES TO IMPLEMENT (24-HOUR MVP SCOPE)

### 1. Authentication & Dashboard
- Supabase email/password login/signup
- User profile setup with business preferences
- Main dashboard with progress tracking
- Module navigation sidebar

### 2. AI-Powered Onboarding Wizard
- Conversational AI assistant (GPT-4.1-mini)
- Business type, region, stealth mode preferences
- SDG goal alignment selection
- User profile completion and storage

### 3. Business Name & Branding Generator
- GPT-4.1-mini business name generation (3 options with rationale)
- AI-powered tagline creation
- Basic color palette suggestions
- Domain availability checking
- Save to branding table

### 4. Legal Structure Recommendations
- Jurisdiction-based business structure advice
- EIN and LLC formation explanations
- Basic legal document templates
- Stealth mode privacy features (burner names, PO box suggestions)

### 5. Marketing Copy Generator
- Audience definition assistant
- Landing page copy generation (Claude Sonnet)
- Basic email sequence templates
- Social media ad copy suggestions

### 6. Progress Dashboard & Analytics
- Completion percentage tracking
- Module status indicators
- Basic user analytics
- AI transparency panel (show prompts used)

## AI INTEGRATION ARCHITECTURE

```typescript
// AI Service Orchestrator with Model Switching
interface AIService {
  provider: 'openai' | 'claude' | 'replicate';
  model: string;
  apiKey: string;
  costPerToken?: number;
}

const AI_MODELS = {
  primary: {
    provider: 'openai',
    model: 'gpt-4-1106-preview', // GPT-4.1-mini
    useCases: ['onboarding', 'business_naming', 'legal_advice']
  },
  creative: {
    provider: 'claude',
    model: 'claude-3-sonnet',
    useCases: ['marketing_copy', 'brand_messaging']
  },
  fast: {
    provider: 'claude', 
    model: 'claude-3-haiku',
    useCases: ['quick_validation', 'simple_responses']
  },
  visual: {
    provider: 'replicate',
    model: 'dall-e-3',
    useCases: ['logo_generation', 'visual_assets']
  }
};

class AIOrchestrator {
  selectModel(taskType: string, userTier: string) {
    // Smart model selection based on task complexity and user tier
  }
  
  async generateBusinessName(params: BusinessParams): Promise<NameSuggestion[]> {
    // Use GPT-4.1-mini for cost-effective business naming
  }
  
  async createMarketingCopy(brandData: BrandData): Promise<MarketingContent> {
    // Use Claude Sonnet for creative marketing content
  }
}
```

## COMPONENT ARCHITECTURE

```typescript
// Core App Structure
src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MatrixBackground.tsx
│   ├── modules/
│   │   ├── onboarding/
│   │   │   ├── OnboardingWizard.tsx
│   │   │   └── AIAssistant.tsx
│   │   ├── branding/
│   │   │   ├── BusinessNameGenerator.tsx
│   │   │   ├── TaglineGenerator.tsx
│   │   │   └── ColorPaletteSelector.tsx
│   │   ├── legal/
│   │   │   ├── BusinessStructureAdvisor.tsx
│   │   │   ├── JurisdictionSelector.tsx
│   │   │   └── StealthModeFeatures.tsx
│   │   ├── marketing/
│   │   │   ├── CopyGenerator.tsx
│   │   │   ├── AudienceDefinition.tsx
│   │   │   └── EmailSequenceBuilder.tsx
│   │   └── dashboard/
│   │       ├── ProgressTracker.tsx
│   │       ├── ModuleCards.tsx
│   │       └── AITransparencyPanel.tsx
│   ├── ui/
│   │   ├── Button.tsx (Matrix-themed)
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   └── shared/
│       ├── AIResponseDisplay.tsx
│       ├── ProgressBar.tsx
│       └── ErrorBoundary.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useAI.ts
│   ├── useSupabase.ts
│   └── useProgress.ts
├── lib/
│   ├── ai/
│   │   ├── openai.ts
│   │   ├── claude.ts
│   │   ├── replicate.ts
│   │   └── orchestrator.ts
│   ├── supabase.ts
│   ├── utils.ts
│   └── constants.ts
└── types/
    ├── user.ts
    ├── business.ts
    ├── ai.ts
    └── database.ts
```

## ENHANCED FEATURES (24-HOUR MVP)

**Performance Optimization:**
- React.lazy() for code splitting modules
- Optimistic UI updates for AI responses
- Local storage caching for user preferences
- Debounced API calls for real-time features

**Security Best Practices:**
- Input sanitization for all AI prompts
- Rate limiting for AI API calls
- Secure environment variable handling
- XSS protection for user-generated content

**User Experience:**
- Loading states for AI processing
- Error boundaries with fallback UI
- Toast notifications for user feedback
- Keyboard shortcuts for power users
- Mobile-responsive Matrix theme

**AI Transparency Features:**
- Display prompts used for each generation
- Confidence scores for AI recommendations
- Regeneration options with parameter adjustment
- Model selection explanation

## SPECIFIC INTEGRATIONS

**Supabase Setup:**
- Configure existing Supabase project (already connected)
- Implement RLS policies for multi-user data protection
- Set up real-time subscriptions for live AI updates
- Storage bucket for generated documents and assets

**Matrix Background Animation:**
```typescript
// Animated Canvas Component
export const MatrixBackground: React.FC = () => {
  // Canvas animation with falling Matrix characters
  // Occasional "SIGMA" text drops
  // Responsive sizing and performance optimization
  // Green Matrix color scheme (#6ad040)
};
```

**AI Response Streaming:**
```typescript
// Real-time AI Response Display
export const AIResponseDisplay: React.FC<{ prompt: string }> = ({ prompt }) => {
  // Stream AI responses in real-time
  // Show typing indicators
  // Display confidence scores
  // Allow regeneration with different models
};
```

## DEVELOPMENT BEST PRACTICES

- TypeScript interfaces for all data structures
- Custom hooks for AI interactions and data fetching
- Error boundaries at module level
- Comprehensive loading states for async operations
- Responsive design with mobile-first approach
- Clean code organization with feature-based folder structure
- Performance monitoring with Web Vitals
- Accessibility compliance (ARIA labels, keyboard navigation)

## SUCCESS CRITERIA (24-HOUR MVP)

**Core Functionality:**
- [ ] User authentication and profile setup
- [ ] AI-powered onboarding wizard
- [ ] Business name generation with rationale
- [ ] Basic legal structure recommendations
- [ ] Marketing copy generation
- [ ] Progress tracking dashboard

**Technical Requirements:**
- [ ] Supabase integration with RLS policies
- [ ] GPT-4.1-mini integration for primary tasks
- [ ] Matrix-themed responsive UI
- [ ] Error handling and loading states
- [ ] Mobile-responsive design

**User Experience:**
- [ ] Smooth onboarding flow (<5 minutes)
- [ ] Clear progress indication
- [ ] AI transparency features
- [ ] Professional Matrix aesthetic
- [ ] Fast performance (<2s page loads)

## DEPLOYMENT CONFIGURATION

**Vercel Deployment:**
- Automatic deployment from main branch
- Environment variables configured
- Performance optimization enabled
- Custom domain setup ready

**Build Optimization:**
- Vite build configuration for production
- Bundle size optimization
- Asset compression and caching
- Service worker for offline functionality

This mega prompt provides a comprehensive foundation for building BasedSigma as a production-ready AI business automation platform with the Matrix-themed "sigma" aesthetic, leveraging your existing Supabase setup and implementing the 24-hour MVP timeline specified in the PRD.