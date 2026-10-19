import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Database, Key, Zap, Lock, Activity, Server, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { HeroScene } from '../components/3d/HeroScene';
import { GlassCard } from '../components/ui/GlassCard';
import { WorkloadState } from '../types';

interface LandingPageProps {
  onLaunchDemo: () => void;
  onViewArchitecture: () => void;
  workloadState: WorkloadState;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDemo,
  onViewArchitecture,
  workloadState,
}) => {
  const [ramComparisonMode, setRamComparisonMode] = useState<'traditional' | 'auraguard'>('auraguard');

  return (
    <div className="relative w-full space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-center pt-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal text-xs font-mono font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>SUB-2-SECOND AUTONOMOUS INCIDENT RESPONSE</span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] text-text-primary">
              Contain the breach <br />
              <span className="bg-gradient-to-r from-aurora-teal via-ice-blue to-aurora-violet bg-clip-text text-transparent">
                before the breach finishes
              </span>
              <span className="inline-block w-2 h-7 sm:h-10 ml-2 bg-aurora-teal animate-blink align-middle" />
            </h1>

            <p className="text-base sm:text-lg text-text-secondary max-w-xl font-body leading-relaxed">
              When an EC2 workload is breached, AuraGuard executes instantaneous Zero-Trust network blackholing, preserves bit-stream EBS snapshots, and vaults a tamper-proof SHA-256 evidence manifest into Amazon S3—completely out-of-band in AWS <span className="font-mono text-aurora-teal">ap-south-1</span>.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchDemo}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-aurora-teal to-aurora-teal-dark text-void-base font-heading uppercase tracking-cyber-wide font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(46,242,192,0.4)] hover:shadow-[0_0_40px_rgba(46,242,192,0.6)] hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Launch Live Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewArchitecture}
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary font-heading uppercase tracking-cyber-wide font-semibold text-xs sm:text-sm transition-all"
              >
                View 5-Layer Architecture
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-md">
              <div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-aurora-teal">
                  &lt; 1.42s
                </div>
                <div className="text-xs font-mono text-text-secondary">Containment Time</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-aurora-violet-light">
                  0/0 SG
                </div>
                <div className="text-xs font-mono text-text-secondary">Zero-Trust Rules</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-ice-blue">
                  100%
                </div>
                <div className="text-xs font-mono text-text-secondary">RAM Preserved</div>
              </div>
            </div>
          </div>

          {/* Right 3D Interactive Scene */}
          <div className="relative w-full h-full flex items-center justify-center">
            <HeroScene status={workloadState} />
          </div>
        </div>
      </section>

      {/* THE PROBLEM COUNTER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-cyber-widest text-ember-coral">
            [ THE INDUSTRY CRISIS ]
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold uppercase tracking-wide text-text-primary">
            Why Traditional Cloud IR Fails
          </h2>
          <p className="text-sm text-text-secondary font-body">
            Adversaries move laterally across AWS accounts in under 84 minutes. Human response averages 30–60 minutes, losing the race every time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Traditional Card */}
          <GlassCard glow="coral" className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold uppercase tracking-cyber-wide text-ember-coral bg-ember-coral/15 px-3 py-1 rounded-full border border-ember-coral/30">
                  TRADITIONAL CLOUD SEC-OPS
                </span>
                <span className="text-3xl font-display font-extrabold text-ember-coral">
                  30 – 60 min
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold uppercase tracking-wide text-text-primary">
                Human-Dependent Ticket Queues
              </h3>
              <ul className="space-y-2 text-xs font-mono text-text-secondary">
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-ember-coral shrink-0" />
                  Alert sits in SIEM queue waiting for Tier-1 analyst triage
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-ember-coral shrink-0" />
                  Attacker dumps database and harvests AWS IMDS credentials
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-ember-coral shrink-0" />
                  Instance is powered off; volatile RAM & memory artifacts wiped forever
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-ember-coral/20 text-xs font-mono text-ember-coral font-medium">
              Result: Catastrophic lateral movement + non-admissible evidence.
            </div>
          </GlassCard>

          {/* AuraGuard Card */}
          <GlassCard glow="teal" className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold uppercase tracking-cyber-wide text-aurora-teal bg-aurora-teal/15 px-3 py-1 rounded-full border border-aurora-teal/30">
                  AURAGUARD AUTONOMOUS ENGINE
                </span>
                <span className="text-3xl font-display font-extrabold text-aurora-teal">
                  &lt; 1.42 sec
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold uppercase tracking-wide text-text-primary">
                Hypervisor-Level Control Plane Isolation
              </h3>
              <ul className="space-y-2 text-xs font-mono text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
                  EventBridge triggers AWS Lambda microVM in sub-second time
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
                  Point-in-time EBS snapshot initiated before network severance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
                  Instance kept RUNNING under 0-ingress/0-egress blackhole (RAM intact)
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-aurora-teal/20 text-xs font-mono text-aurora-teal font-medium">
              Result: Zero lateral movement + tamper-evident SHA-256 S3 vault.
            </div>
          </GlassCard>
        </div>
      </section>

      {/* TRI-PILLAR CONTAINMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-cyber-widest text-aurora-violet-light">
            [ MULTI-LAYERED CLOUD FORTRESS ]
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold uppercase tracking-wide text-text-primary">
            Comprehensive 3-Way Containment
          </h2>
          <p className="text-sm text-text-secondary font-body">
            Most tools only block IPs. AuraGuard synchronously isolates Storage, Network, and Cloud Identity planes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Storage */}
          <GlassCard glow="teal" hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-aurora-teal/15 border border-aurora-teal/30 flex items-center justify-center text-aurora-teal">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold uppercase tracking-wide text-text-primary">
              1. Storage Plane
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-body">
              Instantaneous EBS volume snapshot tags forensic disk images (<span className="font-mono text-aurora-teal">snap-016635...</span>) before any network state is altered, capturing active malware files and logs.
            </p>
          </GlassCard>

          {/* Pillar 2: Network */}
          <GlassCard glow="teal" hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-aurora-teal/15 border border-aurora-teal/30 flex items-center justify-center text-aurora-teal">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold uppercase tracking-wide text-text-primary">
              2. Network Plane
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-body">
              Hypervisor-level Security Group swap to <span className="font-mono text-aurora-teal">AuraGuard-Quarantine-SG</span> with 0 inbound and 0 outbound rules. Active SSH and C2 sockets terminate immediately.
            </p>
          </GlassCard>

          {/* Pillar 3: Identity */}
          <GlassCard glow="violet" hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-aurora-violet/15 border border-aurora-violet/30 flex items-center justify-center text-aurora-violet-light">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold uppercase tracking-wide text-text-primary">
              3. Identity Plane
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-body">
              Disassociates the IAM Instance Profile, immediately revoking temporary IMDSv2 security credentials so stolen keys cannot access S3 or DynamoDB from external IP addresses.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* WHY WE KEEP THE VM RUNNING (RAM PRESERVATION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <GlassCard className="p-8 sm:p-12 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-heading font-bold uppercase tracking-cyber-widest text-ice-blue">
                [ FORENSIC ENGINEERING INNOVATION ]
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase tracking-wide text-text-primary mt-1">
                Why We Keep the VM Running (Live RAM Preservation)
              </h2>
            </div>

            {/* Interactive Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-void-base border border-white/10">
              <button
                onClick={() => setRamComparisonMode('traditional')}
                className={`px-4 py-1.5 rounded-full text-xs font-heading uppercase tracking-cyber-wide font-bold transition-all ${
                  ramComparisonMode === 'traditional'
                    ? 'bg-ember-coral text-void-base'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Traditional: Stop/Terminate
              </button>
              <button
                onClick={() => setRamComparisonMode('auraguard')}
                className={`px-4 py-1.5 rounded-full text-xs font-heading uppercase tracking-cyber-wide font-bold transition-all ${
                  ramComparisonMode === 'auraguard'
                    ? 'bg-aurora-teal text-void-base'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                AuraGuard: Zero-Trust Blackhole
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-bold uppercase tracking-wide text-text-primary">
                {ramComparisonMode === 'traditional'
                  ? 'Catastrophic Evidence Destruction (Power Off)'
                  : 'Complete Volatile Memory Capture (AuraGuard)'}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary font-body leading-relaxed">
                {ramComparisonMode === 'traditional'
                  ? 'Modern adversaries execute memory-injected payloads (Cobalt Strike, meterpreter) and ransomware encryption keys exclusively in RAM. Shutting down or terminating the EC2 instance instantly empties the memory registers, leaving zero trace of the attack.'
                  : 'AuraGuard severs all network communication via AWS hypervisor Security Groups while maintaining VM power. Forensic investigators can dump the live memory over secure sidecar interfaces to extract encryption keys, active process trees, and open sockets.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-void-base/80 border border-white/10 font-mono text-xs space-y-3">
              <div className="text-text-muted text-[11px] pb-2 border-b border-white/5 uppercase">
                Forensic Artifact Survivability Matrix
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Volatile Memory (RAM):</span>
                <span className={ramComparisonMode === 'traditional' ? 'text-ember-coral font-bold' : 'text-aurora-teal font-bold'}>
                  {ramComparisonMode === 'traditional' ? 'DESTROYED (0%)' : 'PRESERVED (100%)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Active TCP / C2 Connections:</span>
                <span className={ramComparisonMode === 'traditional' ? 'text-ember-coral' : 'text-aurora-teal'}>
                  {ramComparisonMode === 'traditional' ? 'Lost (No forensic record)' : 'Frozen & Logged'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Disk Artifacts (EBS):</span>
                <span className="text-aurora-teal font-bold">Snapshotted</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Legal Admissibility:</span>
                <span className={ramComparisonMode === 'traditional' ? 'text-ember-coral' : 'text-aurora-teal'}>
                  {ramComparisonMode === 'traditional' ? 'Inadmissible in Court' : 'Court-Admissible SHA-256'}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* TECH STACK FOOTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <span className="text-xs font-heading font-bold uppercase tracking-cyber-widest text-text-muted">
          [ ENTERPRISE CLOUD FOUNDATION ]
        </span>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 opacity-85">
          {['AWS EC2', 'Amazon EventBridge', 'AWS Lambda', 'Amazon S3', 'Amazon EBS', 'AWS IAM', 'CloudWatch', 'Python 3.14 / Boto3', 'FastAPI', 'React 18 / Three.js'].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-xl bg-void-elevated/60 border border-white/5 text-xs font-mono text-text-secondary"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};
