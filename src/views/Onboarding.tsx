import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Wind, Swords, Compass, Factory } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const archetypes = [
  {
    id: 'hubris',
    title: 'The Hubris Cycle',
    category: 'The Engine of Fall',
    icon: Wind,
    color: 'text-secondary',
    description: 'From the heights of empire to the inevitability of collapse. Explore the patterns where overconfidence meets the hard edge of reality.',
    image: 'https://images.unsplash.com/photo-1544654803-b69140b285a1?q=80&w=800&auto=format&fit=crop',
    colSpan: 'lg:col-span-7'
  },
  {
    id: 'power',
    title: 'Challenger vs. The Monarch',
    category: 'Power Dynamics',
    icon: Swords,
    color: 'text-tertiary',
    description: 'The tension between established authority and the rising tide of dissent. A study of revolution and preservation.',
    image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800&auto=format&fit=crop',
    colSpan: 'lg:col-span-5'
  },
  {
    id: 'discovery',
    title: 'Leap into the Unknown',
    category: 'Discovery & Fear',
    icon: Compass,
    color: 'text-secondary',
    description: 'The pioneers who traded safety for the horizon. Stories of navigation, space exploration, and intellectual risk.',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=800&auto=format&fit=crop',
    colSpan: 'lg:col-span-5'
  },
  {
    id: 'industrial',
    title: 'Industrial Transformation',
    category: 'The Modern Pivot',
    icon: Factory,
    color: 'text-primary',
    description: "When the world changes overnight. The friction between humanity's hand-crafted past and its automated future.",
    image: 'https://images.unsplash.com/photo-1533568024501-de2722116014?q=80&w=800&auto=format&fit=crop',
    colSpan: 'lg:col-span-7'
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-surface">
      <div className="fixed inset-0 historical-grain z-0"></div>
      
      <header className="relative z-10 w-full px-6 py-8 md:px-12 md:py-12 flex justify-between items-center">
        <h1 className="text-2xl font-headline italic text-primary tracking-tight">Echoes</h1>
        <div className="text-xs font-label uppercase tracking-widest text-outline">Step 1 of 3</div>
      </header>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 max-w-7xl mx-auto w-full pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16 max-w-2xl"
        >
          <h2 className="text-4xl md:text-6xl font-headline italic text-primary mb-6 tracking-tight leading-tight">
            Which human dynamics <br className="hidden md:block"/>fascinate you?
          </h2>
          <p className="text-on-surface-variant font-body text-lg leading-relaxed px-4">
            Select the archetypes that stir your curiosity. We will curate your historical timeline around these echoes of the past.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 w-full">
          {archetypes.map((arch, index) => {
            const isSelected = selected.has(arch.id);
            const Icon = arch.icon;
            
            return (
              <motion.button
                key={arch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => toggleSelection(arch.id)}
                className={`${arch.colSpan} group relative text-left p-8 rounded-xl transition-all duration-300 ring-1 ${
                  isSelected 
                    ? 'bg-surface-container-high ring-primary/30 shadow-md' 
                    : 'bg-surface-container-low hover:bg-surface-container ring-outline-variant/10'
                }`}
              >
                <div className={`flex flex-col h-full ${arch.colSpan === 'lg:col-span-7' ? 'md:flex-row md:items-start gap-8' : ''}`}>
                  {arch.colSpan === 'lg:col-span-7' && (
                    <div className="w-full md:w-48 h-48 overflow-hidden rounded-md flex-shrink-0 relative">
                      <img 
                        src={arch.image} 
                        alt={arch.title} 
                        className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'grayscale-0 opacity-100 scale-105' : 'grayscale opacity-80 group-hover:grayscale-[50%]'}`} 
                      />
                      {isSelected && <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>}
                    </div>
                  )}
                  
                  <div className="flex flex-col justify-center h-full flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon size={16} className={arch.color} />
                      <span className={`text-[11px] font-label font-semibold uppercase tracking-widest ${arch.color}`}>
                        {arch.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-headline italic text-primary mb-3">{arch.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed max-w-md mb-6">
                      {arch.description}
                    </p>
                    
                    {arch.colSpan === 'lg:col-span-5' && (
                      <div className="mt-auto overflow-hidden rounded-md h-32 relative">
                        <img 
                          src={arch.image} 
                          alt={arch.title} 
                          className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'grayscale-0 opacity-100 scale-105' : 'grayscale opacity-60 group-hover:grayscale-[50%]'}`} 
                        />
                        {isSelected && <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>}
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-20 p-6 md:p-8 flex justify-center pointer-events-none">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: selected.size >= 2 ? 0 : 100 }}
          className="max-w-7xl w-full flex justify-center items-center pointer-events-auto"
        >
          <div className="w-full md:w-auto bg-surface/90 backdrop-blur-xl p-2 rounded-xl flex items-center gap-6 shadow-lg ring-1 ring-outline-variant/20">
            <p className="hidden md:block text-xs font-label text-outline px-4 uppercase tracking-tighter">
              {selected.size} selected
            </p>
            <button 
              onClick={onComplete}
              className="w-full md:w-auto px-8 py-4 bg-primary text-on-primary font-label font-medium rounded-lg hover:bg-primary-container transition-colors active:scale-95 duration-200 flex items-center justify-center gap-2 group"
            >
              Begin Your Journey
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </footer>

      {/* Decorative Elements */}
      <div className="fixed top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tertiary-container/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
    </div>
  );
}
