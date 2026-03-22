/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout, ViewState } from './components/Layout';
import { Onboarding } from './views/Onboarding';
import { Feed } from './views/Feed';
import { Explore } from './views/Explore';
import { Collections } from './views/Collections';
import { Detail } from './views/Detail';
import { Curations } from './views/Curations';
import { Profile } from './views/Profile';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './components/AuthProvider';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('onboarding');
  const [selectedParallel, setSelectedParallel] = useState<{ modern: string, historical: string } | null>(null);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view !== 'detail') {
      setSelectedParallel(null);
    }
  };

  const handleSelectParallel = (modern: string, historical: string) => {
    setSelectedParallel({ modern, historical });
    setCurrentView('detail');
  };

  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <Onboarding onComplete={() => handleNavigate('feed')} />;
      case 'feed':
        return <Feed onSelectParallel={handleSelectParallel} />;
      case 'explore':
        return <Explore onSelectParallel={handleSelectParallel} />;
      case 'collections':
        return <Collections />;
      case 'detail':
        if (selectedParallel) {
          return (
            <Detail 
              modernEvent={selectedParallel.modern} 
              historicalEvent={selectedParallel.historical} 
              onBack={() => handleNavigate('explore')} 
            />
          );
        }
        return <Explore onSelectParallel={handleSelectParallel} />;
      case 'curations':
        return <Curations />;
      case 'profile':
        return <Profile />;
      default:
        return <Feed onSelectParallel={handleSelectParallel} />;
    }
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <Layout 
          currentView={currentView} 
          onNavigate={handleNavigate}
          hideNav={currentView === 'onboarding'}
        >
          {renderView()}
        </Layout>
      </ToastProvider>
    </AuthProvider>
  );
}
