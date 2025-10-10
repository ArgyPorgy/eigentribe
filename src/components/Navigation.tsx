import { Link } from 'react-router-dom';
import { User, Trophy, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminCheck } from '../hooks/useAdminCheck';

interface NavigationProps {
  currentPage: 'profile' | 'leaderboard' | 'admin' | 'dashboard';
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { profile, signOut, signInWithGoogle, user } = useAuth();
  const { isAdmin } = useAdminCheck(profile?.email);
  

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-black">
              <img 
                src="https://pbs.twimg.com/profile_images/1967450224168943616/Za_8hiTn_400x400.jpg" 
                alt="EigenTribe" 
                className="w-12 h-12 rounded-lg"
              />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg font-light transition-all flex items-center gap-2 ${currentPage === 'profile' ? 'text-white' : 'text-gray-600 hover:text-black'}`}
                style={currentPage === 'profile' ? { backgroundColor: '#1A0C6D' } : {}}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>

              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg font-light transition-all flex items-center gap-2 ${currentPage === 'dashboard' ? 'text-white' : 'text-gray-600 hover:text-black'}`}
                style={currentPage === 'dashboard' ? { backgroundColor: '#1A0C6D' } : {}}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/leaderboard"
                className={`px-4 py-2 rounded-lg font-light transition-all flex items-center gap-2 ${currentPage === 'leaderboard' ? 'text-white' : 'text-gray-600 hover:text-black'}`}
                style={currentPage === 'leaderboard' ? { backgroundColor: '#1A0C6D' } : {}}
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg font-light transition-all flex items-center gap-2 ${currentPage === 'admin' ? 'text-white' : 'text-gray-600 hover:text-black'}`}
                  style={currentPage === 'admin' ? { backgroundColor: '#1A0C6D' } : {}}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}
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
