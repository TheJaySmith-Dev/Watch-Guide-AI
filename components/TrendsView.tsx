
import React, { useState } from 'react';
import { analyzeTrend } from '../services/gemini';
import { TrendAnalysis } from '../types';

const TrendsView: React.FC = () => {
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const trends = [
    "Why are slow-burn movies more popular now?",
    "Why do miniseries outperform long-running shows?",
    "Why do modern blockbusters feel longer?",
    "The rise of the anti-hero in streaming TV",
    "Why practical effects are making a comeback",
    "The 'Prestige Horror' movement"
  ];

  const handleTrendClick = async (trend: string) => {
    setSelectedTrend(trend);
    setLoading(true);
    const res = await analyzeTrend(trend);
    setAnalysis(res);
    setLoading(false);
  };

  return (
    <div className="space-y-16">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Explore Trends</h1>
        <p className="text-white/40 font-light max-w-xl mx-auto">
          Uncovering the patterns and shifts in modern entertainment.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {trends.map(t => (
          <button
            key={t}
            onClick={() => handleTrendClick(t)}
            className={`p-6 rounded-2xl text-left transition-all ${
              selectedTrend === t 
                ? 'bg-white text-black' 
                : 'glass-card hover:border-white/20'
            }`}
          >
            <span className="text-sm font-medium">{t}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {analysis && !loading && (
        <div className="max-w-4xl mx-auto glass p-12 rounded-[48px] space-y-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">{selectedTrend}</h2>
            <div className="h-px w-20 bg-white/20" />
          </div>

          <div className="grid gap-12">
            <TrendSection title="The Historical Background" content={analysis.background} />
            <TrendSection title="Cultural Impact" content={analysis.impact} />
            <TrendSection title="Why it matters right now" content={analysis.whyNow} />
          </div>
        </div>
      )}
    </div>
  );
};

const TrendSection: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-bold tracking-widest uppercase text-white/30">{title}</h3>
    <p className="text-lg text-white/70 font-light leading-relaxed">{content}</p>
  </div>
);

export default TrendsView;
