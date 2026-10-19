import React from 'react';
import { ShieldCheck, AlertTriangle, Lock, ShieldAlert } from 'lucide-react';
import { WorkloadState } from '../../types';

interface StatusPillProps {
  status: WorkloadState;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const config = {
    HEALTHY: {
      label: 'NORMAL WORKLOAD',
      icon: ShieldCheck,
      bg: 'bg-aurora-teal/10 border-aurora-teal/40 text-aurora-teal',
      glow: 'shadow-[0_0_15px_rgba(46,242,192,0.25)]',
      dot: 'bg-aurora-teal',
    },
    UNDER_ATTACK: {
      label: 'UNDER ATTACK',
      icon: ShieldAlert,
      bg: 'bg-ember-coral/15 border-ember-coral/60 text-ember-coral',
      glow: 'shadow-[0_0_20px_rgba(255,77,94,0.4)] animate-pulse',
      dot: 'bg-ember-coral animate-ping',
    },
    QUARANTINED: {
      label: 'QUARANTINED (ZERO-TRUST)',
      icon: Lock,
      bg: 'bg-aurora-violet/15 border-aurora-violet/50 text-aurora-violet-light',
      glow: 'shadow-[0_0_20px_rgba(139,108,255,0.3)]',
      dot: 'bg-aurora-violet',
    },
  };

  const current = config[status];
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5',
  };

  return (
    <div
      className={`inline-flex items-center font-mono font-semibold rounded-full border ${current.bg} ${current.glow} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </div>
  );
};
