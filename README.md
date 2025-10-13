# ContribHub

A modern web application for managing contributions and submissions with user profiles and leaderboards.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Configuration
This application requires Supabase for authentication and database functionality.

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project dashboard
3. Create a `.env.local` file in the project root with:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
VITE_GOOGLE_APPS_SCRIPT_URL=your_google_apps_script_url_here
```

### 3. Database Setup

First, check what tables already exist in your Supabase database by running this query in the SQL Editor:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'submissions');
```

#### If profiles table doesn't exist, create it:
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### If submissions table doesn't exist, create it:
```sql
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Verify table structure (run these to check if columns exist):
```sql
-- Check profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Check submissions table structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'submissions' AND table_schema = 'public';
```

### 4. Run the Application
```bash
npm run dev
```

## Features
- Google OAuth authentication
- User profile management
- Project submissions
- Leaderboard system
- Admin panel

## Troubleshooting

### Profile Page Stuck Loading
If you see a "Configuration Error" or the profile page is stuck loading:

1. **Check Environment Variables**: Verify your `.env.local` file exists and has the correct Supabase credentials
2. **Test Supabase Connection**: Run this query in Supabase SQL Editor to test connection:
   ```sql
   SELECT current_database(), current_user, version();
   ```
3. **Check Table Structure**: Run the verification queries above to ensure tables have correct columns
4. **Browser Console**: Check for detailed error messages in the browser console (F12 → Console)

### Common Issues

**"relation already exists" error**: This means the table already exists. Skip creating that table and check if it has the right structure.

**"Missing Supabase environment variables"**: Create `.env.local` file with your Supabase project URL and anon key.

**Profile loads but shows no data**: Check if the `profiles` table has the correct columns and if Row Level Security (RLS) is properly configured.

### Row Level Security Setup
If you're still having issues, you may need to set up Row Level Security policies:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Google Sheets Integration Setup

To enable submission storage in Google Sheets, you need to set up a Google Apps Script web app. This is the recommended method for client-side applications.

### Method 1: Google Apps Script (Recommended)

1. **Create a Google Apps Script:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project

2. **Add the following code:**
   ```javascript
   function doPost(e) {
     try {
       const data = JSON.parse(e.postData.contents);
       const sheet = SpreadsheetApp.getActiveSheet();
       sheet.appendRow([data.name, data.wallet, data.link]);
       return ContentService.createTextOutput(JSON.stringify({success: true}));
     } catch (error) {
       return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
     }
   }
   ```

3. **Deploy as Web App:**
   - Click "Deploy" > "New Deployment"
   - Choose "Web app" as the type
   - Set access to "Anyone"
   - Deploy and copy the web app URL

4. **Add Environment Variable:**
   Add this to your `.env.local` file:
   ```env
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

### Method 2: Google Forms (Alternative)

1. **Create a Google Form:**
   - Go to [Google Forms](https://forms.google.com/)
   - Create a new form with three questions:
     - Name (Short answer)
     - Wallet Address (Short answer)
     - Link (Short answer)

2. **Get the form URL:**
   - Click "Send" > "Link" 
   - Copy the form URL

3. **Get field IDs:**
   - View the form source and find the field IDs (entry.XXXXXXXXX)
   - Or use browser developer tools to inspect the form

4. **Add Environment Variables:**
   Add these to your `.env.local` file:
   ```env
   VITE_GOOGLE_FORM_URL=https://docs.google.com/forms/d/YOUR_FORM_ID/formResponse
   # Note: You'll need to replace the field IDs in the code with actual IDs
   ```

### Testing the Integration

Once set up, submissions from the "Submit my Yap" form will automatically be stored in your Google Sheet with the following columns:
- Column A: Name
- Column B: Wallet Address  
- Column C: Link

The system will try Google Apps Script first, then fallback to Google Forms if the first method fails.

## Google reCAPTCHA v2 Setup

To prevent spam and bot submissions, the application uses Google reCAPTCHA v2.

### Setup Steps:

1. **Get reCAPTCHA Keys:**
   - Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
   - Click "Create" or "+" to register a new site
   - Choose "reCAPTCHA v2" → "I'm not a robot" Checkbox
   - Add your domain(s):
     - For local development: `localhost`
     - For production: your actual domain (e.g., `yourdomain.com`)
   - Accept terms and submit

2. **Add Site Key to Environment:**
   - Copy the "Site Key" from the reCAPTCHA admin console
   - Add it to your `.env.local` file:
   ```env
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
   ```

3. **How it Works:**
   - When users click "Submit" on the submission form, they must complete the reCAPTCHA challenge
   - The form won't submit until the captcha is verified
   - After successful submission, the captcha resets for the next submission

### Testing reCAPTCHA:
- In development (`localhost`), reCAPTCHA will show test challenges
- The captcha appears below the content tags in the submission modal
- Users must check the "I'm not a robot" box before submitting

**Note:** The reCAPTCHA site key is safe to expose in client-side code. It's meant to be public.
