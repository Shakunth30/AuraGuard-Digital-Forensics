export type WorkloadState = 'HEALTHY' | 'UNDER_ATTACK' | 'QUARANTINED';

export interface SecurityGroupInfo {
  GroupId: string;
  GroupName?: string;
}

export interface EbsSnapshotInfo {
  volume_id: string;
  snapshot_id: string;
  timestamp?: string;
  status: 'initiated' | 'in-progress' | 'completed';
  progress?: string;
}

export interface ManifestTarget {
  instance_id: string;
  vpc_id: string;
  subnet_id: string;
  original_security_groups: string[];
  quarantine_security_group: string;
}

export interface ForensicManifest {
  version: string;
  case_id: string;
  incident_type?: string;
  timestamp: string;
  region: string;
  target: ManifestTarget;
  evidence: {
    ebs_snapshots: EbsSnapshotInfo[];
    iam_neutralized: boolean;
    forensic_status: string;
  };
  sha256_integrity_hash: string;
  cryptographic_hash_sha256?: string;
  sha256_hash?: string;
}

export interface TimelineStepItem {
  id: string;
  timeOffsetMs: number;
  timeFormatted: string;
  title: string;
  subtitle: string;
  status: 'pending' | 'in_progress' | 'completed' | 'critical';
  detail: string;
  category: 'DETECTION' | 'STORAGE' | 'NETWORK' | 'IDENTITY' | 'VAULT';
}

export interface EventLogItem {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
  message: string;
  source: string;
}

export interface CaseHistoryItem {
  case_id: string;
  instance_id: string;
  threat_name: string;
  timestamp: string;
  status: 'QUARANTINED' | 'RESTORED' | 'ARCHIVED';
  snapshot_id: string;
  hash: string;
}

export interface ArchitectureNode {
  id: string;
  title: string;
  awsService: string;
  layer: number;
  badge: string;
  description: string;
  role: string;
  withoutIt: string;
  codeSnippet: string;
  color: 'teal' | 'violet' | 'coral' | 'ice';
}
