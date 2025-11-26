'use client';

import { RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { SessionProvider } from '@/components/app/session-provider';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/livekit/toaster';

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  return (
    <SessionProvider appConfig={appConfig}>
     <main className="relative grid h-svh grid-cols-1 place-content-center overflow-hidden bg-black">
  {/* Animated gradient overlay - Orange accents */}
  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-orange-600/5 to-orange-500/10 animate-pulse" style={{ animationDuration: '10s' }} />
  
  {/* Grid pattern - Subtle tech feel */}
  <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,107,53,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,.2) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
  
  {/* Diagonal lines pattern */}
  <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,107,53,.15) 0px, rgba(255,107,53,.15) 1px, transparent 1px, transparent 20px)' }} />
  
  {/* Glowing orbs - Orange theme */}
  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-15 animate-pulse" style={{ animationDuration: '8s' }} />
  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-3xl opacity-15 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-400 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDuration: '9s', animationDelay: '4s' }} />
  
  {/* Subtle light rays */}
  <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-orange-500/20 to-transparent opacity-30" />
  <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-orange-500/15 to-transparent opacity-30" style={{ animationDelay: '1s' }} />
  
  {/* Floating particles - Minimal and elegant */}
  <div className="absolute top-10 left-10 w-1.5 h-1.5 bg-orange-400/40 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0s' }} />
  <div className="absolute top-20 right-20 w-2 h-2 bg-orange-500/30 rounded-full animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }} />
  <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-orange-400/35 rounded-full animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '2s' }} />
  <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-orange-500/40 rounded-full animate-bounce" style={{ animationDuration: '5.5s', animationDelay: '0.5s' }} />
  <div className="absolute bottom-20 right-10 w-2 h-2 bg-orange-400/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
  
  {/* Tech/Business icons floating - Subtle */}
  <div className="absolute top-16 left-1/3 text-3xl opacity-[0.03] animate-pulse" style={{ animationDuration: '6s' }}>⚡</div>
  <div className="absolute bottom-24 right-1/4 text-2xl opacity-[0.03] animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }}></div>
  <div className="absolute top-1/2 left-20 text-2xl opacity-[0.03] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
  <div className="absolute bottom-1/3 left-1/2 text-xl opacity-[0.03] animate-pulse" style={{ animationDuration: '6.5s', animationDelay: '0.5s' }}></div>
  <div className="absolute top-1/4 right-16 text-2xl opacity-[0.03] animate-pulse" style={{ animationDuration: '7.5s', animationDelay: '1.5s' }}></div>
  
  {/* Radial gradient vignette */}
  <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />
  
  {/* Top accent bar */}
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
  
  {/* Bottom accent bar */}
  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
  
  {/* Content container with backdrop blur */}
  <div className="relative z-10">
    <ViewController />
  </div>
</main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}
