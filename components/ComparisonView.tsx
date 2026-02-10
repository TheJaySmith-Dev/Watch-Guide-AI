
import React, { useState } from 'react';
import { searchTitles } from '../services/mdblist';
import { compareTitles } from '../services/gemini';
import { MovieSearchResult, ComparisonAnalysis } from '../types';

const ComparisonView: React.FC = () => {
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [s1, setS1] = useState<MovieSearchResult | null>(null);
  const [s2, setS2] = useState<MovieSearchResult | null>(null);
  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!t1 || !t2) return;
    setLoading(true);
    
    // First find exact matches or best matches
    const r1 = await searchTitles(t1);
    const r2 = await searchTitles(t2);
    
    if (r1[0] && r2[0]) {
      setS1(r1[0]);
      setS2(r2[0]);
      const res = await compareTitles(r1[0].title, r2[0].title);
      setAnalysis(res);
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-16">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Compare Perspectives</h1>
        <p className="text-white/40 font-light max-w-xl mx-auto">
          Compare two works to understand differences in tone, craft, and reception. 
          No winners declared.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 items-end max-w-3xl mx-auto">
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest uppercase text-white/30 px-1">First Title</label>
          <input 
            type="text" 
            value={t1}
            onChange={(e) => setT1(e.target.value)}
            placeholder="e.g. Oppenheimer" 
            className="w-full glass p-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/5"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest uppercase text-white/30 px-1">Second Title</label>
          <input 
            type="text" 
            value={t2}
            onChange={(e) => setT2(e.target.value)}
            placeholder="e.g. Barbie" 
            className="w-full glass p-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/5"
          />
        </div>
        <button 
          onClick={handleCompare}
          disabled={loading}
          className="md:col-span-2 w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Begin Comparison'}
        </button>
      </div>

      {analysis && s1 && s2 && (
        <div className="grid gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center items-center gap-12 text-center">
            <div className="space-y-4">
              <img src={s1.poster} className="w-32 h-48 object-cover rounded-xl glass shadow-xl" />
              <div className="font-bold">{s1.title}</div>
            </div>
            <div className="text-white/20 text-4xl font-light">VS</div>
            <div className="space-y-4">
              <img src={s2.poster} className="w-32 h-48 object-cover rounded-xl glass shadow-xl" />
              <div className="font-bold">{s2.title}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <ComparisonCard title="Tone & Atmosphere" content={analysis.tone} />
            <ComparisonCard title="Storytelling Approach" content={analysis.storytelling} />
            <ComparisonCard title="Audience Reception" content={analysis.reception} />
            <ComparisonCard title="Broader Context" content={analysis.context} />
          </div>
        </div>
      )}
    </div>
  );
};

const ComparisonCard: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="glass-card p-8 rounded-3xl border border-white/5">
    <h3 className="text-lg font-semibold mb-3 text-white/90">{title}</h3>
    <p className="text-white/50 leading-relaxed font-light text-sm">{content}</p>
  </div>
);

export default ComparisonView;
