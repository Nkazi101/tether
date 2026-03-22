import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowRight, Sparkles, BarChart2 } from 'lucide-react';
import { searchHistoricalParallels, HistoricalParallel, fetchExploreRecommendations, ExploreData } from '../lib/gemini';

interface ExploreProps {
  onSelectParallel: (modern: string, historical: string) => void;
}

export function Explore({ onSelectParallel }: ExploreProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<HistoricalParallel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [exploreData, setExploreData] = useState<ExploreData | null>(null);
  const [isLoadingExplore, setIsLoadingExplore] = useState(true);
  const [exploreError, setExploreError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExploreData() {
      try {
        setIsLoadingExplore(true);
        setExploreError(null);
        const data = await fetchExploreRecommendations();
        setExploreData(data);
      } catch (error) {
        console.error("Failed to load explore data:", error);
        setExploreError("Failed to load global knowledge graph. Please try again later.");
      } finally {
        setIsLoadingExplore(false);
      }
    }
    loadExploreData();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await searchHistoricalParallels(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-12 pb-32">
      <section className="max-w-4xl mx-auto mb-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-5xl md:text-7xl tracking-tight text-primary mb-12"
        >
          Uncover the <span className="italic">invisible threads.</span>
        </motion.h1>
        
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch} 
          className="relative group max-w-3xl mx-auto"
        >
          <div className="relative flex items-center bg-white shadow-sm px-4 py-3 rounded-sm">
            <Search className="text-outline mx-2" size={20} />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-lg font-body placeholder:text-outline/50 text-primary outline-none" 
              placeholder="Show me historical parallels for major shifts in energy supply..." 
            />
            <button 
              type="submit"
              disabled={isSearching || !query.trim()}
              className="ml-4 px-8 py-3 bg-[#1A2B3C] text-white rounded-sm font-label text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Query'}
            </button>
          </div>
        </motion.form>

        {!hasSearched && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-3 items-center"
          >
            <span className="text-xs uppercase tracking-widest text-outline font-bold mr-2">Trending:</span>
            {isLoadingExplore ? (
              <span className="text-xs text-outline animate-pulse">Loading global knowledge graph...</span>
            ) : exploreError ? (
              <span className="text-xs text-red-500">Failed to load trending topics.</span>
            ) : (
              exploreData?.trendingTopics.map(topic => (
                <button 
                  key={topic}
                  onClick={() => { setQuery(topic); setTimeout(() => handleSearch(), 100); }}
                  className="px-4 py-1.5 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  {topic}
                </button>
              ))
            )}
          </motion.div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-outline mb-4">Trending Archetypes</h3>
            <div className="space-y-3">
              {isLoadingExplore ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-[#F2F1ED] p-5 rounded-sm h-24"></div>
                  ))}
                </div>
              ) : exploreError ? (
                <div className="bg-[#F2F1ED] p-5 rounded-sm text-red-500 text-xs">
                  Failed to load archetypes.
                </div>
              ) : exploreData?.trendingArchetypes.map((arch, i) => (
                <div key={i} className="bg-[#F2F1ED] p-5 rounded-sm cursor-pointer hover:bg-[#EAE9E4] transition-colors">
                  <h4 className="font-headline italic text-lg text-primary mb-2">{arch.title}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{arch.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#EAE8EC] border border-[#D5D2D9] p-5 rounded-sm">
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#A39EAB] mb-3">AI Synthesis Pulse</h3>
            {isLoadingExplore ? (
              <div className="h-16 animate-pulse bg-[#D5D2D9]/20 rounded-sm"></div>
            ) : exploreError ? (
              <p className="text-xs text-red-500">Failed to load synthesis pulse.</p>
            ) : (
              <p className="font-headline italic text-sm text-primary leading-relaxed">
                "{exploreData?.aiSynthesisPulse}"
              </p>
            )}
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-9">
          <div className="flex items-end justify-between mb-6 border-b border-outline-variant/20 pb-4">
            <h2 className="font-headline text-4xl italic text-primary">Recommended Echo Pathways</h2>
            <div className="flex gap-6 text-[10px] font-bold tracking-widest uppercase">
              <button className="text-[#B86B5D] border-b border-[#B86B5D] pb-1">By Narrative Fit</button>
              <button className="text-outline hover:text-primary transition-colors pb-1">By Chronology</button>
            </div>
          </div>

          {hasSearched && isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Sparkles className="animate-pulse text-secondary mb-4" size={32} />
              <p className="font-headline italic text-xl">Synthesizing historical archives...</p>
            </div>
          ) : hasSearched && results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {results.map((result, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={result.id}
                  onClick={() => onSelectParallel(result.modernEvent, result.historicalEvent)}
                  className="group cursor-pointer bg-[#F2F1ED] p-8 rounded-sm hover:bg-[#EAE9E4] transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[#B86B5D] font-label text-[10px] tracking-widest uppercase font-bold">
                      {result.historicalEvent} / {result.modernEvent}
                    </span>
                    <span className="text-xs font-mono text-outline bg-white px-2 py-1 rounded-sm">
                      Score: {result.confidenceScore}
                    </span>
                  </div>
                  <h3 className="font-headline italic text-3xl mb-3 text-primary group-hover:text-secondary transition-colors">
                    {result.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                    {result.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {result.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white text-[10px] uppercase font-semibold text-on-surface-variant rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <>
              {isLoadingExplore ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Sparkles className="animate-pulse text-secondary mb-4" size={32} />
                  <p className="font-headline italic text-xl">Querying Global Knowledge Graph...</p>
                </div>
              ) : exploreError ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="font-headline italic text-xl text-red-500 mb-4">{exploreError}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-[#1A2B3C] text-white text-[10px] font-bold tracking-widest uppercase rounded-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {exploreData?.recommendedPathways.filter(p => p.type === 'card').map((pathway, idx) => (
                      <div key={idx} className="bg-[#F2F1ED] rounded-sm overflow-hidden group cursor-pointer flex flex-col">
                        <div className="relative h-48 overflow-hidden">
                          <img src={pathway.imageUrl} alt={pathway.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                          <div className="absolute top-3 right-3 bg-[#F2F1ED] px-2 py-1 flex items-center gap-1.5 rounded-sm">
                            <BarChart2 size={10} className="text-[#B86B5D]" />
                            <span className="text-[9px] font-bold tracking-wider">{pathway.matchScore} MATCH</span>
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-[#B86B5D] mb-3">{pathway.archetype}</span>
                          <h3 className="font-headline italic text-2xl text-primary mb-4 leading-tight">{pathway.title}</h3>
                          <p className="text-sm text-on-surface-variant leading-relaxed mb-8 flex-1">
                            {pathway.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-outline">{pathway.echoesLinked} Echoes Linked</span>
                            <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Full Width Card */}
                  {exploreData?.recommendedPathways.filter(p => p.type === 'full').map((pathway, idx) => (
                    <div key={idx} className="bg-[#F2F1ED] rounded-sm overflow-hidden group cursor-pointer flex flex-col md:flex-row">
                      <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
                        <img src={pathway.imageUrl} alt={pathway.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      </div>
                      <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#3A2B4C]"></div>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Deep Synthetically Linked Pathway</span>
                        </div>
                        <h3 className="font-headline italic text-3xl text-primary mb-4 leading-tight">{pathway.title}</h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
                          {pathway.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-[#E0DCD3] flex items-center justify-center text-[9px] font-bold border border-[#F2F1ED]">H</div>
                            <div className="w-6 h-6 rounded-full bg-[#E8BAA4] flex items-center justify-center text-[9px] font-bold border border-[#F2F1ED]">J</div>
                            <div className="w-6 h-6 rounded-full bg-[#C2CBE0] flex items-center justify-center text-[9px] font-bold border border-[#F2F1ED]">+{pathway.echoesLinked}</div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[#B86B5D]">
                            <span>Enter Pathway</span>
                            <ArrowRight size={12} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
