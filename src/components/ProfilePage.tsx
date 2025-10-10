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
  const [userSubmission, setUserSubmission] = useState<{
    name: string;
    wallet: string;
    link: string;
    email: string;
  } | null>(null);

  // Debug logging
  console.log('ProfilePage - user:', user);
  console.log('ProfilePage - profile:', profile);
  console.log('ProfilePage - authLoading:', authLoading);

  // Load user's submission data from localStorage
  useEffect(() => {
    if (user?.email) {
      const submissionKey = `submission_${user.email}`;
      const hasSubmitted = localStorage.getItem(submissionKey) === 'true';
      
      if (hasSubmitted) {
        // Try to get submission data from localStorage
        const submissionDataKey = `submission_data_${user.email}`;
        const savedSubmissionData = localStorage.getItem(submissionDataKey);
        
        if (savedSubmissionData) {
          try {
            const parsedData = JSON.parse(savedSubmissionData);
            setUserSubmission(parsedData);
          } catch (error) {
            console.error('Error parsing submission data:', error);
          }
        }
      }
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
      <div className="max-w-6xl mx-auto space-y-8 px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
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
      <div className="max-w-6xl mx-auto space-y-8 px-6 py-12">
        <div className="bg-white border-lavender rounded-2xl p-8">
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
      <div className="max-w-6xl mx-auto space-y-8 px-6 py-12">
        <div className="bg-white border-lavender rounded-2xl p-8">
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
    <div className="max-w-6xl mx-auto space-y-8 px-6 py-12">
      <div className="bg-white border-lavender rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1A0C6D' }}>
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-medium text-black">{profile.name || profile.email.split('@')[0]}</h2>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Mail className="w-4 h-4" />
                <p className="text-sm font-light">{profile.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-4 py-2 font-black text-white rounded-lg transition-all"
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
        <h3 className="text-2xl font-medium text-black mb-6">Your Submissions</h3>
      </div>


      {userSubmission ? (
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background with gradient */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{ 
              background: 'linear-gradient(135deg, #1A0C6D 0%, #C0C0DC 50%, #C4DAFF 100%)' 
            }}
          ></div>
          
          {/* Main content */}
          <div className="relative bg-white border-2 rounded-2xl p-6 shadow-lg" style={{ borderColor: '#C0C0DC' }}>
            {/* Header with colored accent */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-8 rounded-full"
                  style={{ backgroundColor: '#1A0C6D' }}
                ></div>
                <h4 className="text-xl font-medium text-black">Your Yap Submission</h4>
              </div>
              <span 
                className="px-4 py-2 rounded-full text-xs font-medium text-white shadow-sm"
                style={{ backgroundColor: '#1A0C6D' }}
              >
                ✓ Submitted
              </span>
            </div>
            
            <div className="space-y-5">
              {/* Name */}
              <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: '#C4DAFF' }}>
                <div className="flex-shrink-0">
                  <User className="w-5 h-5 mt-0.5 text-black" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1 text-black">Name</p>
                  <p className="text-black font-light">{userSubmission.name}</p>
                </div>
              </div>
              
              {/* Wallet Address */}
              <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: '#C4DAFF'}}>
                <div className="flex-shrink-0">
                  <Wallet className="w-5 h-5 mt-0.5 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1 text-black">Wallet Address</p>
                  <p className="font-mono text-sm text-black break-all font-light">{userSubmission.wallet}</p>
                </div>
              </div>
              
              {/* Link */}
              <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: '#C4DAFF' }}>
                <div className="flex-shrink-0">
                  <ExternalLink className="w-5 h-5 mt-0.5 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1 text-black">Content Link</p>
                  <a 
                    href={userSubmission.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline break-all font-light hover:opacity-80 transition-opacity text-black"
                  >
                    {userSubmission.link}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-6 pt-4 border-t-2" style={{ borderColor: '#C0C0DC' }}>
              <p className="text-sm font-bold text-black">
                Submitted on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-lavender rounded-2xl p-12 text-center">
          <p className="text-gray-600 font-light">No submissions yet. Create your first submission!</p>
        </div>
      )}

      {/* Logout Button */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 bg-red-600 hover:bg-red-700"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
