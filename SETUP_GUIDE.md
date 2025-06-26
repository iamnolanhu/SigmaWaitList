# Sigma Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name:** `sigma-ai-business-partner`
   - **Database Password:** (Generate a strong password and save it)
   - **Region:** Choose closest to your users
5. Click "Create new project"

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL:** `https://[your-project-id].supabase.co`
   - **Project API Key (anon, public):** `eyJ...` (the anon key)

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the migration
5. Verify tables were created in **Table Editor**

## Step 4: Create Environment File

1. In your project root, create a `.env` file
2. Add your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important:** Replace `your-project-id` and `your-anon-key-here` with your actual values!

## Step 5: Test the Setup

1. Save your `.env` file
2. Restart your development server: `npm run dev`
3. Open your browser to `http://localhost:5173`
4. Try submitting an email in the waitlist form
5. Check your Supabase dashboard **Table Editor > leads** to see if the email was stored

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure your `.env` file is in the project root
- Check that variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after creating `.env`

### Error: "Failed to join waitlist"
- Verify your Supabase project is active (not paused)
- Check that the database schema was created successfully
- Ensure RLS policies are enabled in **Authentication > Policies**

### Form shows "This email is already on the waitlist"
- This is working correctly! Duplicate prevention is active
- Try a different email address

## Next Steps

Once the waitlist is working:
1. Test form validation (try invalid emails)
2. Test duplicate prevention (submit same email twice)
3. Check analytics in your browser's developer console
4. Monitor signups in Supabase dashboard

## Security Notes

- The anon key is safe to use in frontend code
- RLS policies prevent unauthorized data access
- Never commit your `.env` file to version control (it's in .gitignore)

---

**Need help?** Check the console for error messages or review the Supabase documentation.