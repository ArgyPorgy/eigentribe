import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Navigation from './components/Navigation';
import ProfilePage from './components/ProfilePage';
import LeaderboardPage from './components/LeaderboardPage';
import AdminPage from './components/AdminPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'profile' | 'leaderboard' | 'admin'>('profile');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzFmMjkzNyIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

      <div className="relative">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

        <main className="container mx-auto px-6 py-12">
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'leaderboard' && <LeaderboardPage />}
          {currentPage === 'admin' && <AdminPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
