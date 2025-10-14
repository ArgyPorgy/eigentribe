import { useState, useEffect } from 'react';
import { Clock, Globe, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addSubmissionToSheet } from '../lib/googleSheets';

// Declare Turnstile on window
declare global {
  interface Window {
    turnstile?: any;
    onTurnstileSuccess?: (token: string) => void;
  }
}

// Event data matching the design
const eventData = {
  title: "Eigen Creator League",
  organization: "EigenTribe",
  status: "Ongoing",
  region: "Global",
  totalPrizes: "$10,000",
  endDate: new Date('2025-11-30'),
  campaignDuration: "October 15 – November 30, 2025",
  openTo: "All Creators",
  overview: "The Eigen Creator League is a 6-week content campaign designed to reward creators, storytellers, and educators who can articulate the Eigen narrative across Crypto Twitter and beyond. Over the next six weeks, you'll participate in bi-weekly themed challenges, share your take through content, and compete for rewards from a $10,000 pool distributed bi-weekly and at the campaign's end.",
  campaignStructure: "The campaign runs from October 15 to November 30, divided into three bi-weekly phases. Each phase focuses on a specific narrative from the Eigen ecosystem.",
  phases: [
    {
      phase: "Phase 1",
      dates: "Oct 15 – Oct 31",
      theme: "$EIGEN: The Infra Backbone of EigenCloud",
      reward: "$2,500",
      goal: "Explain how $EIGEN secures and powers EigenCloud as its shared security and infra backbone."
    },
    {
      phase: "Phase 2", 
      dates: "Nov 1 – Nov 15",
      theme: "The Big Tech Analogy: AWS → EigenCloud",
      reward: "$2,500",
      goal: "Compare EigenCloud to AWS/Google Cloud, showing how $EIGEN makes it verifiable, composable, and crypto-native."
    },
    {
      phase: "Phase 3",
      dates: "Nov 16 – Nov 30", 
      theme: "EigenAI: Verifiable AI for the Internet of Value",
      reward: "$2,500",
      goal: "Showcase how EigenAI enables deterministic, verifiable AI and integrates with EigenCompute for trustless inference"
    }
  ],
  finalBonus: "$2,500+",
  howItWorks: [
    "Create content around the active bi-weekly theme.",
    "Share your ideas through threads, videos, articles, memes/shitposts or visual explainers.",
    "Post your content on Twitter/X, tagging @EigenLayer and @eigentribe.",
    "Submit your entry using the official submission form.",
    "The EigenTribe team will review, track, and evaluate all submissions internally.",
    "Rewards will be distributed retroactively based on the overall quality, consistency, and real-world impact of your work.",
    "A public leaderboard will display active contributors and top creators throughout the season."
  ],
  themeDetails: [
    {
      title: "$EIGEN as EigenCloud's Infra Backbone",
      description: "Show how $EIGEN acts as a shared security layer alongside ETH in EigenCloud. Explain how it powers restaking, intersubjective forking, AVSs, and protocols, serving as the infrastructure backbone of the entire ecosystem.",
      formats: "Research-backed threads, explainers, visual dashboards.",
      idealFor: "Researchers, analytical creators, and early ecosystem contributors"
    },
    {
      title: "$EIGEN on the Big Tech Cloud Analogy", 
      description: "Position EigenCloud as the AWS or Google Cloud of Web3, powered by $EIGEN. Break down how EigenCloud is verifiable, programmable, and composable — unlike opaque, centralized Big Tech clouds.",
      formats: "Threads, short videos, meme explainers, data-backed comparisons.",
      idealFor: "General creators, educators, and storytellers."
    },
    {
      title: "EigenAI: Verifiable AI on EigenCloud",
      description: "Dive into EigenAI, an OpenAI-compatible, verifiable AI layer built on EigenCloud. Showcase how developers can retrofit existing AI workflows, verify outputs on-chain, and integrate EigenCompute for trustless inference.",
      formats: "Tutorials, walkthroughs, video explainers, mini-demos.",
      idealFor: "Devs, technical creators, and AI enthusiasts."
    }
  ],
  evaluationCriteria: [
    { category: "Quality & Clarity", weight: "35%", description: "Engaging, well-structured, accessible content that simplifies complexity." },
    { category: "Creativity", weight: "20%", description: "Hooks, storytelling, humor, or analogies that make content stand out." },
    { category: "Research Depth", weight: "25%", description: "Use of data, dashboards, or technical accuracy." },
    { category: "Engagement", weight: "10%", description: "Organic impressions and interactions (no boosted metrics)." },
    { category: "Coverage", weight: "10%", description: "How well it captures the entire narrative angle." }
  ],
  resources: [
    "📄 EIGEN: The Universal Intersubjective Work Token",
    "📄 EigenCloud: Build Powerful Crypto Apps on Any Chain with the Verifiable Cloud", 
    "📄 Delphi Digital report on EigenCloud",
    "🌐 Video Demo on how to deploy verifiable AI agent using EigenAI",
    "🌐 EigenCloud Dashboard",
    "📊 General Analytics on EIGEN",
    "📊 $EIGEN Usage in Protocols",
    "📖 How $EIGEN Powers the Verifiable Cloud",
    "📈 EigenEconomy",
    "🌐 EigenCloud AVS Ecosystem",
    "🌐 EigenCloud Apps Ecosystem",
    "🎨 EigenCloud Media Assets",
    "📣 EigenTribe Telegram (for questions and community chat)"
  ],
  terms: [
    "Participation is voluntary and open to all.",
    "Rewards are discretionary and based on retroactive evaluation.", 
    "Artificial engagement, plagiarism, or misinformation will result in disqualification.",
    "The organizing team reserves the right to adjust distribution and eligibility at its discretion."
  ],
  requirements: [
    "Create content around the active bi-weekly theme",
    "Post your content on Twitter/X, tagging @EigenLayer and @eigentribe",
    "Submit your entry using the official submission form"
  ],
  rewards: {
    description: "The entire campaign rewards are distributed as follows:",
    prizes: [
      "Phase 1: $2,500",
      "Phase 2: $2,500", 
      "Phase 3: $2,500"
    ],
    split: "Any unused pool from a phase will roll into the Final Leaderboard Bonus Pool.",
    note: "Final Leaderboard Bonus Pool ($2,500+) awarded to the Top overall creators at the end of the campaign."
  },
  skills: ["Content Creation", "Social Media", "Research", "Education"]
};

export default function DashboardPage() {
  const { user, signInWithGoogle } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    link?: string;
    contentTags?: string;
  }>({});
  const [formData, setFormData] = useState({
    name: '',
    walletAddress: '',
    link: '',
    contentTags: [] as string[]
  });

  // Load saved name and wallet address for the user
  useEffect(() => {
    if (user?.email) {
      const userInfoKey = `user_info_${user.email}`;
      const savedInfo = localStorage.getItem(userInfoKey);
      
      if (savedInfo) {
        try {
          const { name, walletAddress } = JSON.parse(savedInfo);
          setFormData(prev => ({
            ...prev,
            name: name || '',
            walletAddress: walletAddress || ''
          }));
        } catch (error) {
          console.error('Error loading saved user info:', error);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setShowOpportunityModal(true);
    }
  }, [user]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = eventData.endDate.getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}d:${hours}h:${minutes}m:${seconds}s`);
      } else {
        setTimeRemaining('0d:0h:0m:0s');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    console.log('Submit clicked, formData:', formData);
    
    // Ensure user is logged in
    if (!user) {
      console.log('User not logged in');
      setShowLoginModal(true);
      return;
    }

    // Check if Turnstile is verified
    if (!turnstileToken) {
      console.log('Turnstile not verified');
      setErrorMessage('Please complete the verification challenge.');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    // Validate name (text only, no numbers)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.name.trim())) {
      console.log('Name validation failed:', formData.name);
      setValidationErrors({ name: 'Name must contain only letters and spaces.' });
      setErrorMessage('Name must contain only letters and spaces.');
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    // Validate link (must be a valid URL)
    const urlRegex = /^(https?:\/\/)?([\da-zA-Z\.-]+)\.([a-zA-Z\.]{2,})([\/\w \.\-\?=&%#]*)*\/?$/i;
    if (!urlRegex.test(formData.link.trim())) {
      console.log('Link validation failed:', formData.link);
      setValidationErrors({ link: 'Please enter a valid URL for the link.' });
      setErrorMessage('Please enter a valid URL for the link.');
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    console.log('All validations passed, proceeding to submit');

    // Check if at least one content tag is selected
    if (formData.contentTags.length === 0) {
      setValidationErrors({ contentTags: 'Please select at least one content tag.' });
      setErrorMessage('Please select at least one content tag.');
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    // Clear validation errors if all validations pass
    setValidationErrors({});

    // Check if all required fields are filled
    if (formData.name.trim() && formData.walletAddress.trim() && formData.link.trim() && formData.contentTags.length > 0) {
      console.log('Submitting:', formData);
      
      try {
        const result = await addSubmissionToSheet({
          name: formData.name.trim(),
          wallet: formData.walletAddress.trim(),
          link: formData.link.trim(),
          email: user.email,
          contentTags: formData.contentTags
        });

        if (result.success) {
          // Save submission to localStorage for profile display
          if (user?.email) {
            const submissionsKey = `submissions_${user.email}`;
            const existingSubmissions = JSON.parse(localStorage.getItem(submissionsKey) || '[]');
            
            const newSubmission = {
              id: Date.now().toString(),
              name: formData.name.trim(),
              wallet: formData.walletAddress.trim(),
              link: formData.link.trim(),
              email: user.email,
              contentTags: formData.contentTags,
              timestamp: new Date().toISOString(),
              date: new Date().toLocaleDateString()
            };
            
            existingSubmissions.push(newSubmission);
            localStorage.setItem(submissionsKey, JSON.stringify(existingSubmissions));

            // Save name and wallet address for future submissions
            const userInfoKey = `user_info_${user.email}`;
            localStorage.setItem(userInfoKey, JSON.stringify({
              name: formData.name.trim(),
              walletAddress: formData.walletAddress.trim()
            }));
          }
          
          setErrorMessage('Submission successful! Your entry has been recorded.');
          setShowErrorModal(true);
          setShowModal(false);
          setIsSubmitting(false);
          // Only clear the link and tags, keep name and wallet address
          setFormData(prev => ({ ...prev, link: '', contentTags: [] }));
          // Reset Turnstile
          setTurnstileToken(null);
          if (window.turnstile && turnstileWidgetId) {
            window.turnstile.reset(turnstileWidgetId);
          }
        } else {
          // Show the error message from the API (including rate limit messages)
          setErrorMessage(result.error || 'Submission failed. Please try again or contact support.');
          setShowErrorModal(true);
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Submission error:', error);
        setErrorMessage('An error occurred during submission. Please try again.');
        setShowErrorModal(true);
        setIsSubmitting(false);
      }
    } else {
      setErrorMessage('Please fill in all required fields and select at least one content tag.');
      setShowErrorModal(true);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      contentTags: prev.contentTags.includes(tag)
        ? prev.contentTags.filter(t => t !== tag)
        : [...prev.contentTags, tag]
    }));
    
    // Clear content tags validation error when user selects a tag
    if (validationErrors.contentTags) {
      setValidationErrors(prev => ({
        ...prev,
        contentTags: undefined
      }));
    }
  };


  // Render Turnstile when modal opens
  useEffect(() => {
    if (!showModal) return;

    const renderTurnstile = () => {
      const container = document.getElementById('turnstile-container');
      
      if (!container) {
        console.log('Turnstile container not found');
        return;
      }

      if (container.hasChildNodes()) {
        console.log('Turnstile already rendered');
        return;
      }

      if (!window.turnstile) {
        console.log('Turnstile not loaded yet, retrying...');
        setTimeout(renderTurnstile, 200);
        return;
      }

      if (!window.turnstile.render) {
        console.log('Turnstile.render not available, retrying...');
        setTimeout(renderTurnstile, 200);
        return;
      }

      try {
        console.log('Rendering Turnstile with site key:', import.meta.env.VITE_TURNSTILE_SITE_KEY);
        const widgetId = window.turnstile.render('#turnstile-container', {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            console.log('Turnstile verification successful, token received');
            setTurnstileToken(token);
          },
          theme: 'light'
        });
        setTurnstileWidgetId(widgetId);
        console.log('Turnstile rendered successfully, widget ID:', widgetId);
      } catch (error) {
        console.error('Turnstile render error:', error);
      }
    };

    // Start rendering after a short delay to ensure DOM is ready
    setTimeout(renderTurnstile, 200);
  }, [showModal]);

  const handleGetStarted = async () => {
    try {
      await signInWithGoogle();
      setShowOpportunityModal(false);
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative border-b border-gray-200">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/Egbg.png)',
            zIndex: 1
          }}
        ></div>
        
        <div 
          className="absolute inset-0 bg-black"
          style={{ 
            opacity: 0.4,
            zIndex: 2
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12" style={{ zIndex: 10 }}>
          <div className="flex items-center justify-center gap-8">
            <div className="w-20 h-20 flex items-center justify-center">
              <img 
                src="https://pbs.twimg.com/profile_images/1967450224168943616/Za_8hiTn_400x400.jpg" 
                alt="Logo" 
                className="w-16 h-16 rounded-lg"
                style={{ border: '1px solid #C0C0DC' }}
              />
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-medium mb-3 text-white drop-shadow-lg">{eventData.title}</h1>
              <div className="flex items-center justify-center gap-6 text-sm font-light mb-2">
                <span className="text-gray-200 drop-shadow-md">by {eventData.organization}</span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse bg-green-400"></div>
                  <span className="text-green-300 drop-shadow-md">{eventData.status}</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-200" />
                  <span className="text-gray-200 drop-shadow-md">{eventData.region}</span>
                </div>
              </div>
              <div className="text-sm font-light text-gray-200 drop-shadow-md">
                {eventData.campaignDuration}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container - MODIFIED FOR STICKY SIDEBAR */}
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - STICKY */}
        <aside className="w-80 border-r border-gray-200 bg-white sticky top-0 self-start h-screen overflow-y-auto">
          {/* Section Header */}
          <div className="border-b border-gray-200 py-6 pl-4 pr-6">
            <h2 className="text-xl font-medium border-b-2 pb-2 inline-block text-black" style={{ borderColor: '#1A0C6D' }}>
              Prizes & Submission
            </h2>
          </div>
          
          <div className="py-4 pl-4 pr-4">
            {/* Total Prizes */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#818BFF' }}>
                <img 
                  src="https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png" 
                  alt="EIGEN" 
                  className="w-6 h-6"
                />
              </div>
              <span className="text-lg font-light text-black">
                {eventData.totalPrizes} Total Prizes
              </span>
            </div>

            {/* Active Time Remaining */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#818BFF' }}>
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="font-mono text-lg font-light text-black">
                {timeRemaining} Remaining
              </span>
            </div>

            {/* Submission Button */}
            <div className="mb-8">
              <button
                onClick={() => {
                  if (!user) {
                    setShowLoginModal(true);
                    return;
                  }
                  setShowModal(true);
                }}
                className="w-full px-6 py-4 font-black rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-white hover:opacity-90"
                style={{ backgroundColor: '#1A0C6D' }}
              >
                Submit my Yap
              </button>
            </div>

            {/* Skills Needed */}
            <div className="mb-8">
              <h3 className="text-sm font-light mb-4 text-gray-600">SKILLS NEEDED</h3>
              <div className="flex flex-wrap gap-2">
                {eventData.skills.map((skill, index) => (
                  <span key={index} className="px-4 py-2 rounded-full text-sm font-light transition-all duration-300 hover:scale-105 text-black border border-gray-300" style={{ backgroundColor: '#B7C0E9' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-light mb-3 text-gray-600">CONTACT</h3>
              <p className="text-sm leading-relaxed font-light text-gray-600">
  <a
    href="https://t.me/Sambhav455"
    target="_blank"
    rel="noopener noreferrer"
    className="underline hover:opacity-80 transition-opacity"
  >
    Reach out
  </a>{' '}
  if you have any questions about this listing
</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area - SCROLLABLE */}
        <main className="flex-1 bg-white">
          {/* Section Header */}
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-medium border-b-2 pb-2 inline-block text-black" style={{ borderColor: '#1A0C6D' }}>
              Details
            </h2>
          </div>

          <div className="p-6">
            {/* Campaign Info */}
            <div className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-lg font-medium mb-2 text-black">Campaign Duration</h3>
                  <p className="font-light text-gray-700">{eventData.campaignDuration}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-lg font-medium mb-2 text-black">Total Reward Pool</h3>
                  <p className="font-light text-gray-700">{eventData.totalPrizes}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-lg font-medium mb-2 text-black">Open to</h3>
                  <p className="font-light text-gray-700">{eventData.openTo}</p>
                </div>
              </div>
            </div>

            {/* Overview Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-medium mb-6 text-black">Overview</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <p className="leading-relaxed text-lg font-light text-gray-700 mb-4">
                  {eventData.overview}
                </p>
              </div>
            </div>

            {/* Campaign Structure */}
            <div className="mb-10">
              <h2 className="text-2xl font-medium mb-6 text-black">Campaign Structure</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                <p className="leading-relaxed text-lg font-light text-gray-700">
                  {eventData.campaignStructure}
                </p>
              </div>
              
              <div className="space-y-4">
                {eventData.phases.map((phase, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-medium text-black mb-2">{phase.phase}</h3>
                        <p className="font-light text-gray-600 mb-2">{phase.dates}</p>
                        <p className="font-light text-gray-700">{phase.theme}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-black">{phase.reward}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-black mb-2">Goals:</h4>
                      <p className="font-light text-gray-700">{phase.goal}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-2 text-black">Final Leaderboard Bonus Pool</h3>
                <p className="font-light text-gray-700">{eventData.finalBonus} awarded to the Top overall creators at the end of the campaign.</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-10">
              <h2 className="text-2xl font-medium mb-6 text-black">How It Works</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <ul className="space-y-4">
                  {eventData.howItWorks.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0 shadow-sm" style={{ backgroundColor: '#818BFF' }}>
                        <span className="text-sm font-black text-white">{index + 1}</span>
                      </div>
                      <span className="text-lg leading-relaxed font-light text-gray-700">
                        {step}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Theme Details */}
            <div className="mb-10">
              <h2 className="text-2xl font-medium mb-6 text-black">Theme Details</h2>
              <div className="space-y-6">
                {eventData.themeDetails.map((theme, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-xl font-medium text-black mb-4">{theme.title}</h3>
                    <p className="font-light text-gray-700 mb-4">{theme.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-black mb-2">Suggested Formats:</h4>
                        <p className="font-light text-gray-700">{theme.formats}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-black mb-2">Ideal for:</h4>
                        <p className="font-light text-gray-700">{theme.idealFor}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluation Criteria */}
            <div className="mb-10">
              <h2 className="text-2xl font-medium mb-6 text-black">Evaluation Criteria</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="space-y-6">
                  {eventData.evaluationCriteria.map((criteria, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-black mb-2">{criteria.category}</h3>
                          <p className="font-light text-gray-700">{criteria.description}</p>
                        </div>
                        <div className="ml-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#B7C0E9', color: '#000' }}>{criteria.weight}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="mb-10">
              <h2 className="text-2xl font-medium mb-6 text-black">Resources</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <p className="font-light text-gray-700 mb-6 text-lg">You can use the following to learn, research, and create:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eventData.resources.map((resource, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-all duration-300">
                      <span className="font-light text-gray-700">{resource}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-10">
              <h2 className="text-2xl font-medium mb-6 text-black">Terms</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <ul className="space-y-4">
                  {eventData.terms.map((term, index) => (
                    <li key={index} className="flex items-start gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <span className="mt-1 font-bold text-lg" style={{ color: '#818BFF' }}>•</span>
                      <span className="font-light text-gray-700 text-lg">{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Submission Requirements */}
            <div className="mb-10">
              <h2 className="text-2xl font-medium mb-6 text-black">Submission Requirements</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <ul className="space-y-4">
                  {eventData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0 shadow-sm" style={{ backgroundColor: '#818BFF' }}>
                        <span className="text-sm font-black text-white">{index + 1}</span>
                      </div>
                      <span className="text-lg leading-relaxed font-light text-gray-700">
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Rewards Section */}
            <div>
              <h2 className="text-2xl font-medium mb-6 text-black">Rewards</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                <p className="text-lg font-light text-gray-700">
                  {eventData.rewards.description}
                </p>
              </div>
              
              <div className="space-y-4 mb-8">
                {eventData.rewards.prizes.map((prize, index) => (
                  <div key={index} className="flex items-center gap-4 p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black shadow-sm" style={{
                      backgroundColor: index === 0 ? '#818BFF' : '#B7C0E9',
                      color: '#000000'
                    }}>
                      {index + 1}
                    </div>
                    <span className="text-lg font-light text-black">{prize}</span>
                  </div>
                ))}
              </div>

              <div className="p-8 rounded-xl mb-6 bg-white border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-black mb-4">Important Notes</h3>
                <p className="text-lg leading-relaxed mb-4 font-light text-gray-700">
                  {eventData.rewards.split}
                </p>
                <p className="text-lg leading-relaxed font-light text-gray-700">
                  {eventData.rewards.note}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h3 className="text-2xl font-medium mb-6 text-black">Submit Your Post</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 rounded-xl text-sm font-light bg-white border text-black placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    validationErrors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-600'
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">Wallet Address *</label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your wallet address"
                  className="w-full px-4 py-3 rounded-xl text-sm font-light bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">Link *</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="Submit link of your X's post"
                  className={`w-full px-4 py-3 rounded-xl text-sm font-light bg-white border text-black placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    validationErrors.link 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-600'
                  }`}
                />
                {validationErrors.link && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.link}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">Content Tags (Select at least one) *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Video (more than 1 min)', 'Short', 'Twitter article', 'Thread', 'Post', 'Reply/Comment'].map((tag) => (
                    <label 
                      key={tag}
                      className="flex items-center gap-2 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-all duration-300"
                      style={{
                        backgroundColor: formData.contentTags.includes(tag) ? '#B7C0E9' : 'white',
                        borderColor: formData.contentTags.includes(tag) ? '#1A0C6D' : '#d1d5db'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.contentTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-600"
                        style={{ accentColor: '#1A0C6D' }}
                      />
                      <span className="text-sm font-light text-black">{tag}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.contentTags && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.contentTags}</p>
                )}
              </div>

              {/* Cloudflare Turnstile */}
              <div className="flex justify-center">
                <div id="turnstile-container"></div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTurnstileToken(null);
                  setValidationErrors({});
                  if (window.turnstile && turnstileWidgetId) {
                    window.turnstile.reset(turnstileWidgetId);
                  }
                }}
                className="flex-1 px-4 py-3 font-light rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 font-black rounded-xl transition-all duration-300 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1A0C6D' }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Modal */}
      {showOpportunityModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowOpportunityModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md mx-auto border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h2 className="text-lg font-medium text-black">Live Opportunities</h2>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-black mb-2">$10,000</div>
              <p className="text-lg font-light text-gray-700 mb-4">Get access to opportunities worth $10k!</p>
              <p className="text-sm font-light text-gray-600">Take part in the Eigen Creator League and win rewards!</p>
            </div>

            <button
              onClick={handleGetStarted}
              className="w-full px-6 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: '#1A0C6D' }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#1A0C6D' }}
              >
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-medium text-black mb-2">Login Required</h2>
              <p className="text-gray-600 font-light">
                You need to be logged in to submit your Yap entry.
              </p>
            </div>

            {/* Content */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#C4DAFF' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1A0C6D' }}>
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="text-black font-light">Sign in with your Google account</p>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#C0C0DC' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1A0C6D' }}>
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="text-black font-light">Fill out your submission details</p>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#C4DAFF' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1A0C6D' }}>
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="text-black font-light">Submit your Yap and get rewarded!</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-3 font-light rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLoginModal(false);
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    console.error('Failed to sign in:', error);
                  }
                }}
                className="flex-1 px-4 py-3 font-medium rounded-xl transition-all duration-300 text-white hover:opacity-90"
                style={{ backgroundColor: '#1A0C6D' }}
              >
                Sign In with Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <p className="text-lg font-light text-black text-center mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-4 py-3 font-medium rounded-xl transition-all duration-300 text-white hover:opacity-90"
              style={{ backgroundColor: '#1A0C6D' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
