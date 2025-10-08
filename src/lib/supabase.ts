import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
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
