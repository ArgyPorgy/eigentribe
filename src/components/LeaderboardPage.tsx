import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { supabase, LeaderboardEntry } from '../lib/supabase';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-slate-400 font-bold">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2:
        return 'from-slate-500/20 to-slate-600/20 border-slate-500/50';
      case 3:
        return 'from-amber-500/20 to-amber-600/20 border-amber-500/50';
      default:
        return 'from-slate-800/50 to-slate-800/50 border-slate-700/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Leaderboard</h1>
        <p className="text-slate-400">Top contributors ranked by points</p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
          <p className="text-slate-400">No leaderboard data yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`bg-gradient-to-r ${getRankColor(
                entry.rank
              )} backdrop-blur-sm rounded-2xl p-6 border transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {entry.user_name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-slate-400">{entry.user_email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{entry.points}</div>
                  <div className="text-sm text-slate-400">points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
