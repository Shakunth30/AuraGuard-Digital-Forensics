import React from 'react';
import { Shield, Radio, Presentation, Cloud, Activity } from 'lucide-react';

interface NavbarProps {
  currentTab: 'landing' | 'architecture' | 'dashboard';
  setCurrentTab: (tab: 'landing' | 'architecture' | 'dashboard') => void;
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
  onOpenPresentation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isLiveMode,
  setIsLiveMode,
  onOpenPresentation,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 bg-void-base/80 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-aurora-teal to-aurora-violet p-[1px] shadow-[0_0_20px_rgba(46,242,192,0.3)] group-hover:shadow-[0_0_30px_rgba(46,242,192,0.5)] transition-all">
            <div className="w-full h-full bg-void-base rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-aurora-teal transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-wider text-text-primary">
                AURA<span className="text-aurora-teal">GUARD</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/20 font-bold">
                PROD
              </span>
            </div>
            <p className="text-[10px] font-mono text-text-muted hidden sm:block tracking-wide">
              Zero-Trust Cloud Forensics
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1 rounded-full bg-void-elevated/80 border border-white/10">
          <button
            onClick={() => setCurrentTab('landing')}
            className={`px-4 py-1.5 rounded-full text-xs font-heading uppercase tracking-cyber-wide transition-all ${
              currentTab === 'landing'
                ? 'bg-aurora-teal text-void-base shadow-[0_0_15px_rgba(46,242,192,0.4)] font-bold'
                : 'text-text-secondary hover:text-text-primary font-medium'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentTab('architecture')}
            className={`px-4 py-1.5 rounded-full text-xs font-heading uppercase tracking-cyber-wide transition-all ${
              currentTab === 'architecture'
                ? 'bg-aurora-teal text-void-base shadow-[0_0_15px_rgba(46,242,192,0.4)] font-bold'
                : 'text-text-secondary hover:text-text-primary font-medium'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-heading uppercase tracking-cyber-wide transition-all flex items-center gap-1.5 ${
              currentTab === 'dashboard'
                ? 'bg-aurora-teal text-void-base shadow-[0_0_15px_rgba(46,242,192,0.4)] font-bold'
                : 'text-text-secondary hover:text-text-primary font-medium'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Command Center
          </button>
        </nav>

        {/* Right Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Region Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-void-deep border border-white/10 text-xs font-mono text-text-secondary">
            <Radio className="w-3 h-3 text-aurora-teal animate-pulse" />
            <span>ap-south-1</span>
          </div>

          {/* Mode Toggle: Demo vs Live AWS */}
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono border transition-all ${
              isLiveMode
                ? 'bg-aurora-violet/20 border-aurora-violet/50 text-aurora-violet-light shadow-[0_0_15px_rgba(139,108,255,0.3)]'
                : 'bg-void-deep border-white/10 text-text-secondary hover:text-text-primary'
            }`}
            title="Toggle between Live AWS boto3 calls and zero-dependency Demo Mode"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="font-bold">{isLiveMode ? 'LIVE AWS' : 'DEMO MODE'}</span>
          </button>

          {/* Presentation Mode Button */}
          <button
            onClick={onOpenPresentation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-aurora-teal/15 hover:bg-aurora-teal/25 border border-aurora-teal/40 text-aurora-teal text-xs font-heading uppercase tracking-cyber-wide font-bold transition-all hover:scale-105"
            title="Press P to open faculty presentation mode"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Presenter [P]</span>
          </button>
        </div>
      </div>
    </header>
  );
};
