import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'teal' | 'violet' | 'coral' | 'none';
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
  hoverEffect = false,
}) => {
  const glowClasses = {
    teal: 'glass-panel-glow-teal',
    violet: 'glass-panel-glow-violet',
    coral: 'glass-panel-glow-coral',
    none: 'glass-panel',
  };

  const hoverClasses = hoverEffect
    ? 'transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_15px_35px_-10px_rgba(46,242,192,0.2)] cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 ${glowClasses[glow]} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};
