import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ExternalLink, BookOpen, Layers, Sparkles } from 'lucide-react';
import { fetchDynamicCollections, CollectionData } from '../lib/gemini';

export function Collections() {
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchDynamicCollections();
        setCollectionData(data);
      } catch (err) {
        console.error("Failed to load collections data:", err);
        setError("Failed to load collections. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 flex flex-col items-center justify-center opacity-50">
        <Sparkles className="animate-pulse text-secondary mb-4" size={32} />
        <p className="font-headline italic text-xl">Synthesizing global knowledge graph...</p>
      </div>
    );
  }

  if (error || !collectionData) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 flex flex-col items-center justify-center">
        <p className="font-headline italic text-xl text-red-500 mb-4">{error || "Failed to load data."}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#1A2B3C] text-white text-[10px] font-bold tracking-widest uppercase rounded-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-12 pb-32">
      {/* Featured Section */}
      <section className="flex flex-col lg:flex-row gap-16 items-center mb-24">
        <div className="lg:w-1/2">
          <div className="inline-block bg-[#8B6F5C] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 mb-6">
            Featured Parallel
          </div>
          <h1 className="font-headline italic text-6xl md:text-8xl text-primary leading-[0.9] mb-8">
            {collectionData.featured.title.split(' ').slice(0, 2).join(' ')}<br />
            {collectionData.featured.title.split(' ').slice(2).join(' ')}
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-md">
            {collectionData.featured.description}
          </p>
          <button className="bg-[#1A2B3C] text-white px-6 py-3 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:opacity-90 transition-opacity">
            Open Archive <ArrowRight size={14} />
          </button>
        </div>
        <div className="lg:w-1/2 relative">
          <div className="aspect-[4/5] overflow-hidden bg-surface-container">
            <img 
              src={collectionData.featured.imageUrl} 
              alt={collectionData.featured.title} 
              className="w-full h-full object-cover grayscale opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-headline italic text-2xl">{collectionData.featured.volumeName}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-3 mb-16">
        {collectionData.filters.map((filter, i) => (
          <button 
            key={filter}
            className={`px-5 py-2 text-[10px] font-bold tracking-widest uppercase rounded-full transition-colors ${
              i === 0 
                ? 'bg-[#1A2B3C] text-white' 
                : 'bg-[#F2F1ED] text-outline hover:bg-[#EAE9E4]'
            }`}
          >
            {filter}
          </button>
        ))}
      </section>

      {/* Volumes Section */}
      {collectionData.volumes.map((volume, vIndex) => (
        <section key={vIndex} className="mb-24">
          <div className="flex items-end justify-between mb-8 border-b border-outline-variant/20 pb-4">
            <div>
              <h2 className="font-headline italic text-4xl text-primary mb-2">{volume.title}</h2>
              <p className="text-sm text-on-surface-variant">{volume.description}</p>
            </div>
            <button className="text-[10px] font-bold tracking-widest uppercase text-[#8B6F5C] flex items-center gap-1 hover:opacity-80 transition-opacity">
              View Volume <ExternalLink size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {volume.events.map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-square overflow-hidden mb-4 bg-surface-container">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-[9px] font-bold tracking-widest uppercase text-[#8B6F5C] mb-2">{item.tag}</div>
                <h3 className="font-headline italic text-2xl text-primary mb-2 leading-tight">{item.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Newsletter Section */}
      <section className="bg-[#F8F7F5] py-24 px-6 text-center rounded-sm">
        <div className="max-w-2xl mx-auto">
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#8B6F5C] mb-6">The Weekly Echo</div>
          <h2 className="font-headline italic text-4xl md:text-5xl text-primary mb-12 leading-tight">
            Receive the archive in your<br />private correspondence.
          </h2>
          <div className="flex items-center border-b border-outline-variant/30 pb-2 mb-6 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="YOUR@EMAIL.COM" 
              className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold tracking-widest uppercase placeholder:text-outline/50 text-primary outline-none"
            />
            <button className="text-[10px] font-bold tracking-widest uppercase text-primary hover:text-[#8B6F5C] transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-outline">
            Minimalist frequency. Historical depth. No clutter.
          </p>
        </div>
      </section>
    </div>
  );
}
