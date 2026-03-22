import React, { useEffect, useState } from 'react';
import { Layers, Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';

interface CurationsProps {
  onSelectParallel?: (modern: string, historical: string) => void;
}

export function Curations({ onSelectParallel }: CurationsProps) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [curations, setCurations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCurations();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadCurations = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'curations'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCurations(fetched);
    } catch (error) {
      console.error("Error loading curations:", error);
      showToast("Failed to load curations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'curations', id));
      setCurations(curations.filter(c => c.id !== id));
      showToast("Curation removed");
    } catch (error) {
      console.error("Error deleting curation:", error);
      showToast("Failed to remove curation");
    }
  };

  if (!user) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <Layers className="text-secondary mb-6 opacity-50" size={48} />
        <h2 className="font-headline text-3xl text-primary mb-4">Log in to view your Curations</h2>
        <p className="text-on-surface-variant opacity-80 text-center max-w-md">
          Sign in to save historical parallels and build your own library of echoes.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 md:py-20">
      <div className="flex items-center gap-4 mb-12">
        <Layers className="text-secondary" size={32} />
        <h1 className="font-headline text-4xl md:text-5xl text-primary">Your Curated Reflections</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-on-surface-variant">Loading your archive...</div>
        ) : curations.length === 0 ? (
          <div className="col-span-full text-center py-12 text-on-surface-variant">
            <p>Your archive is empty. Start saving echoes from the feed.</p>
          </div>
        ) : (
          curations.map((curation) => (
            <div 
              key={curation.id} 
              onClick={() => onSelectParallel && onSelectParallel(curation.modernEvent, curation.historicalEvent)}
              className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 group hover:bg-surface-container transition-colors cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Saved Echo</span>
                <button onClick={(e) => handleDelete(curation.id, e)} className="text-primary opacity-50 hover:text-error hover:opacity-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-headline text-2xl text-primary mb-2 group-hover:text-secondary transition-colors">
                {curation.modernTitle}
              </h3>
              <p className="text-sm text-secondary italic mb-4">
                Parallels: {curation.historicalTitle}
              </p>
              <p className="text-sm text-on-surface-variant opacity-80 line-clamp-3 mb-6 flex-grow">
                {curation.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-primary mt-auto">
                Deep Dive <ArrowRight size={14} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
