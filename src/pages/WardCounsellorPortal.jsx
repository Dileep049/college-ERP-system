import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, db, isFirebaseConfigured, isDepartmentMatch, normalizeSemester } from '../services/firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { WardCounsellorLeaveDesk } from '../components/WardCounsellorLeaveDesk';
import { WardCounsellorLeaves } from './WardCounsellorLeaves';
import { WardCounsellorProfile } from './WardCounsellorProfile';
import {
  UserCheck,
  Users,
  Calendar,
  MessageSquare,
  Plus,
  RefreshCw,
  TrendingUp,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Clock,
  Printer,
  ChevronRight,
  Eye,
  AlertTriangle,
  BookOpen,
  Award,
  CheckSquare,
  ShieldCheck,
  X,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export const WardCounsellorPortal = ({ subPage }) => {
  const { user } = useAuth();

  // 1. Check URL Query Parameters Branch Access Guard
  const searchParams = new URLSearchParams(window.location.search);
  const reqDept = searchParams.get('department') || searchParams.get('branch');
  const assignedDept = user?.wardCounsellorDepartment || user?.assignedBranch || user?.department || 'B.Sc. Computer Science (CS)';

  if (reqDept) {
    const normReq = reqDept.toUpperCase().trim();
    const normAssigned = assignedDept.toUpperCase().trim();
    const isDeptValid = normReq === normAssigned || normAssigned.includes(normReq) || normReq.includes(normAssigned) || (normReq.includes('AI') && normAssigned.includes('AI'));

    if (!isDeptValid) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-black/60 backdrop-blur-2xl rounded-3xl border border-rose-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto font-black text-2xl border border-rose-500/20">
            🔒
          </div>
          <h2 className="text-xl font-black text-white">Branch Access Restricted</h2>
          <p className="text-sm font-bold text-rose-400">
            You are not assigned to this branch.
          </p>
          <p className="text-xs text-gray-300 leading-relaxed">
            Your account ({user?.email}) is strictly assigned to <strong>{assignedDept}</strong> by your Head of Department. Access to {reqDept} is blocked.
          </p>
          <button
            onClick={() => window.location.href = '/counsellor'}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg border border-purple-400/30"
          >
            Return to Ward Counsellor Dashboard
          </button>
        </div>
      );
    }
  }

  // 2. Check Inactive Ward Counsellor Status
  if (user?.wardCounsellorStatus === 'inactive') {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-black/60 backdrop-blur-2xl rounded-3xl border border-amber-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto font-black text-2xl border border-amber-500/20">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-white">No Active Branch Assignment</h2>
        <p className="text-sm font-bold text-amber-400">
          No active branch ward counsellor assignment has been provided by your HOD.
        </p>
        <p className="text-xs text-gray-300 leading-relaxed">
          Please contact your Head of Department (HOD) to assign your ward branch.
        </p>
      </div>
    );
  }

  if (subPage === 'wards') return <WardsDirectory counsellor={user} />;
  if (subPage === 'reports') return <CounsellorReports counsellor={user} />;
  if (subPage === 'leaves' || subPage === 'student-leaves') return <WardCounsellorLeaves counsellor={user} />;
  if (subPage === 'profile') return <WardCounsellorProfile />;
  return <CounsellorDashboard counsellor={user} />;
};

// 1. COUNSELLOR DASHBOARD & MENTORING CONSOLE
const CounsellorDashboard = ({ counsellor }) => {
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [wards, setWards] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real-Time Daily Attendance Metrics
  const [presentTodayCount, setPresentTodayCount] = useState(0);
  const [absentTodayCount, setAbsentTodayCount] = useState(0);
  const [overallAttendancePercentage, setOverallAttendancePercentage] = useState('0.0');
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);

  const [wardsAbsentToday, setWardsAbsentToday] = useState([]);
  const [lowAttendanceWards, setLowAttendanceWards] = useState([]);
  const [highRiskWards, setHighRiskWards] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [sectionAnalytics, setSectionAnalytics] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('June');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [showConcernModal, setShowConcernModal] = useState(false);

  // Form state for creating student concern
  const [concernStudentId, setConcernStudentId] = useState('');
  const [concernCategory, setConcernCategory] = useState('Attendance');
  const [concernTitle, setConcernTitle] = useState('');
  const [concernDescription, setConcernDescription] = useState('');
  const [concernPriority, setConcernPriority] = useState('High');
  const [concernFollowUp, setConcernFollowUp] = useState('');

  const { showToast } = useAuth();

  const loadCounsellorData = async () => {
    try {
      setLoading(true);

      const assign = await mockDB.getFacultyWardAssignment(counsellor?.uid || counsellor?.id || counsellor?.email);
      setActiveAssignment(assign || null);

      const resolvedDept = assign?.department || counsellor?.wardCounsellorDepartment || counsellor?.assignedBranch || counsellor?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
      const resolvedSem = assign?.semester || counsellor?.semester || 'Semester 6';

      // Scoped across Sections A, B, C for same Branch + Semester
      const branchStudents = await mockDB.getWardsForCounsellor(counsellor.uid, resolvedDept, resolvedSem);
      setWards(branchStudents);

      const allMeetings = await mockDB.getCounsellingMeetings('counsellor', counsellor.uid);
      setMeetings(allMeetings);

      const reminders = await mockDB.getFollowUpReminders(counsellor.uid);
      setFollowUps(reminders);

      const studentConcerns = await mockDB.getStudentConcerns(counsellor.uid);
      setConcerns(studentConcerns);

      const summary = await mockDB.getMonthlyWardSummary(counsellor.uid, selectedMonth, selectedYear);
      setMonthlySummary(summary);

      const sections = await mockDB.getSectionAnalytics(resolvedDept);
      setSectionAnalytics(sections);

      // Local initial computation of daily stats
      const todayStr = new Date().toISOString().split('T')[0];
      const localAttendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
      computeAttendanceStats(branchStudents, localAttendance, todayStr);

      const localLeaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
      const pendingLeaves = localLeaves.filter(l => {
        const matchDept = isDepartmentMatch(l.department || l.branch, resolvedDept);
        const matchSem = !l.semester || !resolvedSem || normalizeSemester(l.semester) === normalizeSemester(resolvedSem);
        return matchDept && matchSem && (l.status === 'pending' || l.status === 'Pending');
      });
      setPendingLeavesCount(pendingLeaves.length);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const computeAttendanceStats = (studentList, attendanceList, dateStr) => {
    if (!studentList || studentList.length === 0) return;

    const studentRolls = new Set(studentList.map(s => (s.rollNumber || '').toUpperCase()).filter(Boolean));
    const studentUids = new Set(studentList.map(s => s.uid || s.id).filter(Boolean));

    // 1. Records for today
    const todayRecords = attendanceList.filter(a => {
      const matchDate = (a.date || '').startsWith(dateStr);
      const matchStudent = (a.studentId && studentUids.has(a.studentId)) || (a.rollNumber && studentRolls.has(a.rollNumber.toUpperCase()));
      return matchDate && matchStudent;
    });

    const presentStudentUids = new Set();
    const absentStudentUids = new Set();
    const absentWardsList = [];

    todayRecords.forEach(rec => {
      const sIdentifier = rec.studentId || rec.rollNumber;
      const statusNorm = (rec.status || '').toLowerCase();
      if (statusNorm === 'present' || statusNorm === 'late') {
        presentStudentUids.add(sIdentifier);
      } else if (statusNorm === 'absent' || statusNorm === 'on leave' || statusNorm === 'leave') {
        absentStudentUids.add(sIdentifier);
        const wardObj = studentList.find(s => s.uid === rec.studentId || (s.rollNumber && s.rollNumber.toUpperCase() === (rec.rollNumber || '').toUpperCase()));
        if (wardObj && !absentWardsList.some(w => w.uid === wardObj.uid)) {
          absentWardsList.push(wardObj);
        }
      }
    });

    setPresentTodayCount(presentStudentUids.size);
    setAbsentTodayCount(absentStudentUids.size);
    setWardsAbsentToday(absentWardsList);

    // 2. Cumulative Overall Attendance % calculation
    const allScopedRecords = attendanceList.filter(a => {
      return (a.studentId && studentUids.has(a.studentId)) || (a.rollNumber && studentRolls.has(a.rollNumber.toUpperCase()));
    });

    let overallPct = '0.0';
    if (allScopedRecords.length > 0) {
      const totalPresent = allScopedRecords.filter(a => ['present', 'late'].includes((a.status || '').toLowerCase())).length;
      overallPct = ((totalPresent / allScopedRecords.length) * 100).toFixed(1);
    } else {
      const totalSum = studentList.reduce((acc, s) => acc + parseFloat(s.attendancePercentage || s.attendance || 84.5), 0);
      overallPct = (totalSum / Math.max(1, studentList.length)).toFixed(1);
    }
    setOverallAttendancePercentage(overallPct);

    // 3. Risk Categories
    const lowAtt = studentList.filter(s => parseFloat(s.attendancePercentage || s.attendance || 80) < 75);
    setLowAttendanceWards(lowAtt);

    const highRisk = studentList.filter(s => parseFloat(s.attendancePercentage || s.attendance || 80) < 65);
    setHighRiskWards(highRisk);
  };

  useEffect(() => {
    loadCounsellorData();
  }, [counsellor, selectedMonth, selectedYear]);

  // Real-time Firestore Listeners for Attendance & Leaves
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const resolvedDept = activeAssignment?.department || counsellor?.wardCounsellorDepartment || counsellor?.assignedBranch || counsellor?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
    const resolvedSem = activeAssignment?.semester || counsellor?.semester || 'Semester 6';
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Live Attendance Listener
    const unsubscribeAtt = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const liveAttendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      computeAttendanceStats(wards, liveAttendance, todayStr);
    }, (err) => console.warn('Attendance snapshot error:', err));

    // 2. Live Leave Requests Listener
    const unsubscribeLeaves = onSnapshot(collection(db, 'leave_requests'), (snapshot) => {
      const liveLeaves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pendingLeaves = liveLeaves.filter(l => {
        const matchDept = isDepartmentMatch(l.department || l.branch, resolvedDept);
        const matchSem = !l.semester || !resolvedSem || normalizeSemester(l.semester) === normalizeSemester(resolvedSem);
        return matchDept && matchSem && (l.status === 'pending' || l.status === 'Pending');
      });
      setPendingLeavesCount(pendingLeaves.length);
    }, (err) => console.warn('Leave requests snapshot error:', err));

    return () => {
      unsubscribeAtt();
      unsubscribeLeaves();
    };
  }, [wards, activeAssignment, counsellor]);

  const handleCreateConcern = async (e) => {
    e.preventDefault();
    if (!concernStudentId || !concernTitle) return;
    try {
      const studentObj = wards.find(w => w.uid === concernStudentId || w.rollNumber === concernStudentId);
      await mockDB.createStudentConcern({
        studentId: concernStudentId,
        studentName: studentObj?.fullName || studentObj?.name || 'Ward Student',
        rollNumber: studentObj?.rollNumber || '22KBN-CS001',
        category: concernCategory,
        title: concernTitle,
        description: concernDescription,
        priority: concernPriority,
        followUpDate: concernFollowUp || new Date().toISOString().split('T')[0]
      });
      showToast('Student concern logged successfully!', 'success');
      setShowConcernModal(false);
      setConcernTitle('');
      setConcernDescription('');
      loadCounsellorData();
    } catch (e) {
      showToast('Failed to log concern', 'error');
    }
  };

  const currentDept = activeAssignment?.department || counsellor?.wardCounsellorDepartment || counsellor?.assignedBranch || counsellor?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
  const currentSem = activeAssignment?.semester || counsellor?.semester || 'Semester 6';
  const todayDateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="p-8 text-center text-gray-200 font-bold text-xs animate-pulse">Loading mentoring dashboard...</div>;

  return (
    <div className="space-y-6 text-xs font-semibold font-sans">
      
      {/* 1. MENTORING COMMAND BOARD BANNER (PURPLE TINTED GLASS) */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-fuchsia-900/50 to-purple-900/50 backdrop-blur-xl border border-fuchsia-500/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3.5 py-1 bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/30 text-[10px] font-black uppercase tracking-wider rounded-full drop-shadow-md">
                Ward Mentoring & Daily Attendance Console
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9.5px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Sync
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display mt-2 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">Mentoring Command Board</h2>
            <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">
              Counsellor: <strong className="text-fuchsia-300 font-bold drop-shadow">{counsellor.fullName}</strong> • {currentDept} • {currentSem} (Sections A, B, C)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowConcernModal(true)} 
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-500/25 border border-purple-400/40 flex items-center gap-1.5 drop-shadow transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Plus size={16} />
              <span>Log Student Concern</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME DAILY ATTENDANCE & SCOPE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/5 transition-all text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/70 uppercase font-black tracking-wider">Total Scoped Wards</span>
            <Users className="text-cyan-400" size={20} />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white font-display mt-2 drop-shadow-md">{wards.length}</p>
          <div className="flex items-center justify-between text-[10.5px] mt-1.5 pt-1.5 border-t border-white/10 text-cyan-300 font-bold">
            <span>{currentSem} (All Sections)</span>
            <span className="text-white/60 font-mono">Cross-Section</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/5 transition-all text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-300 uppercase font-black tracking-wider">Present Today</span>
            <CheckCircle2 className="text-emerald-400" size={20} />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-300 font-display mt-2 drop-shadow-md">{presentTodayCount}</p>
          <div className="flex items-center justify-between text-[10.5px] mt-1.5 pt-1.5 border-t border-white/10 text-emerald-200/80 font-semibold">
            <span>Date: {todayDateFormatted}</span>
            <span className="text-emerald-400 font-bold">
              {wards.length > 0 ? `${Math.round((presentTodayCount / wards.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Absent Today */}
        <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-rose-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/5 transition-all text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-300 uppercase font-black tracking-wider">Absent Today</span>
            <XCircle className="text-rose-400" size={20} />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-rose-400 font-display mt-2 drop-shadow-md">{absentTodayCount}</p>
          <div className="flex items-center justify-between text-[10.5px] mt-1.5 pt-1.5 border-t border-white/10 text-rose-300/80 font-semibold">
            <span>Action: Immediate Follow-up</span>
            <span className="text-rose-400 font-bold">
              {wards.length > 0 ? `${Math.round((absentTodayCount / wards.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Overall Attendance % */}
        <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-purple-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/5 transition-all text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-300 uppercase font-black tracking-wider">Overall Attendance %</span>
            <TrendingUp className="text-purple-400" size={20} />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-purple-300 font-display mt-2 drop-shadow-md">{overallAttendancePercentage}%</p>
          <div className="flex items-center justify-between text-[10.5px] mt-1.5 pt-1.5 border-t border-white/10 text-purple-200/80 font-semibold">
            <span>Institutional Cutoff: 75%</span>
            <span className={parseFloat(overallAttendancePercentage) >= 75 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {parseFloat(overallAttendancePercentage) >= 75 ? '🟢 Compliant' : '🔴 At Risk'}
            </span>
          </div>
        </div>

      </div>

      {/* 3. SECONDARY STAT & RISK METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-amber-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 transition-all duration-300">
          <span className="text-[9.5px] uppercase text-amber-300 font-extrabold tracking-wide block drop-shadow">Attendance Warning (&lt;75%)</span>
          <span className="text-amber-300 font-black text-3xl drop-shadow font-display mt-0.5 block">{lowAttendanceWards.length}</span>
        </div>
        <div className="p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-rose-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 transition-all duration-300">
          <span className="text-[9.5px] uppercase text-rose-400 font-extrabold tracking-wide block drop-shadow">High Risk Wards (&lt;65%)</span>
          <span className="text-rose-400 font-black text-3xl drop-shadow font-display mt-0.5 block">{highRiskWards.length}</span>
        </div>
        <div className="p-3.5 bg-black/40 backdrop-blur-md border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 transition-all duration-300">
          <span className="text-[9.5px] uppercase text-cyan-300 font-extrabold tracking-wide block drop-shadow">Pending Leaves Review</span>
          <span className="text-cyan-300 font-black text-3xl drop-shadow font-display mt-0.5 block">{pendingLeavesCount}</span>
        </div>
        <div className="p-3.5 bg-black/40 backdrop-blur-md border border-purple-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 transition-all duration-300">
          <span className="text-[9.5px] uppercase text-purple-300 font-extrabold tracking-wide block drop-shadow">Active Student Concerns</span>
          <span className="text-purple-300 font-black text-3xl drop-shadow font-display mt-0.5 block">{concerns.filter(c => c.status === 'Open' || c.status === 'In Progress').length}</span>
        </div>
      </div>

      {/* 4. MONTHLY WARD SUMMARY CARD */}
      {monthlySummary && (
        <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white drop-shadow-lg flex items-center gap-2">
                <Calendar className="text-purple-400" size={18} />
                Monthly Ward Mentoring Summary
              </h3>
              <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">Institutional ward metrics for selected calendar month</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2 rounded-xl border border-white/20 bg-black/50 text-white text-xs font-bold shadow-md">
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
              </select>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="p-2 rounded-xl border border-white/20 bg-black/50 text-white text-xs font-bold shadow-md">
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-gray-200 uppercase font-extrabold block drop-shadow-sm">Total Wards</span>
              <span className="text-lg font-black text-white drop-shadow mt-1 block font-display">{monthlySummary.totalWards}</span>
            </div>
            <div className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-gray-200 uppercase font-extrabold block drop-shadow-sm">Avg Attendance</span>
              <span className="text-lg font-black text-emerald-300 drop-shadow mt-1 block font-display">{monthlySummary.averageAttendance}%</span>
            </div>
            <div className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-gray-200 uppercase font-extrabold block drop-shadow-sm">Counselling Sessions</span>
              <span className="text-lg font-black text-purple-300 drop-shadow mt-1 block font-display">{monthlySummary.counsellingSessions}</span>
            </div>
            <div className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-gray-200 uppercase font-extrabold block drop-shadow-sm">Mentorship Reviews</span>
              <span className="text-lg font-black text-indigo-300 drop-shadow mt-1 block font-display">{monthlySummary.counsellingSessions || 12}</span>
            </div>
            <div className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-gray-200 uppercase font-extrabold block drop-shadow-sm">Open Concerns</span>
              <span className="text-lg font-black text-rose-400 drop-shadow mt-1 block font-display">{monthlySummary.openConcerns}</span>
            </div>
            <div className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-gray-200 uppercase font-extrabold block drop-shadow-sm">Improved Students</span>
              <span className="text-lg font-black text-emerald-300 drop-shadow mt-1 block font-display">{monthlySummary.improvedStudents}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECTION-WISE ANALYTICS GRID */}
      <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white drop-shadow-lg">Section-wise Branch Analytics</h3>
            <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">Comparative attendance and risk metrics across sections in {counsellor.department || 'Branch'}</p>
          </div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[10px] font-bold rounded-full drop-shadow">
            Dynamic Sections
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sectionAnalytics.map((sec) => (
            <div key={sec.section} className="p-4 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-white drop-shadow-md">{sec.section}</h4>
                <span className="text-[10px] text-purple-300 font-bold">{sec.students} Students</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                <span className="text-gray-200">Attendance %:</span>
                <span className="font-bold text-emerald-300">{sec.attendance}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-200">Pass Rate %:</span>
                <span className="font-bold text-purple-300">{sec.passRate}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-200">At Risk Count:</span>
                <span className="font-bold text-rose-400">{sec.atRisk} Students</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. FOLLOW-UP REMINDERS & STUDENT CONCERNS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Follow-up Reminders */}
        <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <h3 className="text-base font-extrabold text-white drop-shadow-lg flex items-center gap-2">
              <Clock className="text-purple-400" size={18} />
              Upcoming Follow-ups
            </h3>
            <span className="text-[10px] text-gray-200 font-bold uppercase drop-shadow">Category Reminders</span>
          </div>

          <div className="space-y-3">
            {followUps.map((flw) => (
              <div key={flw.id} className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-white drop-shadow-sm">{flw.studentName}</h4>
                    <span className="text-[10px] text-gray-300 font-mono">({flw.rollNumber})</span>
                  </div>
                  <p className="text-[11px] text-gray-200 font-medium mt-0.5">{flw.reason}</p>
                  <span className="text-[9.5px] text-purple-300 font-bold block mt-0.5">Date: {flw.followUpDate}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black drop-shadow ${flw.category === 'Overdue' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30 animate-pulse' : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'}`}>
                  {flw.category === 'Overdue' ? '🔴 Overdue' : flw.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Student Concern Issue Tracker */}
        <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <h3 className="text-base font-extrabold text-white drop-shadow-lg flex items-center gap-2">
              <AlertCircle className="text-rose-400" size={18} />
              Student Issue Tracker
            </h3>
            <button 
              onClick={() => setShowConcernModal(true)} 
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-xl text-[10.5px] font-bold shadow-md cursor-pointer hover:scale-[1.02]"
            >
              + Log Concern
            </button>
          </div>

          <div className="space-y-3">
            {concerns.map((cn) => (
              <div key={cn.id} className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[9.5px] font-bold rounded-md uppercase">
                    {cn.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black drop-shadow ${cn.priority === 'Critical' || cn.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'}`}>
                    {cn.priority}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white drop-shadow-sm">{cn.title}</h4>
                <p className="text-[10.5px] text-gray-200">{cn.description}</p>
                <div className="flex items-center justify-between text-[9.5px] pt-1 text-gray-300 border-t border-white/10">
                  <span>Student: <strong className="text-white">{cn.studentName}</strong> ({cn.rollNumber})</span>
                  <span className="font-bold text-emerald-300">Status: {cn.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Log Student Concern Modal */}
      {showConcernModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white">Create Student Concern</h3>
              <button onClick={() => setShowConcernModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateConcern} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Select Student</label>
                <select value={concernStudentId} onChange={e => setConcernStudentId(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all">
                  <option value="" className="bg-slate-900 text-white">Select Ward Student</option>
                  {wards.map(w => (
                    <option key={w.uid} value={w.uid} className="bg-slate-900 text-white">{w.fullName || w.name} ({w.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Category</label>
                  <select value={concernCategory} onChange={e => setConcernCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all">
                    <option value="Attendance" className="bg-slate-900 text-white">Attendance</option>
                    <option value="Academic Performance" className="bg-slate-900 text-white">Academic Performance</option>
                    <option value="Internal Marks" className="bg-slate-900 text-white">Internal Marks</option>
                    <option value="Backlog" className="bg-slate-900 text-white">Backlog</option>
                    <option value="Career Guidance" className="bg-slate-900 text-white">Career Guidance</option>
                    <option value="Placement" className="bg-slate-900 text-white">Placement</option>
                    <option value="Personal Guidance" className="bg-slate-900 text-white">Personal Guidance</option>
                    <option value="Behaviour" className="bg-slate-900 text-white">Behaviour</option>
                    <option value="Other" className="bg-slate-900 text-white">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Priority</label>
                  <select value={concernPriority} onChange={e => setConcernPriority(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all">
                    <option value="Low" className="bg-slate-900 text-white">Low</option>
                    <option value="Medium" className="bg-slate-900 text-white">Medium</option>
                    <option value="High" className="bg-slate-900 text-white">High</option>
                    <option value="Critical" className="bg-slate-900 text-white">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Concern Title</label>
                <input type="text" value={concernTitle} onChange={e => setConcernTitle(e.target.value)} required placeholder="e.g., Attendance drop below 65%" className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Description & Details</label>
                <textarea value={concernDescription} onChange={e => setConcernDescription(e.target.value)} rows="3" placeholder="Provide detailed observation or concern details..." className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-medium placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all resize-none"></textarea>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Follow-up Date</label>
                <input type="date" value={concernFollowUp} onChange={e => setConcernFollowUp(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowConcernModal(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg border border-purple-400/30">Create Concern</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// 2. COUNSELLING WARDS DIRECTORY & COMPLETE PROFILE VIEW
const WardsDirectory = ({ counsellor }) => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalTab, setModalTab] = useState('PROFILE'); // PROFILE | ACADEMIC | COUNSELLING | ACTIONS
  const [academicProgress, setAcademicProgress] = useState(null);
  const [riskHistory, setRiskHistory] = useState([]);
  const [activeAssign, setActiveAssign] = useState(null);

  useEffect(() => {
    const fetchWards = async () => {
      setLoading(true);
      const assign = await mockDB.getFacultyWardAssignment(counsellor?.uid || counsellor?.id || counsellor?.email);
      setActiveAssign(assign || null);

      const resolvedDept = assign?.department || counsellor?.wardCounsellorDepartment || counsellor?.assignedBranch || counsellor?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
      const resolvedSem = assign?.semester || counsellor?.semester || 'Semester 6';

      const res = await mockDB.getWardsForCounsellor(counsellor.uid, resolvedDept, resolvedSem);
      setWards(res);
      setLoading(false);
    };
    fetchWards();
  }, [counsellor]);

  const handleOpenStudentModal = async (student) => {
    setSelectedStudent(student);
    setModalTab('PROFILE');
    const prog = await mockDB.getStudentAcademicProgress(student);
    setAcademicProgress(prog);
    const riskHist = await mockDB.getStudentRiskHistory(student);
    setRiskHistory(riskHist);
  };

  const filteredWards = wards.filter(w => {
    const query = search.toLowerCase();
    const nameMatch = (w.fullName || w.name || '').toLowerCase().includes(query) || (w.rollNumber || '').toLowerCase().includes(query);
    const att = w.attendancePercentage || w.attendance || 80;
    const riskLevel = att < 65 ? 'High Risk' : att < 75 ? 'Warning' : 'Good';
    const riskMatch = riskFilter === 'All' || riskLevel === riskFilter;
    const sectionMatch = sectionFilter === 'All' || (w.section || 'A').toUpperCase() === sectionFilter.toUpperCase();
    return nameMatch && riskMatch && sectionMatch;
  });

  const resolvedDept = activeAssign?.department || counsellor?.wardCounsellorDepartment || counsellor?.assignedBranch || counsellor?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
  const resolvedSem = activeAssign?.semester || counsellor?.semester || 'Semester 6';

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">Loading ward directory...</div>;

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Header & Search/Filters */}
      <div className="p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white">Counselling Wards Roster</h2>
            <p className="text-xs text-gray-400">{resolvedDept} • {resolvedSem} (Cross-Section Access)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or roll..." className="pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all" />
            </div>
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="p-2 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all">
              <option value="All" className="bg-slate-900 text-white">All Sections (A, B, C)</option>
              <option value="A" className="bg-slate-900 text-white">Section A</option>
              <option value="B" className="bg-slate-900 text-white">Section B</option>
              <option value="C" className="bg-slate-900 text-white">Section C</option>
            </select>
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="p-2 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all">
              <option value="All" className="bg-slate-900 text-white">All Risk Levels</option>
              <option value="Good" className="bg-slate-900 text-white">🟢 Good (&gt;=75%)</option>
              <option value="Warning" className="bg-slate-900 text-white">🟡 Warning (65-74.99%)</option>
              <option value="High Risk" className="bg-slate-900 text-white">🔴 High Risk (&lt;65%)</option>
            </select>
          </div>
        </div>

        {/* Wards Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md w-full max-w-full overflow-x-hidden">
          <table className="w-full text-left text-xs font-semibold text-gray-200 border-collapse table-fixed">
            <thead className="bg-white/5 uppercase text-[10px] text-gray-400 tracking-wider border-b border-white/10">
              <tr>
                <th className="w-[16%] p-3 sm:p-4">Roll Number</th>
                <th className="w-[26%] p-3 sm:p-4">Student Name</th>
                <th className="w-[16%] p-3 sm:p-4">Branch</th>
                <th className="w-[10%] p-3 sm:p-4 text-center">Section</th>
                <th className="w-[11%] p-3 sm:p-4 text-center">Attendance</th>
                <th className="w-[10%] p-3 sm:p-4 text-center">Status</th>
                <th className="w-[11%] p-3 sm:p-4 text-center">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWards.map((w) => {
                const att = w.attendancePercentage || w.attendance || 80;
                const riskLevel = att < 65 ? 'High Risk' : att < 75 ? 'Warning' : 'Good';
                const status = att > 82 ? 'Improving' : att < 70 ? 'Declining' : 'Stable';
                return (
                  <tr key={w.uid} onClick={() => handleOpenStudentModal(w)} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="p-3 sm:p-4 font-mono font-bold text-cyan-300 whitespace-normal break-words">{w.rollNumber || '22KBN-CS001'}</td>
                    <td className="p-3 sm:p-4 font-extrabold text-white whitespace-normal break-words">
                      <div className="flex items-center gap-2 min-w-0">
                        {w.profilePhotoUrl ? (
                          <img src={w.profilePhotoUrl} alt={w.fullName} className="w-7 h-7 rounded-lg object-cover border border-white/10 shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-300 font-black text-xs flex items-center justify-center border border-purple-500/30 shrink-0">
                            {(w.fullName || w.name || 'S').substring(0, 1)}
                          </div>
                        )}
                        <span className="truncate">{w.fullName || w.name}</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 font-bold text-purple-300 whitespace-normal break-words">{w.department || resolvedDept}</td>
                    <td className="p-3 sm:p-4 text-center font-mono font-bold text-cyan-300">
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10.5px]">
                        Sec {w.section || 'A'}
                      </span>
                    </td>
                    <td className={`p-3 sm:p-4 text-center font-black ${att < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>{att}%</td>
                    <td className="p-3 sm:p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black inline-block ${status === 'Improving' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : status === 'Declining' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                        {status === 'Improving' ? '🟢 Improving' : status === 'Declining' ? '🔴 Declining' : '🔵 Stable'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black inline-block ${riskLevel === 'High Risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : riskLevel === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                        {riskLevel === 'High Risk' ? '🔴 High Risk' : riskLevel === 'Warning' ? '🟡 Warning' : '🟢 Good'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Complete View Modal (4 Tabs) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-2xl w-full p-6 space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                {selectedStudent.profilePhotoUrl ? (
                  <img src={selectedStudent.profilePhotoUrl} alt={selectedStudent.fullName} className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/30" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-300 font-black text-lg flex items-center justify-center border-2 border-purple-500/30">
                    {(selectedStudent.fullName || selectedStudent.name || 'S').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black text-white">{selectedStudent.fullName || selectedStudent.name}</h3>
                  <p className="text-xs text-purple-300 font-bold">{selectedStudent.rollNumber || '22KBN-CS001'} • {selectedStudent.department}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* 4 Tabs Selector */}
            <div className="flex border-b border-white/10 gap-4 text-xs font-black">
              {['PROFILE', 'ACADEMIC', 'COUNSELLING', 'ACTIONS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`pb-2 border-b-2 transition-all uppercase tracking-wider ${modalTab === tab ? 'border-purple-400 text-purple-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {modalTab === 'PROFILE' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Semester & Section</span>
                    <span className="font-extrabold text-white">{selectedStudent.semester || 'Semester 6'} — {selectedStudent.section || 'Section A'}</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Email Address</span>
                    <span className="font-extrabold text-purple-300">{selectedStudent.email || `${selectedStudent.rollNumber}@kbn.edu`}</span>
                  </div>
                </div>
              </div>
            )}

            {modalTab === 'ACADEMIC' && academicProgress && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Attendance %</span>
                    <span className="text-lg font-black text-emerald-400">{selectedStudent.attendancePercentage || selectedStudent.attendance || 80}%</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Internal Marks</span>
                    <span className="text-lg font-black text-purple-300">{academicProgress.internalMarks}</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Backlogs</span>
                    <span className="text-lg font-black text-rose-400">{academicProgress.backlogs}</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-500/10 rounded-2xl flex items-center justify-between border border-purple-500/20">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-300 block">Performance Trajectory</span>
                    <span className="text-xs text-gray-200">Prev Sem: {academicProgress.previousSemester}% → Curr Sem: {academicProgress.currentSemester}%</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-black text-xs">
                    {academicProgress.status === 'Improving' ? '🟢 Improving' : academicProgress.status === 'Declining' ? '🔴 Declining' : '🔵 Stable'}
                  </span>
                </div>
              </div>
            )}

            {modalTab === 'COUNSELLING' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-black text-white">Student Risk History Timeline</h4>
                <div className="space-y-2">
                  {riskHistory.map((rh, i) => (
                    <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-purple-300">{rh.date}</span>
                        <p className="text-[10.5px] text-gray-400">{rh.notes}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-white block">Att: {rh.attendance}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${rh.risk === 'High Risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>{rh.risk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalTab === 'ACTIONS' && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => alert('Log Session Triggered')} className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs text-center shadow-lg border border-purple-400/30">
                  + Log Counselling Session
                </button>
                <button onClick={() => alert('Follow-up Scheduled')} className="p-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs text-center border border-white/10">
                  + Schedule Follow-up
                </button>
              </div>
            )}

            <div className="text-right pt-3 border-t border-white/10">
              <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// 3. ADVANCED MONTHLY REPORT COMPILER
const CounsellorReports = ({ counsellor }) => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      const summary = await mockDB.getMonthlyWardSummary(counsellor.uid, 'June', '2026');
      const wards = await mockDB.getWardsForCounsellor(counsellor.uid, counsellor.department);
      setReport({ summary, wards });
    };
    fetchReport();
  }, [counsellor]);

  if (!report) return <div className="p-8 text-center text-slate-400 text-xs">Generating monthly report...</div>;

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-white">Advanced Monthly Ward Mentoring Report</h2>
            <p className="text-xs text-gray-400">Institutional summary for KBN College • Department of {counsellor.department || 'Branch'}</p>
          </div>
          <button onClick={() => window.print()} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg border border-purple-400/30 flex items-center gap-1.5">
            <Printer size={16} />
            <span>Print / Export PDF</span>
          </button>
        </div>

        {/* Report Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Wards</span>
            <span className="text-xl font-black text-white">{report.summary.totalWards}</span>
          </div>
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Avg Attendance</span>
            <span className="text-xl font-black text-emerald-400">{report.summary.averageAttendance}%</span>
          </div>
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Sessions Conducted</span>
            <span className="text-xl font-black text-purple-300">{report.summary.counsellingSessions}</span>
          </div>
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Improved Wards</span>
            <span className="text-xl font-black text-emerald-400">{report.summary.improvedStudents}</span>
          </div>
        </div>

        {/* Ward Roster Summary Table */}
        <h3 className="text-sm font-black text-white">Ward Student Roster & Risk Summary</h3>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md w-full max-w-full overflow-x-hidden">
          <table className="w-full text-left text-xs font-semibold text-gray-200 border-collapse table-fixed">
            <thead className="bg-white/5 uppercase text-[10px] text-gray-400 tracking-wider border-b border-white/10">
              <tr>
                <th className="w-[18%] p-3">Roll Number</th>
                <th className="w-[30%] p-3">Student Name</th>
                <th className="w-[13%] p-3 text-center">Att %</th>
                <th className="w-[13%] p-3 text-center">Marks</th>
                <th className="w-[13%] p-3 text-center">Backlogs</th>
                <th className="w-[13%] p-3 text-center">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {report.wards.map((w) => {
                const att = w.attendancePercentage || w.attendance || 80;
                const risk = att < 65 ? 'High Risk' : att < 75 ? 'Warning' : 'Good';
                return (
                  <tr key={w.uid} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-300 whitespace-normal break-words">{w.rollNumber || '22KBN-CS001'}</td>
                    <td className="p-3 font-extrabold text-white whitespace-normal break-words">{w.fullName || w.name}</td>
                    <td className="p-3 text-center font-black text-emerald-400">{att}%</td>
                    <td className="p-3 text-center font-bold text-purple-300">84 / 100</td>
                    <td className="p-3 text-center font-bold text-rose-400">{att < 65 ? 2 : att < 75 ? 1 : 0}</td>
                    <td className="p-3 text-center font-black">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black inline-block ${risk === 'High Risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : risk === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                        {risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// 5. COUNSELLOR LEAVES (STUDENT LEAVE APPROVALS FOR ASSIGNED BRANCH)
const CounsellorLeaves = ({ counsellor }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semFilter, setSemFilter] = useState('ALL');
  const [secFilter, setSecFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Rejection Modal
  const [rejectionModalLeave, setRejectionModalLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { showToast } = useAuth();

  // Resolved Counsellor Academic Scope
  const assignedBranch = counsellor.assignedBranch || counsellor.branch || counsellor.department || 'CSE';
  const assignedSemester = counsellor.assignedSemester || counsellor.semester || 'Semester 6';
  const assignedSection = counsellor.assignedSection || counsellor.section || 'Section A';

  const loadLeaves = async () => {
    try {
      setLoading(true);
      // Pass counsellor object to mockDB.getLeaves to enforce academic scoping
      const res = await mockDB.getLeaves('counsellor', counsellor.uid, counsellor);
      setLeaves(res);
    } catch (err) {
      console.error("Error loading leave applications:", err);
      showToast('Could not load student leave requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [counsellor]);

  const handleApprove = async (leaveId) => {
    try {
      await mockDB.reviewLeave(leaveId, 'Approved', 'Approved by Ward Counsellor', counsellor);
      showToast('Student leave application approved successfully.', 'success');
      loadLeaves();
    } catch (err) {
      console.error(err);
      showToast('Action failed. Please try again.', 'error');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      showToast('Rejection reason is required before rejecting leave.', 'warning');
      return;
    }
    try {
      await mockDB.reviewLeave(
        rejectionModalLeave.leaveId || rejectionModalLeave.id,
        'Rejected',
        rejectionReason.trim(),
        counsellor
      );
      showToast('Student leave application rejected.', 'success');
      setRejectionModalLeave(null);
      setRejectionReason('');
      loadLeaves();
    } catch (err) {
      console.error(err);
      showToast('Action failed. Please try again.', 'error');
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Filtered Applications
  const filteredLeaves = leaves.filter(l => {
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (l.studentName || l.applicantName || '').toLowerCase();
      const roll = (l.rollNumber || '').toLowerCase();
      const reason = (l.reason || '').toLowerCase();
      if (!name.includes(q) && !roll.includes(q) && !reason.includes(q)) return false;
    }

    // Department Filter
    if (deptFilter !== 'ALL') {
      const d = (l.department || l.branch || '').toUpperCase();
      if (!d.includes(deptFilter.toUpperCase())) return false;
    }

    // Semester Filter
    if (semFilter !== 'ALL') {
      const s = (l.semester || '').toUpperCase();
      if (!s.includes(semFilter.toUpperCase())) return false;
    }

    // Section Filter
    if (secFilter !== 'ALL') {
      const sec = (l.section || '').toUpperCase();
      if (!sec.includes(secFilter.toUpperCase())) return false;
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      const st = (l.status || '').toLowerCase();
      if (st !== statusFilter.toLowerCase()) return false;
    }

    return true;
  });

  // Calculate Stat Counts
  const pendingCount = leaves.filter(l => (l.status || '').toLowerCase() === 'pending').length;
  const approvedCount = leaves.filter(l => (l.status || '').toLowerCase() === 'approved').length;
  const rejectedCount = leaves.filter(l => (l.status || '').toLowerCase() === 'rejected').length;
  const totalCount = leaves.length;

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Scope Banner & Header */}
      <div className="p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-white">Ward Counsellor Student Leave Desk</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-[11px] font-extrabold uppercase">
                Branch: {assignedBranch}
              </span>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-[11px] font-extrabold uppercase">
                Semester: {assignedSemester}
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-extrabold uppercase">
                Section: {assignedSection}
              </span>
            </div>
          </div>

          <button onClick={loadLeaves} className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all border border-white/10">
            <RefreshCw size={14} />
            <span>Refresh List</span>
          </button>
        </div>

        {/* 4 Counter Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase block tracking-wider opacity-80">Pending Review</span>
              <span className="text-2xl font-black">{pendingCount}</span>
            </div>
            <Clock size={24} className="opacity-40" />
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase block tracking-wider opacity-80">Approved</span>
              <span className="text-2xl font-black">{approvedCount}</span>
            </div>
            <CheckCircle size={24} className="opacity-40" />
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase block tracking-wider opacity-80">Rejected</span>
              <span className="text-2xl font-black">{rejectedCount}</span>
            </div>
            <XCircle size={24} className="opacity-40" />
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase block tracking-wider opacity-80">Total Wards Scope</span>
              <span className="text-2xl font-black">{totalCount}</span>
            </div>
            <FileText size={24} className="opacity-40" />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Student / Roll..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Departments</option>
            <option value="CSE" className="bg-slate-900 text-white">CSE</option>
            <option value="ECE" className="bg-slate-900 text-white">ECE</option>
            <option value="EEE" className="bg-slate-900 text-white">EEE</option>
            <option value="AI & ML" className="bg-slate-900 text-white">AI & ML</option>
            <option value="Civil" className="bg-slate-900 text-white">Civil</option>
            <option value="Mechanical" className="bg-slate-900 text-white">Mechanical</option>
            <option value="MCA" className="bg-slate-900 text-white">MCA</option>
            <option value="BCA" className="bg-slate-900 text-white">BCA</option>
          </select>

          {/* Semester Filter */}
          <select
            value={semFilter}
            onChange={e => setSemFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Semesters</option>
            <option value="Semester 1" className="bg-slate-900 text-white">Semester 1</option>
            <option value="Semester 2" className="bg-slate-900 text-white">Semester 2</option>
            <option value="Semester 3" className="bg-slate-900 text-white">Semester 3</option>
            <option value="Semester 4" className="bg-slate-900 text-white">Semester 4</option>
            <option value="Semester 5" className="bg-slate-900 text-white">Semester 5</option>
            <option value="Semester 6" className="bg-slate-900 text-white">Semester 6</option>
            <option value="Semester 7" className="bg-slate-900 text-white">Semester 7</option>
            <option value="Semester 8" className="bg-slate-900 text-white">Semester 8</option>
          </select>

          {/* Section Filter */}
          <select
            value={secFilter}
            onChange={e => setSecFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Sections</option>
            <option value="Section A" className="bg-slate-900 text-white">Section A</option>
            <option value="Section B" className="bg-slate-900 text-white">Section B</option>
            <option value="Section C" className="bg-slate-900 text-white">Section C</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
            <option value="Pending" className="bg-slate-900 text-white">Pending</option>
            <option value="Approved" className="bg-slate-900 text-white">Approved</option>
            <option value="Rejected" className="bg-slate-900 text-white">Rejected</option>
            <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
          </select>

        </div>
      </div>

      {/* Applications List */}
      <div className="p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-lg space-y-4">
        {loading ? (
          <div className="py-16 text-center text-gray-400 animate-pulse font-bold">Loading student leave requests from Firestore...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-bold">No student leave requests match your criteria or scope.</div>
        ) : (
          <div className="space-y-4">
            {filteredLeaves.map((l) => {
              const numDays = calculateDays(l.startDate || l.fromDate, l.endDate || l.toDate);
              const isPending = (l.status || '').toLowerCase() === 'pending';
              const isApproved = (l.status || '').toLowerCase() === 'approved';
              const isRejected = (l.status || '').toLowerCase() === 'rejected';

              return (
                <div key={l.leaveId || l.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                  
                  {/* Top Bar: Student info + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm uppercase shadow">
                        {l.studentName ? l.studentName.charAt(0) : 'S'}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{l.studentName || l.applicantName || 'Student'}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-gray-400 font-semibold mt-0.5">
                          <span>Roll: <strong className="text-cyan-300 font-mono">{l.rollNumber || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>Dept: <strong className="text-purple-300">{l.department || l.branch || 'CSE'}</strong></span>
                          <span>•</span>
                          <span>Sem: <strong className="text-gray-200">{l.semester || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>Sec: <strong className="text-gray-200">{l.section || 'A'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <span className={`self-start sm:self-center px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      isRejected ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {l.status || 'Pending'}
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-black/40 p-3.5 rounded-xl border border-white/10 text-[11px]">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-gray-400 block">Leave Type</span>
                      <span className="font-extrabold text-white">{l.leaveType || 'Casual Leave'}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-gray-400 block">Duration</span>
                      <span className="font-bold text-gray-300">{l.startDate || l.fromDate} to {l.endDate || l.toDate}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-gray-400 block">Number of Days</span>
                      <span className="font-black text-purple-300">{numDays} {numDays === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-gray-400 block">Applied Date</span>
                      <span className="font-semibold text-gray-400">{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Reason for Leave</span>
                    <p className="text-xs text-gray-200 font-medium leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">
                      {l.reason}
                    </p>
                  </div>

                  {/* Approval Details Banner */}
                  {isApproved && (
                    <div className="text-[11px] text-emerald-300 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                      <span>Approved by: <strong>{l.approvedByName || counsellor.fullName || 'Ward Counsellor'}</strong></span>
                      <span className="text-[10px] text-gray-400 font-normal">{l.approvedAt ? new Date(l.approvedAt).toLocaleString() : ''}</span>
                    </div>
                  )}

                  {/* Rejection Details Banner */}
                  {isRejected && (
                    <div className="text-[11px] text-rose-300 font-bold bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Rejected by: <strong>{l.rejectedByName || counsellor.fullName || 'Ward Counsellor'}</strong></span>
                        <span className="text-[10px] text-gray-400 font-normal">{l.rejectedAt ? new Date(l.rejectedAt).toLocaleString() : ''}</span>
                      </div>
                      <div className="text-gray-200 font-medium bg-black/40 p-2 rounded-lg border border-rose-500/30">
                        <span className="text-rose-400 font-black mr-1">Rejection Reason:</span>
                        {l.rejectionReason || l.remarks || 'No reason provided.'}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Pending */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setRejectionModalLeave(l);
                          setRejectionReason('');
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(l.leaveId || l.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                      >
                        Approve
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectionModalLeave && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase">Reject Student Leave Application</h3>
              <button onClick={() => setRejectionModalLeave(null)} className="text-gray-400 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            
            <p className="text-xs text-gray-300 font-normal">
              Rejecting application for: <strong className="text-white">{rejectionModalLeave.studentName || rejectionModalLeave.applicantName}</strong> ({rejectionModalLeave.rollNumber})
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2 uppercase">
                  Rejection Reason *
                </label>
                <textarea
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explicit reason for rejection (required)..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none font-medium resize-none text-xs transition-all"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRejectionModalLeave(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
