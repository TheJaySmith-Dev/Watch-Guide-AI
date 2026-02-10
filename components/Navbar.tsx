
import React from 'react';
import { View } from '../types';

interface NavbarProps {
  activeView: View;
  setView: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setView }) => {
  const items = [
    { id: View.Home, label: 'Home' },
    { id: View.Explainer, label: 'Explainer' },
    { id: View.Compare, label: 'Compare' },
    { id: View.Trends, label: 'Trends' },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4">
      <div className="glass px-6 py-3 rounded-full flex items-center gap-8">
        <div 
          className="text-xl font-bold tracking-tight cursor-pointer mr-4"
          onClick={() => setView(View.Home)}
        >
          Frame<span className="font-light opacity-60">Decoded</span>
        </div>
        
        <div className="flex items-center gap-6">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`text-sm font-medium transition-all duration-300 ${
                activeView === item.id 
                  ? 'text-white scale-105' 
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
