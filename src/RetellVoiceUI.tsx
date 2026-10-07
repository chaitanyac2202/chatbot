import React, { useEffect, useState, useRef } from 'react';
import { Mic, X, ShieldAlert, Loader2, Phone } from 'lucide-react';
import { RetellWebClient } from 'retell-client-js-sdk';

interface RetellVoiceUIProps {
  onClose: () => void;
}

const PUBLIC_KEY = import.meta.env.VITE_RETELL_PUBLIC_KEY || '';
const AGENT_ID = 'agent_4993b0ffe40f4023d541ab9126';

export const RetellVoiceUI: React.FC<RetellVoiceUIProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'initializing' | 'connecting' | 'connected' | 'error'>('initializing');
  const [errorMsg, setErrorMsg] = useState('');
  const [transcript, setTranscript] = useState<{ role: string, content: string }[]>([]);
  
  const clientRef = useRef<RetellWebClient | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const setupCall = async () => {
      try {
        setStatus('connecting');
        
        const response = await fetch('https://api.retellai.com/v2/create-web-call', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PUBLIC_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ agent_id: AGENT_ID })
        });
        
        if (!response.ok) {
          throw new Error('Failed to start call. Please check your API key.');
        }

        const data = await response.json();
        const accessToken = data.access_token;

        if (!active) return;

        const client = new RetellWebClient();
        clientRef.current = client;

        client.on('call_started', () => {
          setStatus('connected');
        });

        client.on('call_ended', () => {
          onClose();
        });

        client.on('error', (err: any) => {
          console.error('Retell error:', err);
          if (active) {
            setErrorMsg('An error occurred during the call.');
            setStatus('error');
          }
        });

        client.on('update', (update: any) => {
          if (update.transcript && Array.isArray(update.transcript)) {
            setTranscript(update.transcript);
          }
        });

        await client.startCall({ accessToken });

      } catch (err: any) {
        console.error(err);
        if (active) {
          setErrorMsg(err.message || 'Microphone access denied or connection failed.');
          setStatus('error');
        }
      }
    };

    setupCall();

    return () => {
      active = false;
      if (clientRef.current) {
        clientRef.current.stopCall();
      }
    };
  }, [onClose]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript]);

  const endCall = () => {
    if (clientRef.current) {
      clientRef.current.stopCall();
    }
    onClose();
  };

  return (
    <div className="flex-1 w-full relative bg-gradient-to-b from-white via-purple-50/40 to-white flex flex-col overflow-hidden rounded-b-3xl">
      {/* Decorative floating blobs */}
      <div className="absolute top-4 left-4 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-16 right-4 w-28 h-28 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Status Bar */}
      <div className="w-full px-4 py-2.5 flex items-center justify-between relative z-10 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          {status === 'connected' ? (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          )}
          <span className="text-slate-600 text-xs font-mono font-medium tracking-wide">
            {status === 'connecting' ? 'Connecting...' : status === 'connected' ? '🎙️ Lovely is Live' : 'Voice Offline'}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer">
          <X size={14} />
        </button>
      </div>

      {/* Compact Orb Area */}
      <div className="flex items-center justify-center relative z-10 py-4 shrink-0">
        {status === 'connecting' && (
          <div className="flex items-center gap-2">
            <Loader2 size={20} className="text-purple-500 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Connecting to Lovely...</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-rose-500 text-center px-6 flex items-center gap-2">
            <ShieldAlert size={18} />
            <p className="text-xs font-medium">{errorMsg}</p>
          </div>
        )}

        {status === 'connected' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 -m-1 bg-purple-300/30 animate-pulse rounded-full" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center relative z-10 shadow-md shadow-purple-200">
                <Mic size={20} className="text-white" />
              </div>
            </div>
            <span className="text-xs text-purple-600 font-semibold">Speak now...</span>
          </div>
        )}
      </div>

      {/* Live Subtitles Area — takes remaining space */}
      <div 
        ref={containerRef}
        className="flex-1 w-full px-4 overflow-y-auto flex flex-col gap-2 relative z-10 scroll-smooth no-scrollbar"
      >
        {transcript.map((line, idx) => {
          const isAgent = line.role === 'agent';
          return (
            <div 
              key={idx} 
              className={`p-2.5 rounded-2xl max-w-[85%] text-xs sm:text-sm shadow-xs ${
                isAgent 
                  ? 'bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200/60 text-purple-900 self-start rounded-tl-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 self-end rounded-tr-sm text-right'
              }`}
            >
              <div className="text-[9px] uppercase font-bold tracking-wider mb-0.5 opacity-50">
                {isAgent ? '✨ Lovely' : '🎤 You'}
              </div>
              <p className="leading-relaxed">{line.content}</p>
            </div>
          );
        })}
        {status === 'connected' && transcript.length === 0 && (
          <div className="text-center text-slate-400 text-xs mt-2 font-medium animate-pulse">
            🎧 Listening for voice...
          </div>
        )}
      </div>

      {/* End Call Button — fixed at bottom */}
      <div className="w-full flex items-center justify-center py-3 relative z-10 shrink-0 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <button 
          onClick={endCall}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Phone size={14} className="rotate-[135deg]" />
          End Call
        </button>
      </div>
    </div>
  );
};
