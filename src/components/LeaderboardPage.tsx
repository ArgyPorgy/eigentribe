import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { supabase, LeaderboardEntry } from '../lib/supabase';

// Placeholder data
const placeholderEntries = [
  { id: '1', rank: 1, user_name: 'Arghya', points: 2500 },
  { id: '2', rank: 2, user_name: 'Sambhav', points: 2100 },
  { id: '3', rank: 3, user_name: 'Parth', points: 1850 },
  { id: '4', rank: 4, user_name: 'Satyaki', points: 1600 }
];

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
      
      // Use placeholder data if database is empty
      setEntries(data && data.length > 0 ? data : placeholderEntries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Fallback to placeholder data on error
      setEntries(placeholderEntries);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <img 
            src="https://img.kaito.ai/v1/https%253A%252F%252Fkaito-public-assets.s3.us-west-2.amazonaws.com%252Fyapper%252Ficon%252F1st-icon.svg/w=96&q=90"
            alt="1st Place"
            className="w-12 h-12"
          />
        );
      case 2:
        return (
          <img 
            src="https://img.kaito.ai/v1/https%253A%252F%252Fkaito-public-assets.s3.us-west-2.amazonaws.com%252Fyapper%252Ficon%252F2nd-icon.svg/w=96&q=90"
            alt="2nd Place"
            className="w-12 h-12"
          />
        );
      case 3:
        return (
          <img 
            src="https://img.kaito.ai/v1/https%253A%252F%252Fkaito-public-assets.s3.us-west-2.amazonaws.com%252Fyapper%252Ficon%252F3rd-icon.svg/w=96&q=90"
            alt="3rd Place"
            className="w-12 h-12"
          />
        );
      default:
        return (
          <div className="text-2xl font-medium" style={{ color: '#1A0C6D' }}>
            {rank}.
          </div>
        );
    }
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'linear-gradient(135deg, #1A0C6D 0%, #4A3BA8 100%)';
      case 2:
        return 'linear-gradient(135deg, #4A3BA8 0%, #6B5BBD 100%)';
      case 3:
        return 'linear-gradient(135deg, #6B5BBD 0%, #8B7BD3 100%)';
      default:
        return 'linear-gradient(135deg, #C0C0DC 0%, #E0E0F0 100%)';
    }
  };

  const getTextColor = (rank: number) => {
    return rank <= 3 ? '#ffffff' : '#1A0C6D';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 px-6">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#1A0C6D' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #1A0C6D 0%, #4A3BA8 100%)' }}
          >
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-medium text-black mb-3">Leaderboard</h1>
          <p className="text-gray-600 font-light">Top contributors ranked by points</p>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-gray-600 font-light">No leaderboard data yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  background: getRankGradient(entry.rank)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className={`flex items-center ${entry.rank <= 3 ? 'gap-6' : 'gap-8'}`}>
                    {/* Rank Icon */}
                    <div className="flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    {/* Name */}
                    <div>
                      <h3 
                        className="text-2xl font-medium"
                        style={{ color: getTextColor(entry.rank) }}
                      >
                        {entry.user_name || 'Anonymous'}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Points */}
                  <div className="text-right">
                    <div 
                      className="text-3xl font-bold"
                      style={{ color: getTextColor(entry.rank) }}
                    >
                      {entry.points.toLocaleString()}
                    </div>
                    <div 
                      className="text-sm font-light"
                      style={{ color: entry.rank <= 3 ? 'rgba(255,255,255,0.7)' : '#666' }}
                    >
                      points
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
