import { Button } from '@/components/livekit/button';
import React, { useMemo } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarVisualizer,
  type TrackReference,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';

const MotionContainer = motion.create('div');

const ANIMATION_TRANSITION = {
  type: 'spring',
  stiffness: 675,
  damping: 75,
  mass: 1,
};

const classNames = {
  // GRID
  // 2 Columns x 3 Rows
  grid: [
    'h-full w-full',
    'grid gap-x-2 place-content-center',
    'grid-cols-[1fr_1fr] grid-rows-[90px_1fr_90px]',
  ],
  // Agent
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 1 / Row 1
  // align: x-end y-center
  agentChatOpenWithSecondTile: ['col-start-1 row-start-1', 'self-center justify-self-end'],
  // Agent
  // chatOpen: true,
  // hasSecondTile: false
  // layout: Column 1 / Row 1 / Column-Span 2
  // align: x-center y-center
  agentChatOpenWithoutSecondTile: ['col-start-1 row-start-1', 'col-span-2', 'place-content-center'],
  // Agent
  // chatOpen: false
  // layout: Column 1 / Row 1 / Column-Span 2 / Row-Span 3
  // align: x-center y-center
  agentChatClosed: ['col-start-1 row-start-1', 'col-span-2 row-span-3', 'place-content-center'],
  // Second tile
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 2 / Row 1
  // align: x-start y-center
  secondTileChatOpen: ['col-start-2 row-start-1', 'self-center justify-self-start'],
  // Second tile
  // chatOpen: false,
  // hasSecondTile: false
  // layout: Column 2 / Row 2
  // align: x-end y-end
  secondTileChatClosed: ['col-start-2 row-start-3', 'place-content-end'],
};

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface TileLayoutProps {
  chatOpen: boolean;
}

export function TileLayout({ chatOpen }: TileLayoutProps) {
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = screenShareTrack && !screenShareTrack.publication.isMuted;
  const hasSecondTile = isCameraEnabled || isScreenShareEnabled;

  const animationDelay = chatOpen ? 0 : 0.15;
  const isAvatar = agentVideoTrack !== undefined;
  const videoWidth = agentVideoTrack?.publication.dimensions?.width ?? 0;
  const videoHeight = agentVideoTrack?.publication.dimensions?.height ?? 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 bottom-32 z-50 md:top-12 md:bottom-40">
      <div className="relative mx-auto h-full max-w-2xl px-4 md:px-0">
        <div className={cn(classNames.grid)}>
          {/* Agent */}
          <div
            className={cn([
              'grid',
              !chatOpen && classNames.agentChatClosed,
              chatOpen && hasSecondTile && classNames.agentChatOpenWithSecondTile,
              chatOpen && !hasSecondTile && classNames.agentChatOpenWithoutSecondTile,
            ])}
          >
            <AnimatePresence mode="popLayout">
              {!isAvatar && (
                // Audio Agent - ICICI Bank Theme
                <MotionContainer
                  key="agent"
                  layoutId="agent"
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: chatOpen ? 1 : 5,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className={cn(
                    'aspect-square h-[90px] rounded-xl border-2 transition-[border,drop-shadow,background]',
                    'bg-white shadow-md',
                    chatOpen && 'border-red-500 drop-shadow-xl shadow-red-500/20 delay-200',
                    !chatOpen && 'border-red-400/40 shadow-lg'
                  )}
                >
                  <BarVisualizer
                    barCount={5}
                    state={agentState}
                    options={{ minHeight: 5 }}
                    trackRef={agentAudioTrack}
                    className={cn('flex h-full items-center justify-center gap-1.5')}
                  >
                    <span
                      className={cn([
                        'min-h-2.5 w-2.5 rounded-full',
                        'origin-center transition-colors duration-250 ease-linear',
                        'bg-red-500',
                        'data-[lk-highlighted=true]:bg-gradient-to-t data-[lk-highlighted=true]:from-red-600 data-[lk-highlighted=true]:to-orange-600',
                        'data-[lk-muted=true]:bg-red-400',
                      ])}
                    />
                  </BarVisualizer>
                </MotionContainer>
              )}

              {isAvatar && (
                // Avatar Agent - ICICI Bank Theme
                <MotionContainer
                  key="avatar"
                  layoutId="avatar"
                  initial={{
                    scale: 1,
                    opacity: 1,
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 20px, transparent 20px)',
                    filter: 'blur(20px)',
                  }}
                  animate={{
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 500px, transparent 500px)',
                    filter: 'blur(0px)',
                    borderRadius: chatOpen ? 12 : 16,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                    maskImage: {
                      duration: 1,
                    },
                    filter: {
                      duration: 1,
                    },
                  }}
                  className={cn(
                    'overflow-hidden bg-white drop-shadow-xl ring-2 ring-red-500/40 shadow-lg',
                    chatOpen ? 'h-[90px]' : 'h-auto w-full'
                  )}
                >
                  <VideoTrack
                    width={videoWidth}
                    height={videoHeight}
                    trackRef={agentVideoTrack}
                    className={cn(chatOpen && 'size-[90px] object-cover')}
                  />
                </MotionContainer>
              )}
            </AnimatePresence>
          </div>

          <div
            className={cn([
              'grid',
              chatOpen && classNames.secondTileChatOpen,
              !chatOpen && classNames.secondTileChatClosed,
            ])}
          >
            {/* Camera & Screen Share - ICICI Bank Theme */}
            <AnimatePresence>
              {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
                <MotionContainer
                  key="camera"
                  layout="position"
                  layoutId="camera"
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className="drop-shadow-xl ring-2 ring-red-500/40 shadow-lg"
                >
                  <VideoTrack
                    trackRef={cameraTrack || screenShareTrack}
                    width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                    height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                    className="bg-white aspect-square w-[90px] rounded-xl object-cover"
                  />
                </MotionContainer>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ICICIBankLogo() {
  return (
    <svg
      width="120"
      height="50"
      viewBox="0 0 120 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-8"
    >
      <defs>
        <linearGradient id="iciciGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F15A29" />
          <stop offset="100%" stopColor="#ED1C24" />
        </linearGradient>
      </defs>
      
      {/* Shield background */}
      <path
        d="M40 5L50 5C52 5 54 7 54 9L54 35C54 40 50 45 40 45C30 45 26 40 26 35L26 9C26 7 28 5 30 5L40 5Z"
        fill="url(#iciciGradient)"
        opacity="0.1"
      />
      
      {/* Shield outline */}
      <path
        d="M40 8L48 8C49.5 8 51 9.5 51 11L51 33C51 37 48 41 40 41C32 41 29 37 29 33L29 11C29 9.5 30.5 8 32 8L40 8Z"
        stroke="url(#iciciGradient)"
        strokeWidth="2.5"
        fill="none"
      />
      
      {/* Security checkmark */}
      <path
        d="M34 24L38 28L46 20"
        stroke="url(#iciciGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Bank text */}
      <text x="62" y="28" fill="#1C2833" fontSize="16" fontWeight="700" fontFamily="Arial, sans-serif">
        ICICI Bank
      </text>
      <text x="62" y="40" fill="#5D6D7E" fontSize="9" fontWeight="600" fontFamily="Arial, sans-serif">
        Fraud Protection
      </text>
    </svg>
  );
}

function SecurityIcon() {
  return (
    <div className="w-20 h-20 mx-auto mb-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-full opacity-30"></div>
      <svg className="relative w-20 h-20" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="28" stroke="url(#iciciGradient)" strokeWidth="3" fill="white"/>
        <path d="M40 18L48 18C50 18 52 20 52 22L52 48C52 53 48 58 40 58C32 58 28 53 28 48L28 22C28 20 30 18 32 18L40 18Z" fill="url(#iciciGradient)"/>
        <path d="M34 38L38 42L46 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-orange-500/30">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xl shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
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
    <div ref={ref} className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center p-6 md:p-8">
      <section className="max-w-6xl w-full">
        {/* Trust Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white border-2 border-orange-500/20 shadow-sm">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm font-semibold">Bank-Grade Security</span>
          </div>
        </div>

        {/* Bank Logo */}
        <div className="flex justify-center mb-8">
          <ICICIBankLogo />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 md:p-14 mb-8">
          <div className="text-center mb-10">
            <SecurityIcon />
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-5 leading-tight">
              Fraud Alert
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mt-2">
                Verification System
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 font-semibold mb-4">
              Protecting Your Financial Security 24/7
            </p>
            
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-base">
              Our advanced AI-powered fraud detection system monitors your account for suspicious activities. 
              Verify transactions instantly and keep your money safe.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-5xl mx-auto">
            <FeatureCard
              icon="🛡️"
              title="Real-Time Monitoring"
              description="24/7 surveillance of all transactions with instant fraud detection and alerts"
            />
            <FeatureCard
              icon="✓"
              title="Quick Verification"
              description="Secure identity verification process to confirm or report suspicious activities"
            />
            <FeatureCard
              icon="🔒"
              title="Instant Action"
              description="Immediate card blocking and dispute resolution for unauthorized transactions"
            />
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onStartCall}
              className="w-full md:w-auto px-12 h-16 text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 15.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1C8.7 6.4 8.5 5.2 8.5 4c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"/>
                </svg>
                {startButtonText}
              </span>
            </Button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Verification Process
          </h2>
          <ol className="space-y-5 text-base text-gray-700">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-md">1</span>
              <span className="pt-1"><strong className="text-gray-900">Initiate Verification</strong> - Click the button above to connect with our fraud protection system</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-md">2</span>
              <span className="pt-1"><strong className="text-gray-900">Identity Confirmation</strong> - Verify your identity using secure authentication methods</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-md">3</span>
              <span className="pt-1"><strong className="text-gray-900">Review Transaction</strong> - Listen to details about the flagged suspicious transaction</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-md">4</span>
              <span className="pt-1"><strong className="text-gray-900">Confirm or Report</strong> - Verify if the transaction was made by you or report it as fraudulent</span>
            </li>
          </ol>
        </div>

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-600 rounded-r-lg p-6 mb-8">
          <div className="flex gap-4">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Important Security Notice</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                ICICI Bank will <strong>never</strong> ask for your full card number, CVV, PIN, or online banking password. 
                This system uses only non-sensitive information for verification. All data used is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            Powered by{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
              ICICI Bank AI Technology
            </span>
            {' '}×{' '}
            <span className="font-bold text-gray-700">
              LiveKit Voice AI
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Part of #MurfAIVoiceAgentsChallenge |{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents/start/voice-ai/"
              className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2"
            >
              Technical Documentation
            </a>
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-2">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure & Encrypted
            </span>
            <span>•</span>
            <span>Demo Environment</span>
            <span>•</span>
            <span>#10DaysofAIVoiceAgents</span>
          </div>
          <p className="text-xs text-gray-400 pt-2">
            © 2024 ICICI Bank Ltd. Demo Application for Educational Purposes Only
          </p>
        </div>
      </section>
    </div>
  );
};