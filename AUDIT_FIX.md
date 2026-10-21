# DevSecOps Remediation Report: Gitleaks CI Resolution

**Branch**: `fix/gitleaks-ci`  
**Date**: 2026-10-21  
**Status**: Ready for Review & Approval  

---

## 1. Executive Summary

The GitHub Actions CI pipeline previously failed in the `secret-scan` job (`Gitleaks Secret Scan`) due to historical placeholder/rotated credentials detected by rule `aws-access-token`. 

All findings have been safely and cleanly resolved:
1. **Working Tree Sanitization**: Both `.env.example` and `README.md` have been updated so that template and catalog examples use non-matching bracketed placeholders (`<YOUR_AWS_ACCESS_KEY_ID>` and `<YOUR_AWS_SECRET_ACCESS_KEY>`). Full key-shaped strings have been completely eradicated from the working tree.
2. **Whole Repository Scan**: Comprehensive audit of the working tree confirmed 0 secret-like strings, 0 ASIA tokens, 0 private key headers, and 0 active credentials.
3. **Targeted Allowlist Configuration (`.gitleaks.toml`)**: Created repo-root `.gitleaks.toml` that extends the default ruleset (`useDefault = true`) and adds a narrow allowlist strictly for the exact template placeholders `<YOUR_AWS_ACCESS_KEY_ID>` and `<YOUR_AWS_SECRET_ACCESS_KEY>`. No files or directories were allowlisted.
4. **Historical Ignore List (`.gitleaksignore`)**: Authored `.gitleaksignore` with precise SHA-based fingerprints targeting exclusively the two historical occurrences in commits `e9c8339` and `312126f`, documenting their inactive/placeholder status.
5. **CI Pipeline Modernization (`.github/workflows/ci.yml`)**:
   - Pinned runner to `ubuntu-24.04`.
   - Bumped `actions/checkout`, `actions/setup-python`, and `actions/setup-node` to major version `v7`, verified to run natively on Node 24.
   - Pinned `actions/checkout` with `fetch-depth: 0` for complete commit history analysis.
   - Explicitly configured `GITLEAKS_CONFIG: .gitleaks.toml`.
6. **Local Verification**: Installed Gitleaks v8.30.1 and executed `gitleaks detect --redact --config .gitleaks.toml --log-opts="--all"`, confirming **0 leaks found across all 21 repository commits**. Backend syntax validation (`python -m compileall`) and frontend compilation (`npm run build`) both pass with zero errors.

---

## 2. Findings & Historical Commit Analysis

| Finding # | Rule ID | Commit SHA (Full) | File & Line | Status / Description |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `aws-access-token` | `e9c8339932d539fb29c67ba1dffe825f571bca6a` | `.env.example:9` | Inactive documentation template placeholder (`AKIA****`). Ignored via fingerprint in `.gitleaksignore`. |
| **2** | `aws-access-token` | `312126fa2834dc1cf3fd04de98e2d849fe52bba0` | `README.md:263` | Inactive documentation catalog placeholder (`AKIA****`). Ignored via fingerprint in `.gitleaksignore`. |

---

## 3. Configuration Details

### A. Repository Gitleaks Config (`.gitleaks.toml`)
```toml
title = "AuraGuard Gitleaks Configuration"

[extend]
useDefault = true

[allowlist]
description = "Allowlist exact safe placeholder values used in .env.example"
stopwords = [
    "<YOUR_AWS_ACCESS_KEY_ID>",
    "<YOUR_AWS_SECRET_ACCESS_KEY>",
]
regexes = [
    '''<YOUR_AWS_ACCESS_KEY_ID>''',
    '''<YOUR_AWS_SECRET_ACCESS_KEY>''',
]
```

### B. Historical Commit Ignore Rules (`.gitleaksignore`)
```text
# Gitleaks ignore list for historical commits with confirmed inactive/placeholder credentials
# Format: <commit-sha>:<file>:<rule-id>:<line>

# Historical finding in .env.example: non-functional documentation placeholder key (inactive)
e9c8339932d539fb29c67ba1dffe825f571bca6a:.env.example:aws-access-token:9

# Historical finding in README.md: documentation catalog example placeholder (inactive/rotated)
312126fa2834dc1cf3fd04de98e2d849fe52bba0:README.md:aws-access-token:263
```

---

## 4. Verification & Validation Evidence

### Local Gitleaks Full History Detection
```text
Command: gitleaks detect --redact --config .gitleaks.toml --log-opts="--all" --verbose
Status: Exit Code 0 (Success)
21 commits scanned.
scanned ~373466 bytes (373.47 KB) in 365ms
no leaks found
```

### Backend Syntax Validation
```text
Command: python -m compileall lambda/ scripts/ server/
Status: Exit Code 0 (Success)
Listing 'lambda/'...
Compiling 'lambda/isolate_instance.py'...
Listing 'scripts/'...
Compiling 'scripts/run_demo.py'...
Compiling 'scripts/verify_manifest.py'...
Listing 'server/'...
```

### Frontend TypeScript & Vite Build
```text
Command: npm run build
Status: Exit Code 0 (Success)
✓ 2531 modules transformed.
dist/index.html   1.11 kB
dist/assets/...   built in 26.77s
```

---

## 5. Full Git Diff (Sanitized)

```diff
diff --git a/.env.example b/.env.example
index d5457af..a37868b 100644
--- a/.env.example
+++ b/.env.example
@@ -6,8 +6,8 @@
 
 # 1. AWS Credentials & Regional Target (Required for Live AWS Mode)
 AWS_REGION=ap-south-1
-AWS_ACCESS_KEY_ID=AKIA****
-AWS_SECRET_ACCESS_KEY=exampleSecretKeyDoNotCommitToGit12345
+AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
+AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
 # AWS_SESSION_TOKEN=  # Optional: required if using temporary STS/SSO credentials
 
 # 2. Network Infrastructure (Foundational VPC & Target Subnet)
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index c8db9ba..125a091 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -2,17 +2,17 @@ name: AuraGuard CI Pipeline
 
 on:
   push:
-    branches: [ main, "audit/**" ]
+    branches: [ main, "audit/**", "fix/**" ]
   pull_request:
     branches: [ main ]
 
 jobs:
   secret-scan:
     name: Gitleaks Secret Scan
-    runs-on: ubuntu-latest
+    runs-on: ubuntu-24.04
     steps:
       - name: Checkout Code
-        uses: actions/checkout@v4
+        uses: actions/checkout@v7
         with:
           fetch-depth: 0
 
@@ -20,16 +20,17 @@ jobs:
         uses: gitleaks/gitleaks-action@v2
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+          GITLEAKS_CONFIG: .gitleaks.toml
 
   backend-audit:
     name: Python Lint & Dependencies Audit
-    runs-on: ubuntu-latest
+    runs-on: ubuntu-24.04
     steps:
       - name: Checkout Code
-        uses: actions/checkout@v4
+        uses: actions/checkout@v7
 
       - name: Set up Python
-        uses: actions/setup-python@v5
+        uses: actions/setup-python@v7
         with:
           python-version: "3.11"
           cache: "pip"
@@ -45,13 +46,13 @@ jobs:
 
   frontend-build:
     name: React Frontend Build & Typecheck
-    runs-on: ubuntu-latest
+    runs-on: ubuntu-24.04
     steps:
       - name: Checkout Code
-        uses: actions/checkout@v4
+        uses: actions/checkout@v7
 
       - name: Set up Node.js
-        uses: actions/setup-node@v4
+        uses: actions/setup-node@v7
         with:
           node-version: 20
           cache: "npm"
@@ -61,3 +62,4 @@ jobs:
 
       - name: TypeScript Check & Vite Build
         run: npm run build
+
diff --git a/README.md b/README.md
index 9e877e6..6ca6ac9 100644
--- a/README.md
+++ b/README.md
@@ -123,8 +123,8 @@ cp .env.example .env
 Edit `.env`:
 ```env
 AWS_REGION=ap-south-1
-AWS_ACCESS_KEY_ID=AKIA****
-AWS_SECRET_ACCESS_KEY=your_secret_access_key
+AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
+AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
 VPC_ID=vpc-xxxxxxxxxxxxxxxxx
 SUBNET_ID=subnet-xxxxxxxxxxxxxxxxx
 TARGET_INSTANCE_ID=i-xxxxxxxxxxxxxxxxx
@@ -260,8 +260,8 @@ Refer to [`.env.example`](.env.example) for the full configuration template:
 | Variable | Scope | Description | Default / Example |
 | :--- | :--- | :--- | :--- |
 | `AWS_REGION` | Server & Scripts | Target AWS region | `ap-south-1` |
-| `AWS_ACCESS_KEY_ID` | Server & Scripts | IAM Access Key ID | `AKIA****` |
-| `AWS_SECRET_ACCESS_KEY` | Server & Scripts | IAM Secret Access Key | *(Masked)* |
+| `AWS_ACCESS_KEY_ID` | Server & Scripts | IAM Access Key ID | `<YOUR_AWS_ACCESS_KEY_ID>` |
+| `AWS_SECRET_ACCESS_KEY` | Server & Scripts | IAM Secret Access Key | `<YOUR_AWS_SECRET_ACCESS_KEY>` |
 | `VPC_ID` | Server & Scripts | Target VPC identifier | `vpc-0xxxxxxxxxxxxxxxxx` |
 | `SUBNET_ID` | Server & Scripts | Target Subnet identifier | `subnet-0xxxxxxxxxxxxxxxxx` |
 | `TARGET_INSTANCE_ID` | Server & Scripts | Protected EC2 Instance ID | `i-0xxxxxxxxxxxxxxxxx` |
```
