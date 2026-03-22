import React from 'react';
import { Network, BookOpen, Layers, Search, User, Feather, LogIn, LogOut } from 'lucide-react';
import { useToast } from './Toast';
import { useAuth } from './AuthProvider';

export type ViewState = 'onboarding' | 'feed' | 'explore' | 'detail' | 'curations' | 'profile' | 'collections';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  hideNav?: boolean;
}

export function Layout({ children, currentView, onNavigate, hideNav = false }: LayoutProps) {
  const { showToast } = useToast();
  const { user, signIn, signOut } = useAuth();

  if (hideNav) {
    return <div className="min-h-screen flex flex-col relative">{children}</div>;
  }

  const navItems = [
    { id: 'feed', label: 'Feed', icon: BookOpen },
    { id: 'collections', label: 'Collections', icon: Layers },
    { id: 'curations', label: 'Curations', icon: Layers },
    { id: 'explore', label: 'Explore', icon: Search },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 historical-grain z-0"></div>
      
      {/* Top Navigation (Desktop) */}
      <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/10">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto relative">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('feed')}
              className="font-headline italic text-3xl text-primary tracking-tight hover:opacity-80 transition-opacity"
            >
              Echoes
            </button>
          </div>
          
          <nav className="hidden md:flex gap-8 items-center absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ViewState)}
                className={`font-label text-[10px] uppercase tracking-widest pb-1 transition-all ${
                  currentView === item.id 
                    ? 'text-primary font-bold border-b border-primary' 
                    : 'text-outline hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-surface-container transition-colors text-primary">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-surface-container transition-colors text-primary">
              <User size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10 w-full">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] border-t border-outline-variant/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewState)}
              className={`flex flex-col items-center justify-center transition-all ${
                isActive ? 'text-secondary scale-110' : 'text-primary/60 hover:text-primary'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className="mb-1" />
              <span className="font-label text-[10px] font-medium tracking-wide uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
