import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProfilePage from './components/ProfilePage';
import LeaderboardPage from './components/LeaderboardPage';
import AdminPage from './components/AdminPage';
import DashboardPage from './components/DashboardPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  // Check if user is admin
  const serviceEmail = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const isAdmin = profile?.email === serviceEmail;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative">
          <Navigation currentPage="dashboard" />

          <main>
            <DashboardPage />
          </main>
        </div>
      </div>
    );
  }

  // Redirect non-admin users away from admin page
  if (location.pathname === '/admin' && !isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  // Get current page from pathname
  const getCurrentPage = (pathname: string): 'profile' | 'leaderboard' | 'admin' | 'dashboard' => {
    if (pathname === '/profile') return 'profile';
    if (pathname === '/leaderboard') return 'leaderboard';
    if (pathname === '/admin') return 'admin';
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
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
