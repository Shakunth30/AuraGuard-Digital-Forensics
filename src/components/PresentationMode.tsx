import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Shield, Terminal } from 'lucide-react';
import { WorkloadState } from '../types';

interface PresentationProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateAttack: () => void;
  onRunIsolation: () => void;
  onRollback: () => void;
  status: WorkloadState;
}

const SLIDES = [
  {
    step: 1,
    title: "1. Pre-Attack Baseline State",
    cue: "Explain to Faculty: 'Here is our production EC2 workload running in AWS Mumbai (ap-south-1). It has active user traffic and an unrestricted Security Group.'",
    code: `Target: i-04c26f6ddf34068ca | State: [ RUNNING ] | SG: sg-0a44fbc789e0110a
Inbound: Port 22 (SSH), Port 80 (HTTP) Open | Status: Normal Production`,
    actionText: "Simulate Adversary Breach",
    actionType: "ATTACK" as const,
  },
  {
    step: 2,
    title: "2. Adversary Breach & Threat Ingestion",
    cue: "Explain to Faculty: 'An adversary launches a MITRE T1071 C2 beaconing attack. Within milliseconds, AWS EventBridge intercepts the detection anomaly.'",
    code: `EventBridge Bus: default | Source: auraguard.security | Severity: 8.5 CRITICAL
Threat: UnauthorizedAccess:EC2/C&CActivity.B!DNS`,
    actionText: "Trigger Autonomous Isolation",
    actionType: "ISOLATE" as const,
  },
  {
    step: 3,
    title: "3. Tri-Pillar Autonomous Quarantine (< 2s)",
    cue: "Explain to Faculty: 'In under 2 seconds, AWS Lambda executed three simultaneous containment actions: EBS point-in-time snapshot, Security Group swap to 0-in/0-out blackhole, and IAM profile detachment.'",
    code: `Storage: snap-016635bad8c1227f5 (Preserved)
Network: Swapped to sg-0001e6de5c84d91c2 (0 In / 0 Out Blackhole)
Identity: IAM Profile Disassociated (IMDS tokens invalidated)`,
    actionText: "Inspect Evidence Vault",
    actionType: "INSPECT" as const,
  },
  {
    step: 4,
    title: "4. Live RAM Preservation vs Power Off",
    cue: "Explain to Faculty: 'Unlike traditional scripts that shut down the server, AuraGuard keeps the VM in the running state inside the blackhole. This preserves volatile RAM artifacts for police/forensic audit.'",
    code: `Power State: [ RUNNING: RAM INTACT ]
Public IP: Severed | Active Attacker Sockets: Dropped at Hypervisor`,
    actionText: "Verify Cryptographic Seal",
    actionType: "VERIFY" as const,
  },
  {
    step: 5,
    title: "5. Cryptographic S3 Evidence Vault",
    cue: "Explain to Faculty: 'AuraGuard calculated a SHA-256 digital signature of the complete manifest and sealed it into an S3 vault. Any post-incident tampering is mathematically impossible.'",
    code: `S3 URI: s3://auraguard-evidence-vault-sriram2026/cases/AG-20261019-30ECB6/manifest.json
SHA-256 Seal: 5bbf4582f66beed5a3101d2772bdd27227d82d6fb27af226919ca3ed074ef38a (MATCH)`,
    actionText: "Demonstrate Rollback",
    actionType: "ROLLBACK" as const,
  },
  {
    step: 6,
    title: "6. Zero-Downtime Rollback & Recovery",
    cue: "Explain to Faculty: 'If SOC analysts determine the event was a benign false alarm, AuraGuard uses the manifest metadata to restore original security groups in one click.'",
    code: `Reverted SG: sg-0a44fbc789e0110a | Tag: AuraGuard-Status=RESTORED
Instance returned to production without data loss.`,
    actionText: "Finish Presentation",
    actionType: "FINISH" as const,
  }
];

export const PresentationMode: React.FC<PresentationProps> = ({
  isOpen,
  onClose,
  onSimulateAttack,
  onRunIsolation,
  onRollback,
  status,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentSlide < SLIDES.length - 1) {
        setCurrentSlide(curr => curr + 1);
      }
      if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(curr => curr - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlide, onClose]);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];

  const handleAction = () => {
    if (slide.actionType === 'ATTACK') onSimulateAttack();
    if (slide.actionType === 'ISOLATE') onRunIsolation();
    if (slide.actionType === 'ROLLBACK') onRollback();
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(curr => curr + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-void-base/95 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-12 text-text-primary animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-aurora-teal/20 border border-aurora-teal/40 flex items-center justify-center">
            <Shield className="w-6 h-6 text-aurora-teal" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-black tracking-wide text-text-primary">
              AuraGuard Faculty Defense Suite
            </h2>
            <p className="text-xs font-mono text-text-secondary">
              Slide {currentSlide + 1} of {SLIDES.length} • Press Esc to Exit
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-text-primary transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="max-w-4xl mx-auto w-full my-auto space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-heading uppercase tracking-cyber-wide px-3 py-1 rounded-full bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30 font-bold">
            STAGE 0{slide.step}
          </span>
          <h1 className="text-2xl sm:text-4xl font-heading font-bold uppercase tracking-wide text-text-primary">
            {slide.title}
          </h1>
        </div>

        {/* Presenter Cue Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-void-elevated to-void-deep border border-aurora-teal/30 shadow-[0_0_40px_rgba(46,242,192,0.15)]">
          <div className="text-xs font-heading uppercase tracking-cyber-widest text-aurora-teal font-bold mb-2 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> [ Presenter Teleprompter Script ]
          </div>
          <p className="text-base sm:text-lg font-body text-text-primary leading-relaxed font-medium">
            "{slide.cue.replace(/Explain to Faculty: /, '')}"
          </p>
        </div>

        {/* Live Code / Evidence Display */}
        <div className="p-5 rounded-xl bg-void-base border border-white/10 font-mono text-xs sm:text-sm text-aurora-violet-light leading-relaxed whitespace-pre-wrap">
          {slide.code}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide(curr => Math.max(0, curr - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-heading uppercase tracking-wider text-text-secondary disabled:opacity-40 transition-all font-semibold"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setCurrentSlide(curr => Math.min(SLIDES.length - 1, curr + 1))}
            disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-heading uppercase tracking-wider text-text-secondary disabled:opacity-40 transition-all font-semibold"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleAction}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-teal to-aurora-teal-dark text-void-base font-heading uppercase tracking-cyber-wide font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(46,242,192,0.5)] hover:scale-105 transition-all"
        >
          <Play className="w-4 h-4 fill-void-base" />
          <span>{slide.actionText}</span>
        </button>
      </div>
    </div>
  );
};
