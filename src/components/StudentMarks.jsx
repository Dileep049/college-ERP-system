import React, { useState, useEffect } from 'react';
import { db, isFirebaseConfigured, mockDB } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

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
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">My Internal Marks Ledger (Read-Only)</h3>
          <p className="text-xs text-slate-400">Mid 1 (20) + Mid 2 (20) + Assignments (10) = Total (50 Marks)</p>
        </div>
        {activeStudent?.rollNumber && (
          <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
            Roll No: {activeStudent.rollNumber}
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center animate-pulse text-slate-400 font-bold">Loading internal marks ledger...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3 text-center">Mid 1 (20)</th>
                <th className="px-5 py-3 text-center">Mid 2 (20)</th>
                <th className="px-5 py-3 text-center">Assignments (10)</th>
                <th className="px-5 py-3 text-center">Total (50)</th>
                <th className="px-5 py-3 text-right">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {marksData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 italic font-medium">
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
                  let statusClass = 'bg-emerald-500/10 text-emerald-600';
                  if (pct < 50) {
                    statusLabel = 'Needs Improvement';
                    statusClass = 'bg-rose-500/10 text-rose-500';
                  } else if (pct < 70) {
                    statusLabel = 'Satisfactory';
                    statusClass = 'bg-amber-500/10 text-amber-500';
                  }

                  return (
                    <tr key={mark.id || mark.docId || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-4 font-black text-slate-900 dark:text-white">
                        {mark.subject || 'General'}
                        {mark.status && (
                          <span className="block text-[9px] font-extrabold text-slate-400 uppercase mt-0.5">
                            Status: {mark.status}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-700 dark:text-slate-300">{m1}</td>
                      <td className="px-5 py-4 text-center text-slate-700 dark:text-slate-300">{m2}</td>
                      <td className="px-5 py-4 text-center text-slate-700 dark:text-slate-300">{ass}</td>
                      <td className="px-5 py-4 text-center font-black text-blue-600 dark:text-blue-400">{total} / 50</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`px-3 py-1 rounded-xl text-[9.5px] uppercase font-extrabold ${statusClass}`}>
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
