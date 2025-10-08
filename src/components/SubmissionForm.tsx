import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SubmissionFormProps {
  onSuccess: () => void;
}

export default function SubmissionForm({ onSuccess }: SubmissionFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    walletAddress: '',
    link: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: submitError } = await supabase.from('submissions').insert({
        user_id: user!.id,
        name: formData.name,
        wallet_address: formData.walletAddress,
        link: formData.link,
      });

      if (submitError) throw submitError;

      setFormData({ name: '', walletAddress: '', link: '' });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
          <Send className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">New Submission</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            Submission Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="My Awesome Project"
            required
          />
        </div>

        <div>
          <label htmlFor="wallet" className="block text-sm font-medium text-slate-300 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            id="wallet"
            value={formData.walletAddress}
            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-slate-300 mb-2">
            Project Link
          </label>
          <input
            type="url"
            id="link"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="https://..."
            required
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit
            </>
          )}
        </button>
      </form>
    </div>
  );
}
