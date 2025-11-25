import { Button } from '@/components/livekit/button';

function BrainIcon() {
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
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M40 10C35.5 10 31.5 11.8 28.5 14.8C25.2 13 21.5 12 17.5 12C7.8 12 0 19.8 0 29.5C0 33.2 1 36.7 2.8 39.8C1 43 0 46.7 0 50.5C0 60.2 7.8 68 17.5 68C19.2 68 20.8 67.8 22.3 67.3C25.3 71.5 30.2 74 35.5 74H44.5C49.8 74 54.7 71.5 57.7 67.3C59.2 67.8 60.8 68 62.5 68C72.2 68 80 60.2 80 50.5C80 46.7 79 43 77.2 39.8C79 36.7 80 33.2 80 29.5C80 19.8 72.2 12 62.5 12C58.5 12 54.8 13 51.5 14.8C48.5 11.8 44.5 10 40 10Z"
        fill="url(#brainGradient)"
        opacity="0.2"
      />
      <circle cx="25" cy="32" r="4" fill="#6366f1" />
      <circle cx="55" cy="32" r="4" fill="#6366f1" />
      <path
        d="M30 45C30 45 35 50 40 50C45 50 50 45 50 45"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 25C22 23 24 22 27 22"
        stroke="#8b5cf6"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M60 25C58 23 56 22 53 22"
        stroke="#8b5cf6"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
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
    <div ref={ref} className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <section className="max-w-4xl w-full">
        {/* Header Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg">
            <span className="animate-pulse"></span>
            <span>AI Voice Agents Challenge</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <BrainIcon />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Active Recall Coach
          </h1>
          
          <p className="text-xl text-gray-700 font-medium mb-2">
            Teach the Tutor & Master Any Subject
          </p>
          
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The best way to learn is to teach. Explain concepts to your AI tutor using just your voice, 
            and get instant feedback to strengthen your understanding through active recall.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
          <FeatureCard
            icon="."
            title="Voice-First Learning"
            description="Simply speak your explanations naturally - no typing required"
          />
          <FeatureCard
            icon="."
            title="Active Recall"
            description="Strengthen memory by retrieving and explaining concepts yourself"
          />
          <FeatureCard
            icon="."
            title="Smart Feedback"
            description="Get constructive insights to improve your understanding"
          />
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-8">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={onStartCall}
            className="w-full md:w-96 h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a4 4 0 00-4 4v4a4 4 0 008 0V6a4 4 0 00-4-4zM8 14.5a6 6 0 01-6-6v-1a1 1 0 112 0v1a4 4 0 008 0v-1a1 1 0 112 0v1a6 6 0 01-6 6v1.5h3a1 1 0 110 2H7a1 1 0 110-2h3V14.5z"/>
              </svg>
              {startButtonText}
            </span>
          </Button>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-2xl mx-auto mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            How It Works
          </h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold flex items-center justify-center text-xs">1</span>
              <span><strong>Choose a topic</strong> you want to learn or review</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold flex items-center justify-center text-xs">2</span>
              <span><strong>Explain it out loud</strong> to your AI tutor in your own words</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold flex items-center justify-center text-xs">3</span>
              <span><strong>Receive feedback</strong> on your explanation and identify knowledge gaps</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold flex items-center justify-center text-xs">4</span>
              <span><strong>Practice again</strong> to reinforce your learning and improve retention</span>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Powered by <span className="font-semibold text-indigo-600">LiveKit Voice AI</span>
          </p>
          <p className="text-xs text-gray-500">
            Need help getting started?{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents/start/voice-ai/"
              className="text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              Check out the Voice AI quickstart
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};