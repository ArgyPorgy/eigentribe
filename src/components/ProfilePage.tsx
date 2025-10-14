import { useState, useEffect } from 'react';
import { User, Wallet, ExternalLink, Calendar, Loader2, Mail, LogOut } from 'lucide-react';
import { supabase, Submission } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { profile, refreshProfile, user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    walletAddress: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<Array<{
    id: string;
    name: string;
    wallet: string;
    link: string;
    email: string;
    contentTags?: string[];
    timestamp: string;
    date: string;
  }>>([]);

  // Debug logging
  console.log('ProfilePage - user:', user);
  console.log('ProfilePage - profile:', profile);
  console.log('ProfilePage - authLoading:', authLoading);

  // Load user's submissions from localStorage
  useEffect(() => {
    if (user?.email) {
      const submissionsKey = `submissions_${user.email}`;
      const savedSubmissions = localStorage.getItem(submissionsKey);
      
      if (savedSubmissions) {
        try {
          const parsedSubmissions = JSON.parse(savedSubmissions);
          setUserSubmissions(parsedSubmissions);
        } catch (error) {
          console.error('Error parsing submissions:', error);
          setUserSubmissions([]);
        }
      } else {
        setUserSubmissions([]);
      }
    } else {
      setUserSubmissions([]);
    }
  }, [user]);


  const handleLogout = async () => {
    try {
      // Clear storage first
      clearSupabaseStorage();
      
      // Then sign out with local scope
      await signOut();
      
      // Navigate to home
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear and redirect even if API fails
      clearSupabaseStorage();
      navigate('/');
    }
  };

  const clearSupabaseStorage = () => {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  // Redirect if not logged in
  if (!user && !authLoading) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        walletAddress: profile.wallet_address || '',
      });
      loadSubmissions();
    }
  }, [profile]);

  // If we have a user but no profile, try to refresh it
  useEffect(() => {
    if (user && !profile && !authLoading) {
      console.log('User exists but no profile, attempting to refresh...');
      refreshProfile();
    }
  }, [user, profile, authLoading, refreshProfile]);

  // Add timeout for profile loading
  useEffect(() => {
    if (user && !profile && !authLoading) {
      const timeout = setTimeout(() => {
        console.error('Profile loading timeout - possible Supabase connection issue');
        setError('Profile loading is taking too long. Please check your Supabase configuration.');
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [user, profile, authLoading]);

  const loadSubmissions = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          wallet_address: profileData.walletAddress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 px-4 lg:px-6 py-8 lg:py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 lg:p-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-medium mb-4">Configuration Error</div>
            <div className="text-gray-700 mb-6">{error}</div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                <li>Create a <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code> file in your project root</li>
                <li>Add your Supabase credentials:</li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">VITE_SUPABASE_URL=your_url</code></li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY=your_key</code></li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || (!profile && user)) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 px-4 lg:px-6 py-8 lg:py-12">
        <div className="bg-white border-lavender rounded-2xl p-4 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">
              {authLoading ? 'Loading...' : 'Loading profile...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 px-4 lg:px-6 py-8 lg:py-12">
        <div className="bg-white border-lavender rounded-2xl p-4 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <span className="text-gray-600">Please log in to view your profile.</span>
          </div>
        </div>
      </div>
    );
  }

  // At this point, we know profile exists due to our checks above
  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 px-4 lg:px-6 py-8 lg:py-12">
      <div className="bg-white border-lavender rounded-2xl p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1A0C6D' }}>
              <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl lg:text-2xl font-medium text-black truncate">{profile.name || profile.email.split('@')[0]}</h2>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Mail className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <p className="text-xs lg:text-sm font-light truncate">{profile.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-4 py-2 text-sm lg:text-base font-black text-white rounded-lg transition-all flex-shrink-0"
            style={{ backgroundColor: '#1A0C6D' }}
          >
            {editingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editingProfile ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-light text-gray-600 mb-2">Display Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black font-light focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="Enter your display name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-light text-gray-600 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={profileData.walletAddress}
                onChange={(e) => setProfileData({ ...profileData, walletAddress: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="0x..."
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 font-black text-white rounded-lg transition-all"
              style={{ backgroundColor: '#1A0C6D' }}
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-white border-lavender rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-light">Email</p>
                <p className="text-black font-light">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-light">Member Since</p>
                <p className="text-black font-light">{formatDate(profile.created_at)}</p>
              </div>
            </div>
            {profile.wallet_address && (
              <div className="flex items-start gap-3 md:col-span-2">
                <Wallet className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-light">Wallet Address</p>
                  <p className="font-mono text-sm text-black break-all font-light">{profile.wallet_address}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl lg:text-2xl font-medium text-black mb-4 lg:mb-6">Your Submissions</h3>
      </div>


      {userSubmissions.length === 0 ? (
        <div className="bg-white border-lavender rounded-2xl p-8 lg:p-12 text-center">
          <p className="text-sm lg:text-base text-gray-600 font-light">Your submissions will appear here after you submit them from the dashboard.</p>
        </div>
      ) : (
        <div className="space-y-3 lg:space-y-4">
          {userSubmissions.slice().reverse().map((submission, index) => {
            const submissionNumber = userSubmissions.length - index;
            return (
              <div 
                key={submission.id} 
                className="bg-white rounded-xl border border-gray-200 p-3 lg:p-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    {/* Left side - Submission info */}
                    <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1A0C6D' }}>
                        <span className="text-white text-xs lg:text-sm font-bold">#{submissionNumber}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm lg:text-base text-black font-medium truncate">Submission #{submissionNumber}</p>
                        <p className="text-gray-500 text-xs lg:text-sm font-light truncate">submitted this • {submission.date}</p>
                      </div>
                    </div>
                    
                    {/* Right side - View button */}
                    <a 
                      href={submission.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 lg:px-4 lg:py-2 rounded-lg text-sm lg:text-base font-medium text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                      style={{ backgroundColor: '#1A0C6D' }}
                    >
                      <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
                      View
                    </a>
                  </div>
                  
                  {/* Content Tags */}
                  {submission.contentTags && submission.contentTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-0 sm:ml-10 lg:ml-13">
                      {submission.contentTags.map((tag: string, tagIndex: number) => (
                        <span 
                          key={tagIndex}
                          className="px-3 py-1 rounded-full text-xs font-light text-black border border-gray-300"
                          style={{ backgroundColor: '#B7C0E9' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Logout Button */}
      <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base font-medium text-white transition-all hover:opacity-90 bg-red-600 hover:bg-red-700 w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
