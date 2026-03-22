import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Rss, Sparkles, Bookmark } from 'lucide-react';
import { generateDeepDive, DeepDiveData } from '../lib/gemini';
import { useToast } from '../components/Toast';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface DetailProps {
  modernEvent: string;
  historicalEvent: string;
  onBack: () => void;
}

export function Detail({ modernEvent, historicalEvent, onBack }: DetailProps) {
  const [data, setData] = useState<DeepDiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await generateDeepDive(historicalEvent, modernEvent);
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [historicalEvent, modernEvent]);

  const handleSaveCuration = async () => {
    if (!user) {
      showToast("Please log in to save curations");
      return;
    }
    if (!data) return;
    
    try {
      await addDoc(collection(db, 'curations'), {
        userId: user.uid,
        modernTitle: data.modern.title,
        historicalTitle: data.historical.title,
        modernEvent: modernEvent,
        historicalEvent: historicalEvent,
        description: data.coreParallel.title,
        imageUrl: '',
        link: '',
        createdAt: serverTimestamp()
      });
      showToast('Deep Dive saved to Curations');
    } catch (error) {
      console.error("Error saving curation:", error);
      showToast('Failed to save curation');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Sparkles className="animate-pulse text-secondary mb-6" size={48} />
        <h2 className="font-headline italic text-3xl text-primary">Synthesizing Historical Threads...</h2>
        <p className="text-on-surface-variant mt-4">Analyzing structural parallels between {historicalEvent} and {modernEvent}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-32 px-6 canvas-grid relative overflow-hidden">
      <div className="fixed top-24 left-6 z-50 flex flex-col gap-4">
        <button 
          onClick={onBack}
          className="bg-surface/80 backdrop-blur-md p-2 rounded-full hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/20"
          title="Back"
        >
          <ArrowLeft className="text-primary" size={24} />
        </button>
        <button 
          onClick={handleSaveCuration}
          className="bg-surface/80 backdrop-blur-md p-2 rounded-full hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/20"
          title="Save to Curations"
        >
          <Bookmark className="text-primary" size={24} />
        </button>
      </div>

      {/* Depth Slider (Floating Left) */}
      <aside className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-6">
        <div className="h-64 w-1 bg-outline-variant/30 rounded-full relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 whitespace-nowrap text-[10px] uppercase tracking-tighter text-outline font-bold">Scholar</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-4 whitespace-nowrap text-[10px] uppercase tracking-tighter text-outline font-bold">Layman</div>
          <div 
            onClick={() => showToast('Adjusting depth level...')}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4 h-4 bg-secondary rounded-full shadow-lg cursor-pointer ring-4 ring-background"
          ></div>
          <div className="absolute bottom-0 left-0 w-full h-3/4 bg-primary-container/40 rounded-full"></div>
        </div>
        <span className="text-[10px] font-bold text-primary mt-8">DEPTH</span>
      </aside>

      <div className="max-w-7xl mx-auto relative mt-12">
        {/* Core Connection Node */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-24 relative z-20"
        >
          <div className="bg-primary-container text-on-primary-container p-10 rounded-xl shadow-2xl max-w-2xl text-center ring-1 ring-white/10 backdrop-blur-md">
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold opacity-80 mb-4 block">Core Parallel</span>
            <h1 className="font-headline text-4xl md:text-5xl italic text-surface-container-lowest leading-tight">
              {data.coreParallel.title}
            </h1>
            <div className="mt-8 flex justify-center gap-3">
              {data.coreParallel.tags.map(tag => (
                <span key={tag} className="bg-secondary/20 text-secondary text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Knowledge Graph Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-32 relative">
          
          {/* SVG Connection Lines (Conceptual Simulation) */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <svg className="w-full h-full opacity-20" viewBox="0 0 1000 600" preserveAspectRatio="none">
              <path d="M500,0 C500,100 200,100 200,200" fill="none" stroke="#7e5443" strokeDasharray="4 4" strokeWidth="1.5"></path>
              <path d="M500,0 C500,100 800,100 800,200" fill="none" stroke="#334756" strokeDasharray="4 4" strokeWidth="1.5"></path>
              <path d="M200,280 C200,350 100,350 100,450" fill="none" stroke="#7e5443" strokeWidth="1"></path>
              <path d="M200,280 C200,350 300,350 300,450" fill="none" stroke="#7e5443" strokeWidth="1"></path>
              <path d="M800,280 C800,350 700,350 700,450" fill="none" stroke="#334756" strokeWidth="1"></path>
              <path d="M800,280 C800,350 900,350 900,450" fill="none" stroke="#334756" strokeWidth="1"></path>
            </svg>
          </div>

          {/* LEFT: The Parallel (Historical) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 z-10"
          >
            <div className="bg-surface-container-low p-8 rounded-xl border-l-4 border-secondary shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="text-secondary" size={20} />
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">The Parallel</span>
              </div>
              <h2 className="font-headline text-3xl text-primary mb-4">{data.historical.title}</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed opacity-90">
                {data.historical.description}
              </p>
            </div>

            <div className="ml-8 space-y-6">
              {data.historical.ripples.map((ripple, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 group hover:bg-secondary-container/10 transition-colors">
                  <span className="text-[10px] font-bold text-secondary uppercase block mb-2">Domino Effect {idx + 1}</span>
                  <h3 className="font-medium text-base text-primary mb-2">{ripple.title}</h3>
                  <p className="text-sm text-on-surface-variant opacity-80 leading-relaxed">{ripple.description}</p>
                </div>
              ))}
              
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-secondary/30 group hover:bg-secondary-container/20 transition-colors relative overflow-hidden mt-8">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                <span className="text-[10px] font-bold text-secondary uppercase block mb-2">Historical Conclusion</span>
                <h3 className="font-medium text-base text-primary mb-2">{data.historical.ultimateOutcome.title}</h3>
                <p className="text-sm text-on-surface-variant opacity-80 leading-relaxed">{data.historical.ultimateOutcome.description}</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: The Now (Current Event) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8 z-10"
          >
            <div className="bg-surface-container-low p-8 rounded-xl border-l-4 border-primary shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Rss className="text-primary" size={20} />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">The Now</span>
              </div>
              <h2 className="font-headline text-3xl text-primary mb-4">{data.modern.title}</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed opacity-90">
                {data.modern.description}
              </p>
            </div>

            <div className="ml-8 space-y-6">
              {data.modern.ripples.map((ripple, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 group hover:bg-primary-container/10 transition-colors">
                  <span className="text-[10px] font-bold text-primary uppercase block mb-2">Global Ripple {idx + 1}</span>
                  <h3 className="font-medium text-base text-primary mb-2">{ripple.title}</h3>
                  <p className="text-sm text-on-surface-variant opacity-80 leading-relaxed">{ripple.description}</p>
                </div>
              ))}
              
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-primary/30 group hover:bg-primary-container/20 transition-colors relative overflow-hidden mt-8">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <span className="text-[10px] font-bold text-primary uppercase block mb-2">Projected Trajectory</span>
                <h3 className="font-medium text-base text-primary mb-2">{data.modern.projectedTrajectory.title}</h3>
                <p className="text-sm text-on-surface-variant opacity-80 leading-relaxed">{data.modern.projectedTrajectory.description}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Insight Bubble */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="fixed bottom-28 right-8 z-40 max-w-sm"
        >
          <div className="bg-tertiary-container/95 backdrop-blur-xl p-6 rounded-2xl border border-tertiary/20 shadow-2xl ai-halo">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="text-[10px] font-bold text-on-tertiary-container uppercase tracking-widest">AI Synthesized Insight</span>
            </div>
            <p className="text-sm text-on-tertiary-container leading-relaxed italic font-headline">
              "{data.aiInsight}"
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
