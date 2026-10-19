import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Database, Key, FileCheck, AlertCircle } from 'lucide-react';
import { TimelineStepItem } from '../../types';

interface TimelineStepProps {
  step: TimelineStepItem;
  isLast?: boolean;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({ step, isLast = false }) => {
  const categoryIcons = {
    DETECTION: AlertCircle,
    STORAGE: Database,
    NETWORK: ShieldCheck,
    IDENTITY: Key,
    VAULT: FileCheck,
  };

  const Icon = categoryIcons[step.category] || CheckCircle2;

  const categoryColors = {
    DETECTION: 'text-ember-coral bg-ember-coral/10 border-ember-coral/30',
    STORAGE: 'text-ice-blue bg-ice-blue/10 border-ice-blue/30',
    NETWORK: 'text-aurora-teal bg-aurora-teal/10 border-aurora-teal/30',
    IDENTITY: 'text-aurora-violet-light bg-aurora-violet/10 border-aurora-violet/30',
    VAULT: 'text-aurora-teal bg-aurora-teal/10 border-aurora-teal/30',
  };

  return (
    <div className="relative flex gap-4 group">
      {/* Vertical Connecting Line */}
      {!isLast && (
        <div className="absolute top-8 left-4 -ml-px w-0.5 h-[calc(100%-1rem)] bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
      )}

      {/* Step Icon Badge */}
      <div
        className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${categoryColors[step.category]} transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Step Content */}
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-aurora-teal font-semibold">
              {step.timeFormatted}
            </span>
            <h4 className="font-heading font-semibold text-sm text-text-primary">
              {step.title}
            </h4>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-text-secondary">
            {step.category}
          </span>
        </div>

        <p className="text-xs text-text-secondary font-medium mb-1">
          {step.subtitle}
        </p>
        <p className="text-xs text-text-muted font-mono leading-relaxed bg-void-deep/50 p-2 rounded-lg border border-white/5">
          {step.detail}
        </p>
      </div>
    </div>
  );
};
