
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

interface VoiceScholarProps {
  onClose: () => void;
}

const VoiceScholar: React.FC<VoiceScholarProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Initializing voice mode...');
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Utility functions for audio
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const createBlob = (data: Float32Array): { data: string; mimeType: string } => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  useEffect(() => {
    let nextStartTime = 0;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const startSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const inputCtx = new AudioContext({ sampleRate: 16000 });
        const outputCtx = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setStatus('Voice analysis active. Speak to the scholar.');
              setIsActive(true);
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (message) => {
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio) {
                nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTime);
                nextStartTime += audioBuffer.duration;
                sourcesRef.current.add(source);
              }
              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTime = 0;
              }
            },
            onerror: (e) => console.error('Live Audio Error:', e),
            onclose: () => setStatus('Connection closed.'),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: "You are the FrameDecoded Voice Scholar. You analyze cinema and television with an intelligent, unhurried, and neutral tone. You provide context, explain cultural resonance, and discuss craft. You NEVER give recommendations or suggest what to watch. You speak like a film professor in a private session."
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error('Failed to start voice session:', err);
        setStatus('Failed to access microphone.');
      }
    };

    startSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative glass p-12 rounded-[48px] border border-white/10 max-w-lg w-full text-center space-y-8 animate-in zoom-in-95 duration-700 shadow-2xl">
        <div className="flex justify-center">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center ${isActive ? 'animate-pulse bg-white/5' : ''}`}>
              <div className={`w-24 h-24 rounded-full bg-white/10 flex items-center justify-center ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-500`}>
                <span className="text-4xl">🎙️</span>
              </div>
            </div>
            {isActive && (
              <>
                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
                <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-10 [animation-delay:0.5s]" />
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Voice Scholar</h2>
          <p className="text-white/40 font-light leading-relaxed">{status}</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 glass bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-white/60 transition-all border border-white/5"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

export default VoiceScholar;
