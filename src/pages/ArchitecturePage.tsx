import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Code } from 'lucide-react';
import { ARCHITECTURE_NODES } from '../mock/demoData';
import { ArchitectureNode } from '../types';
import { GlassCard } from '../components/ui/GlassCard';

export const ArchitecturePage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(ARCHITECTURE_NODES[2]); // Default Lambda

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs font-heading font-bold uppercase tracking-cyber-widest text-aurora-teal">
          [ SYSTEM BLUEPRINTS & CLOUD FABRIC ]
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-text-primary">
          5-Layer Autonomous Architecture
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-2xl font-body">
          Click any architecture node below to inspect its cloud role, failure consequence without it, and its exact backend implementation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Interactive Flow Diagram */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative space-y-4">
            {ARCHITECTURE_NODES.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div key={node.id} className="relative group">
                  <GlassCard
                    onClick={() => setSelectedNode(node)}
                    hoverEffect
                    glow={isSelected ? (node.color as any) : 'none'}
                    className={`transition-all duration-300 ${
                      isSelected
                        ? 'border-aurora-teal/50 shadow-[0_0_25px_rgba(46,242,192,0.2)] scale-[1.01]'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-sm text-aurora-teal">
                          0{node.layer}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading font-bold uppercase tracking-wide text-base text-text-primary">
                              {node.title}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-aurora-violet-light font-medium">
                              {node.awsService}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-1 max-w-md font-body">
                            {node.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-xs font-heading uppercase tracking-cyber-wide text-aurora-teal font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Inspect Code <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Flow Arrow Connector between nodes */}
                  {idx < ARCHITECTURE_NODES.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-0.5 h-4 bg-gradient-to-b from-aurora-teal/40 to-aurora-violet/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Detail Drawer / Inspector */}
        <div className="lg:col-span-1 sticky top-24">
          {selectedNode ? (
            <GlassCard glow="teal" className="p-6 space-y-6">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-heading uppercase tracking-cyber-widest text-aurora-teal font-bold">
                    LAYER 0{selectedNode.layer} SPECIFICATION
                  </span>
                  <h3 className="text-xl font-heading font-bold uppercase tracking-wide text-text-primary mt-1">
                    {selectedNode.awsService}
                  </h3>
                </div>
                <div className="px-2.5 py-1 rounded bg-aurora-teal/15 text-aurora-teal text-xs font-heading uppercase tracking-wider font-bold border border-aurora-teal/30">
                  {selectedNode.badge}
                </div>
              </div>

              {/* Role in AuraGuard */}
              <div className="space-y-1.5">
                <div className="text-xs font-heading uppercase tracking-cyber-wide text-text-muted flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-aurora-teal" /> Role in System
                </div>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-body">
                  {selectedNode.role}
                </p>
              </div>

              {/* What Happens Without It */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-ember-coral/10 border border-ember-coral/30">
                <div className="text-xs font-heading uppercase tracking-cyber-wide text-ember-coral flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> What Happens Without It?
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-body">
                  {selectedNode.withoutIt}
                </p>
              </div>

              {/* Production Implementation Code */}
              <div className="space-y-2">
                <div className="text-xs font-heading uppercase tracking-cyber-wide text-text-muted flex items-center gap-1.5 font-bold">
                  <Code className="w-3.5 h-3.5 text-aurora-violet-light" /> Backend Logic (Boto3 / Python)
                </div>
                <pre className="p-3.5 rounded-xl bg-void-base border border-white/10 font-mono text-[11px] text-aurora-teal overflow-x-auto leading-relaxed">
                  <code>{selectedNode.codeSnippet}</code>
                </pre>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center text-text-secondary text-xs font-mono">
              Select an architecture node to inspect technical specifications.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
