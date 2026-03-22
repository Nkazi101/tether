import React from 'react';
import { User, Settings, Archive, LogOut } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../components/AuthProvider';

export function Profile() {
  const { showToast } = useToast();
  const { user, signIn, signOut } = useAuth();

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
      </div>
    </div>
  );
}
