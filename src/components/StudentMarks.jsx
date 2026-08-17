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
    <div className="bg-transparent min-h-screen text-white space-y-6 font-sans">
      {/* Standardized Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-white/20">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white drop-shadow">My Internal Marks Ledger</h2>
            <p className="text-xs text-blue-200 mt-0.5">Continuous Internal Assessment: Mid 1 (20) + Mid 2 (20) + Assignments (10) = Total (50 Marks)</p>
          </div>
        </div>
        {activeStudent?.rollNumber && (
          <span className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-2xl font-black text-xs shadow-md self-start sm:self-auto">
            Roll No: {activeStudent.rollNumber}
          </span>
        )}
      </div>

      {/* Internal Marks Data Table Card */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <FileText size={16} className="text-cyan-400" />
            Subject Internal Performance Breakdown
          </h3>
          <span className="text-[11px] text-white/60 font-semibold">
            {marksData.length} Subjects Evaluated
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center animate-pulse text-white/50 font-bold">Loading internal marks ledger...</div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/60 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-3 py-3 text-center">Mid 1 (20)</th>
                  <th className="px-3 py-3 text-center">Mid 2 (20)</th>
                  <th className="px-3 py-3 text-center">Assignments (10)</th>
                  <th className="px-3 py-3 text-center">Total (50)</th>
                  <th className="px-4 py-3 text-right">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold">
                {marksData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-white/50 italic font-medium">
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
                    let statusBadgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                    if (pct < 50) {
                      statusLabel = 'Needs Improvement';
                      statusBadgeClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
                    } else if (pct < 70) {
                      statusLabel = 'Satisfactory';
                      statusBadgeClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                    }

                    return (
                      <tr key={mark.id || mark.docId || index} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-white">
                          {mark.subject || 'General'}
                          {mark.status && (
                            <span className="block text-[9px] font-bold text-cyan-300 uppercase mt-0.5">
                              Status: {mark.status}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-center text-white/80 font-mono">{m1}</td>
                        <td className="px-3 py-3.5 text-center text-white/80 font-mono">{m2}</td>
                        <td className="px-3 py-3.5 text-center text-white/80 font-mono">{ass}</td>
                        <td className="px-3 py-3.5 text-center font-black text-cyan-300 font-mono text-sm">{total} / 50</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase inline-block ${statusBadgeClass}`}>
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
    </div>
  );
};

export default StudentMarks;
