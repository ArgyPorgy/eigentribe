import { useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPage() {
  const { profile } = useAuth();
  
  // Check if user is admin
  const isAdmin = profile?.email === 'carghya10@gmail.com';
  
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">
              You don't have permission to access the admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    // Double-check admin status before upload
    if (!isAdmin) {
      setResult({ success: false, message: 'Access denied. Only admin users can upload CSV files.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-leaderboard`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ csvData: text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setResult({ success: true, message: data.message || 'Leaderboard updated successfully!' });
      setFile(null);

      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Failed to upload CSV' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-slate-400">Upload CSV to update leaderboard</p>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">CSV Format Requirements</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p>Your CSV file must have the following columns:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code className="text-blue-400">email</code> - User email address (required)</li>
              <li><code className="text-blue-400">name</code> - User name (optional)</li>
              <li><code className="text-blue-400">points</code> - Points earned (required, number)</li>
              <li><code className="text-blue-400">rank</code> - User rank (required, number)</li>
            </ul>
            <p className="mt-3 text-slate-400">Example:</p>
            <pre className="bg-slate-950 p-3 rounded-lg mt-2 text-xs overflow-x-auto">
              <code>email,name,points,rank{'\n'}user@example.com,John Doe,100,1{'\n'}another@example.com,Jane Smith,95,2</code>
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="csv-file"
              className="block text-sm font-medium text-slate-300 mb-3"
            >
              Select CSV File
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="csv-file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600 transition-all"
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-slate-400">
                Selected: <span className="text-white">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                result.success
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-red-500/10 border-red-500/50'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                {result.message}
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload & Update Leaderboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
