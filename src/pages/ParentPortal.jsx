import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  FileText, 
  CreditCard, 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react';

export const ParentPortal = ({ subPage }) => {
  const { user } = useAuth();
  const [childProfile, setChildProfile] = useState(null);
  const [loadingChild, setLoadingChild] = useState(true);

  useEffect(() => {
    const fetchChild = async () => {
      if (!user || !user.childUid) return;
      try {
        setLoadingChild(true);
        const profile = await mockDB.getStudentProfile(user.childUid);
        setChildProfile(profile);
      } catch (err) {
        console.error("Failed to load child profile:", err);
      } finally {
        setLoadingChild(false);
      }
    };
    fetchChild();
  }, [user]);

  if (loadingChild) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse text-xs font-bold uppercase">
        Loading Student Ward Profile...
      </div>
    );
  }

  if (!childProfile) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl text-xs font-bold">
        Error: Ward information not linked to this parent account. Please contact college support.
      </div>
    );
  }

  if (subPage === 'dashboard') return <ParentDashboard parent={user} child={childProfile} />;
  if (subPage === 'attendance') return <ParentAttendance child={childProfile} />;
  if (subPage === 'leaves') return <ParentLeaves child={childProfile} />;
  if (subPage === 'results') return <ParentResults child={childProfile} />;
  if (subPage === 'assignments') return <ParentAssignments child={childProfile} />;
  if (subPage === 'fees') return <ParentFees child={childProfile} />;
  if (subPage === 'notifications') return <ParentNotifications parent={user} child={childProfile} />;
  if (subPage === 'counselling') return <ParentCounselling parent={user} child={childProfile} />;
  if (subPage === 'grievances') return <ParentGrievances parent={user} child={childProfile} />;

  return <ParentDashboard parent={user} child={childProfile} />;
};

// 1. DASHBOARD COMPONENT
const ParentDashboard = ({ parent, child }) => {
  const [attendanceRate, setAttendanceRate] = useState(100);
  const [totalClasses, setTotalClasses] = useState(0);
  const [presentClasses, setPresentClasses] = useState(0);
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const [unpaidFees, setUnpaidFees] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingData(true);
        // Load Attendance
        const att = await mockDB.getAttendanceForStudent(child.uid);
        const present = att.filter(a => a.status === 'present').length;
        const total = att.length;
        setAttendanceRate(total > 0 ? Math.round((present / total) * 100) : 100);
        setTotalClasses(total);
        setPresentClasses(present);

        // Load Assignments (pending ones)
        const assignments = JSON.parse(localStorage.getItem('acad_assignments') || '[]');
        const submissions = JSON.parse(localStorage.getItem('acad_submissions') || '[]');
        // Filter by child department and semester
        const childAssignments = assignments.filter(a => a.branch === child.department && a.semester === child.semester);
        const submittedIds = submissions.filter(s => s.studentId === child.uid).map(s => s.assignmentId);
        const pending = childAssignments.filter(a => !submittedIds.includes(a.assignmentId || a.id)).length;
        setPendingAssignments(pending);

        // Load Fees
        const feeRecords = await mockDB.getFees(child.uid);
        const unpaid = feeRecords.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);
        setUnpaidFees(unpaid);

        // Load Notifications (Continuous absence alert & college alerts)
        const notifs = await mockDB.getNotifications(parent.uid);
        setRecentNotifications(notifs.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    loadStats();
  }, [parent, child]);

  if (loadingData) {
    return (
      <div className="py-20 text-center animate-pulse text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
        Syncing dashboard reports...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest bg-white/10 px-2 py-0.5 rounded">Parent Portal</span>
          <h2 className="text-lg font-black mt-2">Welcome back, {parent.fullName || 'Parent'}</h2>
          <p className="text-[10.5px] opacity-90 mt-1 font-medium">Monitoring academic metrics for: <span className="underline font-black">{child.fullName}</span> ({child.rollNumber})</p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
          <TrendingUp size={22} className="opacity-90" />
          <div className="text-right">
            <span className="text-sm font-black block">{attendanceRate}%</span>
            <span className="text-[9px] font-normal block opacity-80">Overall Attendance</span>
          </div>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Attendance widget */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">Attendance Rate</span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">{attendanceRate}%</span>
            <span className="text-[9.5px] text-slate-450 dark:text-slate-400 block mt-1 font-medium">{presentClasses}/{totalClasses} Classes present</span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${attendanceRate >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            <Activity size={20} />
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">Active Assignments</span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">{pendingAssignments}</span>
            <span className="text-[9.5px] text-slate-450 dark:text-slate-400 block mt-1 font-medium">Requires submission</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </div>

        {/* Unpaid Fees */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">Pending Fees</span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">₹{unpaidFees.toLocaleString()}</span>
            <span className="text-[9.5px] text-slate-450 dark:text-slate-400 block mt-1 font-medium">Tuition & Exam Dues</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <CreditCard size={20} />
          </div>
        </div>

        {/* Academic Year Info */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">Academic Profile</span>
            <span className="text-sm font-black text-slate-800 dark:text-white mt-1 block">{child.department} - {child.semester}</span>
            <span className="text-[9.5px] text-slate-450 dark:text-slate-400 block mt-1 font-medium">Sec: {child.section || 'A'} • AY: {child.academicYear || '2026-27'}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notifications Alerts */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-xl">
          <h3 className="text-sm font-black text-slate-805 dark:text-white mb-4 uppercase">Continuous Absence & Alerts</h3>
          {recentNotifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No alert warnings or notifications received.</div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map(n => (
                <div key={n.id || n.notificationId} className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-red-550 text-xs flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      {n.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{new Date(n.sentAt).toLocaleString()}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Counselling Info */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-805 dark:text-white mb-4 uppercase">Counselling details</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/35 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] text-slate-400 uppercase font-black">Ward Counsellor</span>
                <p className="font-extrabold text-slate-850 dark:text-slate-250 mt-1">{child.wardCounsellorName || 'Assigned Staff'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/35 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] text-slate-400 uppercase font-black">Department Branch</span>
                <p className="font-extrabold text-slate-850 dark:text-slate-250 mt-1">{child.department} Department</p>
              </div>
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-5">
            <span className="text-[9.5px] text-slate-450 dark:text-slate-400 block font-normal leading-relaxed">
              Continuous absence alerts are triggered when the student is absent from period 2 & 3 continuously.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. ATTENDANCE DETAIL COMPONENT
const ParentAttendance = ({ child }) => {
  const [records, setRecords] = useState([]);
  const [subjectAverages, setSubjectAverages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getAttendanceForStudent(child.uid);
        setRecords(data);

        // Calculate averages per subject
        const subjects = Array.from(new Set(data.map(r => r.subject)));
        const avgs = subjects.map(sub => {
          const subRecs = data.filter(r => r.subject === sub);
          const present = subRecs.filter(r => r.status === 'present').length;
          const pct = subRecs.length > 0 ? Math.round((present / subRecs.length) * 100) : 100;
          return { subject: sub, present, total: subRecs.length, percentage: pct };
        });
        setSubjectAverages(avgs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [child]);

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
        Loading attendance records...
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Detailed Attendance Log</h3>
        <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Review lecture-wise attendance logs and subject statistics</p>
      </div>

      {/* Subject Statistics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {subjectAverages.map((avg, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">{avg.subject}</span>
              <span className="text-sm font-black text-slate-850 dark:text-white block mt-1">{avg.percentage}%</span>
              <span className="text-[9px] text-slate-400 mt-0.5 block font-normal">{avg.present} of {avg.total} periods attended</span>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-[9px] ${
              avg.percentage >= 75 ? 'border-emerald-500/40 text-emerald-505 bg-emerald-500/5' : 'border-rose-500/40 text-rose-505 bg-rose-500/5'
            }`}>
              {avg.percentage}%
            </div>
          </div>
        ))}
      </div>

      {/* Lecture Logs Table */}
      <div>
        <span className="text-xs font-black text-slate-805 dark:text-white block uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">Period Wise Register Logs</span>
        {records.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No attendance history records found.</div>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3">Lecture Date</th>
                  <th className="px-5 py-3">Lecture Period</th>
                  <th className="px-5 py-3">Subject Name</th>
                  <th className="px-5 py-3">Marked By Faculty</th>
                  <th className="px-5 py-3 text-center">Marked Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
                {records.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-3">{rec.date}</td>
                    <td className="px-5 py-3">Period {rec.period}</td>
                    <td className="px-5 py-3">{rec.subject}</td>
                    <td className="px-5 py-3 font-normal">{rec.markedByName || 'System Auto'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded font-black text-[9px] uppercase ${
                        rec.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' :
                        rec.status === 'absent' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>{rec.status === 'leave_approved' ? 'Leave Approved' : rec.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. LEAVE APPLICATIONS COMPONENT
const ParentLeaves = ({ child }) => {
  const [leaves, setLeaves] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getLeaves('student', child.uid);
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [child]);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      showToast('Please fill all mandatory fields.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      await mockDB.applyLeave(
        child.uid,
        child.fullName,
        child.rollNumber,
        child.department,
        child.semester,
        child.section || 'A',
        reason,
        startDate,
        endDate,
        'student' // Student role context leave request
      );
      showToast('Ward leave application submitted for Counselling approval.', 'success');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaves();
    } catch (_) {
      showToast('Failed to apply leave.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-semibold">
      
      {/* Apply Leave Form */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Apply Ward Leave</h3>
          <p className="text-[11px] text-slate-400 mt-1">Submit leave application request to the assigned Ward Counsellor</p>
        </div>

        <form onSubmit={handleSubmitLeave} className="space-y-4 pt-2">
          <div>
            <label className="block text-[9.5px] uppercase font-bold text-slate-450 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[9.5px] uppercase font-bold text-slate-455 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[9.5px] uppercase font-bold text-slate-455 mb-1">Reason for Absence</label>
            <textarea
              placeholder="Medical reasons, family event, emergency..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none dark:text-white font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            <span>{submitting ? 'Submitting...' : 'Apply Leave'}</span>
          </button>
        </form>
      </div>

      {/* Leave Status Logs List */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase">Ward Leave Applications History</h3>
        
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Syncing logs...</div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-normal">No leave requests applied for this ward.</div>
        ) : (
          <div className="space-y-3">
            {leaves.map((l, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{l.startDate} to {l.endDate}</span>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">Applied: {new Date(l.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                    l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    l.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                  }`}>{l.status}</span>
                </div>
                <p className="text-[10.5px] font-normal text-slate-700 dark:text-slate-350">{l.reason}</p>
                {l.remarks && (
                  <div className="mt-2 pt-2 border-t border-slate-150 dark:border-slate-850/80 text-[10px] text-slate-500">
                    Remarks: <span className="font-bold text-slate-600 dark:text-slate-400">{l.remarks}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// 4. RESULTS GRADE SHEET COMPONENT
const ParentResults = ({ child }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getStudentMarks(child.uid);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [child]);

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
        Retrieving marks ledger...
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Internal Grading Ledger</h3>
        <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Review internal midterms, assignment grading, and aggregate marks</p>
      </div>

      {/* Internal Marks (Mid1, Mid2, Assignments) */}
      <div>
        <span className="text-xs font-black text-slate-805 dark:text-white block uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">Midterm Scoring Register</span>
        {!results || results.internals.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-normal">Internal scores not published for this semester yet.</div>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3">Subject Name</th>
                  <th className="px-5 py-3 text-center">Mid 1 (20)</th>
                  <th className="px-5 py-3 text-center">Mid 2 (20)</th>
                  <th className="px-5 py-3 text-center">Assignments (10)</th>
                  <th className="px-5 py-3 text-center">Internal Score (50)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
                {results.internals.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-3">{r.subject}</td>
                    <td className="px-5 py-3 text-center font-normal">{r.mid1}</td>
                    <td className="px-5 py-3 text-center font-normal">{r.mid2}</td>
                    <td className="px-5 py-3 text-center font-normal">{r.assignments}</td>
                    <td className="px-5 py-3 text-center text-blue-600 dark:text-blue-400">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. ASSIGNMENTS TRACKER
const ParentAssignments = ({ child }) => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        // Load Assignments
        const allAss = JSON.parse(localStorage.getItem('acad_assignments') || '[]');
        const childAssignments = allAss.filter(a => a.branch === child.department && a.semester === child.semester);
        setAssignments(childAssignments);

        // Load Submissions
        const allSub = JSON.parse(localStorage.getItem('acad_submissions') || '[]');
        const childSub = allSub.filter(s => s.studentId === child.uid);
        setSubmissions(childSub);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [child]);

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
        Loading assignments ledger...
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Active Assignments Tracker</h3>
        <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Review active tasks, deadline dates, and grading submission statuses</p>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-10 text-slate-400 font-normal">No academic assignments allocated.</div>
      ) : (
        <div className="space-y-4">
          {assignments.map((ass) => {
            const sub = submissions.find(s => s.assignmentId === (ass.id || ass.assignmentId));
            const isSubmitted = !!sub;
            
            return (
              <div key={ass.id || ass.assignmentId} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-805 dark:text-slate-200 text-sm">{ass.title}</span>
                    <span className="text-[10px] bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-450">{ass.subject}</span>
                  </div>
                  <p className="text-[11px] font-normal text-slate-505 dark:text-slate-400 mt-1">{ass.description}</p>
                  <p className="text-[9.5px] text-slate-400 mt-2 font-normal">Deadline: <span className="font-bold text-slate-500">{ass.dueDate}</span></p>
                </div>
                <div>
                  {isSubmitted ? (
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-xl font-black uppercase text-[9px] block text-center">Submitted</span>
                      {sub.score !== undefined ? (
                        <span className="text-[10px] text-blue-500 font-bold block mt-1.5">Score: {sub.score} / 10</span>
                      ) : (
                        <span className="text-[9.5px] text-slate-400 font-normal block mt-1.5">Grading Pending</span>
                      )}
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-xl font-black uppercase text-[9px] block text-center">Pending Action</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 6. FEES LEDGER COMPONENT
const ParentFees = ({ child }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingFeeId, setPayingFeeId] = useState(null);
  const { showToast } = useAuth();

  const fetchFees = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getFees(child.uid);
      setFees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [child]);

  const handlePayFee = async (feeId) => {
    try {
      setPayingFeeId(feeId);
      // Simulate quick checkout gateway delay
      await new Promise(resolve => setTimeout(resolve, 800));
      await mockDB.payFee(feeId);
      showToast('Fee transaction processed successfully via simulator gateway.', 'success');
      fetchFees();
    } catch (_) {
      showToast('Transaction declined.', 'error');
    } finally {
      setPayingFeeId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
        Loading invoice reports...
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Fee Invoices & Ledger</h3>
        <p className="text-xs text-slate-455 dark:text-slate-400 mt-1">Review active semester invoices, transaction ledgers and settle payment drafts</p>
      </div>

      {fees.length === 0 ? (
        <div className="text-center py-10 text-slate-400 font-normal">No fee records found.</div>
      ) : (
        <div className="space-y-4">
          {fees.map((fee) => (
            <div key={fee.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="font-extrabold text-slate-805 dark:text-slate-250 text-sm block">{fee.feeType} Invoice</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block font-normal">Semester: {fee.semester} • Due Date: {fee.dueDate || 'Immediate'}</span>
                <span className="text-base font-black text-blue-600 dark:text-blue-400 block mt-2">₹{fee.amount.toLocaleString()}</span>
              </div>

              <div>
                {fee.status === 'paid' ? (
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-xl font-black uppercase text-[9px]">Settled</span>
                    <p className="text-[9px] text-slate-400 mt-1.5 font-normal">Paid on: {new Date(fee.paidAt).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePayFee(fee.id)}
                    disabled={payingFeeId !== null}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    {payingFeeId === fee.id ? 'Processing...' : 'Settle Invoice'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 7. NOTIFICATIONS COMPONENT
const ParentNotifications = ({ parent, child }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getNotifications(parent.uid);
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [parent]);

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
        Loading notification registers...
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Notification Alert Logs</h3>
        <p className="text-xs text-slate-455 dark:text-slate-400 mt-1">Chronological history of continuous absences and administrative warnings</p>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10 text-slate-405 font-normal">No alert records registered.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id || n.notificationId} className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-red-600 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {n.title}
                </span>
                <span className="text-[9.5px] text-slate-400 font-mono">{new Date(n.sentAt).toLocaleString()}</span>
              </div>
              <p className="text-[10.5px] text-slate-700 dark:text-slate-350 font-normal leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// 8. PARENT COUNSELLING REMARKS COMPONENT
const ParentCounselling = ({ parent, child }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounselling = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getCounsellingRecords(child.uid);
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounselling();
  }, [child]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Ward Counsellor Official Remarks</h3>
        <p className="text-xs text-slate-455 dark:text-slate-400 mt-1">Review periodic performance evaluations, behavioral notes, and academic guidance written by {child.wardCounsellorName || 'Assigned Staff'}</p>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-400">Loading counselling logs...</div>
      ) : records.length === 0 ? (
        <div className="py-20 text-center text-slate-400 font-normal">No counsellor review records published yet.</div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div key={rec.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-extrabold text-slate-850 dark:text-slate-200 text-xs">Session Date: {rec.date}</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Counsellor: {rec.counsellorName}</span>
                </div>
                <span className="px-2.5 py-1 bg-purple-500/10 text-purple-500 rounded-xl font-black uppercase text-[9px]">Verified Session</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{rec.notes}</p>
              {rec.recommendations && (
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl text-[10.5px]">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5 uppercase text-[9px]">Action Plan / Recommendation:</span>
                  <p className="text-slate-600 dark:text-slate-400">{rec.recommendations}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 9. PARENT GRIEVANCE FILING COMPONENT
const ParentGrievances = ({ parent, child }) => {
  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState('Academics');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getGrievanceTickets(parent.uid);
      setTickets(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [parent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !description) return;

    try {
      setSubmitting(true);
      await mockDB.submitGrievanceTicket(parent.uid, {
        category,
        subject: `[Parent Request - Ward: ${child.rollNumber}] ${subject}`,
        description
      });
      showToast('Parent Grievance ticket filed with Principal office.', 'success');
      setSubject('');
      setDescription('');
      loadTickets();
    } catch (_) {
      showToast('Could not submit ticket.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white">File Parent Support / Dispute Ticket</h3>
          <p className="text-[10px] text-slate-400 mt-1">Submit direct inquiry or grievance regarding your ward to college executive administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9.5px] uppercase font-bold text-slate-450 mb-1">Issue Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none dark:text-white font-bold">
              <option value="Academics">Academics & Attendance</option>
              <option value="Hostel & Food">Hostel & Mess Facilities</option>
              <option value="Fee Discrepancy">Fee Invoice / Payment Discrepancy</option>
              <option value="Discipline">Discipline & Safety</option>
            </select>
          </div>

          <div>
            <label className="block text-[9.5px] uppercase font-bold text-slate-450 mb-1">Subject Summary</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g. Attendance discrepancy for Period 3" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none dark:text-white font-bold" />
          </div>

          <div>
            <label className="block text-[9.5px] uppercase font-bold text-slate-450 mb-1">Detailed Explanation</label>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Provide clear description of your concern..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none dark:text-white resize-none font-bold"></textarea>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow">
            {submitting ? 'Filing...' : 'Submit Support Ticket'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-4">Your Filed Tickets Ledger</span>
        
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Loading support history...</div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center text-slate-450">No tickets filed by your account.</div>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {tickets.map(t => (
              <div key={t.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[9px] font-black uppercase">{t.category}</span>
                    <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs mt-1">{t.subject}</h4>
                  </div>
                  <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                    t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>{t.status}</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">{t.description}</p>
                {t.reply && (
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1 mt-2">
                    <span className="text-[9px] font-black text-emerald-500 uppercase block">College Official Response:</span>
                    <p className="text-[10.5px] text-slate-600 dark:text-slate-300 font-medium">{t.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
