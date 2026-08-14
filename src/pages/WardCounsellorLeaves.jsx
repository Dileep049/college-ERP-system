import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured, mockDB } from '../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  X,
  AlertTriangle,
  FileText,
  Building2,
  BookOpen,
  Award
} from 'lucide-react';

// Normalization Helpers
const normBranch = (str) => {
  if (!str) return '';
  const s = String(str).toUpperCase().trim();
  if (s.includes('AI') || s.includes('ARTIFICIAL') || s.includes('MACHINE LEARNING')) return 'AI & ML';
  if (s.includes('COMPUTER') || s.includes('CSE') || s.includes('CS')) return 'CSE';
  if (s.includes('ECE') || s.includes('ELECTRONIC')) return 'ECE';
  if (s.includes('EEE') || s.includes('ELECTRICAL')) return 'EEE';
  if (s.includes('CIVIL')) return 'CIVIL';
  if (s.includes('MECH')) return 'MECHANICAL';
  return s;
};

const normSem = (str) => {
  if (!str) return '';
  const s = String(str).toUpperCase().trim();
  const digitMatch = s.match(/\d+/);
  if (digitMatch) return digitMatch[0];
  if (s.includes('VIII') || s === '8') return '8';
  if (s.includes('VII') || s === '7') return '7';
  if (s.includes('VI') || s === '6') return '6';
  if (s.includes('V') || s === '5') return '5';
  if (s.includes('IV') || s === '4') return '4';
  if (s.includes('III') || s === '3') return '3';
  if (s.includes('II') || s === '2') return '2';
  if (s.includes('I') || s === '1') return '1';
  return s;
};

const normSec = (str) => {
  if (!str) return '';
  const s = String(str).toUpperCase().trim();
  const clean = s.replace(/SECTION/g, '').replace(/SEC/g, '').trim();
  return clean || s;
};

const isScopeMatch = (itemBranch, itemSem, itemSec, scopeBranch, scopeSem, scopeSec) => {
  if (scopeBranch && scopeBranch !== 'All' && scopeBranch !== 'N/A') {
    const b1 = normBranch(itemBranch);
    const b2 = normBranch(scopeBranch);
    if (b1 && b2 && b1 !== b2 && !b1.includes(b2) && !b2.includes(b1)) return false;
  }
  if (scopeSem && scopeSem !== 'All' && scopeSem !== 'N/A' && itemSem) {
    const s1 = normSem(itemSem);
    const s2 = normSem(scopeSem);
    if (s1 && s2 && s1 !== s2) return false;
  }
  if (scopeSec && scopeSec !== 'All' && scopeSec !== 'N/A' && itemSec) {
    const sec1 = normSec(itemSec);
    const sec2 = normSec(scopeSec);
    if (sec1 && sec2 && sec1 !== sec2) return false;
  }
  return true;
};

export const WardCounsellorLeaves = ({ counsellor }) => {
  const { showToast } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [processedLeaves, setProcessedLeaves] = useState([]);
  const [studentMonthlyStats, setStudentMonthlyStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Resolved Scope
  const [scope, setScope] = useState({
    assignedBranch: counsellor?.assignedBranch || counsellor?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
    assignedSemester: counsellor?.assignedSemester || counsellor?.semester || 'Semester 2',
    assignedSection: counsellor?.assignedSection || counsellor?.section || 'Section A'
  });

  // Rejection Modal
  const [rejectionModalLeave, setRejectionModalLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // 1. REAL-TIME DATA FETCHING (onSnapshot) & SCOPE RESOLUTION
  useEffect(() => {
    if (!counsellor) return;

    let currentBranch = counsellor?.assignedBranch || counsellor?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
    let currentSem = counsellor?.assignedSemester || counsellor?.semester || 'Semester 2';
    let currentSec = counsellor?.assignedSection || counsellor?.section || 'Section A';

    setScope({
      assignedBranch: currentBranch,
      assignedSemester: currentSem,
      assignedSection: currentSec
    });

    let unsubscribes = [];

    if (isFirebaseConfigured && db) {
      setLoading(true);
      const collectionsToQuery = ['leaves', 'leave_requests', 'student_leaves'];
      const realTimeMap = {};

      collectionsToQuery.forEach(colName => {
        try {
          const colRef = collection(db, colName);
          const unsub = onSnapshot(colRef, (snapshot) => {
            snapshot.forEach(docSnap => {
              const d = docSnap.data();
              const id = docSnap.id;
              realTimeMap[id] = { id, leaveId: id, _col: colName, ...d };
            });
            processAllLeaves(Object.values(realTimeMap), currentBranch, currentSem, currentSec);
            setLoading(false);
          }, (err) => {
            console.error(`[onSnapshot Error] ${colName}:`, err);
            setLoading(false);
          });
          unsubscribes.push(unsub);
        } catch (e) {
          console.error(`Error setting up onSnapshot for ${colName}:`, e);
        }
      });
    } else {
      fetchOfflineScopeAndLeaves(currentBranch, currentSem, currentSec);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [counsellor]);

  // Offline / Manual Refresh Fetch
  const fetchOfflineScopeAndLeaves = async (currentBranch, currentSem, currentSec) => {
    try {
      setLoading(true);
      let rawList = [];
      const seenIds = new Set();

      try {
        const mockRes = await mockDB.getLeaves('counsellor', counsellor?.uid || 'counsellor', {
          assignedDepartment: currentBranch,
          assignedSemester: currentSem,
          assignedSection: currentSec
        });
        mockRes.forEach(l => {
          const id = l.id || l.leaveId;
          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            rawList.push(l);
          }
        });
      } catch (_) {}

      processAllLeaves(rawList, currentBranch, currentSem, currentSec);
    } catch (err) {
      console.error("Error fetching offline leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScopeAndLeaves = () => {
    fetchOfflineScopeAndLeaves(scope.assignedBranch, scope.assignedSemester, scope.assignedSection);
  };

  // Helper to process, scope-filter, and separate Pending vs Processed Leaves
  const processAllLeaves = (rawList, currentBranch, currentSem, currentSec) => {
    const listCopy = [...rawList];
    const seenIds = new Set(listCopy.map(l => l.id || l.leaveId));

    // Merge Local Storage fallback items
    ['acad_student_leaves', 'acad_leave_requests'].forEach(key => {
      try {
        const localItems = JSON.parse(localStorage.getItem(key) || '[]');
        localItems.forEach(item => {
          const id = item.id || item.leaveId;
          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            listCopy.push(item);
          }
        });
      } catch (_) {}
    });

    // Filter by Counsellor Academic Scope
    const scopedLeaves = listCopy.filter(item => {
      const itemBranch = item.branch || item.department || '';
      const itemSem = item.semester || '';
      const itemSec = item.section || '';
      return isScopeMatch(itemBranch, itemSem, itemSec, currentBranch, currentSem, currentSec);
    });

    // Calculate monthly stats per student
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const statsMap = {};

    scopedLeaves.forEach(l => {
      const studentKey = l.studentId || l.rollNumber || l.studentName;
      if (!studentKey) return;

      if (!statsMap[studentKey]) {
        statsMap[studentKey] = { monthlyApproved: 0, totalApproved: 0 };
      }

      if (l.status === 'Approved') {
        statsMap[studentKey].totalApproved += 1;
        const leaveDate = new Date(l.startDate || l.fromDate || l.submittedAt || Date.now());
        if (leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear) {
          statsMap[studentKey].monthlyApproved += 1;
        }
      }
    });
    setStudentMonthlyStats(statsMap);

    // Rule 2: Separate into two distinct state arrays:
    // a) pendingLeaves: status === "Pending"
    // b) processedLeaves: status === "Approved" || status === "Rejected"
    const pending = scopedLeaves.filter(l => (l.status || 'Pending').toLowerCase() === 'pending');
    const processed = scopedLeaves.filter(l => (l.status || '').toLowerCase() === 'approved' || (l.status || '').toLowerCase() === 'rejected');

    const sortByDate = (a, b) => new Date(b.submittedAt || b.startDate || 0) - new Date(a.submittedAt || a.startDate || 0);
    pending.sort(sortByDate);
    processed.sort(sortByDate);

    setPendingLeaves(pending);
    setProcessedLeaves(processed);
  };

  // 2. FIRESTORE APPROVE LEAVE LOGIC (Rule 1 & 3)
  const handleApprove = async (leave) => {
    const leaveId = leave.id || leave.leaveId;
    const counsellorName = counsellor?.fullName || counsellor?.name || 'Ward Counsellor';

    try {
      setSubmittingAction(true);

      // Update Firestore using updateDoc
      if (isFirebaseConfigured && db && leaveId) {
        try {
          const colName = leave._col || 'leaves';
          const leaveRef = doc(db, colName, leaveId);
          await updateDoc(leaveRef, {
            status: 'Approved',
            actionBy: counsellorName,
            approvedBy: counsellorName,
            actionAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (fsErr) {
          console.warn("[Firestore] Col fallback updateDoc attempt:", fsErr);
          try {
            await updateDoc(doc(db, 'leaves', leaveId), {
              status: 'Approved',
              actionBy: counsellorName,
              approvedBy: counsellorName,
              actionAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (_) {}
        }
      }

      // Update Local Storage fallback
      ['acad_student_leaves', 'acad_leave_requests'].forEach(key => {
        try {
          const localItems = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = localItems.findIndex(item => (item.id || item.leaveId) === leaveId);
          if (idx !== -1) {
            localItems[idx].status = 'Approved';
            localItems[idx].actionBy = counsellorName;
            localStorage.setItem(key, JSON.stringify(localItems));
          }
        } catch (_) {}
      });

      // Update mockDB fallback
      try {
        await mockDB.reviewLeave(leaveId, 'Approved', 'Approved by Ward Counsellor', counsellor);
      } catch (_) {}

      // Instant optimistic UI update
      setPendingLeaves(prev => prev.filter(l => (l.id || l.leaveId) !== leaveId));
      setProcessedLeaves(prev => [
        { ...leave, status: 'Approved', actionBy: counsellorName, approvedBy: counsellorName, actionAt: new Date().toISOString() },
        ...prev
      ]);

      showToast?.(`Leave application for ${leave.studentName || 'Student'} approved successfully!`, 'success');
    } catch (err) {
      console.error("Error approving leave:", err);
      showToast?.('Could not approve leave application.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // 3. FIRESTORE REJECT LEAVE SUBMIT HANDLER (Rule 1 & 3)
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      showToast?.('Please state a reason for rejecting the leave.', 'warning');
      return;
    }

    const leave = rejectionModalLeave;
    const leaveId = leave.id || leave.leaveId;
    const counsellorName = counsellor?.fullName || counsellor?.name || 'Ward Counsellor';

    try {
      setSubmittingAction(true);

      // Update Firestore using updateDoc
      if (isFirebaseConfigured && db && leaveId) {
        try {
          const colName = leave._col || 'leaves';
          const leaveRef = doc(db, colName, leaveId);
          await updateDoc(leaveRef, {
            status: 'Rejected',
            rejectionReason: rejectionReason.trim(),
            actionBy: counsellorName,
            rejectedBy: counsellorName,
            actionAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (fsErr) {
          console.warn("[Firestore] Col fallback updateDoc attempt:", fsErr);
          try {
            await updateDoc(doc(db, 'leaves', leaveId), {
              status: 'Rejected',
              rejectionReason: rejectionReason.trim(),
              actionBy: counsellorName,
              rejectedBy: counsellorName,
              actionAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (_) {}
        }
      }

      // Update Local Storage fallback
      ['acad_student_leaves', 'acad_leave_requests'].forEach(key => {
        try {
          const localItems = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = localItems.findIndex(item => (item.id || item.leaveId) === leaveId);
          if (idx !== -1) {
            localItems[idx].status = 'Rejected';
            localItems[idx].rejectionReason = rejectionReason.trim();
            localItems[idx].actionBy = counsellorName;
            localStorage.setItem(key, JSON.stringify(localItems));
          }
        } catch (_) {}
      });

      // Update mockDB fallback
      try {
        await mockDB.reviewLeave(leaveId, 'Rejected', rejectionReason.trim(), counsellor);
      } catch (_) {}

      // Instant optimistic UI update
      setPendingLeaves(prev => prev.filter(l => (l.id || l.leaveId) !== leaveId));
      setProcessedLeaves(prev => [
        { ...leave, status: 'Rejected', rejectionReason: rejectionReason.trim(), actionBy: counsellorName, rejectedBy: counsellorName, actionAt: new Date().toISOString() },
        ...prev
      ]);

      showToast?.(`Leave application for ${leave.studentName || 'Student'} rejected.`, 'success');
      setRejectionModalLeave(null);
      setRejectionReason('');
    } catch (err) {
      console.error("Error rejecting leave:", err);
      showToast?.('Could not reject leave application.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filter Helper
  const filterBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(l =>
      (l.studentName || l.applicantName || '').toLowerCase().includes(q) ||
      (l.rollNumber || l.usn || '').toLowerCase().includes(q) ||
      (l.reason || '').toLowerCase().includes(q)
    );
  };

  const filteredPending = filterBySearch(pendingLeaves);
  const filteredProcessed = filterBySearch(processedLeaves);

  return (
    <div className="space-y-6 text-xs font-semibold p-2 md:p-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase mb-2 border border-purple-500/30">
            <Building2 size={13} />
            Scope: {scope.assignedBranch} • {scope.assignedSemester} • {scope.assignedSection}
          </div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Calendar className="text-purple-400" size={24} />
            Student Leave Management Desk
          </h1>
          <p className="text-xs text-purple-200/80 mt-1 font-medium">
            Review, approve, or reject student leaves for your assigned branch section.
          </p>
        </div>

        <button
          onClick={fetchScopeAndLeaves}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold flex items-center gap-2 transition-all border border-white/20"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Requests
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, roll number, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="text-slate-500 dark:text-slate-400 font-bold text-[11px] self-end sm:self-center">
          Pending: <strong className="text-amber-500">{pendingLeaves.length}</strong> | Processed: <strong className="text-emerald-500">{processedLeaves.length}</strong>
        </div>
      </div>

      {/* Section 1: PENDING LEAVE APPLICATIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="text-amber-500" size={18} />
            Pending Student Leave Requests ({filteredPending.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 animate-pulse font-bold">
            Fetching pending leave applications...
          </div>
        ) : filteredPending.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-bold">
            No pending leave requests found for {scope.assignedBranch} ({scope.assignedSemester}, {scope.assignedSection}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
                  <th className="px-4 py-3">Student Details</th>
                  <th className="px-4 py-3">Leave Interval</th>
                  <th className="px-4 py-3 text-center">Days</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-center">Monthly Leaves Taken</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
                {filteredPending.map(leave => {
                  const studentKey = leave.studentId || leave.rollNumber || leave.studentName;
                  const monthlyCount = studentMonthlyStats[studentKey]?.monthlyApproved || 0;

                  return (
                    <tr key={leave.id || leave.leaveId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-4">
                        <div className="font-black text-slate-900 dark:text-white text-xs">
                          {leave.studentName || leave.applicantName || 'Student'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          USN: {leave.rollNumber || leave.usn || 'N/A'} • {leave.section || scope.assignedSection}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-900 dark:text-white">
                        {leave.startDate || leave.fromDate || 'N/A'} to {leave.endDate || leave.toDate || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-[11px]">
                          {leave.totalDays || 1} Day(s)
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-normal max-w-xs truncate">
                        {leave.reason || 'No reason provided'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {/* MONTHLY LEAVE HISTORY INSIGHT BADGE */}
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black border ${
                          monthlyCount > 3
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : monthlyCount > 1
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        }`}>
                          <Award size={11} />
                          {monthlyCount} Taken This Month
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(leave)}
                            disabled={submittingAction}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1 shadow-sm transition-all"
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectionModalLeave(leave);
                              setRejectionReason('');
                            }}
                            disabled={submittingAction}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black flex items-center gap-1 shadow-sm transition-all"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: PROCESSED / HISTORY LEAVE APPLICATIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-purple-500" size={18} />
            Leave Approval History & Processed Records ({filteredProcessed.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 animate-pulse font-bold">
            Loading processed history...
          </div>
        ) : filteredProcessed.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-bold">
            No processed leave history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Remarks / Rejection Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
                {filteredProcessed.map(l => (
                  <tr key={l.id || l.leaveId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-4">
                      <div className="font-black text-slate-900 dark:text-white text-xs">
                        {l.studentName || l.applicantName || 'Student'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        USN: {l.rollNumber || l.usn || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-900 dark:text-white">
                      {l.startDate || l.fromDate || 'N/A'} to {l.endDate || l.toDate || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-normal">
                      {l.reason || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-xl text-[9.5px] font-black uppercase ${
                        l.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-[11px] text-slate-500 dark:text-slate-400 font-normal italic">
                      {l.status === 'Approved'
                        ? `Approved by: ${l.actionBy || l.approvedBy || counsellor?.fullName || 'Ward Counsellor'}`
                        : `Reason: ${l.rejectionReason || 'Not stated'} (${l.actionBy || l.rejectedBy || counsellor?.fullName || 'Ward Counsellor'})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectionModalLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <XCircle size={20} />
                  Reject Student Leave Application
                </h3>
                <p className="text-xs text-slate-400 font-bold">
                  Student: {rejectionModalLeave.studentName || rejectionModalLeave.applicantName}
                </p>
              </div>
              <button type="button" onClick={() => setRejectionModalLeave(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="State specific reason for rejecting leave (e.g., Low attendance percentage, Invalid supporting documents)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-gray-400 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectionModalLeave(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-500/20"
              >
                {submittingAction ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WardCounsellorLeaves;
