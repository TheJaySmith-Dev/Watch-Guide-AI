
import React, { useState } from 'react';
import { View } from './types.ts';
import Navbar from './components/Navbar.tsx';
import Home from './components/Home.tsx';
import ExplainerView from './components/ExplainerView.tsx';
import ComparisonView from './components/ComparisonView.tsx';
import TrendsView from './components/TrendsView.tsx';
import DetailView from './components/DetailView.tsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Home);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const navigateToDetail = (id: string) => {
    setSelectedMovieId(id);
    setCurrentView(View.Detail);
  };

  const renderView = () => {
    switch (currentView) {
      case View.Home:
        return <Home onExplore={() => setCurrentView(View.Explainer)} onNavigateToDetail={navigateToDetail} />;
      case View.Explainer:
        return <ExplainerView />;
      case View.Compare:
        return <ComparisonView />;
      case View.Trends:
        return <TrendsView />;
      case View.Detail:
        return selectedMovieId ? (
          <DetailView id={selectedMovieId} onBack={() => setCurrentView(View.Home)} />
        ) : <Home onExplore={() => setCurrentView(View.Explainer)} onNavigateToDetail={navigateToDetail} />;
      default:
        return <Home onExplore={() => setCurrentView(View.Explainer)} onNavigateToDetail={navigateToDetail} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <Navbar activeView={currentView} setView={setCurrentView} />
      
      <main className="relative z-10 pt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-700">
        {renderView()}
      </main>

      <footer className="relative z-10 py-12 px-6 border-t border-white/5 text-center text-white/40 text-sm">
        <p>&copy; {new Date().getFullYear()} FrameDecoded. All analysis powered by AI scholar engines.</p>
        <p className="mt-2">Dedicated to understanding, not recommending.</p>
      </footer>
    </div>
  );
};

export default App;
