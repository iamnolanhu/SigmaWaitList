# BasedSigma Module System Documentation

## Overview

The BasedSigma module system is designed to guide users through a comprehensive business setup and automation journey. Each module represents a specific business function or process that can be completed independently while maintaining logical dependencies.

## Module Structure

### Module Categories

Modules are organized into 8 main categories:

1. **Foundation (100 series)** - Core business setup
2. **Legal (200 series)** - Legal structure and compliance
3. **Branding (300 series)** - Brand identity and materials
4. **Operations (400 series)** - Business operations and systems
5. **Marketing (500 series)** - Marketing and online presence
6. **Finance (600 series)** - Financial planning and funding
7. **Growth (700 series)** - Customer acquisition and analytics
8. **Automation (800 series)** - Process automation and AI

### Module ID Convention

```
MOD_XYZ
```
- **X**: Category number (1-8)
- **YZ**: Sequential number within category (01-99)

Examples:
- `MOD_101`: Business Profile Setup (Foundation category, first module)
- `MOD_201`: Legal Structure Setup (Legal category, first module)
- `MOD_501`: Website Builder (Marketing category, first module)

### Sub-Module ID Convention

```
SUB_XYZ_N
```
- **XYZ**: Parent module number
- **N**: Sub-module sequence number

Examples:
- `SUB_101_1`: Basic Information (under Business Profile Setup)
- `SUB_201_2`: State Registration (under Legal Structure Setup)

## Module Definition Schema

```typescript
interface ModuleDefinition {
  id: string                    // Unique module identifier (MOD_XYZ)
  name: string                  // System name (snake_case)
  displayName: string           // User-friendly name
  description: string           // Brief description
  category: ModuleCategory      // Category enum
  icon: string                  // Lucide icon name
  order: number                 // Display order within category
  dependencies?: string[]       // Array of module IDs that must be completed first
  estimatedTime?: string        // Time estimate (e.g., "30 min")
  subModules?: SubModule[]      // Optional sub-modules
  metadata?: {
    requiresProfile?: boolean
    requiresBusinessInfo?: boolean
    externalIntegrations?: string[]
    outputDocuments?: string[]
  }
}
```

## Module Progression Logic

### Dependencies

Modules can have dependencies that must be completed before they become available:

```
MOD_101 (Business Profile) → MOD_102 (Vision & Mission)
                          ↓
                     MOD_201 (Legal Structure)
                          ↓
                     MOD_401 (Business Banking)
```

### Progress Calculation

**Module Progress:**
- For modules without sub-modules: Binary (0% or 100%)
- For modules with sub-modules: Based on required sub-modules completed

**Category Progress:**
- Percentage of modules completed within the category

**Overall Progress:**
- Weighted average across all categories

## Module Lifecycle

### 1. Discovery
- User sees available modules based on completed dependencies
- Modules are grouped by category and sorted by order

### 2. Activation
```typescript
// When user starts a module
{
  module_id: "MOD_201",
  status: "active",
  activated_at: timestamp,
  metadata: {
    source: "dashboard" | "recommendation" | "chat"
  }
}
```

### 3. Progress Tracking
```typescript
// As user completes sub-modules
{
  module_id: "MOD_201",
  completed_sub_modules: ["SUB_201_1", "SUB_201_2"],
  progress: 66,
  last_activity: timestamp
}
```

### 4. Completion
```typescript
// When all required sub-modules are done
{
  module_id: "MOD_201",
  status: "completed",
  completed_at: timestamp,
  outputs: {
    documents: ["operating_agreement.pdf", "ein_confirmation.pdf"],
    integrations: ["state_registration"]
  }
}
```

## Implementation Guidelines

### Adding New Modules

1. Choose appropriate category and ID:
   ```typescript
   {
     id: 'MOD_703',  // Next available in Growth category
     name: 'referral_program',
     category: ModuleCategory.GROWTH,
     // ...
   }
   ```

2. Define clear dependencies:
   ```typescript
   dependencies: ['MOD_701', 'MOD_502']  // Requires customer acquisition and social media
   ```

3. Include metadata for integrations:
   ```typescript
   metadata: {
     externalIntegrations: ['ReferralCandy', 'Rewardful'],
     outputDocuments: ['referral_terms.pdf']
   }
   ```

### Module Recommendations

The system can recommend next modules based on:

1. **Dependency satisfaction** - Modules whose dependencies are met
2. **Business type** - Industry-specific module paths
3. **User goals** - Fast track to specific outcomes
4. **Time availability** - Quick wins vs comprehensive setup

### Example Module Paths

**Fast Track to Revenue:**
```
MOD_101 → MOD_201 → MOD_401 → MOD_402 → MOD_501
(Profile → Legal → Banking → Payments → Website)
```

**Brand-First Approach:**
```
MOD_101 → MOD_102 → MOD_301 → MOD_302 → MOD_501
(Profile → Vision → Brand Identity → Materials → Website)
```

**Funding Preparation:**
```
MOD_101 → MOD_102 → MOD_201 → MOD_601 → MOD_602
(Profile → Vision → Legal → Projections → Funding Prep)
```

## Database Schema

```sql
-- Module activations table
CREATE TABLE module_activations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  module_id VARCHAR(10) NOT NULL,  -- e.g., 'MOD_101'
  module_name VARCHAR(50),          -- e.g., 'business_profile'
  status VARCHAR(20),               -- inactive, active, completed, paused
  progress INTEGER DEFAULT 0,       -- 0-100
  activated_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_activity TIMESTAMP,
  metadata JSONB,                   -- Flexible storage for module-specific data
  outputs JSONB,                    -- Generated documents, integrations, etc.
  UNIQUE(user_id, module_id)
);

-- Sub-module completions
CREATE TABLE sub_module_completions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  module_id VARCHAR(10),
  sub_module_id VARCHAR(15),        -- e.g., 'SUB_101_1'
  completed_at TIMESTAMP,
  data JSONB,                       -- Sub-module specific data
  FOREIGN KEY (user_id, module_id) REFERENCES module_activations(user_id, module_id)
);
```

## Module States

### Status Values

- **inactive**: Module available but not started
- **active**: User currently working on module
- **completed**: All required sub-modules finished
- **paused**: User temporarily stopped (saved progress)

### State Transitions

```
inactive → active → completed
    ↑        ↓
    ←────paused
```

## Best Practices

1. **Module Design**
   - Keep modules focused on single business function
   - Ensure clear outcomes and deliverables
   - Provide time estimates for planning

2. **Dependencies**
   - Only require true prerequisites
   - Allow parallel paths where possible
   - Consider business type variations

3. **Progress Tracking**
   - Save progress frequently
   - Allow resume from any point
   - Track meaningful milestones

4. **User Experience**
   - Show clear next steps
   - Celebrate completions
   - Provide shortcuts for experienced users

## Future Enhancements

1. **Module Templates** - Industry-specific module variations
2. **Custom Modules** - User-created modules for specific needs
3. **Module Marketplace** - Third-party module integrations
4. **Collaborative Modules** - Team-based completion
5. **Module Analytics** - Success rates and optimization