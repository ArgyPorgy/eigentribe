import { Github, Twitter, Mail, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between">
          {/* Left Side - Logo and Description */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EL</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EigenTribe</span>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Discover high paying EigenLayer bounties, projects and grants from the best companies in one place and apply to them using a single profile.
            </p>
            <div className="flex items-center gap-4 mb-6">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
              <div className="text-xs text-gray-500">
                <div>POWERED BY</div>
                <div className="font-bold text-gray-700">EIGENLAYER</div>
              </div>
            </div>
          </div>

          {/* Right Side - Navigation Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">OPPORTUNITIES</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Bounties</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Projects</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Grants</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">CATEGORIES</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Protocol Design</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Development</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Research</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">ABOUT</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Changelog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © 2025 EigenTribe. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">REGION</span>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                <Globe className="w-4 h-4" />
                Global
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
