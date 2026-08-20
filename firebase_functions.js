const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firestore = require('@google-cloud/firestore');

admin.initializeApp();
const db = admin.firestore();

// ------------------------------------------------------------------
// 1. ATTENDANCE EVENT: CONTINUOUS ABSENCE CHECK & PARENT ALERT
// ------------------------------------------------------------------
exports.onAttendanceMarked = functions.firestore
  .document('attendance/{attendanceId}')
  .onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    if (!data) return null;

    // Check for Period 3 absence
    if (data.status === 'absent' && Number(data.period) === 3) {
      const studentId = data.studentId;
      const date = data.date;

      // Check if student has approved leave
      const leavesSnap = await db.collection('leave_requests')
        .where('studentId', '==', studentId)
        .where('status', '==', 'approved')
        .get();

      const leaves = leavesSnap.docs.map(doc => doc.data());
      const hasApprovedLeave = leaves.some(l => date >= l.startDate && date <= l.endDate);
      if (hasApprovedLeave) {
        console.log(`Skipping absence alert for ${data.studentName} due to approved leave.`);
        return null;
      }

      // Query for Period 2 absence
      const p2Snap = await db.collection('attendance')
        .where('studentId', '==', studentId)
        .where('date', '==', date)
        .where('period', '==', 2)
        .get();

      if (!p2Snap.empty) {
        const p2Data = p2Snap.docs[0].data();
        if (p2Data.status === 'absent') {
          console.log(`Continuous absence detected for student ${studentId} (Period 2 & 3).`);

          const studentProfileSnap = await db.collection('profiles').doc(studentId).get();
          if (studentProfileSnap.exists) {
            const studentProfile = studentProfileSnap.data();
            const parentMobile = studentProfile.parentMobile;
            const parentEmail = studentProfile.parentEmail;

            if (parentMobile) {
              const notificationMsg = `Dear Parent, Your child ${data.studentName} was absent from today's classes (Period 2 & 3). Please contact the college if this absence was not planned. Regards, KBN Degree College`;
              
              const parentUserSnap = await db.collection('profiles')
                .where('role', '==', 'parent')
                .where('childRollNumber', '==', studentProfile.rollNumber)
                .limit(1)
                .get();

              const parentUid = !parentUserSnap.empty ? parentUserSnap.docs[0].id : 'parent-fallback';

              const notificationPayload = {
                recipientUid: parentUid,
                recipientMobile: parentMobile,
                recipientEmail: parentEmail || '',
                studentName: data.studentName,
                title: 'Continuous Absence Notification',
                message: notificationMsg,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent'
              };

              await db.collection('notifications').add(notificationPayload);
            }
          }
        }
      }
    }
    return null;
  });

// ------------------------------------------------------------------
// 2. PRODUCTION FIRESTORE MANAGED EXPORT & BACKUP (DAILY AT 2:00 AM)
// ------------------------------------------------------------------

const CANONICAL_COLLECTIONS = [
  'students',
  'profiles',
  'subject_allocations',
  'attendance',
  'attendance_history',
  'internal_marks',
  'leave_requests',
  'faculty_leaves',
  'assignments',
  'assignment_submissions',
  'notes',
  'placement_drives',
  'placement_applications',
  'placement_companies',
  'notifications',
  'audit_logs'
];

/**
 * Executes Firestore Managed Export to Cloud Storage
 */
async function performFirestoreExport(triggeredBy = 'cloud_scheduler') {
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'college-erp-system-df02d';
  const bucketName = process.env.FIRESTORE_BACKUP_BUCKET || `${projectId}-firestore-backups`;
  
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  
  const exportPath = `gs://${bucketName}/firestore-backups/${year}/${month}/${day}/backup-${timestamp}`;
  const backupId = `backup-${Date.now()}`;

  const backupLogRef = db.collection('backup_logs').doc(backupId);

  // 1. Record Initial 'started' state
  await backupLogRef.set({
    backupId,
    startedAt: now.toISOString(),
    completedAt: null,
    status: 'started',
    exportPath,
    collections: CANONICAL_COLLECTIONS,
    triggeredBy,
    error: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  try {
    const client = new firestore.v1.FirestoreAdminClient();
    const databaseName = client.databasePath(projectId, '(default)');

    console.log(`[Backup] Initiating Firestore export to ${exportPath}...`);

    const [response] = await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: exportPath,
      collectionIds: CANONICAL_COLLECTIONS
    });

    console.log(`[Backup] Export operation submitted. Operation name: ${response.name}`);

    // 2. Mark completed
    await backupLogRef.update({
      completedAt: new Date().toISOString(),
      status: 'completed',
      operationName: response.name,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, backupId, exportPath, operationName: response.name };
  } catch (err) {
    console.error('[Backup Error]: Firestore managed export failed:', err);

    // 3. Mark failed and alert admin
    await backupLogRef.update({
      completedAt: new Date().toISOString(),
      status: 'failed',
      error: err.message || 'Firestore managed export failure',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create failure notification
    await db.collection('notifications').add({
      userId: 'admin',
      title: 'Automated Firestore Backup Failed',
      message: `Daily automated backup failed: ${err.message}`,
      type: 'error',
      read: false,
      createdAt: new Date().toISOString()
    });

    throw err;
  }
}

// Scheduled Daily Backup at 2:00 AM
exports.scheduledFirestoreBackup = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('[Scheduler] Running daily scheduled Firestore backup at 02:00 AM...');
    return await performFirestoreExport('cloud_scheduler');
  });

// HTTPS Callable for Admin Manual Trigger
exports.triggerManualBackup = functions.https.onCall(async (data, context) => {
  // Ensure requester is authenticated Admin / Principal
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to trigger backups.');
  }

  const callerProfile = await db.collection('profiles').doc(context.auth.uid).get();
  const role = callerProfile.exists ? callerProfile.data().role : '';
  if (role !== 'admin' && role !== 'principal') {
    throw new functions.https.HttpsError('permission-denied', 'Only System Administrator or Principal can trigger database backups.');
  }

  const triggeredBy = callerProfile.data().fullName || callerProfile.data().name || context.auth.uid;
  return await performFirestoreExport(triggeredBy);
});
