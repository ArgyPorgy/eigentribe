import { useState, useEffect } from 'react';
import { User, Wallet, ExternalLink, Calendar, Loader2, Mail } from 'lucide-react';
import { supabase, Submission } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SubmissionForm from './SubmissionForm';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    walletAddress: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        walletAddress: profile.wallet_address || '',
      });
      loadSubmissions();
    }
  }, [profile]);

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

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || profile.email}
                className="w-20 h-20 rounded-xl object-cover border-2 border-blue-500/50"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.name || profile.email.split('@')[0]}</h2>
              <div className="flex items-center gap-2 text-slate-400 mt-1">
                <Mail className="w-4 h-4" />
                <p className="text-sm">{profile.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
          >
            {editingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editingProfile ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your display name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={profileData.walletAddress}
                onChange={(e) => setProfileData({ ...profileData, walletAddress: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-slate-900/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
                <p className="text-slate-200">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Member Since</p>
                <p className="text-slate-200">{formatDate(profile.created_at)}</p>
              </div>
            </div>
            {profile.wallet_address && (
              <div className="flex items-start gap-3 md:col-span-2">
                <Wallet className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Wallet Address</p>
                  <p className="font-mono text-sm text-slate-200 break-all">{profile.wallet_address}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Your Submissions</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
        >
          {showForm ? 'Hide Form' : 'New Submission'}
        </button>
      </div>

      {showForm && (
        <SubmissionForm
          onSuccess={() => {
            setShowForm(false);
            loadSubmissions();
          }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
          <p className="text-slate-400">No submissions yet. Create your first submission!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all"
            >
              <h4 className="text-xl font-semibold text-white mb-3">{submission.name}</h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono text-xs truncate">{submission.wallet_address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(submission.created_at)}</span>
                </div>
              </div>
              <a
                href={submission.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
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
