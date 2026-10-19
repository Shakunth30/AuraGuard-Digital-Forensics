# AuraGuard: Zero-Trust Autonomous Cloud Forensic Isolation & Cryptographic Evidence Vault

[![AWS Region](https://img.shields.io/badge/AWS%20Region-ap--south--1%20(Mumbai)-orange.svg)](https://aws.amazon.com/about-aws/global-infrastructure/)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Trust%20Forensic%20Quarantine-blue.svg)](#architecture)
[![Python Version](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-green.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)](LICENSE)

**AuraGuard** is an enterprise-grade DevSecOps and cloud incident response framework designed for autonomous, tamper-evident forensic containment of compromised AWS workloads. Operating under strict **Zero-Trust principles**, AuraGuard eliminates lateral adversary movement and exfiltration in sub-second timeframes while cryptographically sealing forensic disk artifacts for law enforcement and compliance auditing.

---

## 🏛️ Foundational Cloud Infrastructure

AuraGuard integrates with the provisioned production VPC scaffold in AWS Region **`ap-south-1` (Mumbai)**:

| Resource Name | Type | CIDR / Specification | Status |
| :--- | :--- | :--- | :--- |
| **`AuraGuard-Prod-vpc`** | AWS VPC | `10.0.0.0/16` | **Provisioned** |
| **`AuraGuard-Prod-subnet-public1`** | Public Subnet | `10.0.0.0/24` (AZ: `ap-south-1a`) | **Provisioned** |
| **`AuraGuard-Quarantine-SG`** | Zero-Trust SG | 0 Ingress Rules, 0 Egress Rules | **Autonomous** |
| **Evidence Vault** | Amazon S3 + KMS | Encrypted SHA-256 Custody Ledger | **Provisioned** |

---

## 📐 Architecture & Containment Lifecycle

```mermaid
flowchart TD
    subgraph Attack_Simulation ["1. Adversary Simulation / Detection"]
        T1["MITRE T1071.001 C2 Beaconing"]
        T2["MITRE T1552.005 IMDSv2 Harvesting"]
        T3["MITRE T1486 Canary Tampering"]
        SIM["simulate_attack.py"]
    end

    subgraph Autonomous_Engine ["2. AuraGuard Orchestration"]
        TRIG["trigger_isolation.py / Lambda"]
        SNAP["Forensic Snapshot Engine"]
        SG_MOD["Zero-Trust Security Group Swap"]
        IAM_MOD["IAM Instance Profile Disassociation"]
    end

    subgraph Target_Workload ["3. Target EC2 Workload (ap-south-1)"]
        EC2["Target Instance (10.0.0.x)"]
        VOL["EBS Storage Volumes"]
        IMDS["IMDS Credential Service"]
    end

    subgraph Evidence_Vault ["4. Cryptographic Evidence Vault"]
        EBS_SNAP["Point-in-Time EBS Snapshots"]
        HASH["SHA-256 Integrity Digest"]
        S3["S3 Tamper-Evident Ledger"]
    end

    T1 --> SIM
    T2 --> SIM
    T3 --> SIM
    SIM -->|Incident Telemetry| TRIG
    TRIG -->|1. Snapshot Request| SNAP
    SNAP --> VOL
    VOL --> EBS_SNAP
    TRIG -->|2. Sever Network| SG_MOD
    SG_MOD -->|Replace with 0-In/0-Out SG| EC2
    TRIG -->|3. Kill Stolen Tokens| IAM_MOD
    IAM_MOD -->|Revoke Profile| IMDS
    SNAP & SG_MOD & IAM_MOD --> HASH
    HASH --> S3
```

---

## 📂 Project Directory Architecture

```text
auraguard/
├── .env.example                     # Environment credentials & target instance template
├── .gitignore                        # Git exclusion rules for credentials and evidence
├── requirements.txt                  # Production-pinned Python dependencies
├── README.md                         # Architecture, workflow, and operations guide
├── config/
│   └── aws_config.json               # Regional infrastructure parameters & isolation policy
├── infra/
│   ├── vpc_info.json                 # Foundational VPC & Subnet network configuration
│   └── iam_quarantine_policy.json    # Explicit Zero-Trust Deny-All IAM quarantine policy
├── scripts/
│   ├── simulate_attack.py            # Automated MITRE ATT&CK adversarial simulation engine
│   └── trigger_isolation.py          # Zero-Trust forensic quarantine orchestration CLI
└── lambda/
    └── isolate_instance.py           # Serverless autonomous event-driven isolation handler
```

---

## ⚡ Quickstart & Setup Guide

### 1. Clone & Set Up Python Environment
Ensure Python 3.10+ is installed on your workstation:

```bash
# Navigate to the workspace
cd auraguard

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure AWS Credentials & Targets
Copy `.env.example` to `.env` and fill in your active AWS credentials and target instance details:

```bash
cp .env.example .env
```

Edit `.env`:
```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_access_key
VPC_ID=vpc-xxxxxxxxxxxxxxxxx
SUBNET_ID=subnet-xxxxxxxxxxxxxxxxx
TARGET_INSTANCE_ID=i-xxxxxxxxxxxxxxxxx
EVIDENCE_VAULT_BUCKET=auraguard-evidence-vault-ap-south-1
```

---

## 🧪 Automated Attack Simulation & Incident Response Loop

The attack simulator models real-world tactics without destructive kernel corruption, measuring detection response times:

```bash
# 1. Run standalone attack simulation with CloudWatch anomaly metric
python scripts/simulate_attack.py

# 2. Run attack simulation with automated quarantine trigger
python scripts/simulate_attack.py --auto-isolate

# 3. Run complete End-to-End Demo Pipeline with Before/After verification table
python scripts/run_demo.py
```

### Supported MITRE ATT&CK Techniques:
- **`PHASE 1 - T1046` (Reconnaissance / Port Scanning)**: Rapid TCP SYN sweeps probing target ports (22, 80, 443, 3389, 8080).
- **`PHASE 2 - T1110.001` (Credential Stuffing / Brute Force)**: Simulated dictionary attack against SSH with auth failure spikes.
- **`PHASE 3 - T1071.001 / T1552.005` (C2 Beaconing & Metadata Harvesting)**: Outbound encrypted C2 heartbeat egress and IMDSv2 credential access attempts.
- **CloudWatch Telemetry**: Dispatches custom security metric `AuraGuard/Security -> MaliciousActivityDetected` (Count=1, Severity=CRITICAL).

---

## 🛡️ Autonomous Forensic Isolation Trigger

The isolation controller executes the Zero-Trust containment protocol:

```bash
# Execute quarantine on target instance (Live AWS)
python scripts/trigger_isolation.py --instance-id i-0123456789abcdef0

# Run in offline simulation / mock mode (requires no AWS connection)
python scripts/trigger_isolation.py --mock

# Run with AWS Boto3 DryRun flag
python scripts/trigger_isolation.py --dry-run
```

### What Happens During Containment:
1. **Forensic EBS Snapshotting**: Takes instantaneous snapshots of all attached EBS volumes before modifying network state.
2. **Network Blackhole**: Applies `AuraGuard-Quarantine-SG` (0 ingress, 0 egress). Active SSH/C2 connections are dropped instantly.
3. **IAM Profile Detachment**: Disassociates the instance profile, neutralizing any stolen temporary IMDS security credentials.
4. **Cryptographic Sealing**: Computes a SHA-256 hash of the complete isolation manifest and stores it under `evidence/`.

---

## ☁️ Serverless AWS Lambda Deployment

Deploy `lambda/isolate_instance.py` for sub-second automated response triggered by **Amazon GuardDuty** or **AWS Security Hub**:

1. **Lambda Runtime**: Python 3.11 / 3.12
2. **Handler**: `isolate_instance.lambda_handler`
3. **Environment Variables**:
   - `AWS_REGION`: `ap-south-1`
   - `QUARANTINE_SG_NAME`: `AuraGuard-Quarantine-SG`
   - `EVIDENCE_VAULT_BUCKET`: `your-evidence-bucket-name`
4. **Execution Role**: Attach `infra/iam_quarantine_policy.json` (for workload quarantine) and grant EC2 Snapshot/Modify and S3 Put permissions to the Lambda role.

---

## 🔐 Cryptographic Chain of Custody Verification

Upon completion of any isolation sequence, an immutable JSON manifest is produced:

```json
{
  "version": "1.0.0",
  "case_id": "AG-CASE-8F3D12AB",
  "isolation_timestamp": "2026-10-10T04:48:32.108420+00:00",
  "aws_region": "ap-south-1",
  "target": {
    "instance_id": "i-0123456789abcdef0",
    "vpc_id": "vpc-0a1b2c3d4e5f67890",
    "quarantine_security_group": "sg-quarantine-4e5f6789"
  },
  "forensic_evidence": {
    "ebs_snapshots": [
      {
        "volume_id": "vol-0123456789abcdef0",
        "snapshot_id": "snap-forensic-e2b4d91c78a0",
        "status": "completed"
      }
    ],
    "iam_profile_neutralized": true,
    "status": "ISOLATED_QUARANTINED"
  },
  "cryptographic_hash_sha256": "4b2e8a6f9c1d0e3a5b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"
}
```

Verify integrity at any time via:
```bash
python -c "import json, hashlib; data=json.load(open('evidence/AuraGuard_Forensic_Manifest_AG-CASE-8F3D12AB.json')); original=data.pop('cryptographic_hash_sha256'); calc=hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest(); print('VERIFIED' if original==calc else 'TAMPERED')"
```

---

## 🛡️ License
Distributed under the **Apache 2.0 License**. See `LICENSE` for more information.
