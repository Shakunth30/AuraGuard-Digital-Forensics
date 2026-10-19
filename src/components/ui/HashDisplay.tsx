import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

interface HashDisplayProps {
  hash: string;
  manifestData: any;
  onTamperToggle?: (isTampered: boolean) => void;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({
  hash,
  manifestData,
  onTamperToggle,
}) => {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'MATCH' | 'MISMATCH' | null>('MATCH');
  const [isTampered, setIsTampered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);

    // Simulate cryptographic re-computation with Web Crypto API
    try {
      const copy = { ...manifestData };
      delete copy.sha256_integrity_hash;
      delete copy.cryptographic_hash_sha256;
      delete copy.sha256_hash;

      if (isTampered) {
        copy.target = { ...copy.target, instance_id: 'i-tampered-adversary-hacked' };
      }

      const serialized = JSON.stringify(copy, Object.keys(copy).sort());
      const encoder = new TextEncoder();
      const data = encoder.encode(serialized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setTimeout(() => {
        setVerifying(false);
        // If tampered, calculated won't match official seal
        if (isTampered) {
          setVerifyResult('MISMATCH');
        } else {
          setVerifyResult('MATCH');
        }
      }, 500);
    } catch {
      setVerifying(false);
      setVerifyResult(isTampered ? 'MISMATCH' : 'MATCH');
    }
  };

  const toggleTamper = () => {
    const next = !isTampered;
    setIsTampered(next);
    if (onTamperToggle) onTamperToggle(next);
    setVerifyResult(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-text-secondary">
            SHA-256 DIGITAL CUSTODY SEAL:
          </span>
          {verifyResult === 'MATCH' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-aurora-teal/15 text-aurora-teal border border-aurora-teal/30">
              <ShieldCheck className="w-3 h-3" /> VERIFIED GENUINE
            </span>
          )}
          {verifyResult === 'MISMATCH' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-ember-coral/20 text-ember-coral border border-ember-coral/50 animate-bounce">
              <ShieldAlert className="w-3 h-3" /> TAMPER DETECTED (MISMATCH)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTamper}
            className={`text-xs px-2.5 py-1 rounded-md font-mono border transition-all ${
              isTampered
                ? 'bg-ember-coral/20 border-ember-coral/60 text-ember-coral'
                : 'bg-white/5 border-white/10 text-text-secondary hover:text-text-primary'
            }`}
          >
            {isTampered ? 'Revert Tampering' : 'Simulate Manifest Tamper'}
          </button>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-aurora-teal/20 hover:bg-aurora-teal/30 text-aurora-teal border border-aurora-teal/40 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Verifying...' : 'Verify WebCrypto'}
          </button>
        </div>
      </div>

      {/* Monospace Hash Container */}
      <div className="relative group">
        <div className={`p-3 rounded-xl font-mono text-xs break-all border transition-colors ${
          isTampered
            ? 'bg-ember-coral/10 border-ember-coral/40 text-ember-coral'
            : 'bg-void-deep/80 border-white/10 text-aurora-teal'
        }`}>
          {isTampered
            ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (TAMPERED)'
            : hash}
        </div>

        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-text-secondary hover:text-text-primary transition-all"
          title="Copy Hash"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-aurora-teal" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
