import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import TripDetails from './pages/TripDetails';
import SavedTrips from './pages/SavedTrips';
import AiAssistant from './pages/AiAssistant';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import { mockDb } from './lib/supabase';

type Page = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'forgot' 
  | 'dashboard' 
  | 'new-trip' 
  | 'trip-details' 
  | 'saved-trips' 
  | 'ai-assistant' 
  | 'profile' 
  | 'settings' 
  | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [pageParams, setPageParams] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check user session on mount
  useEffect(() => {
    const checkSession = async () => {
      setAuthLoading(true);
      const { data } = await mockDb.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setCurrentPage('dashboard');
      }
      setAuthLoading(false);
    };
    checkSession();
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page as Page);
    if (params) {
      setPageParams(params);
    } else {
      setPageParams(null);
    }
  };

  const handleAuthSuccess = (sessionUser: any) => {
    setUser(sessionUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await mockDb.auth.signOut();
    setUser(null);
    setCurrentPage('landing');
  };

  const isPublicPage = ['landing', 'login', 'register', 'forgot'].includes(currentPage);
  const isAdmin = user?.email === 'admin@trippilot.ai';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080b11] flex flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-sm font-semibold">Consulting active routing matrices...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b11] text-gray-200 flex flex-col">
      {/* Universal header navigation */}
      <Navbar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main viewport */}
      <div className="grow flex">
        {/* Protected Dashboard Sidebar */}
        {!isPublicPage && user && (
          <Sidebar 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            isAdmin={isAdmin}
          />
        )}

        {/* Dynamic content rendering container */}
        <main className={`grow p-6 md:p-8 overflow-y-auto max-w-full ${isPublicPage ? 'p-0!' : ''}`}>
          {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          
          {['login', 'register', 'forgot'].includes(currentPage) && (
            <Auth 
              initialMode={currentPage as any} 
              onAuthSuccess={handleAuthSuccess} 
              onNavigate={handleNavigate} 
            />
          )}

          {currentPage === 'dashboard' && user && (
            <Dashboard user={user} onNavigate={handleNavigate} />
          )}

          {currentPage === 'new-trip' && user && (
            <Interview user={user} onNavigate={handleNavigate} />
          )}

          {currentPage === 'trip-details' && user && pageParams?.tripId && (
            <TripDetails 
              tripId={pageParams.tripId} 
              onNavigate={handleNavigate} 
              user={user} 
            />
          )}

          {currentPage === 'saved-trips' && user && (
            <SavedTrips user={user} onNavigate={handleNavigate} />
          )}

          {currentPage === 'ai-assistant' && user && (
            <AiAssistant />
          )}

          {currentPage === 'profile' && user && (
            <Profile 
              user={user} 
              onUpdateUser={(updated) => setUser(updated)} 
            />
          )}

          {currentPage === 'settings' && user && (
            <Settings />
          )}

          {currentPage === 'admin' && user && isAdmin && (
            <Admin user={user} onNavigate={handleNavigate} />
          )}
        </main>
      </div>
    </div>
  );
}
