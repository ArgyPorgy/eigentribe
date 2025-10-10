import { useState, useEffect } from 'react';
import { User, Wallet, ExternalLink, Calendar, Loader2, Mail } from 'lucide-react';
import { supabase, Submission } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { profile, refreshProfile, user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    walletAddress: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('ProfilePage - user:', user);
  console.log('ProfilePage - profile:', profile);
  console.log('ProfilePage - authLoading:', authLoading);

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


      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white border-lavender rounded-2xl p-12 text-center">
          <p className="text-gray-600 font-light">No submissions yet. Create your first submission!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white border-lavender rounded-2xl p-6 hover:border-blue-600 transition-all"
            >
              <h4 className="text-xl font-medium text-black mb-3">{submission.name}</h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono text-xs truncate font-light">{submission.wallet_address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-light">{formatDate(submission.created_at)}</span>
                </div>
              </div>
              <a
                href={submission.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-light transition-colors"
                style={{ color: '#1A0C6D' }}
              >
                <span>View Project</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
