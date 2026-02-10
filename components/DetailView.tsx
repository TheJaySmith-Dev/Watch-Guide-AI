
import React, { useState, useEffect } from 'react';
import { getTitleDetails } from '../services/mdblist';
import { analyzeTitle, getTrailerUrl } from '../services/gemini';
import { analyzeTitleWithPoe } from '../services/poe';
import { MovieDetail, AIAnalysis } from '../types';

interface DetailViewProps {
  id: string;
  onBack: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ id, onBack }) => {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [engineSource, setEngineSource] = useState<'Gemini' | 'Poe'>('Gemini');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const details = await getTitleDetails(id);
      if (details) {
        setMovie(details);
        
        try {
          // Attempt Gemini first
          const [analysisRes, trailerRes] = await Promise.all([
            analyzeTitle(details.title, details.year, details.description),
            getTrailerUrl(details.title, details.year)
          ]);
          
          setAnalysis(analysisRes);
          // Prioritize the URL found by Gemini Search over the static DB one
          setTrailerUrl(trailerRes || details.trailer || null);
          setEngineSource('Gemini');
        } catch (error) {
          console.warn('Gemini failed, falling back to Poe:', error);
          const poeRes = await analyzeTitleWithPoe(details.title, details.year, details.description);
          setAnalysis({
            resonance: poeRes.resonance,
            divisiveness: poeRes.divisiveness,
            misunderstandings: poeRes.misunderstandings,
            legacy: poeRes.legacy
          });
          setTrailerUrl(poeRes.trailer_url || details.trailer || null);
          setEngineSource('Poe');
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const extractYoutubeId = (url?: string) => {
    if (!url) return null;
    // Enhanced regex for various YouTube URL patterns
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    const videoId = extractYoutubeId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-6">
        <div className="w-12 h-12 border-2 border-white/5 border-t-white rounded-full animate-spin" />
        <p className="text-white/40 font-light animate-pulse">Scholar is researching cultural impact...</p>
      </div>
    );
  }

  if (!movie) return <div className="text-center py-40">Failed to load title details.</div>;

  const embedUrl = getYoutubeEmbedUrl(trailerUrl || movie.trailer);

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack}
          className="text-white/40 hover:text-white transition-colors flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Search
        </button>

        {embedUrl && (
          <button 
            onClick={() => setShowTrailer(true)}
            className="glass px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase text-white/80 hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10 shadow-lg"
          >
            <span className="text-lg">▶</span> Watch Trailer
          </button>
        )}
      </div>

      <section className="grid md:grid-cols-3 gap-12 items-start">
        <div className="md:col-span-1">
          <div className="aspect-[2/3] rounded-3xl overflow-hidden glass shadow-2xl relative group">
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            {embedUrl && (
              <div 
                onClick={() => setShowTrailer(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-black border-b-[8px] border-b-transparent ml-1" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-xs text-white/30 uppercase mb-1">IMDb</div>
              <div className="font-bold text-lg">{movie.ratings.imdb || 'N/A'}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-xs text-white/30 uppercase mb-1">Critics</div>
              <div className="font-bold text-lg">{movie.ratings.rotten_tomatoes || 'N/A'}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-xs text-white/30 uppercase mb-1">Score</div>
              <div className="font-bold text-lg text-blue-400">{movie.score || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase text-white/40 border border-white/10">
                {movie.type}
              </span>
              <span className="text-white/30 text-sm">{movie.year} • {movie.runtime} min • {movie.certification}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">{movie.title}</h1>
            <div className="flex flex-wrap gap-2 mb-8">
              {movie.genres.map(g => (
                <span key={g} className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/60">{g}</span>
              ))}
            </div>
            <p className="text-lg text-white/60 font-light leading-relaxed border-l-2 border-white/10 pl-6">
              {movie.description}
            </p>
          </div>

          <div className="grid gap-8 pt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold opacity-80">{engineSource} AI Analysis</h2>
              <div className="text-[10px] text-white/20 tracking-[0.2em] uppercase font-bold">
                {engineSource === 'Gemini' ? '2.0-Flash Scholar' : 'Fallback Engine (Poe)'}
              </div>
            </div>
            
            <div className="grid gap-6">
              <AnalysisSection 
                title="Why it resonates with audiences" 
                content={analysis?.resonance || "Gathering insights..."} 
                icon="✨"
              />
              <AnalysisSection 
                title="Why it is divisive" 
                content={analysis?.divisiveness || "Gathering insights..."} 
                icon="⚖️"
              />
              <AnalysisSection 
                title="What people often misunderstand" 
                content={analysis?.misunderstandings || "Gathering insights..."} 
                icon="🧩"
              />
              <AnalysisSection 
                title="Cultural legacy & aging" 
                content={analysis?.legacy || "Gathering insights..."} 
                icon="⏳"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      {showTrailer && embedUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl" 
            onClick={() => setShowTrailer(false)}
          />
          <div className="relative w-full max-w-6xl aspect-video glass rounded-[40px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setShowTrailer(false)}
              className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110"
            >
              ✕
            </button>
            <iframe 
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={`${movie.title} Official Trailer`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const AnalysisSection: React.FC<{ title: string; content: string; icon: string }> = ({ title, content, icon }) => (
  <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group">
    <div className="flex items-start gap-6">
      <div className="text-2xl bg-white/5 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white/90">{title}</h3>
        <p className="text-white/50 leading-relaxed font-light">{content}</p>
      </div>
    </div>
  </div>
);

export default DetailView;
