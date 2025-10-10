import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProfilePage from './components/ProfilePage';
import LeaderboardPage from './components/LeaderboardPage';
import DashboardPage from './components/DashboardPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  // Block access to admin page completely
  if (location.pathname === '/admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Block access to profile page if not logged in
  if (!user && location.pathname === '/profile') {
    return <Navigate to="/dashboard" replace />;
  }

  // Get current page from pathname
  const getCurrentPage = (pathname: string): 'profile' | 'leaderboard' | 'dashboard' => {
    if (pathname === '/profile') return 'profile';
    if (pathname === '/leaderboard') return 'leaderboard';
    return 'dashboard';
  };

  const currentPage = getCurrentPage(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <Navigation currentPage={currentPage} />

        <main>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
