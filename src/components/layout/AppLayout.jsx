import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AuroraBackground from './AuroraBackground';
import TopHeader from './TopHeader';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAppStore } from '../../store/useAppStore';
import useAuthStore from '../../store/useAuthStore';
import db from '../../db/database';
import { SEED_BOOKS, VIRTUES, BADGES } from '../../db/seedData';
import OnboardingModal from '../../features/settings/OnboardingModal';
import AuthModal from '../../features/auth/AuthModal';
import GuestMigrationDialog from '../../features/auth/GuestMigrationDialog';

export default function AppLayout() {
  const initApp = useAppStore(state => state.initApp);
  const showOnboarding = useAppStore(state => state.showOnboarding);
  const initAuth = useAuthStore(state => state.initAuth);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setupApp() {
      await Promise.all([initApp(), initAuth()]);
      
      // Ensure seed data is initialized in Dexie
      try {
        const bookCount = await db.books.count();
        if (bookCount === 0) {
          for (const book of SEED_BOOKS) {
            await db.books.put(book);
          }
        }
      } catch (err) {
        console.warn('Seed initialization note:', err);
      }

      setDbReady(true);
    }
    setupApp();
  }, [initApp, initAuth]);

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* Ambient shifting Aurora background */}
      <AuroraBackground />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 lg:pl-72 relative z-10 min-h-screen">
        <TopHeader />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 pb-28 md:pb-12">
          {dbReady ? <Outlet /> : (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-400 font-medium">Entering Sanctuary...</p>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Floating Nav */}
        <BottomNav />
      </div>

      {/* First-time Onboarding Modal */}
      {showOnboarding && <OnboardingModal />}

      {/* Cloud Auth & Sync Modals */}
      <AuthModal />
      <GuestMigrationDialog />
    </div>
  );
}

