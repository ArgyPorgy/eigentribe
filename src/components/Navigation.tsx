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
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-black">
              <img 
                src="https://pbs.twimg.com/profile_images/1967450224168943616/Za_8hiTn_400x400.jpg" 
                alt="EigenTribe" 
                className="w-12 h-12 rounded-lg border border-gray-300"
              />
            </div>

            <div className="hidden md:flex items-center gap-2">
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
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-light transition-all hover:bg-gray-100 text-gray-600 hover:text-black"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#1A0C6D' }}
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
