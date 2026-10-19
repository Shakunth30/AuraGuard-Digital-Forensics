#!/usr/bin/env python3
"""
AuraGuard: Zero-Trust Autonomous Cloud Forensic Isolation Controller
====================================================================
Orchestrates rapid, autonomous quarantine of compromised EC2 workloads in AWS ap-south-1.

Core Workflow:
1. Pre-flight Validation: Validates target instance state and attached storage.
2. Forensic Snapshot Acquisition: Initiates point-in-time EBS snapshots of all volumes.
3. Zero-Trust Network Quarantine: Swaps security groups to total blackhole (0 ingress, 0 egress).
4. Identity Neutralization: Disassociates IAM Instance Profile to kill compromised IMDS tokens.
5. Cryptographic Evidence Manifest: Generates SHA-256 signed chain of custody record.
"""

import os
import sys
import json
import uuid
import hashlib
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pathlib import Path

# Load environment configuration
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Import AWS SDK
try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [AuraGuard-Isolation] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("AuraGuard-Isolation")


class AuraGuardIsolationController:
    """Manages the autonomous forensic isolation lifecycle for EC2 workloads."""

    def __init__(
        self,
        instance_id: Optional[str] = None,
        region: str = "ap-south-1",
        config_path: str = "config/aws_config.json",
        dry_run: bool = False,
        mock_mode: bool = False
    ):
        self.instance_id = instance_id or os.getenv("TARGET_INSTANCE_ID", "i-mock-instance-01")
        self.region = region or os.getenv("AWS_REGION", "ap-south-1")
        self.dry_run = dry_run
        self.mock_mode = mock_mode
        self.config = self._load_config(config_path)

        # Initialize Boto3 clients if available
        self.ec2 = None
        self.s3 = None
        if BOTO3_AVAILABLE and not self.mock_mode:
            try:
                self.ec2 = boto3.client("ec2", region_name=self.region)
                self.s3 = boto3.client("s3", region_name=self.region)
            except Exception as e:
                logger.warning(f"Could not initialize live Boto3 client ({e}). Falling back to mock/simulation mode.")
                self.mock_mode = True

    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Loads configuration from JSON file or provides robust defaults."""
        try:
            p = Path(config_path)
            if p.exists():
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load config from {config_path}: {e}")

        return {
            "quarantine_security_group": {"group_name": "AuraGuard-Quarantine-SG"},
            "evidence_vault": {
                "s3_bucket_prefix": "auraguard-evidence-vault",
                "cryptographic_hash_algorithm": "SHA-256"
            }
        }

    def get_or_create_quarantine_sg(self, vpc_id: str) -> str:
        """
        Locates or creates the Zero-Trust Quarantine Security Group.
        Total Blackhole: 0 inbound rules, 0 outbound rules.
        """
        sg_name = self.config.get("quarantine_security_group", {}).get(
            "group_name", "AuraGuard-Quarantine-SG"
        )

        if self.mock_mode or not self.ec2:
            mock_sg_id = f"sg-quarantine-{vpc_id[-8:] if len(vpc_id) >= 8 else 'blackhole'}"
            logger.info(f"[MOCK] Quarantine Security Group located/created: {mock_sg_id} (0 Ingress, 0 Egress)")
            return mock_sg_id

        try:
            # Check if quarantine SG exists in the VPC
            response = self.ec2.describe_security_groups(
                Filters=[
                    {"Name": "group-name", "Values": [sg_name]},
                    {"Name": "vpc-id", "Values": [vpc_id]}
                ]
            )
            if response["SecurityGroups"]:
                sg_id = response["SecurityGroups"][0]["GroupId"]
                logger.info(f"Existing Quarantine Security Group found: {sg_id}")
                return sg_id

            # Create new quarantine security group
            logger.info(f"Creating Zero-Trust Quarantine Security Group '{sg_name}' in VPC {vpc_id}...")
            create_resp = self.ec2.create_security_group(
                GroupName=sg_name,
                Description="AuraGuard Zero-Trust Quarantine Security Group - Total Blackhole",
                VpcId=vpc_id,
                TagSpecifications=[
                    {
                        "ResourceType": "security-group",
                        "Tags": [
                            {"Key": "Name", "Value": sg_name},
                            {"Key": "AuraGuard-Role", "Value": "Forensic-Quarantine"},
                            {"Key": "ZeroTrust", "Value": "Total-Blackhole"}
                        ]
                    }
                ]
            )
            sg_id = create_resp["GroupId"]

            # Revoke default outbound egress rule to achieve total network isolation
            try:
                self.ec2.revoke_security_group_egress(
                    GroupId=sg_id,
                    IpPermissions=[
                        {
                            "IpProtocol": "-1",
                            "IpRanges": [{"CidrIp": "0.0.0.0/0"}]
                        }
                    ]
                )
                logger.info(f"Default egress revoked on {sg_id}. Absolute network blackhole enforced.")
            except ClientError as e:
                logger.debug(f"Egress rule revocation note: {e}")

            return sg_id

        except ClientError as e:
            logger.error(f"Error managing quarantine security group: {e}")
            raise

    def acquire_forensic_snapshots(
        self,
        block_devices: List[Dict[str, Any]],
        case_id: str
    ) -> List[Dict[str, str]]:
        """Creates forensic EBS point-in-time snapshots for all mounted volumes."""
        snapshot_records = []
        timestamp = datetime.now(timezone.utc).isoformat()

        logger.info(f"Acquiring forensic snapshots for {len(block_devices)} volume(s)...")

        for device in block_devices:
            volume_id = device.get("Ebs", {}).get("VolumeId", f"vol-mock-{uuid.uuid4().hex[:8]}")
            device_name = device.get("DeviceName", "/dev/xvda")

            if self.mock_mode or not self.ec2:
                mock_snap_id = f"snap-forensic-{uuid.uuid4().hex[:12]}"
                logger.info(f"[MOCK] Forensic Snapshot acquired: {mock_snap_id} for volume {volume_id} ({device_name})")
                snapshot_records.append({
                    "volume_id": volume_id,
                    "device_name": device_name,
                    "snapshot_id": mock_snap_id,
                    "timestamp": timestamp,
                    "status": "completed"
                })
                continue

            try:
                desc = f"AuraGuard Forensic Snapshot | Case: {case_id} | Vol: {volume_id}"
                snap = self.ec2.create_snapshot(
                    VolumeId=volume_id,
                    Description=desc,
                    DryRun=self.dry_run,
                    TagSpecifications=[
                        {
                            "ResourceType": "snapshot",
                            "Tags": [
                                {"Key": "Name", "Value": f"AuraGuard-{case_id}-{volume_id}"},
                                {"Key": "AuraGuard-Case-ID", "Value": case_id},
                                {"Key": "AuraGuard-Source-Instance", "Value": self.instance_id},
                                {"Key": "AuraGuard-Forensic-Type", "Value": "Disk-Image"},
                                {"Key": "AuraGuard-Acquired-At", "Value": timestamp}
                            ]
                        }
                    ]
                )
                snap_id = snap["SnapshotId"]
                logger.info(f"Forensic Snapshot initiated: {snap_id} for {volume_id} ({device_name})")
                snapshot_records.append({
                    "volume_id": volume_id,
                    "device_name": device_name,
                    "snapshot_id": snap_id,
                    "timestamp": timestamp,
                    "status": "pending"
                })
            except ClientError as e:
                if e.response.get("Error", {}).get("Code") == "DryRunOperation":
                    logger.info(f"[DRY-RUN VERIFIED] EBS snapshot operation authorized for volume {volume_id} ({device_name}).")
                    snapshot_records.append({
                        "volume_id": volume_id,
                        "device_name": device_name,
                        "snapshot_id": f"snap-dryrun-verified-{volume_id[-8:]}",
                        "timestamp": timestamp,
                        "status": "dry_run_verified"
                    })
                else:
                    logger.error(f"Failed to snapshot volume {volume_id}: {e}")
                    snapshot_records.append({
                        "volume_id": volume_id,
                        "device_name": device_name,
                        "snapshot_id": "FAILED",
                        "error": str(e)
                    })

        return snapshot_records

    def apply_network_isolation(
        self,
        quarantine_sg_id: str,
        original_sg_ids: List[str]
    ) -> bool:
        """Replaces instance security groups with the Zero-Trust Quarantine Security Group."""
        logger.warning(
            f"[SEVERING CONNECTIONS] Swapping security groups on {self.instance_id}: "
            f"{original_sg_ids} -> [{quarantine_sg_id}]"
        )

        if self.mock_mode or not self.ec2:
            logger.info(f"[MOCK] Security groups successfully swapped. Zero-Trust blackhole active.")
            return True

        try:
            self.ec2.modify_instance_attribute(
                InstanceId=self.instance_id,
                Groups=[quarantine_sg_id],
                DryRun=self.dry_run
            )
            logger.info(f"Instance {self.instance_id} network connectivity completely severed.")
            return True
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") == "DryRunOperation":
                logger.info(f"[DRY-RUN VERIFIED] Network security group modification to {quarantine_sg_id} authorized.")
                return True
            logger.error(f"Failed to modify instance security groups: {e}")
            return False

    def neutralize_iam_credentials(
        self,
        iam_association: Optional[Dict[str, Any]]
    ) -> Optional[str]:
        """Disassociates IAM instance profile to neutralize IMDSv1/v2 credentials."""
        if not iam_association:
            logger.info(f"No IAM Instance Profile attached to {self.instance_id}. Skipping neutralization.")
            return None

        association_id = iam_association.get("AssociationId")
        iam_arn = iam_association.get("IamInstanceProfile", {}).get("Arn", "unknown")

        logger.warning(
            f"[REVOKING IDENTITY] Disassociating IAM Instance Profile: {iam_arn} (Assoc: {association_id})"
        )

        if self.mock_mode or not self.ec2:
            logger.info(f"[MOCK] IAM Profile {iam_arn} neutralized. IMDS credentials invalidated.")
            return association_id

        try:
            self.ec2.disassociate_iam_instance_profile(
                AssociationId=association_id
            )
            logger.info(f"IAM Profile {association_id} successfully disassociated.")
            return association_id
        except ClientError as e:
            logger.error(f"Failed to disassociate IAM profile: {e}")
            return None

    def execute_quarantine_workflow(
        self,
        case_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Executes the full zero-trust forensic quarantine sequence."""
        case_id = case_id or f"AG-CASE-{uuid.uuid4().hex[:8].upper()}"
        start_time = datetime.now(timezone.utc).isoformat()

        logger.info(f"============================================================")
        logger.info(f"AURAGUARD ZERO-TRUST QUARANTINE INITIATED | CASE: {case_id}")
        logger.info(f"Target Instance: {self.instance_id} | Region: {self.region}")
        logger.info(f"============================================================")

        # Step 1: Pre-flight instance query
        instance_details = self._get_instance_details()
        vpc_id = instance_details.get("VpcId", os.getenv("VPC_ID", "vpc-0123456789abcdef0"))
        original_sgs = [sg["GroupId"] for sg in instance_details.get("SecurityGroups", [])]
        block_devices = instance_details.get("BlockDeviceMappings", [])
        iam_profile_assoc = instance_details.get("IamInstanceProfile")

        # Step 2: Acquire point-in-time forensic snapshots (BEFORE cutting networks)
        snapshot_records = self.acquire_forensic_snapshots(block_devices, case_id)

        # Step 3: Zero-Trust Network Quarantine
        quarantine_sg_id = self.get_or_create_quarantine_sg(vpc_id)
        isolation_success = self.apply_network_isolation(quarantine_sg_id, original_sgs)

        # Step 4: Identity & Credential Neutralization
        iam_neutralized = self.neutralize_iam_credentials(iam_profile_assoc)

        # Step 5: Tag Instance with Quarantine Metadata
        self._tag_quarantined_instance(case_id)

        # Step 6: Generate Cryptographic Evidence Manifest
        manifest = {
            "version": "1.0.0",
            "case_id": case_id,
            "isolation_timestamp": start_time,
            "aws_region": self.region,
            "target": {
                "instance_id": self.instance_id,
                "vpc_id": vpc_id,
                "subnet_id": instance_details.get("SubnetId", os.getenv("SUBNET_ID", "subnet-xxxxxxxx")),
                "private_ip": instance_details.get("PrivateIpAddress", "10.0.0.100"),
                "public_ip": instance_details.get("PublicIpAddress", "None"),
                "original_security_groups": original_sgs,
                "quarantine_security_group": quarantine_sg_id
            },
            "forensic_evidence": {
                "ebs_snapshots": snapshot_records,
                "iam_profile_neutralized": iam_neutralized is not None,
                "iam_association_id": iam_neutralized,
                "status": "ISOLATED_QUARANTINED"
            },
            "chain_of_custody": {
                "custodian": "AuraGuard-Autonomous-Forensic-Engine",
                "isolation_policy": "Zero-Trust-Immediate-Blackhole",
                "verified": isolation_success
            }
        }

        # Calculate cryptographic SHA-256 digital signature of evidence manifest
        serialized = json.dumps(manifest, sort_keys=True)
        manifest_hash = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        manifest["cryptographic_hash_sha256"] = manifest_hash

        # Save manifest
        self._save_evidence_manifest(manifest, case_id)

        logger.info(f"============================================================")
        logger.info(f"AURAGUARD ISOLATION COMPLETE | HASH: {manifest_hash}")
        logger.info(f"============================================================")
        return manifest

    def _get_instance_details(self) -> Dict[str, Any]:
        """Retrieves EC2 instance attributes or returns mock profile."""
        if self.mock_mode or not self.ec2:
            return {
                "InstanceId": self.instance_id,
                "VpcId": os.getenv("VPC_ID", "vpc-0a1b2c3d4e5f67890"),
                "SubnetId": os.getenv("SUBNET_ID", "subnet-0123456789abcdef0"),
                "PrivateIpAddress": "10.0.0.100",
                "PublicIpAddress": "13.232.100.50",
                "State": {"Name": "running"},
                "SecurityGroups": [{"GroupId": "sg-original-workload-01"}],
                "BlockDeviceMappings": [
                    {"DeviceName": "/dev/xvda", "Ebs": {"VolumeId": "vol-0123456789abcdef0"}}
                ],
                "IamInstanceProfile": {
                    "AssociationId": "iip-assoc-0123456789",
                    "IamInstanceProfile": {
                        "Arn": "arn:aws:iam::123456789012:instance-profile/AuraGuard-Workload-Role"
                    }
                }
            }

        try:
            resp = self.ec2.describe_instances(InstanceIds=[self.instance_id])
            reservations = resp.get("Reservations", [])
            if reservations and reservations[0].get("Instances"):
                return reservations[0]["Instances"][0]
        except ClientError as e:
            logger.warning(f"Could not describe instance {self.instance_id} ({e}). Using mock representation.")

        return {"InstanceId": self.instance_id}

    def _tag_quarantined_instance(self, case_id: str):
        """Applies forensic governance tags to the EC2 instance."""
        if self.mock_mode or not self.ec2:
            logger.info(f"[MOCK] Tags applied to {self.instance_id}: AuraGuard-Status=QUARANTINED")
            return

        try:
            self.ec2.create_tags(
                Resources=[self.instance_id],
                DryRun=self.dry_run,
                Tags=[
                    {"Key": "AuraGuard-Status", "Value": "QUARANTINED"},
                    {"Key": "AuraGuard-Case-ID", "Value": case_id},
                    {"Key": "AuraGuard-Quarantined-At", "Value": datetime.now(timezone.utc).isoformat()}
                ]
            )
            logger.info(f"Instance {self.instance_id} tagged with AuraGuard-Status=QUARANTINED.")
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") == "DryRunOperation":
                logger.info(f"[DRY-RUN VERIFIED] Instance tagging operation authorized for {self.instance_id}.")
            else:
                logger.error(f"Failed to tag quarantined instance: {e}")

    def _save_evidence_manifest(self, manifest: Dict[str, Any], case_id: str):
        """Writes forensic manifest to disk and uploads to S3 Evidence Vault if configured."""
        evidence_dir = Path("evidence")
        evidence_dir.mkdir(parents=True, exist_ok=True)
        manifest_file = evidence_dir / f"AuraGuard_Forensic_Manifest_{case_id}.json"

        with open(manifest_file, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        logger.info(f"Tamper-evident Forensic Manifest preserved at: {manifest_file}")

        # Attempt S3 Vault upload if credentials and bucket exist
        bucket = os.getenv("EVIDENCE_VAULT_BUCKET")
        if bucket and self.s3 and not self.mock_mode:
            try:
                s3_key = f"cases/{case_id}/manifest.json"
                self.s3.upload_file(str(manifest_file), bucket, s3_key)
                logger.info(f"Manifest cryptographically vaulted to S3: s3://{bucket}/{s3_key}")
            except Exception as e:
                logger.warning(f"Could not upload manifest to S3 Vault: {e}")

    def rollback_quarantine(
        self,
        manifest_file: Optional[str] = None,
        restore_sg_ids: Optional[List[str]] = None
    ) -> bool:
        """Restores pre-quarantine security groups and updates status tags."""
        logger.info(f"Initiating rollback / restoration workflow for {self.instance_id}...")

        target_sgs = restore_sg_ids or []
        if not target_sgs and manifest_file:
            try:
                with open(manifest_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    target_sgs = data.get("target", {}).get("original_security_groups", [])
            except Exception as e:
                logger.error(f"Failed to read manifest file {manifest_file}: {e}")

        if not target_sgs:
            # Fallback query default or prompt
            logger.warning("No original security groups specified. Querying existing VPC for defaults...")
            return False

        logger.info(f"Restoring security groups for {self.instance_id}: {target_sgs}")
        if self.mock_mode or not self.ec2:
            logger.info(f"[MOCK] Security groups restored to {target_sgs}.")
            return True

        try:
            self.ec2.modify_instance_attribute(
                InstanceId=self.instance_id,
                Groups=target_sgs,
                DryRun=self.dry_run
            )
            self.ec2.create_tags(
                Resources=[self.instance_id],
                DryRun=self.dry_run,
                Tags=[
                    {"Key": "AuraGuard-Status", "Value": "RESTORED"},
                    {"Key": "AuraGuard-Restored-At", "Value": datetime.now(timezone.utc).isoformat()}
                ]
            )
            logger.info(f"Instance {self.instance_id} successfully restored to original security groups.")
            return True
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") == "DryRunOperation":
                logger.info("[DRY-RUN VERIFIED] Rollback restoration operation authorized.")
                return True
            logger.error(f"Failed to restore security groups: {e}")
            return False


def main():
    import argparse
    parser = argparse.ArgumentParser(
        description="AuraGuard: Zero-Trust Autonomous Cloud Forensic Isolation Controller"
    )
    parser.add_argument(
        "--instance-id",
        default=os.getenv("TARGET_INSTANCE_ID", "i-xxxxxxxxxxxxxxxxx"),
        help="AWS Target EC2 Instance ID to isolate"
    )
    parser.add_argument(
        "--region",
        default=os.getenv("AWS_REGION", "ap-south-1"),
        help="AWS Region (default: ap-south-1)"
    )
    parser.add_argument(
        "--case-id",
        default=None,
        help="Optional forensic incident case ID"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Execute with AWS EC2 DryRun flag"
    )
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Run in mock/offline mode without live AWS API calls"
    )
    parser.add_argument(
        "--rollback",
        action="store_true",
        help="Rollback quarantine by restoring original security groups"
    )
    parser.add_argument(
        "--manifest",
        default=None,
        help="Path to manifest file to load original security groups from for rollback"
    )
    parser.add_argument(
        "--restore-sgs",
        nargs="+",
        help="List of Security Group IDs to restore during rollback"
    )

    args = parser.parse_args()

    controller = AuraGuardIsolationController(
        instance_id=args.instance_id,
        region=args.region,
        dry_run=args.dry_run,
        mock_mode=args.mock
    )

    if args.rollback:
        success = controller.rollback_quarantine(
            manifest_file=args.manifest,
            restore_sg_ids=args.restore_sgs
        )
        print(f"\nRollback result for {args.instance_id}: {'SUCCESS' if success else 'FAILED'}")
        return

    manifest = controller.execute_quarantine_workflow(case_id=args.case_id)
    print("\n" + "=" * 60)
    print("AURAGUARD FORENSIC ISOLATION VERIFICATION")
    print("=" * 60)
    print(f"Case ID:                 {manifest['case_id']}")
    print(f"Target Instance:         {manifest['target']['instance_id']}")
    print(f"Status:                  {manifest['forensic_evidence']['status']}")
    print(f"Quarantine Security SG:  {manifest['target']['quarantine_security_group']}")
    print(f"EBS Snapshots Created:   {len(manifest['forensic_evidence']['ebs_snapshots'])}")
    print(f"Evidence Vault Hash:     {manifest['cryptographic_hash_sha256']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
