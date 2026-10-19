import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { CommandCenter } from './pages/CommandCenter';
import { PresentationMode } from './components/PresentationMode';
import { WorkloadState } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'architecture' | 'dashboard'>('landing');
  const [workloadState, setWorkloadState] = useState<WorkloadState>('HEALTHY');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false); // Default to Demo Mode as specified
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);

  // Global key listener for Presentation Mode (press 'P')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'p' || e.key === 'P') {
        setIsPresentationOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-void-base text-text-primary flex flex-col font-body selection:bg-aurora-teal/30 selection:text-aurora-teal aurora-bg-mesh">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isLiveMode={isLiveMode}
        setIsLiveMode={setIsLiveMode}
        onOpenPresentation={() => setIsPresentationOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1 w-full">
        {currentTab === 'landing' && (
          <LandingPage
            onLaunchDemo={() => setCurrentTab('dashboard')}
            onViewArchitecture={() => setCurrentTab('architecture')}
            workloadState={workloadState}
          />
        )}

        {currentTab === 'architecture' && (
          <ArchitecturePage />
        )}

        {currentTab === 'dashboard' && (
          <CommandCenter
            isLiveMode={isLiveMode}
            workloadState={workloadState}
            setWorkloadState={setWorkloadState}
          />
        )}
      </main>

      {/* Faculty Presentation Guided Tour (Press P) */}
      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        status={workloadState}
        onSimulateAttack={() => setWorkloadState('UNDER_ATTACK')}
        onRunIsolation={() => setWorkloadState('QUARANTINED')}
        onRollback={() => setWorkloadState('HEALTHY')}
      />

      {/* Ambient Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs font-mono text-text-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            AuraGuard: Autonomous Zero-Trust Cloud Forensic Isolation & Cryptographic Evidence Vault
          </div>
          <div className="text-aurora-teal">
            Region: ap-south-1 (Mumbai) • Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-text-primary">P</kbd> for Defense Mode
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
