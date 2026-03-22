import React, { useState } from 'react';
import { User, Settings, Archive, LogOut, Database, Globe } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function Profile() {
  const { showToast } = useToast();
  const { user, signIn, signOut } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingTier2, setIsSeedingTier2] = useState(false);

  const writeEventsToFirestore = async (events: any[]) => {
    let count = 0;
    for (const event of events) {
      try {
        // Generate a simple ID based on the title
        const id = event.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);
        
        // Write to Firestore using the special map format for vectors
        await setDoc(doc(db, 'historical_archives', id), {
          title: event.title,
          year: event.year,
          archetype: event.archetype,
          description: event.description,
          source: event.source || "Golden Set",
          embedding: {
            __type__: '__vector__',
            value: event.embedding
          },
          createdAt: serverTimestamp()
        }, { merge: true });
        count++;
      } catch (e) {
        console.error("Failed to write event:", event.title, e);
      }
    }
    return count;
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    showToast('Generating embeddings for Golden Set...');
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        showToast(`Writing ${data.events.length} events to Firestore...`);
        const count = await writeEventsToFirestore(data.events);
        showToast(`Successfully seeded ${count} events!`);
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error}`);
      }
    } catch (err) {
      showToast('Failed to seed database.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedTier2 = async () => {
    setIsSeedingTier2(true);
    showToast('Fetching Wikipedia events and generating embeddings...');
    try {
      const response = await fetch('/api/seed-tier2', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        showToast(`Writing ${data.events.length} Tier 2 events to Firestore...`);
        const count = await writeEventsToFirestore(data.events);
        showToast(`Successfully seeded ${count} Tier 2 events!`);
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error}`);
      }
    } catch (err) {
      showToast('Failed to seed Tier 2 database.');
    } finally {
      setIsSeedingTier2(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-screen-md mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6 border-4 border-surface">
          <User className="text-primary opacity-50" size={40} />
        </div>
        <h1 className="font-headline text-4xl text-primary mb-2">Guest Scholar</h1>
        <p className="text-on-surface-variant opacity-80 mt-4 mb-8">Log in to view your profile and manage your archive.</p>
        <button 
          onClick={async () => {
            try {
              await signIn();
              showToast('Logged in successfully');
            } catch (e: any) {
              if (e?.message !== 'cancelled') {
                showToast('Failed to log in');
              }
            }
          }}
          className="font-label text-sm uppercase tracking-widest px-6 py-3 rounded-md bg-primary text-on-primary hover:bg-primary-container transition-all"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-md mx-auto px-6 py-12 md:py-20">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6 border-4 border-surface overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="text-primary opacity-50" size={40} />
          )}
        </div>
        <h1 className="font-headline text-4xl text-primary mb-2">{user.displayName || 'Scholar'}</h1>
        <p className="text-on-surface-variant opacity-80 mb-4">{user.email}</p>
        <span className="text-xs font-label uppercase tracking-widest text-secondary font-bold">Archivist</span>
      </div>

      <div className="space-y-6">
        <div 
          onClick={() => showToast('Opening Archive Settings...')}
          className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <Archive className="text-primary opacity-70" size={20} />
            <span className="font-medium text-primary">Archive Settings</span>
          </div>
        </div>
        <div 
          onClick={() => showToast('Opening Preferences...')}
          className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <Settings className="text-primary opacity-70" size={20} />
            <span className="font-medium text-primary">Preferences</span>
          </div>
        </div>
        <div 
          onClick={async () => {
            await signOut();
            showToast('Logged out successfully');
          }}
          className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between hover:bg-error/10 hover:text-error transition-colors cursor-pointer text-error/80"
        >
          <div className="flex items-center gap-4">
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="mt-12 pt-8 border-t border-surface-container-high">
          <h3 className="font-label text-xs uppercase tracking-widest text-secondary mb-4">Admin Tools</h3>
          <div className="space-y-4">
            <button 
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="w-full bg-surface-container-low p-6 rounded-xl flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <Database className="text-primary opacity-70" size={20} />
                <span className="font-medium text-primary">{isSeeding ? 'Seeding Database...' : 'Seed Vector Database (Golden Set)'}</span>
              </div>
            </button>

            <button 
              onClick={handleSeedTier2}
              disabled={isSeedingTier2}
              className="w-full bg-surface-container-low p-6 rounded-xl flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <Globe className="text-primary opacity-70" size={20} />
                <span className="font-medium text-primary">{isSeedingTier2 ? 'Fetching Wikipedia...' : 'Seed Tier 2 (Wikipedia On-This-Day)'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
