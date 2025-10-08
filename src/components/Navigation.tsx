import { Rocket, User, Trophy, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: 'profile' | 'leaderboard' | 'admin';
  onPageChange: (page: 'profile' | 'leaderboard' | 'admin') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-white">
              <Rocket className="w-6 h-6" />
              <span className="text-xl font-bold">ContribHub</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => onPageChange('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  currentPage === 'profile'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>

              <button
                onClick={() => onPageChange('leaderboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  currentPage === 'leaderboard'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </button>

              <button
                onClick={() => onPageChange('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  currentPage === 'admin'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">{profile?.name || 'Anonymous'}</p>
              <p className="text-xs text-slate-400">{profile?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
