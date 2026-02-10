
import React, { useState } from 'react';
import { searchTitles } from '../services/mdblist';
import { MovieSearchResult } from '../types';

interface HomeProps {
  onExplore: () => void;
  onNavigateToDetail: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ onExplore, onNavigateToDetail }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const data = await searchTitles(query);
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-12">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gradient max-w-4xl mx-auto leading-tight">
          Understand movies and TV shows — without being told what to watch.
        </h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
          FrameDecoded is an AI-powered scholar that explains the "why" behind film and television culture. 
          No ratings, no recommendations. Just analysis.
        </p>
        
        <div className="max-w-xl mx-auto pt-4">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a movie or show to decode..."
              className="w-full glass py-5 px-8 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-white/10 transition-all border border-white/10 placeholder:text-white/20"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-6 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Decode
            </button>
          </form>
          
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {['Inception', 'The Bear', 'Succession', 'Interstellar'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1 border border-white/5 rounded-full hover:border-white/20"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <section className="animate-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-2xl font-semibold mb-8 text-white/80">Search Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map((item) => (
              <div 
                key={item.id}
                onClick={() => onNavigateToDetail(item.id)}
                className="group cursor-pointer space-y-4"
              >
                <div className="aspect-[2/3] rounded-2xl overflow-hidden glass-card relative">
                  <img 
                    src={item.poster} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs font-medium uppercase tracking-widest text-white/80">View Analysis</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-white/90 group-hover:text-white transition-colors truncate">{item.title}</h3>
                  <p className="text-sm text-white/40">{item.year} • {item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Featured Explorations */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          { 
            title: 'Explain a title', 
            desc: 'Get deep insights into why a specific movie or show connects with audiences.',
            icon: '🔍'
          },
          { 
            title: 'Compare perspectives', 
            desc: 'Analyze two different works to see how they handle similar themes differently.',
            icon: '⚖️'
          },
          { 
            title: 'Explore trends', 
            desc: 'Understand the underlying patterns shaping modern entertainment today.',
            icon: '📈'
          }
        ].map((feat) => (
          <div key={feat.title} className="glass-card p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="text-3xl mb-4 opacity-50 group-hover:opacity-100 transition-opacity">{feat.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
            <p className="text-white/40 font-light text-sm leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
