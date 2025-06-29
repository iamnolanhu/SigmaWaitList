# BasedSigma Waitlist - Complete Project Specification

## Project Overview
**BasedSigma** is an AI business automation platform with a "sigma" personality-driven landing page and waitlist collection system. The project features a Matrix-themed aesthetic with cyberpunk elements, showcasing the team and technology stack while collecting leads for the upcoming launch.

## Technology Stack

### Frontend Framework
- **React 18.2.0** with TypeScript
- **Vite** as build tool and dev server
- **React Router DOM 6.8.1** for navigation

### Styling & UI
- **TailwindCSS 3.4.16** for utility-first styling
- **Shadcn/ui** component library (Radix UI-based)
- **class-variance-authority** for component variants
- **clsx** and **tailwind-merge** for conditional classes

### Backend & Database
- **Supabase** for backend-as-a-service
- PostgreSQL database for lead collection
- Real-time subscriptions capability

### Analytics & Monitoring
- **Vercel Analytics** for performance tracking
- **Vercel Speed Insights** for core web vitals
- **Google Analytics 4** for user behavior tracking

### Icons & Assets
- **Lucide React** for icons
- Custom SVG assets for branding and features

## Visual Design System

### Color Palette
```css
/* Primary Matrix Green Theme */
--primary-green: #6ad040;
--secondary-green: #79e74c;
--text-green: #b7ffab;
--accent-green: #6ad040;

/* Background & Surface Colors */
--background: #1a1a1a;
--surface: #0f0f0f;
--card-background: rgba(0, 0, 0, 0.3);
--border: rgba(106, 208, 64, 0.4);

/* Text Colors */
--foreground: #ffffff;
--text-primary: #b7ffab;
--text-secondary: #ffffff;
--text-muted: rgba(183, 255, 171, 0.6);
```

### Typography
```css
/* Font Stack */
@import url("https://fonts.googleapis.com/css?family=Orbitron:900,600|Space+Mono:400|Space+Grotesk:700|Azeret+Mono:500");

/* Font Families */
--font-heading: 'Orbitron'; /* Futuristic headings */
--font-body: 'Space_Mono'; /* Body text and descriptions */
--font-accent: 'Space_Grotesk'; /* Roles and special text */
--font-mono: 'Azeret_Mono'; /* Code-like elements */
```

### Responsive Breakpoints
```css
/* TailwindCSS Default Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1400px /* Container max-width */
```

### Animation Effects
```css
/* Matrix-style Animations */
@keyframes matrix-glow {
  0%, 100% { 
    text-shadow: 0 0 3px rgba(106, 208, 64, 0.5), 0 0 4px rgba(106, 208, 64, 0.2), 0 0 6px rgba(106, 208, 64, 0.1);
  }
  50% { 
    text-shadow: 0 0 4px rgba(106, 208, 64, 0.7), 0 0 8px rgba(106, 208, 64, 0.5), 0 0 12px rgba(106, 208, 64, 0.4);
  }
}

@keyframes glitch {
  /* Complex glitch effect with transforms and hue rotation */
  0% { transform: translate(0); filter: hue-rotate(0deg); }
  10% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); }
  /* ... continues with random transforms */
}

/* Utility Classes */
.matrix-glow { animation: matrix-glow 2s ease-in-out infinite; }
.matrix-pulse { animation: matrix-pulse 3s ease-in-out infinite; }
.glitch-effect { animation: glitch 2s infinite; }
.glitch-hover:hover { animation: glitch 0.5s infinite; }
```

## Component Architecture

### Core Components

#### MatrixBackground.tsx
```typescript
// Animated canvas background with falling matrix characters
interface MatrixBackgroundProps {
  className?: string;
}

// Features:
// - Canvas-based animation
// - Matrix characters (Katakana, numbers, symbols)
// - Occasional "SIGMA" text drops
// - Responsive canvas sizing
// - 60fps animation loop
```

#### WaitlistForm.tsx
```typescript
// Email collection form with validation and submission
interface WaitlistFormProps {}

// Features:
// - Email validation
// - Duplicate email checking
// - Success/error states with icons
// - Supabase integration
// - Analytics tracking
// - Auto-reset after success
```

#### UI Components (Shadcn/ui)
```typescript
// Button.tsx - Variant-based button component
// Input.tsx - Styled input with focus states
// Card.tsx - Container components for content sections
```

### Layout Structure

#### Desktop.tsx (Main Screen)
```typescript
// Main landing page component with sections:
// 1. Header/Navigation - Fixed with smooth scroll navigation
// 2. Hero Section - Logo, tagline, video demo
// 3. Features Section - 6 feature cards with icons
// 4. Tech Stack Section - Technology showcase
// 5. Team Section - 4 team member profiles
// 6. Waitlist Section - Email collection form
// 7. Mobile Navigation - Bottom navigation for mobile
```

## Content Strategy

### Brand Messaging
```typescript
// Primary Tagline
"AI Business automation for Sigmas"

// Hero Messages
"POV: you want to start a business but every tutorial means you gotta listen to another NPC 'expert'"
"'what if we just... did all of it?'"

// Value Proposition
"Based Sigma helps you build your business from scratch. 0 to CEO while you sleep."
```

### Feature Set
```typescript
const features = [
  {
    title: "Legal Paper work",
    description: "Boring but necessary. Based Sigma will handle it all for you.",
    icon: "legalPaper.svg"
  },
  {
    title: "Branding", 
    description: "Brand that doesn't look like Canva threw up",
    icon: "branding.svg"
  },
  {
    title: "Website",
    description: "Website that converts (not just exists), brings all the Sigma to your backyard",
    icon: "website.svg"
  },
  {
    title: "Payment Processing",
    description: "Payment processing that WORKS",
    icon: "payment.svg"
  },
  {
    title: "Business Banking",
    description: "Skip the bank small talk and get your business running",
    icon: "businessBanking.svg"
  },
  {
    title: "Marketing",
    description: "Marketing that runs itself, promoting your business is now a piece of cake",
    icon: "sigmaguy.svg"
  }
];
```

### Team Profiles
```typescript
const teamMembers = [
  {
    name: "Nolan Hu",
    role: "BASED dev",
    bio: "Puts the \"based\" in Based Sigma. Architect of systems that just work.",
    image: "/nolanPFP.png",
    socials: { github, twitter, linkedin }
  },
  {
    name: "Apoorva",
    role: "Product Designer and Front-End Sigma", 
    bio: "The product designer who sees opportunities where others see problems. Pure sigma energy..",
    image: "/aporvaPFP.jpg",
    socials: { github, twitter, linkedin }
  },
  {
    name: "Brian Cardova",
    role: "Marketing Wizard",
    bio: "Spreads Sigma energy worldwide through marketing and content creation, based video editing skills",
    image: "/honeybPFP.jpg",
    socials: { twitter, linkedin }
  },
  {
    name: "Suzanna Codes",
    role: "Designer and Front-End Developer",
    bio: "A sigma designer that is obsessed with coffee and making websites. Based in Toronto!",
    image: "/suzannaPFP.png", 
    socials: { github, twitter, linkedin }
  }
];
```

### Technology Stack Display
```typescript
const techStack = [
  {
    name: "Bolt",
    description: "AI-powered development platform",
    logo: "/boltnewLogo.svg",
    color: "#6ad040"
  },
  {
    name: "Next.js",
    description: "React framework for production",
    logo: "/nextJSLogo.svg", 
    color: "#ffffff"
  },
  {
    name: "Supabase",
    description: "Open source Postgres Development Platform.",
    logo: "/supabaseLogo.svg",
    color: "#3ecf8e"
  }
];
```

## Asset Management

### Images & SVGs
```bash
public/
├── SigmaLogo.svg           # Main brand logo
├── boltnewLogo.svg         # Bolt.new branding
├── nextJSLogo.svg          # Next.js logo
├── supabaseLogo.svg        # Supabase logo
├── branding.svg            # Feature icon
├── businessBanking.svg     # Feature icon
├── legalPaper.svg          # Feature icon
├── payment.svg             # Feature icon
├── sigmaguy.svg            # Feature icon
├── website.svg             # Feature icon
├── aporvaPFP.jpg           # Team member photo
├── honeybPFP.jpg           # Team member photo  
├── nolanPFP.png            # Team member photo
├── suzannaPFP.png          # Team member photo
└── sigma_draft_1.mp4       # Demo video
```

### External Assets
```typescript
// Bolt.new Badge
"https://storage.bolt.army/white_circle_360x360.png"

// Google Fonts
"https://fonts.googleapis.com/css?family=Orbitron:900,600|Space+Mono:400|Space+Grotesk:700|Azeret+Mono:500"
```

## Database Schema

### Supabase Tables
```sql
-- Leads table for waitlist
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table for user management
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  image TEXT,
  customer_id TEXT,
  price_id TEXT,
  has_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Analytics Implementation

### Google Analytics 4
```typescript
// Event Tracking
trackEvent('sign_up', { method: 'email', event_label: 'waitlist_signup' })
trackEvent('video_interaction', { action: 'play|pause|mute|unmute' })
trackEvent('section_view', { event_label: 'features|tech|team' })
trackEvent('*_nav_cta_click', { location: 'header_nav|mobile_bottom_nav' })
```

### Vercel Analytics
```typescript
// Performance and user behavior tracking
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
```

## Development Configuration

### Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Analytics
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  // Additional Vite configuration
});

// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { /* Custom color system */ },
      fontFamily: { /* Custom font stack */ },
      keyframes: { /* Custom animations */ }
    }
  },
  plugins: [],
  darkMode: ["class"]
};
```

## User Experience Flow

### Navigation Pattern
1. **Landing** → Hero section with auto-playing video
2. **Exploration** → Smooth scroll through features, tech, team sections
3. **Conversion** → Waitlist form with immediate feedback
4. **Success** → Confirmation with auto-reset after 5 seconds

### Responsive Design
- **Desktop**: Full-width sections with hover effects
- **Tablet**: Adjusted grid layouts and spacing
- **Mobile**: Stacked layout with bottom navigation bar

### Performance Optimizations
- Lazy loading for images
- Optimized video autoplay with fallback
- Efficient canvas animations
- Minimal bundle size with tree shaking

## Deployment & Hosting

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@vite_supabase_anon_key", 
    "VITE_GA_MEASUREMENT_ID": "@vite_ga_measurement_id"
  }
}
```

## Security Considerations

### Data Protection
- Email validation and sanitization
- Supabase RLS (Row Level Security) policies
- Environment variable protection
- No sensitive data in client-side code

### Performance Security
- Content Security Policy headers
- HTTPS enforcement
- Asset optimization and caching

This specification provides a complete blueprint for recreating or extending the BasedSigma waitlist application with all its visual, functional, and technical characteristics preserved.