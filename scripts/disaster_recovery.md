# Academia ERP — Production Disaster Recovery & Firestore Restore Runbook

---

## 1. Overview
This document defines the disaster recovery procedures for the Academia ERP system. Google Cloud Firestore Managed Exports are stored in a dedicated Google Cloud Storage bucket with automated daily snapshots at 02:00 AM IST and 30-day lifecycle retention.

---

## 2. Canonical Collections Included in Backups
1. `students`
2. `profiles`
3. `subject_allocations`
4. `attendance`
5. `attendance_history`
6. `internal_marks`
7. `leave_requests`
8. `faculty_leaves`
9. `assignments`
10. `assignment_submissions`
11. `notes`
12. `placement_drives`
13. `placement_applications`
14. `placement_companies`
15. `notifications`
16. `audit_logs`

---

## 3. Storage Architecture & Directory Structure
- **Bucket**: `gs://${PROJECT_ID}-firestore-backups`
- **Path Pattern**: `gs://${PROJECT_ID}-firestore-backups/firestore-backups/YYYY/MM/DD/backup-[TIMESTAMP]/`
- **Retention**: 30 Days (Managed by GCS Lifecycle Policy)

---

## 4. Recovery Scenarios & Playbooks

### Scenario A: Accidental Student / Faculty Deletion
- **Primary Mechanism**: Soft-delete recovery.
- **Action**: Locate the document in `students` or `profiles` and update `status: 'active'`.

### Scenario B: Incorrect Attendance Modification
- **Primary Mechanism**: Audit trail rollback.
- **Action**: Query `attendance_history` by `studentId`, `date`, and `period` to retrieve the `oldStatus`, `reason`, and `editedBy`. Revert the `status` field in `attendance`.

### Scenario C: Corrupted Marks or Tampered Internal Assessment
- **Primary Mechanism**: `audit_logs` inspection.
- **Action**: Locate the mutation log under `module: 'marks'` or `module: 'internal_marks'`, extract the `oldData` payload, and restore the values via `internal_marks`.

### Scenario D: Catastrophic Data Loss or Large-Scale Database Corruption
- **Primary Mechanism**: Google Cloud Firestore Managed Import.
- **Prerequisites**:
  1. Google Cloud SDK (`gcloud`) installed and authenticated with `roles/datastore.importExportAdmin` and `roles/storage.admin`.
  2. The target backup URI from `backup_logs` or Cloud Storage bucket.

#### Step 1: List Available Backups
```bash
gsutil ls -r gs://college-erp-system-df02d-firestore-backups/firestore-backups/
```

#### Step 2: Validate Backup Integrity (Dry-Run / Non-Production Target)
> **CRITICAL**: Never restore directly into production without verifying in a staging/test environment first.

```bash
# Set project to Staging / Validation Project
gcloud config set project college-erp-staging

# Execute Import to Staging Database
gcloud firestore import gs://college-erp-system-df02d-firestore-backups/firestore-backups/2026/08/20/backup-2026-08-20T02-00-00/
```

#### Step 3: Production Import (Requires CIO / Super-Admin Authorization)
```bash
gcloud config set project college-erp-system-df02d

# Import all canonical collections
gcloud firestore import gs://college-erp-system-df02d-firestore-backups/firestore-backups/2026/08/20/backup-2026-08-20T02-00-00/ \
  --collection-ids=students,profiles,subject_allocations,attendance,attendance_history,internal_marks,leave_requests,faculty_leaves,assignments,assignment_submissions,notes,placement_drives,placement_applications,placement_companies,notifications,audit_logs
```

---

## 5. Security & Access Control
- Cloud Storage backup bucket access is strictly restricted to the GCP service account executing Cloud Functions.
- Public read access is blocked at the bucket level (`Uniform Bucket-Level Access` enabled).
- No service account private keys or export URLs are exposed in frontend client code.
