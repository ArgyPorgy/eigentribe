import { Link, useNavigate } from 'react-router-dom';
import { User, Trophy, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: 'profile' | 'leaderboard' | 'dashboard';
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { profile, signOut, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to home after sign out
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
      // Still redirect even if sign out fails
      navigate('/');
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
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 lg:gap-8 flex-1">
            <Link to="/dashboard" className="flex items-center gap-2 text-black cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
              <img 
                src="https://pbs.twimg.com/profile_images/1967450224168943616/Za_8hiTn_400x400.jpg" 
                alt="EigenTribe" 
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg border border-gray-300"
              />
            </Link>

            <div className="flex items-center gap-1 lg:gap-2">
              <Link
                to="/dashboard"
                className={`px-2 py-1.5 lg:px-4 lg:py-2 rounded-lg font-light transition-all flex items-center gap-1 lg:gap-2 text-xs lg:text-base ${currentPage === 'dashboard' ? 'text-white' : 'text-gray-600 hover:text-black'}`}
                style={currentPage === 'dashboard' ? { backgroundColor: '#1A0C6D' } : {}}
              >
                <LayoutDashboard className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/leaderboard"
                className={`px-2 py-1.5 lg:px-4 lg:py-2 rounded-lg font-light transition-all flex items-center gap-1 lg:gap-2 text-xs lg:text-base ${currentPage === 'leaderboard' ? 'text-white' : 'text-gray-600 hover:text-black'}`}
                style={currentPage === 'leaderboard' ? { backgroundColor: '#1A0C6D' } : {}}
              >
                <Trophy className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-1 lg:gap-2 px-2 py-1.5 lg:px-4 lg:py-2 rounded-lg font-light transition-all hover:bg-gray-100 text-gray-600 hover:text-black text-xs lg:text-base"
              >
                <User className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 text-xs lg:text-base whitespace-nowrap"
                style={{ backgroundColor: '#1A0C6D' }}
              >
                <span className="hidden sm:inline">Login / Sign Up</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
