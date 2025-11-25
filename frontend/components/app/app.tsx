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
     <main className="relative grid h-svh grid-cols-1 place-content-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
  {/* Animated gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/50 via-purple-500/50 to-pink-500/50 animate-pulse" style={{ animationDuration: '8s' }} />
  
  {/* Grid pattern */}
  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
  
  {/* Glowing orbs */}
  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '6s' }} />
  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400 rounded-full blur-3xl opacity-15 animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
  
  {/* Floating particles */}
  <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '0s' }} />
  <div className="absolute top-20 right-20 w-3 h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
  <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-white/25 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
  <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }} />
  <div className="absolute bottom-20 right-10 w-3 h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '2s' }} />
  
  {/* Educational icons floating */}
  <div className="absolute top-16 left-1/3 text-4xl opacity-10 animate-pulse" style={{ animationDuration: '5s' }}></div>
  <div className="absolute bottom-24 right-1/4 text-3xl opacity-10 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
  <div className="absolute top-1/2 left-20 text-3xl opacity-10 animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }}></div>
  <div className="absolute bottom-1/3 left-1/2 text-2xl opacity-10 animate-pulse" style={{ animationDuration: '5.5s', animationDelay: '0.5s' }}></div>
  <div className="absolute top-1/4 right-16 text-3xl opacity-10 animate-pulse" style={{ animationDuration: '6.5s', animationDelay: '1.5s' }}></div>
  
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
