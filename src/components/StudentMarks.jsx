import React, { useState, useEffect } from 'react';
import { db, isFirebaseConfigured, mockDB } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Award, FileText } from 'lucide-react';

export const StudentMarks = ({ student, currentUser, isParent }) => {
  const activeStudent = student || currentUser || {};
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const studentUid = activeStudent?.uid || activeStudent?.id || activeStudent?.studentId || '';
    const studentRoll = activeStudent?.rollNumber || activeStudent?.studentRollNumber || activeStudent?.studentId || '';

    let unsubInternal = () => {};
    let unsubMarks = () => {};

    if (isFirebaseConfigured && db) {
      try {
        // Real-time snapshot listener on `internal_marks`
        const qInternal = query(collection(db, 'internal_marks'));
        unsubInternal = onSnapshot(qInternal, (snap) => {
          const list = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(m => {
              const uidMatch = studentUid && (m.studentId === studentUid || m.studentUid === studentUid || m.uid === studentUid);
              const rollMatch = studentRoll && (m.rollNumber === studentRoll || m.studentRollNumber === studentRoll || m.studentId === studentRoll);
              return uidMatch || rollMatch;
            });

          setMarksData(prev => {
            const combinedMap = new Map();
            [...prev, ...list].forEach(item => {
              const key = item.id || `${item.subject}_${item.studentId || item.rollNumber}`;
              combinedMap.set(key, item);
            });
            return Array.from(combinedMap.values());
          });
          setLoading(false);
        }, (err) => {
          console.error("Firestore onSnapshot error (internal_marks):", err);
          setLoading(false);
        });

        // Real-time snapshot listener on `marks`
        const qMarks = query(collection(db, 'marks'));
        unsubMarks = onSnapshot(qMarks, (snap) => {
          const list = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(m => {
              const uidMatch = studentUid && (m.studentId === studentUid || m.studentUid === studentUid || m.uid === studentUid);
              const rollMatch = studentRoll && (m.rollNumber === studentRoll || m.studentRollNumber === studentRoll || m.studentId === studentRoll);
              return uidMatch || rollMatch;
            });

          setMarksData(prev => {
            const combinedMap = new Map();
            [...prev, ...list].forEach(item => {
              const key = item.id || `${item.subject}_${item.studentId || item.rollNumber}`;
              combinedMap.set(key, item);
            });
            return Array.from(combinedMap.values());
          });
          setLoading(false);
        }, (err) => {
          console.error("Firestore onSnapshot error (marks):", err);
          setLoading(false);
        });
      } catch (err) {
        console.error("Error setting up real-time listener for marks:", err);
        setLoading(false);
      }
    }

    // Local Storage Mock fallback load
    const loadMockMarks = async () => {
      try {
        const localList = JSON.parse(localStorage.getItem('acad_internal_marks') || '[]')
          .filter(m => {
            const uidMatch = studentUid && (m.studentId === studentUid || m.studentUid === studentUid);
            const rollMatch = studentRoll && (m.rollNumber === studentRoll || m.studentRollNumber === studentRoll);
            return uidMatch || rollMatch;
          });

        if (localList.length > 0) {
          setMarksData(prev => {
            const combinedMap = new Map();
            [...prev, ...localList].forEach(item => {
              const key = item.id || `${item.subject}_${item.studentId || item.rollNumber}`;
              combinedMap.set(key, item);
            });
            return Array.from(combinedMap.values());
          });
        }
      } catch (e) {
        console.error("Error reading local marks:", e);
      } finally {
        setLoading(false);
      }
    };

    loadMockMarks();

    return () => {
      unsubInternal();
      unsubMarks();
    };
  }, [activeStudent?.uid, activeStudent?.rollNumber]);

  return (
    <div className="card-3d p-6 space-y-6 text-xs font-semibold">
      <div className="border-b border-[var(--border-subtle)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Award size={20} />
          </div>
          <div>
            <h3 className="text-base font-black font-display text-[var(--text-primary)]">My Internal Marks Ledger</h3>
            <p className="text-xs text-[var(--text-muted)]">Mid 1 (20) + Mid 2 (20) + Assignments (10) = Total (50 Marks)</p>
          </div>
        </div>
        {activeStudent?.rollNumber && (
          <span className="badge-3d badge-3d-info shrink-0">
            Roll No: {activeStudent.rollNumber}
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center animate-pulse text-[var(--text-muted)] font-bold">Loading internal marks ledger...</div>
      ) : (
        <div className="table-3d-container">
          <table className="table-3d">
            <thead>
              <tr>
                <th>Subject</th>
                <th className="text-center">Mid 1 (20)</th>
                <th className="text-center">Mid 2 (20)</th>
                <th className="text-center">Assignments (10)</th>
                <th className="text-center">Total (50)</th>
                <th className="text-right">Performance Status</th>
              </tr>
            </thead>
            <tbody>
              {marksData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[var(--text-muted)] italic font-medium">
                    No internal marks published yet.
                  </td>
                </tr>
              ) : (
                marksData.map((mark, index) => {
                  const m1 = mark.mid1 || 0;
                  const m2 = mark.mid2 || 0;
                  const ass = mark.assignments || 0;
                  const total = mark.total !== undefined ? mark.total : (m1 + m2 + ass);
                  const pct = (total / 50) * 100;

                  let statusLabel = 'Excellent';
                  let statusBadgeClass = 'badge-3d badge-3d-success';
                  if (pct < 50) {
                    statusLabel = 'Needs Improvement';
                    statusBadgeClass = 'badge-3d badge-3d-danger';
                  } else if (pct < 70) {
                    statusLabel = 'Satisfactory';
                    statusBadgeClass = 'badge-3d badge-3d-warning';
                  }

                  return (
                    <tr key={mark.id || mark.docId || index}>
                      <td className="font-bold text-[var(--text-primary)]">
                        {mark.subject || 'General'}
                        {mark.status && (
                          <span className="block text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">
                            Status: {mark.status}
                          </span>
                        )}
                      </td>
                      <td className="text-center text-[var(--text-secondary)] font-mono">{m1}</td>
                      <td className="text-center text-[var(--text-secondary)] font-mono">{m2}</td>
                      <td className="text-center text-[var(--text-secondary)] font-mono">{ass}</td>
                      <td className="text-center font-black text-[var(--accent)] font-mono">{total} / 50</td>
                      <td className="text-right">
                        <span className={statusBadgeClass}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentMarks;
