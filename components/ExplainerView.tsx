
import React, { useState, useRef, useEffect } from 'react';
import { askExplainerGemini } from '../services/gemini.ts';
import { askPoe } from '../services/poe.ts';
import VoiceScholar from './VoiceScholar.tsx';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const ExplainerView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello. I'm FrameDecoded. Ask me why a movie or show is loved, divisive, or misunderstood. I provide context and analysis without making recommendations. Primary: Gemini 2.0-Flash (Fallback: Poe)." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await askExplainerGemini(userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      console.warn('Gemini Explainer failed, falling back to Poe:', error);
      try {
        const response = await askPoe(userMsg);
        setMessages(prev => [...prev, { role: 'ai', content: response }]);
      } catch (poeError) {
        setMessages(prev => [...prev, { role: 'ai', content: "I encountered an error with both my scholarly engines. Please try again." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const extractYoutubeId = (text: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/i;
    const match = text.match(youtubeRegex);
    return match ? match[1] : null;
  };

  const renderMessageContent = (msg: Message) => {
    const youtubeId = extractYoutubeId(msg.content);
    return (
      <div className="space-y-4">
        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        {msg.role === 'ai' && youtubeId && (
          <div className="pt-2">
            <button
              onClick={() => setActiveTrailer(`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`)}
              className="glass px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase text-white/80 hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
            >
              <span className="text-sm">▶</span> Play Found Trailer
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">AI Scholar</h1>
          <p className="text-white/40 font-light text-lg">Conversational analysis powered by Gemini 2.0-Flash.</p>
        </div>
        <button 
          onClick={() => setIsVoiceMode(true)}
          className="glass px-8 py-4 rounded-2xl text-xs font-bold tracking-widest uppercase text-white/80 hover:bg-white/10 transition-all border border-white/10 flex items-center gap-3 shadow-xl group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🎙️</span> Enter Voice Mode
        </button>
      </header>

      <div className="glass rounded-[32px] overflow-hidden flex flex-col h-[650px] border border-white/10 shadow-2xl relative">
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] rounded-3xl px-8 py-5 ${m.role === 'user' ? 'bg-white text-black font-medium' : 'glass-card text-white/90 font-light'}`}>
                {renderMessageContent(m)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass-card rounded-2xl px-8 py-5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/20">Consulting Scholar</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
          <div className="relative group max-w-2xl mx-auto">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Decode a theme, character, or cultural shift..." className="w-full glass bg-white/5 py-5 px-8 rounded-2xl focus:outline-none focus:ring-1 focus:ring-white/20 transition-all border border-white/10 text-lg placeholder:text-white/20" />
            <button type="submit" disabled={loading} className="absolute right-3 top-3 bottom-3 px-6 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-30">Send</button>
          </div>
        </form>
      </div>

      {isVoiceMode && <VoiceScholar onClose={() => setIsVoiceMode(false)} />}

      {activeTrailer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setActiveTrailer(null)} />
          <div className="relative w-full max-w-6xl aspect-video glass rounded-[40px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
            <button onClick={() => setActiveTrailer(null)} className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110">✕</button>
            <iframe src={activeTrailer} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainerView;
