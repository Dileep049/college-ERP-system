const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * Triggered on writing attendance. If student is marked absent in period 3,
 * checks if they were absent in period 2 of today. If so, triggers parent notification.
 */
exports.onAttendanceMarked = functions.firestore
  .document('attendance/{attendanceId}')
  .onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    if (!data) return null;

    // We only trigger checks for Period 3 absence
    if (data.status === 'absent' && Number(data.period) === 3) {
      const studentId = data.studentId;
      const date = data.date;
      const branch = data.branch;
      const semester = data.semester;
      const section = data.section;

      // Check if student has approved leave for today
      const leavesSnap = await db.collection('leave_requests')
        .where('studentId', '==', studentId)
        .where('status', '==', 'approved')
        .get();

      const leaves = leavesSnap.docs.map(doc => doc.data());
      const hasApprovedLeave = leaves.some(l => date >= l.startDate && date <= l.endDate);
      if (hasApprovedLeave) {
        console.log(`Skipping continuous absence alert for ${data.studentName} due to approved leave.`);
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

          // Fetch student detailed profile for parent contacts
          const studentProfileSnap = await db.collection('profiles').doc(studentId).get();
          if (studentProfileSnap.exists) {
            const studentProfile = studentProfileSnap.data();
            const parentMobile = studentProfile.parentMobile;
            const parentEmail = studentProfile.parentEmail;
            const parentName = studentProfile.parentName;

            if (parentMobile) {
              const notificationMsg = `Dear Parent, Your child ${data.studentName} was absent from today's classes (Period 2 & 3). Please contact the college if this absence was not planned. Regards, KBN Degree College`;
              
              // Find parent user ID to link notification in portal
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
              console.log(`Continuous absence parent notification saved for parent ID: ${parentUid}`);

              // Trigger FCM push notification to parent devices if tokens exist
              if (!parentUserSnap.empty) {
                const parentTokensSnap = await db.collection('fcm_tokens').doc(parentUid).get();
                if (parentTokensSnap.exists) {
                  const tokens = parentTokensSnap.data().tokens || [];
                  if (tokens.length > 0) {
                    const message = {
                      notification: {
                        title: 'Continuous Absence Notification',
                        body: notificationMsg
                      },
                      tokens: tokens
                    };
                    const response = await admin.messaging().sendMulticast(message);
                    console.log(`FCM Multicast response: ${response.successCount} messages sent successfully.`);
                  }
                }
              }
            }
          }
        }
      }
    }
    return null;
  });
