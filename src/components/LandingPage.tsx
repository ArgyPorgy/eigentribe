import { Rocket, Trophy, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzFmMjkzNyIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

      <div className="relative">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Rocket className="w-8 h-8" />
              <span className="text-2xl font-bold">ContribHub</span>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Track Your Contributions,
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Climb The Ranks
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Submit your work, showcase your wallet, and compete with others on the leaderboard.
              Join our community of contributors today.
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Rocket className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Submit Your Work</h3>
                <p className="text-slate-400">
                  Easily submit your contributions with your name, wallet address, and project link.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300">
                <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">View Your Profile</h3>
                <p className="text-slate-400">
                  Track all your submissions in one place and manage your contributor profile.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300">
                <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Trophy className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Climb The Leaderboard</h3>
                <p className="text-slate-400">
                  Compete with other contributors and see where you rank based on your points.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
