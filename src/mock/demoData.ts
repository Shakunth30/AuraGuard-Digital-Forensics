import { ForensicManifest, TimelineStepItem, CaseHistoryItem, ArchitectureNode } from '../types';

export const DEMO_MANIFEST: ForensicManifest = {
  version: "1.0.0",
  case_id: "AG-20261019-30ECB6",
  incident_type: "AUTONOMOUS_SERVERLESS_QUARANTINE",
  timestamp: "2026-10-19T12:25:03.217703+00:00",
  region: "ap-south-1",
  target: {
    instance_id: "i-04c26f6ddf34068ca",
    vpc_id: "vpc-035b2495ff9e08ad4",
    subnet_id: "subnet-03e33f98246880434",
    original_security_groups: ["sg-0a44fbc789e0110a"],
    quarantine_security_group: "sg-0001e6de5c84d91c2"
  },
  evidence: {
    ebs_snapshots: [
      {
        volume_id: "vol-00193af04425f4b7e",
        snapshot_id: "snap-016635bad8c1227f5",
        timestamp: "2026-10-19T12:25:02.193987+00:00",
        status: "completed",
        progress: "100%"
      }
    ],
    iam_neutralized: true,
    forensic_status: "QUARANTINED"
  },
  sha256_integrity_hash: "5bbf4582f66beed5a3101d2772bdd27227d82d6fb27af226919ca3ed074ef38a",
  cryptographic_hash_sha256: "5bbf4582f66beed5a3101d2772bdd27227d82d6fb27af226919ca3ed074ef38a",
  sha256_hash: "5bbf4582f66beed5a3101d2772bdd27227d82d6fb27af226919ca3ed074ef38a"
};

export const DEMO_TIMELINE: TimelineStepItem[] = [
  {
    id: "step-1",
    timeOffsetMs: 0,
    timeFormatted: "T+0.00s",
    title: "Threat Ingestion (EventBridge)",
    subtitle: "High-severity MITRE T1071.001 C2 beaconing anomaly detected",
    status: "completed",
    category: "DETECTION",
    detail: "Event received via default event bus from source auraguard.security. Severity 8.5 (CRITICAL). Target: i-04c26f6ddf34068ca."
  },
  {
    id: "step-2",
    timeOffsetMs: 240,
    timeFormatted: "T+0.24s",
    title: "Lambda Invocation & Pre-flight",
    subtitle: "Execution context initialized in ap-south-1",
    status: "completed",
    category: "DETECTION",
    detail: "Extracted instance attributes, mapped VPC topology (vpc-035b2495ff9e08ad4), identified attached EBS storage volume vol-00193af04425f4b7e."
  },
  {
    id: "step-3",
    timeOffsetMs: 580,
    timeFormatted: "T+0.58s",
    title: "Point-in-Time EBS Snapshot",
    subtitle: "Forensic image initiated prior to network severance",
    status: "completed",
    category: "STORAGE",
    detail: "Invoked ec2:CreateSnapshot. Tagged with Case-ID AG-20261019-30ECB6, Forensic-Classification: Restricted-Evidence. ID: snap-016635bad8c1227f5."
  },
  {
    id: "step-4",
    timeOffsetMs: 980,
    timeFormatted: "T+0.98s",
    title: "Zero-Trust Network Blackhole",
    subtitle: "Security Group swapped to 0-ingress / 0-egress",
    status: "completed",
    category: "NETWORK",
    detail: "Active SSH and external TCP sockets severed instantaneously via hypervisor SG swap to sg-0001e6de5c84d91c2. Instance remains running."
  },
  {
    id: "step-5",
    timeOffsetMs: 1240,
    timeFormatted: "T+1.24s",
    title: "IAM Credential Neutralization",
    subtitle: "Detached IAM Instance Profile",
    status: "completed",
    category: "IDENTITY",
    detail: "Disassociated IAM Profile Association. Stolen temporary IMDSv2 credentials immediately invalidated across all AWS control APIs."
  },
  {
    id: "step-6",
    timeOffsetMs: 1480,
    timeFormatted: "T+1.48s",
    title: "Cryptographic SHA-256 Digest",
    subtitle: "Manifest serialized and digitally hashed",
    status: "completed",
    category: "VAULT",
    detail: "Generated deterministic SHA-256 digest: 5bbf4582f66beed5a3101d2772bdd27227d82d6fb27af226919ca3ed074ef38a. Tamper-proof guarantee."
  },
  {
    id: "step-7",
    timeOffsetMs: 1720,
    timeFormatted: "T+1.72s",
    title: "Evidence Vault Registration",
    subtitle: "Manifest uploaded to Amazon S3",
    status: "completed",
    category: "VAULT",
    detail: "Saved to s3://auraguard-evidence-vault-sriram2026/cases/AG-20261019-30ECB6/manifest.json with AES-256 Server-Side Encryption."
  }
];

export const DEMO_CASE_HISTORY: CaseHistoryItem[] = [
  {
    case_id: "AG-20261019-30ECB6",
    instance_id: "i-04c26f6ddf34068ca",
    threat_name: "UnauthorizedAccess:EC2/C&CActivity.B!DNS",
    timestamp: "2026-10-19 12:25:03 UTC",
    status: "QUARANTINED",
    snapshot_id: "snap-016635bad8c1227f5",
    hash: "5bbf4582f66beed5...4ef38a"
  },
  {
    case_id: "AG-CASE-88F29DC6",
    instance_id: "i-04c26f6ddf34068ca",
    threat_name: "CredentialAccess:IAM/IMDSv2BruteForce",
    timestamp: "2026-10-10 07:56:10 UTC",
    status: "RESTORED",
    snapshot_id: "snap-0a91fbc789e021",
    hash: "9c1d0e3a5b7c8d9e...2b3c4d"
  },
  {
    case_id: "AG-CASE-2CE164AC",
    instance_id: "i-091a2b3c4d5e6f7a",
    threat_name: "Recon:EC2/PortSweepSYN",
    timestamp: "2026-10-09 14:12:45 UTC",
    status: "ARCHIVED",
    snapshot_id: "snap-08bc34fa78129e",
    hash: "1a2b3c4d5e6f7a8b...9c0d1e"
  }
];

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: "node-detection",
    title: "1. Threat Detection",
    awsService: "Amazon GuardDuty & CloudWatch",
    layer: 1,
    badge: "Ingestion",
    color: "coral",
    description: "Monitors VPC Flow Logs, DNS logs, and CloudTrail events using machine learning anomaly detection to uncover C2 beacons, brute force, or metadata theft.",
    role: "Identifies adversary indicators of compromise (IoC) with zero agent overhead.",
    withoutIt: "Breaches remain undetected for months (industry average: 200+ days dwell time).",
    codeSnippet: `events.put_events(Entries=[{
  "Source": "auraguard.security",
  "DetailType": "MaliciousActivityDetected",
  "Detail": json.dumps({"instance_id": "i-04c26...", "severity": 8.5})
}])`,
  },
  {
    id: "node-eventbridge",
    title: "2. Serverless Bus",
    awsService: "Amazon EventBridge",
    layer: 2,
    badge: "Routing",
    color: "ice",
    description: "The event routing backbone of AuraGuard. Subscribes to custom security events and AWS-native GuardDuty findings, routing them to Lambda in milliseconds.",
    role: "Decouples detection from containment with near-instantaneous event delivery.",
    withoutIt: "Requires polling cron jobs that add 1–5 minute latency and waste computing resources.",
    codeSnippet: `{
  "source": ["auraguard.security", "aws.guardduty"],
  "detail-type": ["MaliciousActivityDetected", "GuardDuty Finding"],
  "resources": ["arn:aws:ec2:ap-south-1:..."]
}`,
  },
  {
    id: "node-lambda",
    title: "3. Autonomous Brain",
    awsService: "AWS Lambda (isolate_instance.py)",
    layer: 3,
    badge: "Decision Engine",
    color: "violet",
    description: "Stateless microVM executor running in ap-south-1. Orchestrates the tri-pillar containment: snapshot creation, security group swap, and IAM revocation.",
    role: "Executes out-of-band at the cloud control plane where the compromised VM's attacker cannot reach.",
    withoutIt: "Requires manual human triage taking 30–60 minutes, enabling total data exfiltration.",
    codeSnippet: `def lambda_handler(event, context):
    instance_id = extract_target_instance_id(event)
    snapshot = acquire_volume_snapshots(instance_id, case_id)
    ec2.modify_instance_attribute(InstanceId=instance_id, Groups=[quarantine_sg])
    ec2.disassociate_iam_instance_profile(AssociationId=iam_assoc_id)`,
  },
  {
    id: "node-containment",
    title: "4. Zero-Trust Isolation",
    awsService: "Amazon EC2 & VPC Security Groups",
    layer: 4,
    badge: "Blackhole",
    color: "teal",
    description: "Swaps all active security groups to AuraGuard-Quarantine-SG (0 Ingress, 0 Egress) while keeping the VM in the 'running' state.",
    role: "Instantly drops all attacker command & control connections while preserving volatile RAM artifacts.",
    withoutIt: "Rebooting or shutting down the VM flushes active malware processes, RAM decryption keys, and socket tables.",
    codeSnippet: `ec2.create_security_group(
    GroupName="AuraGuard-Quarantine-SG",
    Description="Zero-Trust Forensic Quarantine (0 In / 0 Out)",
    VpcId=vpc_id
)
ec2.revoke_security_group_egress(GroupId=sg_id, ...)`,
  },
  {
    id: "node-vault",
    title: "5. Evidence Vault",
    awsService: "Amazon S3 & SHA-256 Digest",
    layer: 5,
    badge: "Chain of Custody",
    color: "violet",
    description: "Generates an immutable JSON manifest containing all forensics: snapshot IDs, timestamps, and SG states, sealed with SHA-256.",
    role: "Provides court-admissible, auditor-verifiable proof of non-tampering.",
    withoutIt: "Evidence collected can be challenged in legal proceedings as tampered or unverified.",
    codeSnippet: `manifest_hash = hashlib.sha256(json.dumps(manifest, sort_keys=True).encode()).hexdigest()
manifest["sha256_integrity_hash"] = manifest_hash
s3.put_object(Bucket=vault_bucket, Key=f"cases/{case_id}/manifest.json", Body=manifest)`,
  }
];
