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

---

## 🖥️ AuraGuard Command Center (Web UI & Live Dashboard)

A cinematic, award-level web application and live operations dashboard built with **Vite, React 18, TypeScript, Tailwind CSS, and Three.js (React Three Fiber)**.

### Design Concept: "Aurora Glass"
- **Aesthetic**: Night-sky fortress aesthetic inspired by the northern lights. Represents a living digital shield protecting cloud workloads.
- **Color System**:
  - **Base Void**: `#05070F`, Deep Layer `#0B1020`, Elevated `#121A33`
  - **Aurora Teal** (`#2EF2C0` → `#19B8A6`): Normal production & healthy status
  - **Aurora Violet** (`#8B6CFF` → `#C4A8FF`): Cryptographic evidence & S3 vaulting
  - **Ice Blue** (`#7CC4FF`): Telemetry & cloud infrastructure metadata
  - **Ember Coral** (`#FF4D5E` → `#FF8A5B`): Reserved strictly for active adversary threats
- **Typography (Self-Hosted via `@fontsource`, SIL Open Font License OFL)**:
  - **Display / Logo / Key Metrics**: Orbitron (Weights 600, 800)
  - **Headings & UI Labels**: Chakra Petch (Weights 500, 700) with uppercase cyber tracking (`0.08em` - `0.12em`)
  - **Body UI**: IBM Plex Sans (Weights 400, 500)
  - **Data, Hashes, Logs, & Timestamps**: JetBrains Mono (Weights 400, 500, 700) with tabular numbers
- **Glassmorphism**: High-performance backdrop blur (22px), 1px gradient borders, soft reactive glows, and floating 3D parallax.

---

### Environment Variables Catalog

Refer to [`.env.example`](.env.example) for the full configuration template:

| Variable | Scope | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `AWS_REGION` | Server & Scripts | Target AWS region | `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | Server & Scripts | IAM Access Key ID | `AKIAEXAMPLEACCESSKEY` |
| `AWS_SECRET_ACCESS_KEY` | Server & Scripts | IAM Secret Access Key | *(Masked)* |
| `VPC_ID` | Server & Scripts | Target VPC identifier | `vpc-0xxxxxxxxxxxxxxxxx` |
| `SUBNET_ID` | Server & Scripts | Target Subnet identifier | `subnet-0xxxxxxxxxxxxxxxxx` |
| `TARGET_INSTANCE_ID` | Server & Scripts | Protected EC2 Instance ID | `i-0xxxxxxxxxxxxxxxxx` |
| `QUARANTINE_SG_ID` | Server & Lambda | Optional pre-provisioned quarantine SG ID | `sg-0xxxxxxxxxxxxxxxxx` |
| `QUARANTINE_SG_NAME` | Server & Lambda | Dynamic discovery/creation SG name | `AuraGuard-Quarantine-SG` |
| `EVIDENCE_VAULT_BUCKET` | Server & Lambda | S3 Evidence Vault bucket name | `auraguard-evidence-vault-sample` |
| `SERVER_HOST` | FastAPI Server | Local bind host | `127.0.0.1` |
| `SERVER_PORT` | FastAPI Server | Local bind port | `8000` |

---

### Running the Command Center

#### 1. Start the Backend API (FastAPI)
```powershell
python -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start the Frontend (Vite)
```powershell
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Demo Mode vs. Live AWS Mode
- **Demo Mode (Default & Zero-AWS Dependency)**: Replays realistic scripted incident data based on Case `AG-20261019-30ECB6`, target instance `i-04c26f6ddf34068ca`, snapshot `snap-016635bad8c1227f5`, and cryptographic hash `5bbf4582f66beed5...`. Allows 100% offline testing and presentation without incurring AWS costs or requiring active cloud connectivity.
- **Live AWS Mode**: Toggle the **`DEMO MODE / LIVE AWS`** pill in the top navigation bar. When active, API calls interact directly with AWS `ap-south-1` via server-side Boto3 without ever exposing AWS credentials to the browser.

---

### Interactive Features & Key Components
1. **Interactive 3D Hero Scene**: Floating glass EC2 cube inside a hexagonal shield lattice. Reacts dynamically to threat states (turns coral during attacks and seals inside a teal shockwave with orbiting violet custody orb upon containment).
2. **RAM Preservation Toggle**: Interactive matrix comparing traditional destructive server termination against AuraGuard's live-memory blackhole.
3. **5-Layer Architecture Inspector**: Interactive diagram detailing Detection, EventBridge, Lambda, Zero-Trust SG, and S3 Vault with direct code snippets.
4. **Sub-Second Containment Stepper**: Displays millisecond progression from threat ingestion ($T+0.00\text{s}$) to S3 vaulting ($T+1.72\text{s}$).
5. **In-Browser Web Crypto Hash Verification**: Validates the SHA-256 seal live using the browser's SubtleCrypto API. Includes a **"Simulate Manifest Tamper"** button to prove detection of altered evidence.
6. **Faculty Presentation Mode (Press `P`)**: Fullscreen, clutter-free guided tour with on-screen narration scripts designed specifically for academic evaluation.

---

### Presentation Screenshot Checklist
- [ ] **Landing Page**: 3D glass cube with glowing aurora particles and "Contain the breach before the breach finishes" headline.
- [ ] **RAM Preservation Comparison**: Side-by-side matrix showing 100% volatile memory survival vs. traditional 0%.
- [ ] **Interactive Architecture Drawer**: Selected Lambda node showing backend Python isolation handler.
- [ ] **Live Dashboard (Healthy)**: Target node `i-04c26f6ddf34068ca` in normal state with active security groups.
- [ ] **Under Attack State**: Red coral glow with active MITRE C2 exfiltration telemetry.
- [ ] **Quarantined State**: Teal-violet locked state with 100% completed EBS snapshot progress bar.
- [ ] **Web Crypto Hash Verification**: "VERIFIED GENUINE" green seal alongside "TAMPER DETECTED (MISMATCH)" demonstration.
- [ ] **Faculty Defense Mode (`P`)**: Presenter cue card with scripted talking points.

---

## 🔒 Security & Known Limitations
See [`SECURITY.md`](SECURITY.md) for full vulnerability disclosure policy and threat model.
- **IMDSv2 Session Token Invalidation**: Disassociating the IAM instance profile prevents new tokens from being issued. To immediately revoke pre-existing STS tokens, apply [`infra/iam_session_revocation_policy.json`](infra/iam_session_revocation_policy.json) with `aws:TokenIssueTime`.

---

## 📜 Font & Asset Credits
All fonts are open-source and bundled locally via Fontsource:
- **Orbitron**: Designed by Matt McInerney ([SIL Open Font License 1.1](https://scripts.sil.org/OFL))
- **Chakra Petch**: Designed by Cadson Demak ([SIL Open Font License 1.1](https://scripts.sil.org/OFL))
- **IBM Plex Sans**: Designed by Mike Abbink / Bold Monday ([SIL Open Font License 1.1](https://scripts.sil.org/OFL))
- **JetBrains Mono**: Designed by JetBrains ([SIL Open Font License 1.1](https://scripts.sil.org/OFL))

---

## 🛡️ License
Distributed under the **Apache 2.0 License**. See [`LICENSE`](LICENSE) for more information.


