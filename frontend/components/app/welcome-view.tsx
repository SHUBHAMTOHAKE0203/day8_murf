import { Button } from '@/components/livekit/button';

function SDRIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-6"
    >
      <defs>
        <linearGradient id="nexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#ff8c42" />
        </linearGradient>
      </defs>
      
      {/* Background circle with glow */}
      <circle cx="40" cy="40" r="38" fill="url(#nexGradient)" opacity="0.1" />
      <circle cx="40" cy="40" r="32" fill="url(#nexGradient)" opacity="0.15" />
      
      {/* Headset arc */}
      <path
        d="M25 35C25 26.7 31.7 20 40 20C48.3 20 55 26.7 55 35V42H52V35C52 28.4 46.6 23 40 23C33.4 23 28 28.4 28 35V42H25V35Z"
        fill="url(#nexGradient)"
      />
      
      {/* Left earpiece */}
      <rect x="22" y="40" width="6" height="14" rx="3" fill="url(#nexGradient)" />
      <rect x="23.5" y="42" width="3" height="3" rx="1.5" fill="white" opacity="0.4" />
      
      {/* Right earpiece */}
      <rect x="52" y="40" width="6" height="14" rx="3" fill="url(#nexGradient)" />
      <rect x="53.5" y="42" width="3" height="3" rx="1.5" fill="white" opacity="0.4" />
      
      {/* Microphone boom */}
      <path
        d="M52 47L58 50L58 54C58 56 56.5 57 55 57L40 57"
        stroke="url(#nexGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Microphone */}
      <circle cx="40" cy="57" r="4" fill="url(#nexGradient)" />
      <circle cx="40" cy="57" r="2" fill="white" opacity="0.6" />
      
      {/* Sound waves */}
      <path
        d="M15 35C15 35 12 38 12 40C12 42 15 45 15 45"
        stroke="url(#nexGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M65 35C65 35 68 38 68 40C68 42 65 45 65 45"
        stroke="url(#nexGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group relative flex items-start gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900/80 transition-all duration-300">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-base mb-1.5">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="min-h-screen bg-black flex items-center justify-center p-4">
      <section className="max-w-5xl w-full">
        {/* Header Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-gray-300 text-sm font-semibold">
            <svg className="w-4 h-4 text-orange-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="4" />
            </svg>
            <span>Murf AI Voice Agents Challenge</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-10">
          <div className="flex justify-center">
            <SDRIcon />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mt-2">
              Business
            </span>
          </h1>
          
          <p className="text-2xl text-white font-semibold mb-3">
            with AI Automation
          </p>
          
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-lg">
            Build intelligent workflows that run 24/7. Automate customer support and operations 
            with our advanced AI voice platform.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-10 max-w-4xl mx-auto">
          <FeatureCard
            icon=":"
            title="Smart Q&A"
            description="Get instant answers about products, features, and pricing from our comprehensive knowledge base"
          />
          <FeatureCard
            icon=":"
            title="Natural Conversations"
            description="Speak naturally with our AI agent - no scripts, no menus, just smooth dialogue"
          />
          <FeatureCard
            icon=":"
            title="Lead Capture"
            description="Automatically collect and qualify lead information during your conversation"
          />
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-10">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={onStartCall}
            className="w-full md:w-auto px-12 h-16 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center justify-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9v5c0 .55-.45 1-1 1s-1-.45-1-1V9c0-4.97 4.03-9 9-9s9 4.03 9 9v5c0 .55-.45 1-1 1s-1-.45-1-1V9c0-3.87-3.13-7-7-7z"/>
                <path d="M12 15c-1.66 0-3-1.34-3-3V8c0-1.66 1.34-3 3-3s3 1.34 3 3v4c0 1.66-1.34 3-3 3z"/>
                <path d="M12 17c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/>
                <path d="M11 19h2v3h-2z"/>
                <path d="M8 22h8v2H8z"/>
              </svg>
              {startButtonText}
            </span>
          </Button>
        </div>

        {/* How It Works */}
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-8 border border-zinc-800 max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl"></span>
            How It Works
          </h2>
          <ol className="space-y-4 text-base text-gray-300">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-orange-500/20">1</span>
              <span className="pt-0.5"><strong className="text-white">Start the conversation</strong> - Click the button above to connect with our AI SDR agent</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-orange-500/20">2</span>
              <span className="pt-0.5"><strong className="text-white">Ask your questions</strong> - Inquire about products, features, pricing, or use cases</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-orange-500/20">3</span>
              <span className="pt-0.5"><strong className="text-white">Share your details</strong> - Provide your information to receive personalized follow-up</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-orange-500/20">4</span>
              <span className="pt-0.5"><strong className="text-white">Get your summary</strong> - Receive a complete recap of your conversation and next steps</span>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-400 font-medium">
            Powered by{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              Murf Falcon TTS
            </span>
            {' '}×{' '}
            <span className="font-bold text-white">
              LiveKit Voice AI
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Building the future of sales automation |{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents/start/voice-ai/"
              className="text-orange-500 hover:text-orange-400 font-semibold underline underline-offset-2"
            >
              Developer Documentation
            </a>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 pt-2">
            <span>#MurfAIVoiceAgentsChallenge</span>
            <span>•</span>
            <span>#10DaysofAIVoiceAgents</span>
          </div>
        </div>
      </section>
    </div>
  );
};