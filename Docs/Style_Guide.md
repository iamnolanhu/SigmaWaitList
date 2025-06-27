# Sigma AI Business Partner - Style Guide

## Executive Summary

This style guide establishes the visual identity, design principles, and implementation standards for the Sigma AI Business Partner platform. It serves as the definitive reference for maintaining brand consistency across all touchpoints, user interfaces, and marketing materials.

**Brand Essence:** Based Sigma energy meets cutting-edge AI automation - confident, efficient, and unapologetically modern.

---

## 1. Brand Identity

### 1.1 Brand Personality

**Core Attributes:**
- **Based/Sigma:** Confident, self-reliant, results-oriented
- **Tech-Forward:** Cutting-edge but accessible
- **Authentic:** No corporate BS, genuine value
- **Empowering:** Enables users to achieve more
- **Efficient:** Streamlined, purposeful, no waste

### 1.2 Voice & Tone

**Primary Voice:** Confident but not arrogant, knowledgeable but approachable

**Tone Variations by Context:**
- **Marketing Copy:** Bold, confident, slightly playful
- **UI Copy:** Clear, direct, helpful
- **Error Messages:** Supportive, solution-focused
- **Success Messages:** Celebratory, encouraging

**Language Guidelines:**
- Use "we" and "you" to create connection
- Avoid corporate jargon and buzzwords
- Embrace internet culture references when appropriate
- Be concise and action-oriented
- Use active voice

**Example Phrases:**
- ✅ "Skip the complexity, focus on your vision"
- ✅ "0 to CEO while you sleep"
- ✅ "Built for those who think differently"
- ❌ "Leverage synergistic solutions"
- ❌ "Best-in-class enterprise platform"

---

## 2. Color System

### 2.1 Primary Colors

#### Sigma Green (Primary)
```css
/* Main brand color - use for CTAs, highlights, success states */
--sigma-green: #6ad040;
--sigma-green-hover: #79e74c;
--sigma-green-light: #b7ffab;
--sigma-green-dark: #5bc039;
```

**Usage:**
- Primary CTA buttons
- Key highlights and accents
- Success indicators
- Brand logo elements
- Interactive element focus states

#### Matrix Dark (Secondary)
```css
/* Dark backgrounds and containers */
--matrix-dark-primary: #1a1a1a;
--matrix-dark-secondary: #0f0f0f;
--matrix-dark-light: #2a2a2a;
--matrix-dark-overlay: rgba(26, 26, 26, 0.8);
```

**Usage:**
- Primary background colors
- Card and container backgrounds
- Overlay backgrounds
- Section dividers

### 2.2 Supporting Colors

#### Neutral Grays
```css
/* Text and UI elements */
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;
```

#### Status Colors
```css
/* Success (extends Sigma Green) */
--success: #22c55e;
--success-light: #86efac;
--success-dark: #16a34a;

/* Warning */
--warning: #f59e0b;
--warning-light: #fcd34d;
--warning-dark: #d97706;

/* Error */
--error: #ef4444;
--error-light: #fca5a5;
--error-dark: #dc2626;

/* Info */
--info: #3b82f6;
--info-light: #93c5fd;
--info-dark: #2563eb;
```

### 2.3 Color Usage Guidelines

**Accessibility Requirements:**
- All text must meet WCAG 2.1 AA contrast ratios (4.5:1 minimum)
- Interactive elements must have clear focus indicators
- Color cannot be the only way to convey information

**Color Combinations:**
- **High Contrast:** Sigma Green on Matrix Dark
- **Medium Contrast:** Light gray text on Matrix Dark
- **Subtle Accents:** Green tints for hover states

---

## 3. Typography

### 3.1 Font Hierarchy

#### Display Font: Orbitron
```css
font-family: 'Orbitron', monospace;
```
**Usage:** Headlines, logos, CTAs, bold statements
**Weights:** 600 (Semi-bold), 900 (Black)
**Character:** Futuristic, tech-forward, commanding

#### Body Font: Space Mono
```css
font-family: 'Space Mono', monospace;
```
**Usage:** Body text, descriptions, captions
**Weights:** 400 (Regular)
**Character:** Readable, tech-inspired, approachable

#### UI Font: Space Grotesk
```css
font-family: 'Space Grotesk', sans-serif;
```
**Usage:** Interface elements, buttons, navigation
**Weights:** 700 (Bold)
**Character:** Modern, clean, functional

#### Code Font: Azeret Mono
```css
font-family: 'Azeret Mono', monospace;
```
**Usage:** Code snippets, technical documentation
**Weights:** 500 (Medium)
**Character:** Technical, precise, developer-friendly

### 3.2 Typography Scale

#### Desktop Typography
```css
/* Display Heading */
.heading-display {
  font-family: 'Orbitron', monospace;
  font-weight: 900;
  font-size: 4rem; /* 64px */
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Main Heading */
.heading-h1 {
  font-family: 'Orbitron', monospace;
  font-weight: 900;
  font-size: 3rem; /* 48px */
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* Section Heading */
.heading-h2 {
  font-family: 'Orbitron', monospace;
  font-weight: 600;
  font-size: 2rem; /* 32px */
  line-height: 1.3;
}

/* Subsection Heading */
.heading-h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.5rem; /* 24px */
  line-height: 1.4;
}

/* Body Large */
.body-large {
  font-family: 'Space Mono', monospace;
  font-weight: 400;
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
}

/* Body Default */
.body-default {
  font-family: 'Space Mono', monospace;
  font-weight: 400;
  font-size: 1rem; /* 16px */
  line-height: 1.5;
}

/* Body Small */
.body-small {
  font-family: 'Space Mono', monospace;
  font-weight: 400;
  font-size: 0.875rem; /* 14px */
  line-height: 1.4;
}

/* Caption */
.caption {
  font-family: 'Space Mono', monospace;
  font-weight: 400;
  font-size: 0.75rem; /* 12px */
  line-height: 1.3;
}
```

#### Mobile Typography (Responsive Adjustments)
```css
/* Reduce display sizes for mobile */
@media (max-width: 768px) {
  .heading-display { font-size: 2.5rem; }
  .heading-h1 { font-size: 2rem; }
  .heading-h2 { font-size: 1.5rem; }
  .body-large { font-size: 1rem; }
}
```

### 3.3 Typography Guidelines

**Line Height:**
- **Headlines:** 120% (tight for impact)
- **Body Text:** 150% (comfortable reading)
- **UI Elements:** 130% (compact but readable)

**Letter Spacing:**
- **Large Headlines:** -2% (tighter for cohesion)
- **Small Headlines:** -1% (slight tightening)
- **Body Text:** Default (0%)
- **Uppercase Text:** +5% (better readability)

---

## 4. Visual Elements

### 4.1 Logo & Branding

#### Primary Logo
- **File:** `SigmaLogo.svg`
- **Usage:** Main brand representation
- **Minimum Size:** 100px wide
- **Clear Space:** Logo width × 0.5 on all sides

#### Logo Variations
- **Primary:** Full color on dark backgrounds
- **Monochrome:** Single color when needed
- **Simplified:** Text-only version for small sizes

#### Logo Usage Guidelines
- Never stretch or distort the logo
- Maintain clear space requirements
- Use high contrast backgrounds only
- Never place on busy/complex backgrounds

### 4.2 Iconography

#### Icon Style
- **Style:** Outline-based with consistent stroke width
- **Weight:** 2px stroke weight
- **Corner Radius:** Rounded corners (2px radius)
- **Size Grid:** 24px base grid (16px, 20px, 24px, 32px)

#### Icon Library
Primary icons from Lucide React:
- Navigation: `ChevronDown`, `Menu`, `X`
- Actions: `Play`, `Pause`, `Volume2`, `VolumeX`
- Social: `Github`, `Linkedin`, `Twitter`
- Status: `CheckCircle`, `AlertCircle`, `Loader2`

#### Custom Icons
- Legal documents, branding assets, website tools
- Business banking, payment processing, marketing
- All custom icons follow the same 24px grid system

### 4.3 Imagery Guidelines

#### Photography Style
- **Mood:** Clean, modern, tech-forward
- **Color Treatment:** Slight green tint to match brand
- **Composition:** Minimalist, focused subjects
- **Sources:** Pexels, Unsplash (specific photographer credits)

#### Illustration Style
- **Aesthetic:** Geometric, abstract, tech-inspired
- **Color Palette:** Matrix greens with dark backgrounds
- **Style:** Clean vector graphics, minimal detail
- **Usage:** Feature illustrations, empty states, onboarding

---

## 5. Layout & Spacing

### 5.1 Grid System

#### Container Widths
```css
/* Responsive containers */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { padding: 0 2rem; }
}

@media (min-width: 1024px) {
  .container { padding: 0 3rem; }
}
```

#### Breakpoints
```css
/* Mobile First Approach */
--mobile: 0px;
--tablet: 640px;
--desktop: 1024px;
--large: 1280px;
--xl: 1536px;
```

### 5.2 Spacing System

#### 8px Base Grid System
```css
/* Spacing scale based on 8px increments */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

#### Section Spacing
```css
/* Consistent section spacing */
.section-padding {
  padding: var(--space-16) 0; /* Desktop */
}

@media (max-width: 1024px) {
  .section-padding {
    padding: var(--space-12) 0; /* Tablet */
  }
}

@media (max-width: 640px) {
  .section-padding {
    padding: var(--space-8) 0; /* Mobile */
  }
}
```

### 5.3 Layout Guidelines

#### Content Hierarchy
1. **Full Width:** Hero sections, backgrounds
2. **Container Width:** Main content sections
3. **Narrow Width:** Forms, focused content (max-width: 600px)

#### Viewport Heights
- Each main section should be minimum 100vh
- Content should be vertically centered when appropriate
- Maintain proper spacing for mobile viewports

---

## 6. Components

### 6.1 Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--sigma-green);
  color: var(--matrix-dark-primary);
  font-family: 'Orbitron', monospace;
  font-weight: 900;
  padding: 12px 24px;
  border-radius: 9999px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--sigma-green-hover);
  transform: scale(1.05);
  box-shadow: 0 0 20px 6px rgba(106, 208, 64, 0.5);
}

.btn-primary:active {
  transform: scale(0.95);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--sigma-green-light);
  border: 2px solid var(--sigma-green);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: 9999px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--sigma-green);
  color: var(--matrix-dark-primary);
  box-shadow: 0 0 15px 3px rgba(106, 208, 64, 0.3);
}
```

#### Button States
- **Default:** Base styling
- **Hover:** Scale, color, shadow changes
- **Active:** Scale down effect
- **Disabled:** 50% opacity, no interactions
- **Loading:** Spinner icon, disabled state

### 6.2 Form Elements

#### Input Fields
```css
.input-field {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(106, 208, 64, 0.5);
  border-radius: 9999px;
  padding: 12px 24px;
  color: var(--sigma-green-light);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: var(--sigma-green);
  box-shadow: 0 0 12px 3px rgba(106, 208, 64, 0.3);
  outline: none;
}

.input-field::placeholder {
  color: rgba(183, 255, 171, 0.6);
}
```

#### Form Validation
- **Success:** Green border, checkmark icon
- **Error:** Red border, alert icon  
- **Loading:** Spinner icon in input
- **Disabled:** Reduced opacity, no interaction

### 6.3 Cards & Containers

#### Glass Card
```css
.glass-card {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(106, 208, 64, 0.4);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.5s ease;
}

.glass-card:hover {
  border-color: var(--sigma-green);
  box-shadow: 0 8px 32px rgba(106, 208, 64, 0.3);
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.05) translateY(-8px);
}
```

#### Feature Card
```css
.feature-card {
  /* Extends glass-card */
  position: relative;
  height: 100%;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(
    135deg, 
    rgba(106, 208, 64, 0.1), 
    transparent, 
    rgba(106, 208, 64, 0.05)
  );
  opacity: 0;
  transition: opacity 0.5s ease;
}

.feature-card:hover::before {
  opacity: 1;
}
```

### 6.4 Navigation

#### Header Navigation
```css
.nav-header {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(106, 208, 64, 0.2);
  box-shadow: 0 2px 12px rgba(106, 208, 64, 0.1);
}

.nav-link {
  color: var(--sigma-green-light);
  font-family: 'Space Mono', monospace;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: var(--sigma-green);
  text-shadow: 0 0 8px rgba(106, 208, 64, 0.5);
}
```

#### Mobile Navigation
```css
.mobile-nav {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(106, 208, 64, 0.4);
  border-radius: 16px;
  padding: 16px 24px;
  box-shadow: 0 8px 32px rgba(106, 208, 64, 0.3);
  z-index: 50;
}
```

---

## 7. Effects & Animations

### 7.1 Matrix Background

#### Animation Properties
```css
@keyframes matrix-fall {
  0% { transform: translateY(-100vh); }
  100% { transform: translateY(100vh); }
}

.matrix-character {
  color: var(--sigma-green);
  font-family: monospace;
  font-size: 14px;
  animation: matrix-fall 3s linear infinite;
  opacity: 0.8;
}
```

#### Implementation Guidelines
- Canvas-based animation for performance
- Characters include: Katakana, numbers, symbols, "SIGMA"
- Frame rate: 20fps (50ms intervals)
- Opacity: 60% to avoid overwhelming content

### 7.2 UI Animations

#### Hover Effects
```css
/* Scale and glow effect */
.hover-scale {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-scale:hover {
  transform: scale(1.05) translateY(-4px);
  box-shadow: 0 0 20px 6px rgba(106, 208, 64, 0.5);
}

/* Glitch effect for special elements */
@keyframes glitch {
  0%, 100% { transform: translate(0); }
  10% { transform: translate(-2px, 2px); }
  20% { transform: translate(-1px, -1px); }
  30% { transform: translate(1px, 2px); }
  40% { transform: translate(1px, -1px); }
  50% { transform: translate(-1px, 2px); }
}

.glitch-hover:hover {
  animation: glitch 0.5s infinite;
}
```

#### Loading States
```css
@keyframes pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}
```

### 7.3 Page Transitions

#### Smooth Scrolling
```css
html {
  scroll-behavior: smooth;
}

/* Custom easing for programmatic scrolling */
.smooth-scroll {
  scroll-behavior: smooth;
  scroll-padding-top: 80px; /* Account for fixed header */
}
```

#### Section Reveals
```css
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-animation {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

---

## 8. Accessibility

### 8.1 Color Contrast

#### Required Ratios
- **Normal Text:** 4.5:1 minimum (WCAG AA)
- **Large Text:** 3:1 minimum
- **UI Components:** 3:1 minimum for focus indicators

#### Testing Tools
- WebAIM Contrast Checker
- Chrome DevTools Contrast tab
- Automated testing with axe-core

### 8.2 Keyboard Navigation

#### Focus Indicators
```css
.focusable:focus-visible {
  outline: 2px solid var(--sigma-green);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(106, 208, 64, 0.3);
}

/* Remove default browser outline */
.focusable:focus {
  outline: none;
}
```

#### Tab Order
- Logical tab sequence through page sections
- Skip links for screen readers
- Modal focus trapping when applicable

### 8.3 Screen Reader Support

#### Semantic HTML
```html
<!-- Proper heading hierarchy -->
<h1>Main Page Title</h1>
<h2>Section Titles</h2>
<h3>Subsection Titles</h3>

<!-- Meaningful link text -->
<a href="#features" aria-label="View Sigma features section">Features</a>

<!-- Form labels -->
<label for="email">Email Address</label>
<input id="email" type="email" required>

<!-- Status announcements -->
<div role="status" aria-live="polite">
  Form submitted successfully!
</div>
```

#### ARIA Labels
- `aria-label` for icon-only buttons
- `aria-describedby` for form help text
- `aria-expanded` for collapsible content
- `role="status"` for dynamic content updates

---

## 9. Implementation Guidelines

### 9.1 CSS Architecture

#### Naming Convention
```css
/* BEM-inspired naming */
.component-name {}
.component-name__element {}
.component-name--modifier {}

/* Examples */
.waitlist-form {}
.waitlist-form__input {}
.waitlist-form__input--error {}
.waitlist-form__button {}
.waitlist-form__button--loading {}
```

#### CSS Custom Properties
```css
:root {
  /* Colors */
  --color-primary: #6ad040;
  --color-background: #1a1a1a;
  
  /* Typography */
  --font-display: 'Orbitron', monospace;
  --font-body: 'Space Mono', monospace;
  
  /* Spacing */
  --space-unit: 8px;
  --space-sm: calc(var(--space-unit) * 2);
  --space-md: calc(var(--space-unit) * 4);
  
  /* Animation */
  --transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-long: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 9.2 Component Development

#### React Component Structure
```typescript
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  ...props
}) => {
  const className = cn(
    'base-component-classes',
    {
      'variant-primary': variant === 'primary',
      'variant-secondary': variant === 'secondary',
      'size-small': size === 'sm',
      'size-large': size === 'lg',
      'is-disabled': disabled,
      'is-loading': loading,
    }
  );

  return (
    <button className={className} disabled={disabled || loading} {...props}>
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
};
```

#### Tailwind CSS Classes
```typescript
// Preferred Tailwind patterns for Sigma design
const cardClasses = cn(
  'bg-black/30 backdrop-blur-md',
  'border border-[#6ad040]/40 rounded-2xl',
  'p-6 lg:p-8',
  'transition-all duration-500',
  'hover:border-[#6ad040] hover:shadow-2xl',
  'hover:shadow-[#6ad040]/30 hover:bg-black/50',
  'hover:scale-105 hover:-translate-y-2'
);
```

### 9.3 Performance Guidelines

#### Image Optimization
- Use WebP format when possible
- Implement lazy loading for non-critical images
- Provide appropriate alt text for accessibility
- Use responsive images with srcset

#### Animation Performance
```css
/* Prefer transforms and opacity for smooth animations */
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Avoid animating expensive properties */
/* ❌ Avoid: width, height, margin, padding */
/* ✅ Prefer: transform, opacity */
```

#### Bundle Size
- Import only necessary Lucide icons
- Use dynamic imports for large components
- Optimize font loading with font-display: swap

---

## 10. Quality Assurance

### 10.1 Testing Checklist

#### Visual Testing
- [ ] Components render correctly across breakpoints
- [ ] Colors maintain proper contrast ratios
- [ ] Typography scales appropriately
- [ ] Animations perform smoothly (60fps)
- [ ] Loading states provide clear feedback

#### Accessibility Testing
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader compatibility verified
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Focus indicators are visible and consistent
- [ ] Alt text provided for all images

#### Performance Testing
- [ ] Page load time under 3 seconds
- [ ] Time to interactive under 5 seconds
- [ ] Lighthouse accessibility score 90+
- [ ] No layout shift during loading
- [ ] Smooth scrolling performance

### 10.2 Browser Support

#### Primary Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

#### Mobile Support
- iOS Safari 14+
- Android Chrome 90+
- Samsung Internet 14+

#### Graceful Degradation
- Backdrop blur fallbacks for older browsers
- CSS Grid fallbacks using Flexbox
- Progressive enhancement for advanced features

---

## 11. Brand Extensions

### 11.1 Marketing Materials

#### Color Adaptations
- **Light Backgrounds:** Use dark text with green accents
- **Print Materials:** Ensure minimum 300 DPI resolution
- **Social Media:** Maintain brand colors in profile elements

#### Typography in Marketing
- **Headlines:** Orbitron for impact and brand recognition
- **Body Text:** Use system fonts for readability in long-form content
- **Captions:** Space Mono for consistency with digital experience

### 11.2 Email Templates

#### Brand Consistency
```html
<!-- Email-safe styles -->
<style>
  .email-header {
    background-color: #1a1a1a;
    color: #b7ffab;
    font-family: Arial, sans-serif; /* Fallback */
  }
  
  .email-cta {
    background-color: #6ad040;
    color: #1a1a1a;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 25px;
    display: inline-block;
    font-weight: bold;
  }
</style>
```

### 11.3 Documentation

#### Technical Documentation
- Use consistent heading hierarchy
- Code blocks with proper syntax highlighting
- Maintain brand color scheme in diagrams
- Include brand-appropriate examples and terminology

---

## 12. Maintenance & Updates

### 12.1 Version Control

#### Documentation Updates
- All style guide changes require version updates
- Major changes (new components, color updates) = major version
- Minor changes (spacing adjustments, copy updates) = minor version
- Bug fixes and clarifications = patch version

#### Change Log Format
```markdown
## [Version 2.1.0] - 2025-01-15

### Added
- New error state styles for form components
- Mobile-specific animation optimizations

### Changed
- Updated primary button hover states for better accessibility
- Refined color contrast ratios for improved readability

### Fixed
- Corrected focus indicator styling for keyboard navigation
```

### 12.2 Team Communication

#### Design Reviews
- All new components must follow this style guide
- Design reviews required for any deviations
- Document exceptions with rationale
- Update style guide to reflect approved changes

#### Developer Handoffs
- Include style guide references in design specifications
- Provide implementation notes for complex animations
- Specify exact color values and spacing measurements
- Include accessibility requirements in specifications

---

## Appendix

### A. Color Reference Chart

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Sigma Green | #6ad040 | 106, 208, 64 | Primary actions, highlights |
| Sigma Green Hover | #79e74c | 121, 231, 76 | Button hover states |
| Sigma Green Light | #b7ffab | 183, 255, 171 | Text on dark backgrounds |
| Matrix Dark Primary | #1a1a1a | 26, 26, 26 | Main background |
| Matrix Dark Secondary | #0f0f0f | 15, 15, 15 | Alternate background |

### B. Font Loading Code

```html
<!-- Optimized font loading -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;900&family=Space+Mono:wght@400&family=Space+Grotesk:wght@700&family=Azeret+Mono:wght@500&display=swap" rel="stylesheet">
```

### C. Accessibility Testing Tools

- **Automated Testing:** axe-core, Lighthouse, Wave
- **Manual Testing:** Screen readers (NVDA, VoiceOver, JAWS)
- **Contrast Testing:** WebAIM Contrast Checker, Colour Contrast Analyser
- **Keyboard Testing:** Manual tab navigation, keyboard-only interaction

---

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Next Review:** March 2025  
**Contact:** Team Sigma Design System

*This style guide is a living document that evolves with the Sigma brand and platform. All team members are responsible for maintaining consistency and proposing improvements.*