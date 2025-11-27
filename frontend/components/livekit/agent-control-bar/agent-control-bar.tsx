'use client';

import { type HTMLAttributes, useCallback, useState } from 'react';
import { Track } from 'livekit-client';
import { useChat, useRemoteParticipants } from '@livekit/components-react';
import { ChatTextIcon, PhoneDisconnectIcon } from '@phosphor-icons/react/dist/ssr';
import { useSession } from '@/components/app/session-provider';
import { TrackToggle } from '@/components/livekit/agent-control-bar/track-toggle';
import { Button } from '@/components/livekit/button';
import { Toggle } from '@/components/livekit/toggle';
import { cn } from '@/lib/utils';
import { ChatInput } from './chat-input';
import { UseInputControlsProps, useInputControls } from './hooks/use-input-controls';
import { usePublishPermissions } from './hooks/use-publish-permissions';
import { TrackSelector } from './track-selector';

export interface ControlBarControls {
  leave?: boolean;
  camera?: boolean;
  microphone?: boolean;
  screenShare?: boolean;
  chat?: boolean;
}

export interface AgentControlBarProps extends UseInputControlsProps {
  controls?: ControlBarControls;
  onDisconnect?: () => void;
  onChatOpenChange?: (open: boolean) => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

/**
 * A control bar specifically designed for voice assistant interfaces - ICICI Bank Theme
 */
export function AgentControlBar({
  controls,
  saveUserChoices = true,
  className,
  onDisconnect,
  onDeviceError,
  onChatOpenChange,
  ...props
}: AgentControlBarProps & HTMLAttributes<HTMLDivElement>) {
  const { send } = useChat();
  const participants = useRemoteParticipants();
  const [chatOpen, setChatOpen] = useState(false);
  const publishPermissions = usePublishPermissions();
  const { isSessionActive, endSession } = useSession();

  const {
    micTrackRef,
    cameraToggle,
    microphoneToggle,
    screenShareToggle,
    handleAudioDeviceChange,
    handleVideoDeviceChange,
    handleMicrophoneDeviceSelectError,
    handleCameraDeviceSelectError,
  } = useInputControls({ onDeviceError, saveUserChoices });

  const handleSendMessage = async (message: string) => {
    await send(message);
  };

  const handleToggleTranscript = useCallback(
    (open: boolean) => {
      setChatOpen(open);
      onChatOpenChange?.(open);
    },
    [onChatOpenChange, setChatOpen]
  );

  const handleDisconnect = useCallback(async () => {
    endSession();
    onDisconnect?.();
  }, [endSession, onDisconnect]);

  const visibleControls = {
    leave: controls?.leave ?? true,
    microphone: controls?.microphone ?? publishPermissions.microphone,
    screenShare: controls?.screenShare ?? publishPermissions.screenShare,
    camera: controls?.camera ?? publishPermissions.camera,
    chat: controls?.chat ?? publishPermissions.data,
  };

  const isAgentAvailable = participants.some((p) => p.isAgent);

  return (
    <div
      aria-label="Voice assistant controls"
      className={cn(
        'relative overflow-hidden flex flex-col rounded-2xl p-3 drop-shadow-lg',
        'bg-white/98 backdrop-blur-xl',
        'border-2 border-gray-200 shadow-xl',
        className
      )}
      {...props}
    >
      {/* Subtle gradient overlay - ICICI red/orange */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-orange-50/30 to-red-50/50 pointer-events-none" />
      
      {/* Accent border glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-red-500/10 pointer-events-none" />
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent pointer-events-none" />

      {/* Content - increased z-index */}
      <div className="relative z-10">
        {/* Chat Input */}
        {visibleControls.chat && (
          <ChatInput
            chatOpen={chatOpen}
            isAgentAvailable={isAgentAvailable}
            onSend={handleSendMessage}
          />
        )}

        <div className="flex gap-1">
          <div className="flex grow gap-1">
            {/* Toggle Microphone */}
            {visibleControls.microphone && (
              <TrackSelector
                kind="audioinput"
                aria-label="Toggle microphone"
                source={Track.Source.Microphone}
                pressed={microphoneToggle.enabled}
                disabled={microphoneToggle.pending}
                audioTrackRef={micTrackRef}
                onPressedChange={microphoneToggle.toggle}
                onMediaDeviceError={handleMicrophoneDeviceSelectError}
                onActiveDeviceChange={handleAudioDeviceChange}
              />
            )}

            {/* Toggle Camera */}
            {visibleControls.camera && (
              <TrackSelector
                kind="videoinput"
                aria-label="Toggle camera"
                source={Track.Source.Camera}
                pressed={cameraToggle.enabled}
                pending={cameraToggle.pending}
                disabled={cameraToggle.pending}
                onPressedChange={cameraToggle.toggle}
                onMediaDeviceError={handleCameraDeviceSelectError}
                onActiveDeviceChange={handleVideoDeviceChange}
              />
            )}

            {/* Toggle Screen Share */}
            {visibleControls.screenShare && (
              <TrackToggle
                size="icon"
                variant="secondary"
                aria-label="Toggle screen share"
                source={Track.Source.ScreenShare}
                pressed={screenShareToggle.enabled}
                disabled={screenShareToggle.pending}
                onPressedChange={screenShareToggle.toggle}
              />
            )}

            {/* Toggle Transcript */}
            <Toggle
              size="icon"
              variant="secondary"
              aria-label="Toggle transcript"
              pressed={chatOpen}
              onPressedChange={handleToggleTranscript}
            >
              <ChatTextIcon weight="bold" />
            </Toggle>
          </div>

          {/* Disconnect - ICICI red accent */}
          {visibleControls.leave && (
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={!isSessionActive}
              className="font-semibold relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg shadow-red-500/25 border border-red-500/20"
            >
              <PhoneDisconnectIcon weight="bold" />
              <span className="hidden md:inline">END CALL</span>
              <span className="inline md:hidden">END</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}