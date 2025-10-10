import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('Fetching profile for user:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Fetched profile data:', data);
      return data;
    } catch (error) {
      console.error('Network error fetching profile:', error);
      return null;
    }
  };

  const createProfile = async (user: User) => {
    console.log('Creating profile for user:', user);
    console.log('User metadata:', user.user_metadata);
    console.log('User email:', user.email);
    
    // Only include columns that exist in the table
    const profileData = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0],
      // Remove avatar_url since it doesn't exist in the table
    };
    
    console.log('Profile data to insert:', profileData);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return null;
      }

      console.log('✅ Created profile data:', data);
      return data;
    } catch (error) {
      console.error('❌ Network error creating profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      let profileData = await fetchProfile(user.id);

      if (!profileData) {
        profileData = await createProfile(user);
      }

      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Test Supabase connection first
    console.log('🔍 Testing Supabase connection...');
    supabase.from('profiles').select('count').then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
      } else {
        console.log('✅ Supabase connection test successful:', data);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('Initial session user found:', session.user);
          let profileData = await fetchProfile(session.user.id);

          if (!profileData) {
            console.log('No profile found in initial load, creating new one...');
            profileData = await createProfile(session.user);
          }

          console.log('Setting initial profile:', profileData);
          setProfile(profileData);
        }

        setLoading(false);
      })();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('Session user found:', session.user);
          let profileData = await fetchProfile(session.user.id);

          if (!profileData) {
            console.log('No profile found, creating new one...');
            profileData = await createProfile(session.user);
          }

          console.log('Setting profile:', profileData);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
