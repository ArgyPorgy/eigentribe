import { X, MessageCircle, Camera, Star, Image } from 'lucide-react';
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Blurry background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-50"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzBmMTcyNCIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30 blur-sm"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-teal-600 mb-4">Lets Vibe</h1>
          </div>

          {/* Yap to Earn Card */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            {/* Header */}
            <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-white font-bold text-lg">Yap to Earn</span>
            </div>

            {/* Content */}
            <div className="bg-gray-800 p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">Earn by driving attention</h2>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Earn more as You Yap</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Earn additional $Kaito for driving attention</span>
                </li>
              </ul>

              {/* Call to Action Button */}
              <button
                onClick={handleGoogleSignIn}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                Let's Yap
                <span className="text-lg">&gt;</span>
              </button>

              {/* 3D Illustration */}
              <div className="absolute bottom-4 right-4">
                <div className="relative">
                  {/* Purple figure with VR headset */}
                  <div className="w-16 h-16 bg-purple-500 rounded-full relative">
                    {/* VR headset */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-700 rounded-lg"></div>
                    {/* Controllers */}
                    <div className="absolute -right-2 top-2 w-4 h-8 bg-gray-600 rounded-lg"></div>
                    <div className="absolute -left-2 top-2 w-4 h-8 bg-gray-600 rounded-lg"></div>
                  </div>
                  
                  {/* Floating app icons */}
                  <div className="absolute -top-8 -left-4">
                    <Camera className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="absolute -top-6 -right-6">
                    <MessageCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="absolute top-2 -left-8">
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="absolute top-0 -right-8">
                    <Image className="w-4 h-4 text-purple-400" />
                  </div>
                  
                  {/* Dashed connection lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#4F46E5" strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>
                    <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#10B981" strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>
                    <line x1="50%" y1="50%" x2="10%" y2="60%" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>
                    <line x1="50%" y1="50%" x2="90%" y2="50%" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
