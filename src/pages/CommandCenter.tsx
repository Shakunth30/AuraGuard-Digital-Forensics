import React, { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, Play, RotateCcw, CheckCircle2, Clock, Database,
  Key, FileText, Download, Terminal, Radio, Server, Lock, Layers, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkloadState, ForensicManifest, TimelineStepItem } from '../types';
import { DEMO_MANIFEST, DEMO_TIMELINE, DEMO_CASE_HISTORY } from '../mock/demoData';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusPill } from '../components/ui/StatusPill';
import { TimelineStep } from '../components/ui/TimelineStep';
import { HashDisplay } from '../components/ui/HashDisplay';

interface CommandCenterProps {
  isLiveMode: boolean;
  workloadState: WorkloadState;
  setWorkloadState: (s: WorkloadState) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  isLiveMode,
  workloadState,
  setWorkloadState,
}) => {
  const [manifest, setManifest] = useState<ForensicManifest>(DEMO_MANIFEST);
  const [timeline, setTimeline] = useState<TimelineStepItem[]>(DEMO_TIMELINE);
  const [elapsedMs, setElapsedMs] = useState<number>(1420);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isIsolating, setIsIsolating] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [showCaseDetailModal, setShowCaseDetailModal] = useState(false);
  const [caseFilter, setCaseFilter] = useState<'ALL' | 'QUARANTINED' | 'RESTORED'>('ALL');
  const [logs, setLogs] = useState<Array<{ time: string; text: string; level: 'info' | 'warn' | 'crit' | 'success' }>>([
    { time: '12:24:50', text: 'AuraGuard listener active in region ap-south-1', level: 'info' },
    { time: '12:25:01', text: 'Target node i-04c26f6ddf34068ca heartbeat verified', level: 'info' },
    { time: '12:25:03', text: 'Adversary anomaly detected: UnauthorizedAccess:EC2/C&CActivity.B!DNS', level: 'crit' },
    { time: '12:25:04', text: 'EventBridge event 93366043 routed to isolate_instance Lambda', level: 'warn' },
    { time: '12:25:05', text: 'EBS Snapshot snap-016635bad8c1227f5 preserved (100% completed)', level: 'success' },
    { time: '12:25:05', text: 'Workload isolated in zero-trust SG sg-0001e6de5c84d91c2 (0 In/0 Out)', level: 'success' },
    { time: '12:25:06', text: 'Manifest SHA-256 registered in S3: cases/AG-20261019-30ECB6/manifest.json', level: 'success' },
  ]);

  // Handle Simulate Attack
  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    setWorkloadState('UNDER_ATTACK');

    // Add log
    const now = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [
      { time: now, text: 'Simulated Attack Triggered: MITRE T1071 C2 exfiltration broadcast', level: 'crit' },
      ...prev
    ]);

    if (isLiveMode) {
      try {
        await fetch('/api/simulate-attack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instance_id: manifest.target.instance_id, severity: 8.5 })
        });
      } catch (e) {
        console.warn('Live API call failed, falling back to mock event stream.');
      }
    }

    setTimeout(() => {
      setIsSimulating(false);
    }, 1200);
  };

  // Handle Run Isolation
  const handleRunIsolation = async () => {
    setIsIsolating(true);

    const now = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [
      { time: now, text: 'Autonomous Isolation sequence triggered by CloudWatch / EventBridge', level: 'warn' },
      { time: now, text: 'Creating point-in-time forensic EBS snapshot for vol-00193af04425f4b7e...', level: 'info' },
      { time: now, text: 'Swapping Security Group to Zero-Trust Blackhole (0 Ingress / 0 Egress)...', level: 'info' },
      { time: now, text: 'Detaching IAM instance profile to revoke stolen IMDS tokens...', level: 'warn' },
      ...prev
    ]);

    setTimeout(() => {
      setWorkloadState('QUARANTINED');
      setIsIsolating(false);
      setElapsedMs(1420);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2EF2C0', '#8B6CFF', '#7CC4FF']
      });

      setLogs(prev => [
        { time: now, text: 'CONTAINMENT COMPLETE: Instance isolated in 1.42s under Case AG-20261019-30ECB6', level: 'success' },
        ...prev
      ]);
    }, 1200);
  };

  // Handle Rollback
  const handleRollback = async () => {
    setShowRollbackModal(false);
    setWorkloadState('HEALTHY');

    const now = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [
      { time: now, text: 'Rollback initiated: Restoring original Security Groups [sg-0a44fbc789e0110a]...', level: 'info' },
      { time: now, text: 'Tagging instance: AuraGuard-Status=RESTORED', level: 'success' },
      { time: now, text: 'Instance successfully restored to active production status.', level: 'success' },
      ...prev
    ]);

    if (isLiveMode) {
      try {
        await fetch('/api/rollback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instance_id: manifest.target.instance_id })
        });
      } catch (e) {
        console.warn('Live rollback API call fallback.');
      }
    }
  };

  const filteredCases = DEMO_CASE_HISTORY.filter(c => {
    if (caseFilter === 'ALL') return true;
    return c.status === caseFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner & Control Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-void-elevated/80 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-aurora-teal/15 border border-aurora-teal/40 flex items-center justify-center text-aurora-teal">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold uppercase tracking-wide text-base text-text-primary">
                Target Node: <span className="font-mono text-aurora-teal">{manifest.target.instance_id}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-secondary">
                ap-south-1
              </span>
            </div>
            <p className="text-xs font-mono text-text-muted">
              VPC: {manifest.target.vpc_id} • Subnet: {manifest.target.subnet_id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSimulateAttack}
            disabled={isSimulating || workloadState === 'UNDER_ATTACK'}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ember-coral/15 hover:bg-ember-coral/25 border border-ember-coral/50 text-ember-coral font-heading uppercase tracking-cyber-wide font-bold text-xs transition-all disabled:opacity-50 hover:scale-105"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Attack'}</span>
          </button>

          <button
            onClick={handleRunIsolation}
            disabled={isIsolating || workloadState === 'QUARANTINED'}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-aurora-teal to-aurora-teal-dark text-void-base font-heading uppercase tracking-cyber-wide font-bold text-xs shadow-[0_0_20px_rgba(46,242,192,0.4)] hover:shadow-[0_0_30px_rgba(46,242,192,0.6)] transition-all disabled:opacity-50 hover:scale-105"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isIsolating ? 'Isolating (< 2s)...' : 'Run Autonomous Isolation'}</span>
          </button>

          <button
            onClick={() => setShowRollbackModal(true)}
            disabled={workloadState === 'HEALTHY'}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-text-primary text-xs font-heading uppercase tracking-cyber-wide font-semibold transition-all disabled:opacity-30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rollback</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-1">
          <div className="text-[11px] font-heading uppercase tracking-cyber-wide text-text-muted">Mean Time to Contain (MTTC)</div>
          <div className="text-2xl font-display font-bold text-aurora-teal">&lt; 1.42 sec</div>
          <div className="text-[10px] font-mono text-text-secondary">Sub-second autonomous execution</div>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <div className="text-[11px] font-heading uppercase tracking-cyber-wide text-text-muted">Active Threat Severity</div>
          <div className={`text-2xl font-display font-bold ${workloadState === 'UNDER_ATTACK' ? 'text-ember-coral animate-pulse' : 'text-text-primary'}`}>
            8.5 / 10.0
          </div>
          <div className="text-[10px] font-mono text-text-secondary truncate">
            UnauthorizedAccess:EC2/C&CActivity.B!DNS
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <div className="text-[11px] font-heading uppercase tracking-cyber-wide text-text-muted">Forensic Classification</div>
          <div className="text-2xl font-display font-bold text-aurora-violet-light">Restricted</div>
          <div className="text-[10px] font-mono text-text-secondary">Chain of custody active</div>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <div className="text-[11px] font-heading uppercase tracking-cyber-wide text-text-muted">Incidents Vaulted Today</div>
          <div className="text-2xl font-display font-bold text-ice-blue">04 Cases</div>
          <div className="text-[10px] font-mono text-text-secondary">100% SHA-256 verified</div>
        </GlassCard>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Instance State & Containment Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Workload Status Card */}
          <GlassCard
            glow={workloadState === 'UNDER_ATTACK' ? 'coral' : workloadState === 'QUARANTINED' ? 'teal' : 'none'}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                  Live Workload Quarantine Status
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-xl font-heading font-bold uppercase tracking-wide text-text-primary">
                    Node {manifest.target.instance_id}
                  </h3>
                  <StatusPill status={workloadState} />
                </div>
              </div>

              <div className="text-right font-mono text-xs text-text-secondary">
                Power State: <span className="text-aurora-teal font-bold uppercase">[ RUNNING: RAM INTACT ]</span>
              </div>
            </div>

            {/* Side-by-Side Status Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-void-base border border-white/5 space-y-1">
                <span className="text-text-muted text-[10px] uppercase">Active Security Group</span>
                <div className="text-aurora-teal font-bold truncate">
                  {workloadState === 'QUARANTINED'
                    ? manifest.target.quarantine_security_group
                    : manifest.target.original_security_groups[0]}
                </div>
                <div className="text-[10px] text-text-secondary">
                  {workloadState === 'QUARANTINED' ? '0 Ingress / 0 Egress Blackhole' : 'Production Web/SSH Group'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-void-base border border-white/5 space-y-1">
                <span className="text-text-muted text-[10px] uppercase">IAM Credentials State</span>
                <div className={workloadState === 'QUARANTINED' ? 'text-aurora-violet-light font-bold' : 'text-text-primary font-bold'}>
                  {workloadState === 'QUARANTINED' ? 'REVOKED / NEUTRALIZED' : 'ACTIVE / ATTACHED'}
                </div>
                <div className="text-[10px] text-text-secondary">
                  {workloadState === 'QUARANTINED' ? 'Profile disassociated' : 'Workload instance profile'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-void-base border border-white/5 space-y-1">
                <span className="text-text-muted text-[10px] uppercase">Forensic Case ID</span>
                <div className="text-aurora-teal font-bold truncate">{manifest.case_id}</div>
                <div className="text-[10px] text-text-secondary">Tagged in AWS EC2</div>
              </div>
            </div>
          </GlassCard>

          {/* Containment Timeline Stepper */}
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading font-bold uppercase tracking-wide text-lg text-text-primary">
                  Sub-Second Containment Stepper
                </h3>
                <p className="text-xs font-mono text-text-secondary">
                  Execution lifecycle recorded in milliseconds
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-aurora-teal/15 border border-aurora-teal/40 font-mono text-xs text-aurora-teal font-bold">
                Total Elapsed: {elapsedMs}ms
              </div>
            </div>

            <div className="pt-2">
              {timeline.map((step, idx) => (
                <TimelineStep
                  key={step.id}
                  step={step}
                  isLast={idx === timeline.length - 1}
                />
              ))}
            </div>
          </GlassCard>

          {/* Case History Table */}
          <GlassCard className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading font-bold uppercase tracking-wide text-lg text-text-primary">
                  Cryptographic Incident History
                </h3>
                <p className="text-xs font-mono text-text-secondary">
                  Forensic audit trail stored in S3 Evidence Vault
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-full bg-void-base border border-white/10 text-xs font-mono">
                {(['ALL', 'QUARANTINED', 'RESTORED'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setCaseFilter(tab)}
                    className={`px-3 py-1 rounded-full font-heading uppercase tracking-wider text-[11px] transition-all ${
                      caseFilter === tab
                        ? 'bg-aurora-teal text-void-base font-bold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-text-muted uppercase text-[10px]">
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Target Node</th>
                    <th className="py-2.5 px-3">Adversary Threat</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">EBS Snapshot</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCases.map((c) => (
                    <tr key={c.case_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-aurora-teal">{c.case_id}</td>
                      <td className="py-3 px-3 text-text-secondary">{c.instance_id}</td>
                      <td className="py-3 px-3 text-text-primary max-w-[200px] truncate">{c.threat_name}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'QUARANTINED'
                            ? 'bg-aurora-violet/20 text-aurora-violet-light border border-aurora-violet/40'
                            : 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/40'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-text-muted">{c.snapshot_id}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setShowCaseDetailModal(true)}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-aurora-teal border border-white/10 text-xs transition-all font-heading uppercase tracking-wider"
                        >
                          View Split
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Evidence Vault & Live Terminal (1 col) */}
        <div className="lg:col-span-1 space-y-8 sticky top-24">
          {/* EBS Snapshot Status Card */}
          <GlassCard glow="teal" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-aurora-teal" />
                <h4 className="font-heading font-bold uppercase tracking-wide text-sm text-text-primary">
                  EBS Forensic Snapshot
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-aurora-teal/15 text-aurora-teal font-bold">
                100% COMPLETED
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Snapshot ID:</span>
                <span className="text-aurora-teal font-semibold">{manifest.evidence.ebs_snapshots[0].snapshot_id}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Root Volume ID:</span>
                <span className="text-text-primary">{manifest.evidence.ebs_snapshots[0].volume_id}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Preservation Tag:</span>
                <span className="text-aurora-violet-light">Restricted-Evidence</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-void-base h-2 rounded-full overflow-hidden border border-white/5 mt-2">
                <div className="bg-gradient-to-r from-aurora-teal to-aurora-violet h-full w-full rounded-full" />
              </div>
            </div>
          </GlassCard>

          {/* Evidence Vault & SHA-256 Digital Seal */}
          <GlassCard glow="violet" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-aurora-violet-light" />
                <h4 className="font-heading font-bold uppercase tracking-wide text-sm text-text-primary">
                  S3 Evidence Vault Manifest
                </h4>
              </div>
              <span className="text-[10px] font-mono text-text-muted">
                AES-256 Encrypted
              </span>
            </div>

            <div className="text-xs font-mono text-text-secondary space-y-1">
              <div>S3 URI:</div>
              <div className="text-[11px] text-aurora-teal break-all bg-void-base p-2 rounded-lg border border-white/5">
                s3://auraguard-evidence-vault-sriram2026/cases/{manifest.case_id}/manifest.json
              </div>
            </div>

            {/* Cryptographic SHA-256 Verification & Tamper Simulation */}
            <HashDisplay
              hash={manifest.sha256_integrity_hash}
              manifestData={manifest}
            />

            {/* Manifest JSON snippet */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-text-muted text-[10px] font-mono mb-1">
                <span>RAW EVIDENCE PAYLOAD</span>
                <button
                  onClick={() => setShowCaseDetailModal(true)}
                  className="text-aurora-teal hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> Expand Full JSON
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-void-base border border-white/10 font-mono text-[10px] text-aurora-violet-light max-h-40 overflow-y-auto leading-relaxed">
                <code>{JSON.stringify(manifest, null, 2)}</code>
              </pre>
            </div>
          </GlassCard>

          {/* Live Terminal Log Stream */}
          <GlassCard className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-aurora-teal" />
                <span className="font-heading uppercase tracking-wide text-xs font-bold text-text-primary">
                  CloudWatch Telemetry Stream
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-aurora-teal animate-pulse" />
            </div>

            <div className="space-y-1.5 font-mono text-[11px] max-h-48 overflow-y-auto pr-1">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-text-muted shrink-0">[{log.time}]</span>
                  <span className={
                    log.level === 'crit' ? 'text-ember-coral font-bold' :
                    log.level === 'warn' ? 'text-ember-orange' :
                    log.level === 'success' ? 'text-aurora-teal' :
                    'text-text-secondary'
                  }>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* CONFIRM ROLLBACK MODAL */}
      {showRollbackModal && (
        <div className="fixed inset-0 z-50 bg-void-base/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full p-6 rounded-2xl glass-panel-glow-coral border border-ember-coral/40 space-y-4">
            <div className="flex items-center gap-3 text-ember-coral">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-heading font-bold uppercase tracking-wide text-lg text-text-primary">
                Confirm Quarantine Rollback?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary font-body leading-relaxed">
              This will restore original Security Groups (<span className="font-mono text-aurora-teal">{manifest.target.original_security_groups[0]}</span>) and unblock network egress. Use only if verified as a benign false alarm.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-heading uppercase tracking-wider text-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRollback}
                className="px-4 py-2 rounded-xl bg-ember-coral text-void-base font-heading uppercase tracking-cyber-wide font-bold text-xs shadow-[0_0_20px_rgba(255,77,94,0.4)]"
              >
                Execute Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASE DETAIL BEFORE/AFTER SPLIT MODAL */}
      {showCaseDetailModal && (
        <div className="fixed inset-0 z-50 bg-void-base/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl glass-panel space-y-6 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-aurora-teal uppercase">
                  Comprehensive Evidence Dossier
                </span>
                <h3 className="text-2xl font-heading font-black uppercase tracking-wide text-text-primary">
                  Case {manifest.case_id}
                </h3>
              </div>
              <button
                onClick={() => setShowCaseDetailModal(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-text-secondary"
              >
                Close
              </button>
            </div>

            {/* Split Comparison View: Before vs After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="p-5 rounded-2xl bg-void-base border border-ember-coral/30 space-y-3">
                <div className="text-ember-coral font-bold flex items-center gap-2 border-b border-ember-coral/20 pb-2">
                  <AlertTriangle className="w-4 h-4" /> PRE-ATTACK (COMPROMISED STATE)
                </div>
                <div className="space-y-1.5 text-text-secondary">
                  <div>Security Groups: <span className="text-text-primary">sg-0a44fbc789e0110a</span></div>
                  <div>Inbound Traffic: <span className="text-ember-coral font-bold">Port 22/80 OPEN</span></div>
                  <div>Outbound Traffic: <span className="text-ember-coral font-bold">0.0.0.0/0 (UNRESTRICTED)</span></div>
                  <div>C2 Exfiltration: <span className="text-ember-coral">ACTIVE BEACONING</span></div>
                  <div>Forensic Snapshot: <span className="text-text-muted">NONE</span></div>
                  <div>Evidence Seal: <span className="text-text-muted">UNREGISTERED</span></div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-void-base border border-aurora-teal/30 space-y-3">
                <div className="text-aurora-teal font-bold flex items-center gap-2 border-b border-aurora-teal/20 pb-2">
                  <Shield className="w-4 h-4" /> POST-CONTAINMENT (AURA GUARD)
                </div>
                <div className="space-y-1.5 text-text-secondary">
                  <div>Security Groups: <span className="text-aurora-teal font-bold">sg-0001e6de5c84d91c2</span></div>
                  <div>Inbound Traffic: <span className="text-aurora-teal font-bold">0 INGRESS RULES (SEVERED)</span></div>
                  <div>Outbound Traffic: <span className="text-aurora-teal font-bold">0 EGRESS RULES (BLACKHOLE)</span></div>
                  <div>RAM State: <span className="text-aurora-teal font-bold">PRESERVED (VM RUNNING)</span></div>
                  <div>Forensic Snapshot: <span className="text-aurora-teal">{manifest.evidence.ebs_snapshots[0].snapshot_id}</span></div>
                  <div>SHA-256 Seal: <span className="text-aurora-violet-light">5bbf45...4ef38a (VAULTED)</span></div>
                </div>
              </div>
            </div>

            {/* Complete JSON Payload Viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                <span>FULL RAW MANIFEST JSON</span>
                <a
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(manifest, null, 2))}`}
                  download={`AuraGuard_Forensic_Manifest_${manifest.case_id}.json`}
                  className="text-aurora-teal hover:underline flex items-center gap-1 font-heading uppercase tracking-wider text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" /> Download JSON
                </a>
              </div>
              <pre className="p-4 rounded-2xl bg-void-base border border-white/10 font-mono text-xs text-aurora-teal max-h-60 overflow-y-auto leading-relaxed">
                <code>{JSON.stringify(manifest, null, 2)}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
