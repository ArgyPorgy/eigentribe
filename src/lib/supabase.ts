import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please create a .env.local file with:');
  console.error('VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('Get these values from your Supabase project dashboard at https://supabase.com');
  throw new Error('Missing Supabase environment variables. Check console for setup instructions.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
};

export type Submission = {
  id: string;
  user_id: string;
  name: string;
  wallet_address: string;
  link: string;
  created_at: string;
  updated_at: string;
};

export type LeaderboardEntry = {
  id: string;
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  points: number;
  rank: number;
  created_at: string;
  updated_at: string;
};
