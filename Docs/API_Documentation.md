# API Documentation

## Base Configuration

### Base URL
```
Production: https://[project-id].supabase.co
Development: http://localhost:54321
```

### Authentication
The API uses Supabase authentication with JWT tokens:
```
Authorization: Bearer <jwt_token>
```

For service operations:
```
Authorization: Bearer <service_role_key>
apikey: <service_role_key>
```

## Authentication Endpoints

### User Registration
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": null,
    "created_at": "2025-01-XX"
  }
}
```

### User Login
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Password Recovery
```http
POST /auth/v1/recover
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### User Logout
```http
POST /auth/v1/logout
Authorization: Bearer <jwt_token>
```

## Database API Endpoints

### Leads Management

#### Create Lead (Waitlist Signup)
```http
POST /rest/v1/leads
Content-Type: application/json
apikey: <anon_key>

{
  "email": "prospect@example.com"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "email": "prospect@example.com",
  "created_at": "2025-01-XX"
}
```

**Error Response (400 Bad Request):**
```json
{
  "code": "PGRST116",
  "details": "The result contains 0 rows",
  "hint": null,
  "message": "JSON object requested, multiple (or no) rows returned"
}
```

#### Get All Leads (Admin Only)
```http
GET /rest/v1/leads
Authorization: Bearer <service_role_key>
apikey: <service_role_key>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "email": "prospect1@example.com",
    "created_at": "2025-01-XX"
  },
  {
    "id": "uuid",
    "email": "prospect2@example.com",
    "created_at": "2025-01-XX"
  }
]
```

#### Get Leads with Pagination
```http
GET /rest/v1/leads?select=*&limit=50&offset=0&order=created_at.desc
Authorization: Bearer <service_role_key>
apikey: <service_role_key>
```

#### Export Leads to CSV
```http
GET /rest/v1/leads?select=email,created_at
Authorization: Bearer <service_role_key>
apikey: <service_role_key>
Accept: text/csv
```

### Profile Management

#### Get User Profile
```http
GET /rest/v1/profiles?id=eq.<user_id>&select=*
Authorization: Bearer <user_jwt_token>
apikey: <anon_key>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://example.com/avatar.jpg",
    "customer_id": "cus_stripe_id",
    "price_id": "price_stripe_id",
    "has_access": true,
    "created_at": "2025-01-XX",
    "updated_at": "2025-01-XX"
  }
]
```

#### Update User Profile
```http
PATCH /rest/v1/profiles?id=eq.<user_id>
Authorization: Bearer <user_jwt_token>
apikey: <anon_key>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "image": "https://example.com/new-avatar.jpg"
}
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "image": "https://example.com/new-avatar.jpg",
    "updated_at": "2025-01-XX"
  }
]
```

#### Create User Profile (Auto-triggered)
*Note: Profile creation is automatically handled by database triggers when a user signs up*

## Custom Edge Functions

### Function: waitlist-signup
**Purpose:** Enhanced waitlist signup with validation and email confirmation

```http
POST /functions/v1/waitlist-signup
Content-Type: application/json
Authorization: Bearer <anon_key>

{
  "email": "user@example.com",
  "source": "landing_page",
  "utm_source": "google",
  "utm_campaign": "sigma_launch"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully added to waitlist",
  "confirmation_sent": true,
  "lead_id": "uuid"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

### Function: send-confirmation-email
**Purpose:** Send email confirmation to new waitlist signups

```http
POST /functions/v1/send-confirmation-email
Content-Type: application/json
Authorization: Bearer <service_role_key>

{
  "email": "user@example.com",
  "template": "waitlist_confirmation",
  "data": {
    "name": "John",
    "position_in_queue": 1337
  }
}
```

## Real-time Subscriptions

### Subscribe to Leads (Admin Dashboard)
```javascript
const { data, error } = supabase
  .channel('leads-channel')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'leads' 
    }, 
    (payload) => {
      console.log('New lead:', payload);
    }
  )
  .subscribe();
```

### Subscribe to Profile Changes
```javascript
const { data, error } = supabase
  .channel('profile-channel')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'profiles',
      filter: `id=eq.${userId}`
    }, 
    (payload) => {
      console.log('Profile updated:', payload);
    }
  )
  .subscribe();
```

## Query Parameters

### Filtering
```http
GET /rest/v1/leads?email=like.*@gmail.com
GET /rest/v1/profiles?has_access=eq.true
GET /rest/v1/leads?created_at=gte.2025-01-01
```

### Ordering
```http
GET /rest/v1/leads?order=created_at.desc
GET /rest/v1/profiles?order=name.asc
```

### Limiting and Pagination
```http
GET /rest/v1/leads?limit=10&offset=20
```

### Selecting Specific Columns
```http
GET /rest/v1/leads?select=email,created_at
GET /rest/v1/profiles?select=name,email,has_access
```

### Counting Rows
```http
HEAD /rest/v1/leads
# Returns count in Content-Range header
```

## Error Handling

### Common HTTP Status Codes
- `200 OK` - Successful GET, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - RLS policy violation
- `404 Not Found` - Resource not found
- `409 Conflict` - Unique constraint violation
- `422 Unprocessable Entity` - Database constraint violation
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "code": "PGRST116",
  "details": "Detailed error description",
  "hint": "Suggestion for fixing the error",
  "message": "High-level error message"
}
```

### Common Error Codes
- `PGRST116` - No rows returned when expecting one
- `23505` - Unique constraint violation
- `23503` - Foreign key constraint violation
- `42501` - Insufficient privilege (RLS)

## Rate Limiting

### Default Limits
- **Anonymous requests:** 100 requests per hour per IP
- **Authenticated requests:** 1000 requests per hour per user
- **Service role requests:** 10000 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

## Planned API Extensions

### Phase 2: Business Management APIs

#### Business Profiles
```http
POST /rest/v1/business_profiles
GET /rest/v1/business_profiles?user_id=eq.<user_id>
PATCH /rest/v1/business_profiles?id=eq.<business_id>
```

#### Automation Jobs
```http
POST /functions/v1/create-automation-job
GET /rest/v1/automation_jobs?user_id=eq.<user_id>
GET /functions/v1/job-status/<job_id>
```

### Phase 3: Service Integration APIs

#### Legal Document Generation
```http
POST /functions/v1/generate-legal-docs
GET /rest/v1/legal_documents?business_id=eq.<business_id>
```

#### Brand Asset Creation
```http
POST /functions/v1/generate-brand-assets
GET /rest/v1/brand_assets?business_id=eq.<business_id>
```

#### Website Deployment
```http
POST /functions/v1/deploy-website
GET /functions/v1/website-status/<website_id>
```

## SDK Usage Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Add to waitlist
const { data, error } = await supabase
  .from('leads')
  .insert({ email: 'user@example.com' });

// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

### React Hook Example
```typescript
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useProfile(userId: string) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      setProfile(data);
      setLoading(false);
    }

    fetchProfile();
  }, [userId]);

  return { profile, loading };
}
```

---

*This API documentation will be expanded as new endpoints and features are implemented.*