import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Bookmark, Share2, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '../components/Toast';
import { FeedEcho } from '../lib/gemini';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { processNewsPipeline } from '../lib/pipeline';

interface FeedProps {
  onSelectParallel: (modern: string, historical: string) => void;
}

const curatedEchoes: FeedEcho[] = [
  {
    id: 1,
    modernTitle: "Global Supply Chains Strain Under Geopolitical Shifts",
    historicalTitle: "The Bronze Age Collapse and Interconnected Fragility",
    modernEvent: "Global Supply Chains Strain Under Geopolitical Shifts",
    historicalEvent: "The Bronze Age Collapse and Interconnected Fragility",
    description: "The current fragility of global just-in-time manufacturing mirrors the structural vulnerabilities of the Late Bronze Age. Much like the reliance on tin and copper trade routes, today's geopolitical friction exposes how hyper-optimized systems fail catastrophically when a single node is disrupted.",
    imageUrl: "https://images.unsplash.com/photo-1555990538-782c5f1c990a?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Ancient ruins",
    highlight: "Late Bronze Age",
    layout: "full"
  },
  {
    id: 2,
    modernTitle: "Generative AI Disrupts Knowledge Economies",
    historicalTitle: "The Gutenberg Disruption and the Democratization of Authority",
    modernEvent: "Generative AI Disrupts Knowledge Economies",
    historicalEvent: "The Gutenberg Disruption and the Democratization of Authority",
    description: "This technological pivot reflects the 15th-century Printing Revolution. The sudden collapse of \"gatekeeper\" authority mirrors the clergy's loss of information control during the Reformation, signaling a shift from centralized truth to algorithmic distribution.",
    imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Vintage printing press",
    highlight: "Printing Revolution",
    layout: "split-reverse"
  },
  {
    id: 3,
    modernTitle: "Climate-Driven Migration Strains Global Borders",
    historicalTitle: "The Völkerwanderung and the Transformation of Rome",
    modernEvent: "Climate-Driven Migration Strains Global Borders",
    historicalEvent: "The Migration Period (Völkerwanderung) and the Fall of Rome",
    description: "Modern mass migrations driven by climate change and resource scarcity closely parallel the Migration Period of Late Antiquity. Just as the movement of Germanic tribes reshaped the Roman Empire, today's demographic shifts are testing the resilience and adaptability of modern nation-states.",
    imageUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "People walking in a vast landscape",
    highlight: "Migration Period",
    layout: "split"
  },
  {
    id: 4,
    modernTitle: "The Privatization of Space Exploration",
    historicalTitle: "Charter Companies and the Age of Discovery",
    modernEvent: "The Privatization of Space Exploration",
    historicalEvent: "The Dutch East India Company and the Age of Discovery",
    description: "The reliance on private corporations like SpaceX for orbital logistics mirrors the 17th-century reliance on joint-stock companies like the VOC. Governments are once again outsourcing the massive risks of frontier exploration to private entities, blurring the lines between state power and corporate ambition.",
    imageUrl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Rocket launch",
    highlight: "joint-stock companies",
    layout: "split-reverse"
  },
  {
    id: 5,
    modernTitle: "The Resurgence of Global Labor Movements",
    historicalTitle: "The Peasants' Revolt and Post-Plague Economics",
    modernEvent: "The Resurgence of Global Labor Movements",
    historicalEvent: "The Peasants' Revolt of 1381 and Post-Plague Economics",
    description: "Recent surges in unionization and labor strikes echo the economic restructuring following the Black Death. A sudden shift in labor supply dynamics empowers workers to demand better conditions, challenging entrenched economic hierarchies just as the 14th-century peasantry challenged feudalism.",
    imageUrl: "https://images.unsplash.com/photo-1503945438517-f65904a52ce6?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Crowd of people",
    highlight: "Black Death",
    layout: "full"
  }
];

export function Feed({ onSelectParallel }: FeedProps) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [echoes, setEchoes] = useState<FeedEcho[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');

  useEffect(() => {
    loadLiveEchoes();
  }, []);

  const loadLiveEchoes = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setLoadingStatus('Connecting to the Backend Newsroom...');
    }
    try {
      const echoesRef = collection(db, 'daily_echoes');
      const q = query(echoesRef, orderBy('createdAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const data = docData.echoes || [];
        
        if (data && data.length > 0) {
          // Map the backend data to the FeedEcho format expected by the UI
          const mappedEchoes: FeedEcho[] = data.map((item: any, index: number) => {
            const layouts = ['full', 'split-reverse', 'split', 'split-reverse', 'full'];
            return {
              id: item.id || `echo-${index}`,
              modernTitle: item.modern_title,
              historicalTitle: item.historical_parallel,
              modernEvent: item.modern_title,
              historicalEvent: item.historical_parallel,
              description: item.historical_description || item.modern_description,
              structuralSkeleton: item.structural_skeleton,
              imageUrl: `https://picsum.photos/seed/${item.archetype?.replace(/\s+/g, '') || 'history'}/1200/800`,
              imageAlt: item.modern_title,
              highlight: item.archetype,
              layout: layouts[index % layouts.length],
              link: '#'
            };
          });
          setEchoes(mappedEchoes);
        } else {
          // Only set curated echoes if we're not silently polling
          if (!silent || echoes.length === 0 || echoes === curatedEchoes) {
            setEchoes(curatedEchoes);
          }
        }
      } else {
        if (!silent || echoes.length === 0 || echoes === curatedEchoes) {
          setEchoes(curatedEchoes);
        }
      }
    } catch (error) {
      console.error("Failed to load live echoes, using fallback:", error);
      if (!silent || echoes.length === 0 || echoes === curatedEchoes) {
        setEchoes(curatedEchoes);
        if (!silent) showToast("Using curated archives (live feed unavailable)");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Poll for new echoes every 15 seconds if we're showing curated echoes
  useEffect(() => {
    const isShowingCurated = echoes === curatedEchoes;
    if (isShowingCurated) {
      const interval = setInterval(() => {
        loadLiveEchoes(true);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [echoes]);

  const handleSaveCuration = async (echo: FeedEcho) => {
    if (!user) {
      showToast("Please log in to save curations");
      return;
    }
    
    try {
      await addDoc(collection(db, 'curations'), {
        userId: user.uid,
        modernTitle: echo.modernTitle,
        historicalTitle: echo.historicalTitle,
        modernEvent: echo.modernEvent,
        historicalEvent: echo.historicalEvent,
        description: echo.description,
        imageUrl: echo.imageUrl || '',
        link: echo.link || '',
        createdAt: serverTimestamp()
      });
      showToast('Saved to Curations');
    } catch (error) {
      console.error("Error saving curation:", error);
      showToast('Failed to save curation');
    }
  };

  const renderDescription = (text: string, highlight: string) => {
    const parts = text.split(highlight);
    if (parts.length === 2) {
      return (
        <>
          {parts[0]}<span className="text-primary font-medium">{highlight}</span>{parts[1]}
        </>
      );
    }
    return text;
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleTriggerPipeline = async () => {
    if (!user) {
      showToast("Please log in to trigger the pipeline");
      return;
    }
    setIsProcessing(true);
    showToast("Triggering news pipeline in the background...");
    try {
      await processNewsPipeline();
      showToast("Pipeline completed successfully. Reloading feed...");
      await loadLiveEchoes();
    } catch (error) {
      console.error("Error triggering pipeline:", error);
      showToast("Failed to trigger pipeline. Check permissions.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin text-secondary mb-6" size={48} />
        <h2 className="font-headline italic text-3xl text-primary">{loadingStatus}</h2>
        <p className="text-on-surface-variant mt-4">Connecting current events to the historical archive</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 md:py-20 lg:py-24">
      <section className="mb-16 md:mb-24 flex flex-col items-center text-center">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-secondary font-label text-xs uppercase tracking-[0.2em] font-semibold">The Journal of Continuity</span>
          <button 
            onClick={handleTriggerPipeline}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-full text-xs font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isProcessing ? "animate-spin" : ""} />
            {isProcessing ? "Processing..." : "Sync Live Feed"}
          </button>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-primary tracking-tight leading-[1.1] max-w-4xl">
          Current <span className="italic">Echoes</span>
        </h1>
        <p className="mt-8 text-on-surface-variant font-body text-lg max-w-xl leading-relaxed opacity-90">
          Understanding the present through the meticulous lens of the past. A curated feed of modern ripples and their ancient tides.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
        {/* Feed Content */}
        <div className="lg:col-span-8 space-y-24 md:space-y-32">
          
          {echoes.map((echo) => (
            <article key={echo.id} className="group relative">
              <div className={`flex ${echo.layout === 'full' ? 'flex-col gap-8 md:gap-12' : echo.layout === 'split-reverse' ? 'flex-col md:flex-row-reverse gap-8 md:gap-12 items-center' : 'flex-col md:flex-row gap-8 md:gap-12 items-center'}`}>
                
                <div className={`w-full ${echo.layout === 'full' ? 'aspect-[16/9]' : 'md:w-1/2 aspect-square'} bg-surface-container-high rounded-xl overflow-hidden relative`}>
                  <img 
                    src={echo.imageUrl} 
                    alt={echo.imageAlt} 
                    className="w-full h-full object-cover historical-filter group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {echo.layout === 'full' && <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>}
                </div>
                
                <div className={`flex flex-col gap-6 ${echo.layout === 'full' ? 'md:pl-12' : 'w-full md:w-1/2'}`}>
                  <div className={`ai-halo bg-tertiary-container/10 p-8 rounded-xl ${echo.layout === 'split-reverse' ? 'border-r-2 text-right md:text-left' : 'border-l-2'} border-tertiary/20 transition-all duration-500`}>
                    <div className={`flex items-center gap-2 mb-3 ${echo.layout === 'split-reverse' ? 'justify-end md:justify-start' : ''}`}>
                      <Sparkles className="text-tertiary" size={16} />
                      <span className="text-tertiary font-label text-[10px] uppercase tracking-widest font-bold">
                        Synthesized Intelligence
                      </span>
                    </div>
                    <h2 className="font-headline text-3xl md:text-4xl text-primary leading-tight">
                      {echo.modernTitle}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-secondary font-headline text-2xl italic leading-snug">
                      Parallels: {echo.historicalTitle}
                    </h3>
                    <p className="text-on-surface-variant font-body text-base leading-relaxed max-w-2xl transition-all duration-500">
                      {renderDescription(echo.description, echo.highlight)}
                    </p>
                  </div>
                  
                  <footer className="flex items-center gap-6 pt-6 border-t border-outline-variant/20">
                    <button 
                      onClick={() => onSelectParallel(echo.modernEvent, echo.historicalEvent)}
                      className="bg-primary text-on-primary px-6 py-3 rounded-md font-label text-xs uppercase tracking-widest hover:bg-primary-container transition-all flex items-center gap-2"
                    >
                      Deep Dive
                      {echo.layout === 'full' && <ArrowRight size={16} />}
                    </button>
                    <div className="flex gap-4">
                      {echo.link && (
                        <a href={echo.link} target="_blank" rel="noopener noreferrer" className="p-2 text-primary opacity-60 hover:opacity-100 transition-opacity" title="Read Original Article">
                          <ExternalLink size={20} />
                        </a>
                      )}
                      <button onClick={() => handleSaveCuration(echo)} className="p-2 text-primary opacity-60 hover:opacity-100 transition-opacity"><Bookmark size={20} /></button>
                      <button onClick={() => showToast('Link copied to clipboard')} className="p-2 text-primary opacity-60 hover:opacity-100 transition-opacity"><Share2 size={20} /></button>
                    </div>
                  </footer>
                </div>
              </div>
            </article>
          ))}

        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 sticky top-32 space-y-12">
          <section className="p-8 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-6 font-bold">Current Tempo</h4>
            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <span className="font-headline text-xl text-primary">The Great Recalibration</span>
                <span className="text-xs text-on-surface-variant opacity-80">6 New Parallels added today</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-headline text-xl text-primary">Empire Decay Indices</span>
                <span className="text-xs text-on-surface-variant opacity-80">Global market patterns mirroring 1929</span>
              </div>
            </div>
          </section>

          <section 
            className="relative aspect-[4/5] bg-primary overflow-hidden rounded-xl p-8 flex flex-col justify-end group cursor-pointer"
            onClick={() => onSelectParallel('The Anatomy of Civil Unrest through the Ages', 'Historical Civil Unrest')}
          >
            <img 
              src="https://images.unsplash.com/photo-1544654803-b69140b285a1?q=80&w=600&auto=format&fit=crop" 
              alt="Classical sculpture" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-10">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-primary opacity-80 mb-3 block font-bold">Weekly Curation</span>
              <h4 className="font-headline text-3xl text-on-primary mb-6 leading-tight">The Anatomy of Civil Unrest through the Ages</h4>
              <button className="text-on-primary font-label text-xs uppercase tracking-widest border-b border-on-primary/30 pb-1 hover:border-on-primary transition-colors">Explore Theme</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
