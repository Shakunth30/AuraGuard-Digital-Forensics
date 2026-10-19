# Security Policy & Vulnerability Disclosure

## 1. Security Architecture & Threat Model

AuraGuard is designed for zero-trust containment of compromised cloud compute workloads in Amazon Web Services (AWS). Security principles applied:
- **Out-of-Band Control Plane Operation**: No security agent runs inside the monitored workload. Containment is driven by EventBridge and Lambda at the AWS hypervisor level.
- **Server-Side Secret Isolation**: AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are stored in `.env` and loaded exclusively by the Python server. Secrets are **never** injected into the client-side JavaScript bundle.
- **Zero-Trust Network Blackhole**: The quarantine security group enforces 0 ingress rules and 0 egress rules, preventing lateral movement and command-and-control communication.
- **Tamper-Evident Hashing**: Every forensic manifest is cryptographically signed with deterministic SHA-256 before upload to an AES-256 encrypted Amazon S3 bucket.

---

## 2. Known Limitations & Compensating Controls

### The STS Temporary Credential Window
* **Limitation**: When AuraGuard disassociates the IAM Instance Profile (`ec2:DisassociateIamInstanceProfile`), it immediately prevents the instance from requesting **new** credentials via the Instance Metadata Service (IMDSv2). However, temporary credentials already issued prior to detachment remain valid until their natural expiration (up to 6 hours).
* **Mitigation**: In high-assurance environments, attach the policy in `infra/iam_session_revocation_policy.json` to the workload's IAM role. This applies a `Deny` condition with `DateLessThan` on `aws:TokenIssueTime`, instantly revoking all pre-existing sessions.

### EBS Snapshot Consistency
* Point-in-time EBS snapshots represent a crash-consistent copy of the file system. In-memory data is preserved because AuraGuard does not terminate or reboot the EC2 instance.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability within AuraGuard, please do **NOT** open a public issue. Follow this responsible disclosure process:
1. Contact the maintainer privately via email at: `imsriram093@gmail.com`.
2. Include a proof-of-concept description, impact assessment, and remediation steps.
3. You will receive an acknowledgment within 48 hours and updates until resolved.

---

## 4. Secret Governance Policy
- Do not commit `.env`, `*.pem`, `*.key`, or cloud credentials.
- All committed configuration templates must use placeholder values (e.g., `.env.example`).
