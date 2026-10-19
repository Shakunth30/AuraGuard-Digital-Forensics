#!/usr/bin/env python3
"""
AuraGuard: Automated Cloud Attack Simulation & Anomaly Trigger Engine
=====================================================================
Emulates realistic multi-stage adversarial compromise indicators against AWS EC2 targets:
- Phase 1: Reconnaissance & Port Scanning (MITRE T1046)
- Phase 2: Credential Stuffing & SSH Brute Force (MITRE T1110.001)
- Phase 3: Simulated Data Exfiltration & C2 Beaconing (MITRE T1071.001 / T1552.005)
- Telemetry: Dispatches high-severity custom security metrics to Amazon CloudWatch.
- Pipeline: Supports --auto-isolate to immediately trigger the autonomous zero-trust quarantine.
"""

import os
import sys
import json
import time
import uuid
import socket
import hashlib
import logging
import argparse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pathlib import Path

# Load environment configuration from .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Import AWS Boto3 SDK
try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [AuraGuard-Sim] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("AuraGuard-Sim")


class AuraGuardAttackSimulator:
    """Simulates adversarial attacks and publishes CloudWatch detection telemetry."""

    def __init__(
        self,
        instance_id: Optional[str] = None,
        region: Optional[str] = None,
        dry_run: bool = False
    ):
        self.instance_id = instance_id or os.getenv("TARGET_INSTANCE_ID")
        self.region = region or os.getenv("AWS_REGION", "ap-south-1")
        self.dry_run = dry_run
        self.session_id = f"AG-SIM-{uuid.uuid4().hex[:8].upper()}"

        if not self.instance_id:
            raise ValueError("Target instance ID must be provided via --instance-id or .env TARGET_INSTANCE_ID")

        # Initialize Boto3 clients
        self.ec2 = None
        self.cloudwatch = None
        if BOTO3_AVAILABLE:
            self.ec2 = boto3.client("ec2", region_name=self.region)
            self.cloudwatch = boto3.client("cloudwatch", region_name=self.region)

    def preflight_health_check(self) -> Dict[str, Any]:
        """
        Verifies target instance exists and is in the 'running' state.
        Raises RuntimeError if instance is stopped or not reachable.
        """
        logger.info(f"Performing pre-flight health check on target instance {self.instance_id}...")

        if not self.ec2:
            logger.warning("Boto3 not initialized. Assuming running state for offline test.")
            return {"InstanceId": self.instance_id, "State": {"Name": "running"}}

        try:
            resp = self.ec2.describe_instances(InstanceIds=[self.instance_id])
            reservations = resp.get("Reservations", [])
            if not reservations or not reservations[0].get("Instances"):
                raise RuntimeError(f"Target instance {self.instance_id} not found in AWS region {self.region}.")

            instance = reservations[0]["Instances"][0]
            state = instance.get("State", {}).get("Name", "unknown")
            logger.info(f"Target Instance State: {state.upper()} | VPC: {instance.get('VpcId')}")

            if state != "running":
                raise RuntimeError(
                    f"Target instance {self.instance_id} is in '{state}' state. Must be 'running' to execute attack simulation."
                )

            return instance

        except ClientError as e:
            logger.error(f"Pre-flight health check failed: {e}")
            raise

    def execute_phase_1_reconnaissance(self, target_ip: str) -> Dict[str, Any]:
        """PHASE 1: Reconnaissance / Port Scanning (MITRE ATT&CK T1046)"""
        logger.info("------------------------------------------------------------")
        logger.info(">>> PHASE 1: Reconnaissance / Port Scanning (MITRE T1046)")
        logger.info("------------------------------------------------------------")
        logger.info(f"Initiating rapid TCP SYN probe sweep against target {target_ip}...")

        target_ports = [21, 22, 80, 443, 3306, 3389, 8080, 8443]
        open_ports = []

        for port in target_ports:
            # Emulate port probing
            logger.info(f"  [PROBE] Scanning TCP port {port:5d} ... {'SYN/ACK (Open)' if port in [22, 80] else 'RST (Closed)'}")
            if port in [22, 80]:
                open_ports.append(port)
            time.sleep(0.15)

        phase_data = {
            "phase": "PHASE 1",
            "technique": "T1046 - Network Service Discovery",
            "target_ip": target_ip,
            "probed_ports": target_ports,
            "discovered_services": open_ports,
            "status": "COMPLETED"
        }
        return phase_data

    def execute_phase_2_brute_force(self, target_ip: str) -> Dict[str, Any]:
        """PHASE 2: Credential Stuffing / Brute Force (MITRE ATT&CK T1110.001)"""
        logger.info("------------------------------------------------------------")
        logger.info(">>> PHASE 2: Credential Stuffing / Brute Force (MITRE T1110.001)")
        logger.info("------------------------------------------------------------")
        logger.info(f"Simulating dictionary attack against SSH service on {target_ip}:22...")

        usernames = ["root", "admin", "ubuntu", "ec2-user", "auraguard-svc"]
        attempts = []

        for user in usernames:
            logger.warning(f"  [AUTH_FAIL] Failed publickey/password authentication attempt for '{user}' from 198.51.100.77")
            attempts.append({"user": user, "source_ip": "198.51.100.77", "result": "AUTH_FAILED"})
            time.sleep(0.2)

        # Successful brute-force escalation simulation
        logger.warning(f"  [ANOMALY] High-frequency authentication failure threshold exceeded (5 failures / 1s)")
        logger.warning(f"  [AUTH_COMPROMISE] Unauthorized interactive session established for 'ec2-user'")

        phase_data = {
            "phase": "PHASE 2",
            "technique": "T1110.001 - Password Guessing / Brute Force",
            "target_service": "SSH (port 22)",
            "attempts": len(attempts),
            "threat_status": "THRESHOLD_EXCEEDED"
        }
        return phase_data

    def execute_phase_3_exfiltration_and_c2(self) -> Dict[str, Any]:
        """PHASE 3: Simulated Data Exfiltration / C2 Beaconing (MITRE ATT&CK T1071.001 / T1552.005)"""
        logger.info("------------------------------------------------------------")
        logger.info(">>> PHASE 3: Simulated Data Exfiltration / C2 Beaconing (MITRE T1071.001)")
        logger.info("------------------------------------------------------------")

        c2_endpoint = "198.51.100.23:4444"
        logger.info(f"Simulating outbound Command & Control (C2) heartbeat beaconing to {c2_endpoint}...")

        beacons = []
        for seq in range(1, 4):
            logger.warning(f"  [C2_EGRESS] Beacon #{seq} -> {c2_endpoint} | Protocol: TCP/Encrypted | Bytes: 512")
            beacons.append({"seq": seq, "endpoint": c2_endpoint, "bytes": 512})
            time.sleep(0.25)

        logger.info("Simulating unauthorized Instance Metadata API (IMDSv2) credential query...")
        logger.warning("  [IMDS_HARVEST] HTTP GET http://169.254.169.254/latest/meta-data/iam/security-credentials/")
        logger.warning("  [DATA_STAGING] Staging /var/log/secure and customer data for exfiltration")

        phase_data = {
            "phase": "PHASE 3",
            "technique": "T1071.001 (C2) & T1552.005 (Cloud Metadata)",
            "c2_endpoint": c2_endpoint,
            "beacons_transmitted": len(beacons),
            "imds_probed": True,
            "exfiltration_risk": "CRITICAL"
        }
        return phase_data

    def push_cloudwatch_security_metric(self) -> Dict[str, Any]:
        """
        Pushes custom security metric to Amazon CloudWatch:
        Namespace: AuraGuard/Security
        MetricName: MaliciousActivityDetected
        Value: 1.0 (Unit: Count)
        """
        logger.info("------------------------------------------------------------")
        logger.info(">>> EMITTING FORENSIC DETECTION TELEMETRY TO CLOUDWATCH")
        logger.info("------------------------------------------------------------")

        metric_payload = {
            "Namespace": "AuraGuard/Security",
            "MetricData": [
                {
                    "MetricName": "MaliciousActivityDetected",
                    "Dimensions": [
                        {"Name": "InstanceId", "Value": self.instance_id},
                        {"Name": "ThreatCategory", "Value": "BruteForce_And_C2Beaconing"},
                        {"Name": "Severity", "Value": "CRITICAL"}
                    ],
                    "Value": 1.0,
                    "Unit": "Count",
                    "Timestamp": datetime.now(timezone.utc)
                }
            ]
        }

        if self.dry_run or not self.cloudwatch:
            logger.info(f"[DRY-RUN] CloudWatch Metric emitted: AuraGuard/Security -> MaliciousActivityDetected=1")
            return {"status": "DRY_RUN_EMITTED", "metric": "MaliciousActivityDetected"}

        try:
            resp = self.cloudwatch.put_metric_data(**metric_payload)
            status_code = resp.get("ResponseMetadata", {}).get("HTTPStatusCode", 200)
            logger.info(
                f"[TELEMETRY DISPATCHED] CloudWatch Metric 'AuraGuard/Security:MaliciousActivityDetected' "
                f"successfully posted for instance {self.instance_id} (HTTP {status_code})."
            )
            return {"status": "SUCCESS", "http_status": status_code}
        except ClientError as e:
            logger.error(f"Failed to publish CloudWatch security metric: {e}")
            return {"status": "FAILED", "error": str(e)}

    def run_simulation(self) -> Dict[str, Any]:
        """Executes the complete attack chain and returns a structured execution report."""
        start_time = datetime.now(timezone.utc).isoformat()
        logger.info("============================================================")
        logger.info(f"AURAGUARD ADVERSARIAL ATTACK SIMULATION | SESSION: {self.session_id}")
        logger.info(f"Target: {self.instance_id} | Region: {self.region}")
        logger.info("============================================================")

        # Step 1: Pre-flight check
        instance_meta = self.preflight_health_check()
        target_ip = instance_meta.get("PublicIpAddress") or instance_meta.get("PrivateIpAddress", "10.0.0.100")
        original_sgs = [sg["GroupId"] for sg in instance_meta.get("SecurityGroups", [])]

        # Step 2: Execute attack phases
        phase_1 = self.execute_phase_1_reconnaissance(target_ip)
        phase_2 = self.execute_phase_2_brute_force(target_ip)
        phase_3 = self.execute_phase_3_exfiltration_and_c2()

        # Step 3: Trigger CloudWatch anomaly metric
        cw_result = self.push_cloudwatch_security_metric()

        # Step 4: Build JSON execution report
        report = {
            "session_id": self.session_id,
            "timestamp": start_time,
            "target_instance_id": self.instance_id,
            "target_ip": target_ip,
            "aws_region": self.region,
            "initial_security_groups": original_sgs,
            "simulated_attack_type": "SSH_BRUTE_FORCE_AND_C2_EXFILTRATION",
            "cloudwatch_metric": {
                "namespace": "AuraGuard/Security",
                "metric_name": "MaliciousActivityDetected",
                "value": 1,
                "unit": "Count",
                "result": cw_result
            },
            "status": "ATTACK_SIMULATION_ACTIVE",
            "phases": [phase_1, phase_2, phase_3],
            "recommendation": "IMMEDIATE_AUTONOMOUS_FORENSIC_ISOLATION"
        }

        # SHA-256 integrity hash
        serialized = json.dumps(report, sort_keys=True)
        report["integrity_sha256"] = hashlib.sha256(serialized.encode("utf-8")).hexdigest()

        # Save to evidence folder
        self._save_report(report)
        return report

    def _save_report(self, report: Dict[str, Any]):
        """Persists the attack report to evidence/."""
        evidence_dir = Path("evidence")
        evidence_dir.mkdir(parents=True, exist_ok=True)
        report_path = evidence_dir / "attack_simulation_report.json"

        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        logger.info(f"Attack simulation JSON report preserved at: {report_path}")


def main():
    parser = argparse.ArgumentParser(
        description="AuraGuard: Automated Cloud Attack Simulation & Anomaly Trigger Engine"
    )
    parser.add_argument(
        "--instance-id",
        default=os.getenv("TARGET_INSTANCE_ID"),
        help="AWS Target EC2 Instance ID"
    )
    parser.add_argument(
        "--region",
        default=os.getenv("AWS_REGION", "ap-south-1"),
        help="AWS Region (default: ap-south-1)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run simulation in dry-run mode"
    )
    parser.add_argument(
        "--auto-isolate",
        action="store_true",
        help="Immediately trigger autonomous zero-trust isolation upon anomaly detection"
    )

    args = parser.parse_args()

    simulator = AuraGuardAttackSimulator(
        instance_id=args.instance_id,
        region=args.region,
        dry_run=args.dry_run
    )

    report = simulator.run_simulation()

    print("\n" + "=" * 60)
    print("AURAGUARD ATTACK SIMULATION REPORT (JSON SUMMARY)")
    print("=" * 60)
    print(json.dumps({
        "timestamp": report["timestamp"],
        "target_instance_id": report["target_instance_id"],
        "simulated_attack_type": report["simulated_attack_type"],
        "cloudwatch_metric": "AuraGuard/Security:MaliciousActivityDetected",
        "status": report["status"],
        "integrity_sha256": report["integrity_sha256"]
    }, indent=2))
    print("=" * 60)

    if args.auto_isolate:
        print("\n[ANOMALY DETECTOR TRIGGERED]")
        print("High-severity security event detected on target instance.")
        print("Initiating Autonomous Zero-Trust Forensic Isolation Workflow...\n")

        from trigger_isolation import AuraGuardIsolationController
        controller = AuraGuardIsolationController(
            instance_id=report["target_instance_id"],
            region=report["aws_region"],
            dry_run=args.dry_run
        )
        manifest = controller.execute_quarantine_workflow(case_id=report["session_id"])

        print("\n" + "=" * 65)
        print("AURAGUARD END-TO-END INCIDENT RESPONSE VERIFICATION")
        print("=" * 65)
        print(f"Target Instance:        {report['target_instance_id']}")
        print(f"Pre-Attack SG:          {report['initial_security_groups']}")
        print(f"Attack Trigger Time:    {report['timestamp']}")
        print(f"Quarantine Status:      {manifest['forensic_evidence']['status']}")
        print(f"Quarantined SG:         {manifest['target']['quarantine_security_group']} (0-In / 0-Out)")
        print(f"Forensic Snapshots:     {[s['snapshot_id'] for s in manifest['forensic_evidence']['ebs_snapshots']]}")
        print(f"Evidence Vault URI:     s3://{os.getenv('EVIDENCE_VAULT_BUCKET')}/cases/{manifest['case_id']}/manifest.json")
        print(f"Cryptographic Hash:     {manifest['cryptographic_hash_sha256']}")
        print("=" * 65)


if __name__ == "__main__":
    main()
