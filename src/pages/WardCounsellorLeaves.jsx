import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured, mockDB, isDepartmentMatch, normalizeSemester, normalizeSection } from '../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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
  Award,
  Layers
} from 'lucide-react';

// Helper for Robust Branch Matching
const isBranchMatch = (itemBranch, scopeBranch) => {
  if (!scopeBranch || scopeBranch === 'All' || scopeBranch === 'N/A') return true;
  if (!itemBranch) return true;
  return isDepartmentMatch(itemBranch, scopeBranch);
};

export const WardCounsellorLeaves = ({ counsellor }) => {
  const { showToast } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [allRawLeaves, setAllRawLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [processedLeaves, setProcessedLeaves] = useState([]);
  const [studentMonthlyStats, setStudentMonthlyStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('All');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('All');

  // Resolved Scope
  const [scope, setScope] = useState({
    assignedBranch: counsellor?.assignedBranch || counsellor?.assignedDepartment || counsellor?.wardCounsellorDepartment || counsellor?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
    assignedSemester: counsellor?.assignedSemester || counsellor?.semester || 'Semester 2',
    assignedSection: counsellor?.assignedSection || counsellor?.section || 'Section A'
  });

  // Rejection Modal
  const [rejectionModalLeave, setRejectionModalLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // 1. REAL-TIME DATA FETCHING (onSnapshot) & DYNAMIC SCOPE RESOLUTION
  useEffect(() => {
    if (!counsellor) return;

    let unsubscribes = [];

    const initScopeAndSubscription = async () => {
      let currentBranch = counsellor?.assignedBranch || counsellor?.assignedDepartment || counsellor?.wardCounsellorDepartment || counsellor?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
      let currentSem = counsellor?.assignedSemester || counsellor?.semester || 'All';
      let currentSec = counsellor?.assignedSection || counsellor?.section || 'All';

      try {
        const activeAssign = await mockDB.getFacultyWardAssignment(counsellor?.uid || counsellor?.id || counsellor?.email);
        if (activeAssign) {
          if (activeAssign.department) currentBranch = activeAssign.department;
          if (activeAssign.semester) currentSem = activeAssign.semester;
          if (activeAssign.section) currentSec = activeAssign.section;
        }
      } catch (e) {
        console.warn("Could not load dynamic ward assignment, using counsellor profile scope:", e);
      }

      setScope({
        assignedBranch: currentBranch,
        assignedSemester: currentSem,
        assignedSection: currentSec
      });

      if (isFirebaseConfigured && db) {
        setLoading(true);
        const collectionsToQuery = ['leave_requests', 'leaves', 'student_leaves'];
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
              const merged = Object.values(realTimeMap);
              setAllRawLeaves(merged);
              processAllLeaves(merged, currentBranch, selectedSemesterFilter, selectedSectionFilter);
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
      }

      fetchOfflineScopeAndLeaves(currentBranch);
    };

    initScopeAndSubscription();

    return () => {
      unsubscribes.forEach(unsub => {
        try { unsub(); } catch (_) {}
      });
    };
  }, [counsellor]);

  // Re-filter when semester / section filter changes
  useEffect(() => {
    if (allRawLeaves.length > 0) {
      processAllLeaves(allRawLeaves, scope.assignedBranch, selectedSemesterFilter, selectedSectionFilter);
    }
  }, [selectedSemesterFilter, selectedSectionFilter, scope.assignedBranch]);

  // Offline / Fallback Fetch
  const fetchOfflineScopeAndLeaves = async (currentBranch) => {
    try {
      setLoading(true);
      let rawList = [];
      const seenIds = new Set();

      try {
        const mockRes = await mockDB.getLeaves('counsellor', counsellor?.uid || 'counsellor', {
          assignedDepartment: currentBranch
        });
        (mockRes || []).forEach(l => {
          const id = l.id || l.leaveId;
          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            rawList.push(l);
          }
        });
      } catch (_) {}

      // Merge Local Storage items
      ['acad_student_leaves', 'acad_leave_requests'].forEach(key => {
        try {
          const localItems = JSON.parse(localStorage.getItem(key) || '[]');
          localItems.forEach(item => {
            const id = item.id || item.leaveId;
            if (id && !seenIds.has(id)) {
              seenIds.add(id);
              rawList.push(item);
            }
          });
        } catch (_) {}
      });

      setAllRawLeaves(rawList);
      processAllLeaves(rawList, currentBranch, selectedSemesterFilter, selectedSectionFilter);
    } catch (err) {
      console.error("Error fetching offline leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScopeAndLeaves = () => {
    fetchOfflineScopeAndLeaves(scope.assignedBranch);
  };

  // Helper to process, scope-filter, and separate Pending vs Processed Leaves
  const processAllLeaves = (rawList, currentBranch, semFilter, secFilter) => {
    const listCopy = [...rawList];
    const seenIds = new Set();
    const uniqueLeaves = [];

    listCopy.forEach(item => {
      const key = item.id || item.leaveId;
      if (key && !seenIds.has(key)) {
        seenIds.add(key);
        uniqueLeaves.push(item);
      }
    });

    // 1. Primary Filter: Counsellor Department / Branch Scope
    let scopedLeaves = uniqueLeaves.filter(item => {
      const itemBranch = item.branch || item.department || '';
      return isBranchMatch(itemBranch, currentBranch);
    });

    // 2. Secondary Filter: Selected Semester Filter (if not 'All')
    if (semFilter && semFilter !== 'All') {
      const normTargetSem = normalizeSemester(semFilter);
      const filteredBySem = scopedLeaves.filter(l => !l.semester || normalizeSemester(l.semester) === normTargetSem);
      if (filteredBySem.length > 0) {
        scopedLeaves = filteredBySem;
      }
    }

    // 3. Tertiary Filter: Selected Section Filter (if not 'All')
    if (secFilter && secFilter !== 'All') {
      const normTargetSec = normalizeSection(secFilter);
      const filteredBySec = scopedLeaves.filter(l => !l.section || normalizeSection(l.section) === normTargetSec);
      if (filteredBySec.length > 0) {
        scopedLeaves = filteredBySec;
      }
    }

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

    // Separate into pendingLeaves and processedLeaves
    const pending = scopedLeaves.filter(l => (l.status || 'Pending').toLowerCase() === 'pending');
    const processed = scopedLeaves.filter(l => (l.status || '').toLowerCase() === 'approved' || (l.status || '').toLowerCase() === 'rejected');

    const sortByDate = (a, b) => new Date(b.submittedAt || b.startDate || b.appliedAt || 0) - new Date(a.submittedAt || a.startDate || a.appliedAt || 0);
    pending.sort(sortByDate);
    processed.sort(sortByDate);

    setPendingLeaves(pending);
    setProcessedLeaves(processed);
  };

  // 2. APPROVE LEAVE LOGIC
  const handleApprove = async (leave) => {
    const leaveId = leave.id || leave.leaveId;
    const counsellorName = counsellor?.fullName || counsellor?.name || 'Ward Counsellor';

    try {
      setSubmittingAction(true);

      // Update Firestore using updateDoc
      if (isFirebaseConfigured && db && leaveId) {
        const collectionsToTry = [leave._col, 'leave_requests', 'leaves', 'student_leaves'].filter(Boolean);
        for (const col of collectionsToTry) {
          try {
            const leaveRef = doc(db, col, leaveId);
            await updateDoc(leaveRef, {
              status: 'Approved',
              actionBy: counsellorName,
              approvedBy: counsellorName,
              approvedByName: counsellorName,
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
            localItems[idx].approvedBy = counsellorName;
            localItems[idx].approvedByName = counsellorName;
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
        { ...leave, status: 'Approved', actionBy: counsellorName, approvedBy: counsellorName, approvedByName: counsellorName, actionAt: new Date().toISOString() },
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

  // 3. REJECT LEAVE LOGIC
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
        const collectionsToTry = [leave._col, 'leave_requests', 'leaves', 'student_leaves'].filter(Boolean);
        for (const col of collectionsToTry) {
          try {
            const leaveRef = doc(db, col, leaveId);
            await updateDoc(leaveRef, {
              status: 'Rejected',
              rejectionReason: rejectionReason.trim(),
              actionBy: counsellorName,
              rejectedBy: counsellorName,
              rejectedByName: counsellorName,
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
            localItems[idx].rejectedBy = counsellorName;
            localItems[idx].rejectedByName = counsellorName;
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
        { ...leave, status: 'Rejected', rejectionReason: rejectionReason.trim(), actionBy: counsellorName, rejectedBy: counsellorName, rejectedByName: counsellorName, actionAt: new Date().toISOString() },
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

  // Search Filter
  const filterBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(l =>
      (l.studentName || l.applicantName || '').toLowerCase().includes(q) ||
      (l.rollNumber || l.usn || '').toLowerCase().includes(q) ||
      (l.reason || '').toLowerCase().includes(q) ||
      (l.leaveType || '').toLowerCase().includes(q)
    );
  };

  const filteredPending = filterBySearch(pendingLeaves);
  const filteredProcessed = filterBySearch(processedLeaves);

  return (
    <div className="space-y-6 text-xs font-semibold p-2 md:p-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase mb-2 border border-purple-500/30">
            <Building2 size={13} />
            Scope: {scope.assignedBranch}
          </div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-white">
            <Calendar className="text-purple-300" size={24} />
            Student Leave Management Desk
          </h1>
          <p className="text-xs text-purple-200/80 mt-1 font-medium">
            Review, approve, or reject student leaves for {scope.assignedBranch}.
          </p>
        </div>

        <button
          onClick={fetchScopeAndLeaves}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold flex items-center gap-2 transition-all border border-white/20 shadow-md cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Requests
        </button>
      </div>

      {/* Scope Filtering & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search student name, roll number, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl font-bold placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-purple-400 outline-none transition-all text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Filter */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Semester:</span>
            <select
              value={selectedSemesterFilter}
              onChange={(e) => setSelectedSemesterFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Semesters</option>
              {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(sem => (
                <option key={sem} value={sem} className="bg-slate-900 text-white">{sem}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Section:</span>
            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Sections</option>
              <option value="Section A" className="bg-slate-900 text-white">Section A</option>
              <option value="Section B" className="bg-slate-900 text-white">Section B</option>
              <option value="Section C" className="bg-slate-900 text-white">Section C</option>
            </select>
          </div>

          <div className="text-gray-400 font-bold text-[11px] px-2">
            Pending: <strong className="text-amber-400">{pendingLeaves.length}</strong> | Processed: <strong className="text-emerald-400">{processedLeaves.length}</strong>
          </div>
        </div>
      </div>

      {/* Section 1: PENDING LEAVE APPLICATIONS */}
      <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Clock className="text-amber-400" size={18} />
            Pending Student Leave Requests ({filteredPending.length})
          </h2>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
            Awaiting Counsellor Review
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 animate-pulse font-bold">
            Fetching pending leave applications...
          </div>
        ) : filteredPending.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-bold">
            No pending leave requests found for {scope.assignedBranch}.
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-hidden border border-white/10 rounded-2xl">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="w-[26%] px-4 py-3">Student Details</th>
                  <th className="w-[20%] px-3 py-3">Leave Interval</th>
                  <th className="w-[10%] px-2 py-3 text-center">Type</th>
                  <th className="w-[18%] px-3 py-3">Reason</th>
                  <th className="w-[14%] px-2 py-3 text-center">Monthly Leaves</th>
                  <th className="w-[12%] px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-bold text-gray-200">
                {filteredPending.map(leave => {
                  const studentKey = leave.studentId || leave.rollNumber || leave.studentName;
                  const monthlyCount = studentMonthlyStats[studentKey]?.monthlyApproved || 0;

                  return (
                    <tr key={leave.id || leave.leaveId} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-black text-white text-xs whitespace-normal break-words">
                          {leave.studentName || leave.applicantName || 'Student'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Roll: <span className="text-cyan-300 font-bold">{leave.rollNumber || leave.usn || 'N/A'}</span> • {leave.semester || 'Sem 6'} ({leave.section || 'Sec A'})
                        </div>
                      </td>
                      <td className="px-3 py-3.5 font-mono text-gray-300 text-xs whitespace-normal break-words align-middle">
                        {leave.startDate || leave.fromDate || 'N/A'} to {leave.endDate || leave.toDate || 'N/A'}
                      </td>
                      <td className="px-2 py-3.5 text-center align-middle">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-black text-[10px] border border-purple-500/30">
                          {leave.leaveType || 'Casual'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-gray-300 font-normal whitespace-normal break-words align-middle">
                        {leave.reason || 'No reason provided'}
                      </td>
                      <td className="px-2 py-3.5 text-center align-middle">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                          monthlyCount > 3
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : monthlyCount > 1
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          <Award size={11} />
                          {monthlyCount} Approved
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(leave)}
                            disabled={submittingAction}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1 shadow-sm transition-all text-xs cursor-pointer"
                          >
                            <CheckCircle size={13} /> Accept
                          </button>
                          <button
                            onClick={() => {
                              setRejectionModalLeave(leave);
                              setRejectionReason('');
                            }}
                            disabled={submittingAction}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black flex items-center gap-1 shadow-sm transition-all text-xs cursor-pointer"
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
      <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <FileText className="text-purple-400" size={18} />
            Leave Approval History & Processed Records ({filteredProcessed.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 animate-pulse font-bold">
            Loading processed history...
          </div>
        ) : filteredProcessed.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-bold">
            No processed leave history found.
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-hidden border border-white/10 rounded-2xl">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="w-[25%] px-4 py-3">Student</th>
                  <th className="w-[20%] px-3 py-3">Dates</th>
                  <th className="w-[22%] px-3 py-3">Reason</th>
                  <th className="w-[13%] px-2 py-3 text-center">Status</th>
                  <th className="w-[20%] px-3 py-3 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-bold text-gray-200">
                {filteredProcessed.map(l => (
                  <tr key={l.id || l.leaveId} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5 align-middle">
                      <div className="font-black text-white text-xs whitespace-normal break-words">
                        {l.studentName || l.applicantName || 'Student'}
                      </div>
                      <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
                        Roll: {l.rollNumber || l.usn || 'N/A'} • {l.semester || 'Sem 6'}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 font-mono text-gray-300 text-xs whitespace-normal break-words align-middle">
                      {l.startDate || l.fromDate || 'N/A'} to {l.endDate || l.toDate || 'N/A'}
                    </td>
                    <td className="px-3 py-3.5 text-gray-300 font-normal whitespace-normal break-words align-middle">
                      {l.reason || 'N/A'}
                    </td>
                    <td className="px-2 py-3.5 text-center align-middle">
                      <span className={`px-3 py-1 rounded-xl text-[9.5px] font-black uppercase inline-block ${
                        l.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-[11px] text-gray-400 font-normal italic whitespace-normal break-words align-middle">
                      {l.status === 'Approved'
                        ? `Approved by: ${l.approvedByName || l.actionBy || l.approvedBy || counsellor?.fullName || 'Ward Counsellor'}`
                        : `Reason: ${l.rejectionReason || 'Not stated'} (${l.rejectedByName || l.actionBy || l.rejectedBy || counsellor?.fullName || 'Ward Counsellor'})`}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="bg-black/60 backdrop-blur-2xl max-w-md w-full rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-white/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-rose-400 flex items-center gap-2">
                  <XCircle size={20} />
                  Reject Student Leave Application
                </h3>
                <p className="text-xs text-gray-400 font-bold mt-0.5">
                  Student: {rejectionModalLeave.studentName || rejectionModalLeave.applicantName}
                </p>
              </div>
              <button type="button" onClick={() => setRejectionModalLeave(null)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1.5">
                Reason for Rejection <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="State specific reason for rejecting leave (e.g., Low attendance percentage, Invalid supporting documents)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 font-medium focus:ring-1 focus:ring-purple-400 focus:bg-white/10 focus:outline-none transition-all resize-none text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRejectionModalLeave(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg border border-rose-500/30 cursor-pointer"
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
