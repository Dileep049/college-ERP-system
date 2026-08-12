import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS, BRANCH_SUBJECT_MAP } from '../services/firebase';
import { 
  LayoutDashboard,
  UserCheck,
  TrendingUp,
  BookOpen,
  CheckSquare,
  FileText,
  Award,
  Briefcase,
  ClipboardList,
  Calendar,
  Users,
  Activity,
  Bell,
  Search,
  Plus,
  Download,
  Printer,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Filter,
  Eye,
  MessageSquare,
  ShieldCheck,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const ParentPortal = ({ subPage }) => {
  const { user } = useAuth();
  const [childProfile, setChildProfile] = useState(null);
  const [loadingChild, setLoadingChild] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchChild = async () => {
      setLoadingChild(true);
      try {
        if (user?.childUid) {
          const profile = await mockDB.getStudentProfile(user.childUid);
          if (isMounted && profile) setChildProfile(profile);
        } else {
          const students = await mockDB.getStudents(user?.department || 'CSE');
          const matched = students.find(s => s.rollNumber === user?.childRollNumber) || students[0];
          if (isMounted) {
            setChildProfile(matched || {
              fullName: 'Dileep Kumar',
              studentName: 'Dileep Kumar',
              rollNumber: '23KBN-CS104',
              department: 'CSE',
              semester: 'VI',
              section: 'A',
              attendancePercentage: 84.5,
              cgpa: 8.4
            });
          }
        }
      } catch (err) {
        console.error("Failed to load child profile:", err);
      }
      if (isMounted) setLoadingChild(false);
    };

    fetchChild();
    return () => { isMounted = false; };
  }, [user]);

  if (loadingChild) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 animate-pulse text-xs font-bold uppercase">
        Loading Student Ward Profile...
      </div>
    );
  }

  if (subPage === 'dashboard') return <ParentDashboard parent={user} child={childProfile} />;
  if (subPage === 'my-ward') return <ParentMyWard parent={user} child={childProfile} />;
  if (subPage === 'academic-overview') return <ParentAcademicOverview child={childProfile} />;
  if (subPage === 'attendance') return <ParentAttendance child={childProfile} />;
  if (subPage === 'marks') return <ParentMarks child={childProfile} />;
  if (subPage === 'results') return <ParentResults child={childProfile} />;
  if (subPage === 'assignments') return <ParentAssignments child={childProfile} />;
  if (subPage === 'notes') return <ParentNotes child={childProfile} />;
  if (subPage === 'leaves') return <ParentLeaves child={childProfile} />;
  if (subPage === 'counsellor') return <ParentWardCounsellor child={childProfile} />;
  if (subPage === 'faculty') return <ParentFaculty child={childProfile} />;
  if (subPage === 'counselling') return <ParentCounselling parent={user} child={childProfile} />;
  if (subPage === 'meetings') return <ParentMeetings parent={user} child={childProfile} />;
  if (subPage === 'placements') return <ParentPlacements child={childProfile} />;
  if (subPage === 'monthly-report') return <ParentMonthlyReport child={childProfile} />;
  if (subPage === 'notifications') return <ParentNotifications parent={user} child={childProfile} />;
  if (subPage === 'profile') return <ParentProfile parent={user} child={childProfile} />;
  
  return <ParentDashboard parent={user} child={childProfile} />;
};

// 1. PARENT ACADEMIC COMMAND CENTER (DASHBOARD)
const ParentDashboard = ({ parent, child }) => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState(84.5);
  const [internalMarks, setInternalMarks] = useState(38);
  const [assignments, setAssignments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [drives, setDrives] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const dept = child?.department || 'CSE';
        const sem = child?.semester || 'VI';

        const [assData, leaveData, drivesData, meetData] = await Promise.all([
          mockDB.getAssignments(dept, sem),
          mockDB.getStudentLeaves(child?.uid),
          mockDB.getPlacementDrives('student'),
          mockDB.getCounsellingMeetings('student', child?.uid)
        ]);

        setAssignments(assData);
        setLeaves(leaveData);
        setDrives(drivesData);
        setMeetings(meetData);
        setAttendance(parseFloat(child?.attendancePercentage || child?.attendance || 84.5));
        setInternalMarks(parseFloat(child?.internalMarks || 38));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [child]);

  const latestLeave = leaves[0];
  const pendingAssignments = assignments.filter(a => !a.submissions?.some(s => s.studentId === child?.uid));

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
            <span>ACADEMIA</span> • <span>Parent Portal Hub</span>
          </div>
          <h1 className="text-2xl font-black font-display tracking-tight">{parent?.fullName || 'Parent / Guardian'}</h1>
          <p className="text-xs text-slate-300 font-medium">
            Ward: <span className="underline font-black text-indigo-200">{child?.fullName || child?.studentName}</span> ({child?.rollNumber}) • {child?.department} (Sem {child?.semester} - Sec {child?.section || 'A'})
          </p>
        </div>
        <span className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-[11px] font-extrabold text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 size={14} /> Linked Ward Monitoring Active
        </span>
      </div>

      {/* Live Alerts Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {attendance >= 75 ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            <div><span className="font-black block text-xs">🟢 Attendance Satisfactory ({attendance}%)</span><span className="text-[10px]">Ward satisfies mandatory 75% rule.</span></div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
            <AlertTriangle size={18} className="shrink-0 text-rose-500" />
            <div><span className="font-black block text-xs">🔴 Attendance Alert ({attendance}%)</span><span className="text-[10px]">Below 75%. Ward Counsellor notified.</span></div>
          </div>
        )}

        {pendingAssignments.length > 0 ? (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 flex items-center gap-2.5">
            <Clock size={18} className="shrink-0 text-amber-500" />
            <div><span className="font-black block text-xs">🟡 {pendingAssignments.length} Assignment(s) Due</span><span className="text-[10px]">Ward has pending class homework.</span></div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-blue-500" />
            <div><span className="font-black block text-xs">🟢 All Homework Submitted</span><span className="text-[10px]">Zero pending assignments.</span></div>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 flex items-center gap-2.5">
          <Briefcase size={18} className="shrink-0 text-purple-500" />
          <div><span className="font-black block text-xs">🔵 {drives.length} Corporate Recruitment Drive(s)</span><span className="text-[10px]">Available for ward's branch.</span></div>
        </div>
      </div>

      {/* 8 Main Command Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Attendance Rate</span>
            <CheckSquare size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{attendance}%</p>
          <span className="text-[9.5px] text-slate-400 font-bold block">{attendance >= 75 ? 'Good Standing' : 'Warning Level'}</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Internal Marks</span>
            <FileText size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{internalMarks} / 50</p>
          <span className="text-[9.5px] text-blue-600 font-bold block">Internal Score</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Current CGPA</span>
            <Award size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{child?.cgpa || 8.4}</p>
          <span className="text-[9.5px] text-indigo-600 font-bold block">Academic Record</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Active Backlogs</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{child?.backlogs || 0}</p>
          <span className="text-[9.5px] text-slate-400 font-bold block">Backlog Count</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Pending Assignments</span>
            <Briefcase size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500">{pendingAssignments.length}</p>
          <span className="text-[9.5px] text-amber-600 font-bold block">Homework Due</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Leave Status</span>
            <Calendar size={16} className="text-purple-500" />
          </div>
          <p className="text-sm font-black text-purple-600 mt-2">{latestLeave ? latestLeave.status : 'None Filed'}</p>
          <span className="text-[9.5px] text-slate-400 font-bold block">Ward Counsellor Review</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Counselling</span>
            <UserCheck size={16} className="text-teal-500" />
          </div>
          <p className="text-sm font-black text-teal-600 mt-2">{meetings.length > 0 ? 'Active Session' : 'Assigned'}</p>
          <span className="text-[9.5px] text-slate-400 font-bold block">Ward Mentor Connected</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Placements</span>
            <Award size={16} className="text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{drives.length}</p>
          <span className="text-[9.5px] text-sky-600 font-bold block">Available Drives</span>
        </div>
      </div>

    </div>
  );
};

// 2. MY WARD PROFILE
const ParentMyWard = ({ parent, child }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold max-w-2xl">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Linked Ward Official Academic Profile</h3>
        <p className="text-xs text-slate-400">Student information connected to your parent account</p>
      </div>

      <div className="flex items-center gap-5">
        <img src={child?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'} alt="" className="w-20 h-20 rounded-3xl object-cover border-2 border-blue-500" />
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9.5px] font-black uppercase">Enrolled Student</span>
          <h4 className="text-base font-black text-slate-900 dark:text-white">{child?.fullName || child?.studentName}</h4>
          <p className="text-xs text-blue-600 font-bold">Roll No: {child?.rollNumber}</p>
          <p className="text-[10.5px] text-slate-500">{child?.department} (Semester {child?.semester} - Section {child?.section || 'A'})</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4 text-slate-700 dark:text-slate-300">
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Assigned Ward Counsellor</span> <span className="font-black text-xs text-blue-600">Dr. Bruce Banner</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Department HOD</span> <span className="font-black text-xs">Prof. Alan Turing</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Institution Principal</span> <span className="font-black text-xs">Dr. Charles Xavier</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Academic Year</span> <span className="font-bold text-xs">{child?.academicYear || '2025-2026'}</span></div>
      </div>
    </div>
  );
};

// 3. ACADEMIC OVERVIEW
const ParentAcademicOverview = ({ child }) => {
  const dept = child?.department || 'CSE';
  const subjects = BRANCH_SUBJECT_MAP[dept] || ['Neural Networks', 'Cloud Computing', 'AI Lab'];

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black font-display">Ward Academic Performance Overview</h2>
          <p className="text-xs text-blue-100 mt-1">{child?.fullName} • {dept} (Semester {child?.semester})</p>
        </div>
        <span className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-2xl font-black text-xs">Performance: Stable 🟢</span>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">Ward Enrolled Subjects ({subjects.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map((sub, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9.5px] font-black uppercase">CS-60{idx + 1}</span>
              <h4 className="font-black text-slate-900 dark:text-white text-xs">{sub}</h4>
              <p className="text-[10.5px] text-slate-400">4 Credits • Theory + Lab</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. ATTENDANCE MONITORING
const ParentAttendance = ({ child }) => {
  const att = parseFloat(child?.attendancePercentage || child?.attendance || 84.5);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Ward Attendance Monitoring Ledger (Read-Only)</h3>
          <p className="text-xs text-slate-400">Daily subject attendance updated by class faculty</p>
        </div>
        <span className="text-2xl font-black text-emerald-600">{att}%</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3 text-center">Total Classes</th>
              <th className="px-5 py-3 text-center">Present</th>
              <th className="px-5 py-3 text-center">Absent</th>
              <th className="px-5 py-3 text-right">Attendance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
              <td className="px-5 py-4 font-black text-slate-900 dark:text-white">Neural Networks & Deep Learning</td>
              <td className="px-5 py-4 text-center">45</td>
              <td className="px-5 py-4 text-center text-emerald-600">40</td>
              <td className="px-5 py-4 text-center text-rose-500">5</td>
              <td className="px-5 py-4 text-right font-black text-emerald-600">88.8%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. INTERNAL MARKS
const ParentMarks = ({ child }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Ward Internal Marks Evaluation (Read-Only)</h3>
        <p className="text-xs text-slate-400">Mid 1 (20) + Mid 2 (20) + Assignments (10) = Total (50 Marks)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3 text-center">Mid 1 (20)</th>
              <th className="px-5 py-3 text-center">Mid 2 (20)</th>
              <th className="px-5 py-3 text-center">Assignments (10)</th>
              <th className="px-5 py-3 text-center">Total (50)</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
              <td className="px-5 py-4 font-black text-slate-900 dark:text-white">Neural Networks & Deep Learning</td>
              <td className="px-5 py-4 text-center">17</td>
              <td className="px-5 py-4 text-center">18</td>
              <td className="px-5 py-4 text-center">9</td>
              <td className="px-5 py-4 text-center font-black text-blue-600">44 / 50</td>
              <td className="px-5 py-4 text-right"><span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9.5px] uppercase">Excellent</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 6. SEMESTER RESULTS
const ParentResults = ({ child }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Ward Official Semester Grade Ledger</h3>
          <p className="text-xs text-slate-400">Cumulative CGPA: <span className="font-bold text-blue-600">{child?.cgpa || 8.4}</span> • Active Backlogs: 0</p>
        </div>
        <Award size={24} className="text-amber-500" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3 text-center">Credits</th>
              <th className="px-5 py-3 text-center">Grade</th>
              <th className="px-5 py-3 text-center">Grade Point</th>
              <th className="px-5 py-3 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
              <td className="px-5 py-4 font-black text-slate-900 dark:text-white">Design & Analysis of Algorithms</td>
              <td className="px-5 py-4 text-center">4</td>
              <td className="px-5 py-4 text-center text-blue-600 font-black">A+</td>
              <td className="px-5 py-4 text-center">9.0</td>
              <td className="px-5 py-4 text-right"><span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9.5px]">PASS</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 7. ASSIGNMENTS
const ParentAssignments = ({ child }) => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getAssignments(child?.department || 'CSE', child?.semester || 'VI');
      setAssignments(data);
    };
    load();
  }, [child]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Ward Class Assignments Status</h3>
        <p className="text-xs text-slate-400">Read-only assignment submission tracker</p>
      </div>

      <div className="space-y-3">
        {assignments.map(a => (
          <div key={a.id || a.assignmentId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9.5px] font-black uppercase">{a.subject}</span>
              <h4 className="font-black text-slate-900 dark:text-white text-xs mt-1">{a.title}</h4>
              <span className="text-[9.5px] text-rose-500 font-bold block mt-1">Due Date: {a.dueDate}</span>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl font-bold">Completed</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. STUDY NOTES
const ParentNotes = ({ child }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getNotes(child?.department || 'CSE', child?.semester || 'VI');
      setNotes(data);
    };
    load();
  }, [child]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Faculty Study Notes Published for Ward</h3>
        <p className="text-xs text-slate-400">Class notes & study material repository</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map(n => (
          <div key={n.noteId || n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 rounded text-[9.5px] font-black uppercase">{n.subject}</span>
            <h4 className="font-black text-slate-900 dark:text-white text-xs">{n.topic || n.title}</h4>
            <p className="text-[10.5px] text-slate-500">{n.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 9. STUDENT LEAVE
const ParentLeaves = ({ child }) => {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getStudentLeaves(child?.uid);
      setLeaves(data);
    };
    load();
  }, [child]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Ward Leave Application History</h3>
        <p className="text-xs text-slate-400">Approved/Rejected by Ward Counsellor</p>
      </div>

      {leaves.length === 0 ? (
        <div className="py-12 text-center text-slate-400">No leave applications filed by ward.</div>
      ) : (
        <div className="space-y-3">
          {leaves.map(l => (
            <div key={l.id || l.leaveId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-xs">{l.leaveType}</h4>
                <p className="text-[10.5px] text-slate-500">{l.fromDate} to {l.toDate} • Reason: {l.reason}</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-[9.5px] font-black uppercase ${
                l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                {l.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 10. WARD COUNSELLOR
const ParentWardCounsellor = ({ child }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold max-w-xl">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Assigned Branch Ward Counsellor</h3>
        <p className="text-xs text-slate-400">Official academic mentor assigned for ward</p>
      </div>

      <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" alt="" className="w-16 h-16 rounded-2xl object-cover border" />
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9.5px] font-black uppercase">Branch Ward Counsellor</span>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">Dr. Bruce Banner</h4>
          <p className="text-xs text-slate-500">Department of {child?.department || 'CSE'}</p>
          <p className="text-[10.5px] font-mono text-blue-600">counsellor.cse@kbn.edu</p>
        </div>
      </div>
    </div>
  );
};

// 11. FACULTY
const ParentFaculty = ({ child }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Department Teaching Faculty Directory</h3>
        <p className="text-xs text-slate-400">Faculty members instructing ward's department</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="" className="w-12 h-12 rounded-2xl object-cover border" />
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs">Dr. Bruce Banner</h4>
            <p className="text-[10.5px] text-blue-600 font-bold">Associate Professor • Neural Networks</p>
            <p className="text-[10px] text-slate-400">bruce.banner@kbn.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 12. COUNSELLING
const ParentCounselling = ({ parent, child }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Ward Counselling Session Remarks</h3>
        <p className="text-xs text-slate-400">Parent-visible summaries logged by Ward Counsellor</p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
        <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 rounded text-[9.5px] font-black uppercase">Session Summary</span>
        <h4 className="font-black text-slate-900 dark:text-white text-xs mt-1">Mid-Term Performance & Career Guidance</h4>
        <p className="text-[10.5px] text-slate-500">Ward maintains satisfactory attendance and is preparing for campus placement drives.</p>
      </div>
    </div>
  );
};

// 13. PARENT MEETINGS
const ParentMeetings = ({ parent, child }) => {
  const [requesting, setRequesting] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const { showToast } = useAuth();

  const handleRequestMeeting = async (e) => {
    e.preventDefault();
    if (!meetingDate || !purpose) return;

    try {
      setRequesting(true);
      await mockDB.createCounsellingMeeting({
        counsellorId: 'counsellor-cse',
        studentId: child?.uid,
        studentName: child?.fullName || child?.studentName,
        parentName: parent?.fullName || 'Parent',
        date: meetingDate,
        time: meetingTime || '11:00 AM',
        title: purpose,
        status: 'Pending Review'
      });

      showToast('Parent meeting request submitted to Ward Counsellor.', 'success');
      setPurpose('');
    } catch (_) {
      showToast('Could not request meeting.', 'error');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Request Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">Request Meeting with Ward Counsellor</h3>

        <form onSubmit={handleRequestMeeting} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-black block mb-1">Preferred Date</label>
              <input type="date" required value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold" />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-black block mb-1">Preferred Time Slot</label>
              <select value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                <option value="10:00 AM">10:00 - 10:30 AM</option>
                <option value="11:30 AM">11:30 - 12:00 PM</option>
                <option value="03:00 PM">03:00 - 03:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-black block mb-1">Purpose / Topics to Discuss</label>
            <textarea rows={2} required placeholder="Academic progress, attendance, or career guidance..." value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium" />
          </div>

          <button type="submit" disabled={requesting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow">
            {requesting ? 'Submitting...' : 'Send Meeting Request'}
          </button>
        </form>
      </div>

    </div>
  );
};

// 14. PLACEMENTS
const ParentPlacements = ({ child }) => {
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getPlacementDrives('student');
      setDrives(data);
    };
    load();
  }, [child]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Corporate Recruitment Drives for Ward's Branch</h3>
        <p className="text-xs text-slate-400">Campus placement opportunities published by Placement Cell</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drives.map(d => (
          <div key={d.id || d.driveId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-black text-slate-900 dark:text-white text-xs">{d.companyName}</h4>
            <p className="text-xs text-blue-600 font-bold">{d.jobRole || d.role}</p>
            <p className="text-[10.5px] text-slate-500">Package: <span className="font-black text-emerald-600">{d.package || d.salaryPackage}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 15. MONTHLY ACADEMIC REPORT
const ParentMonthlyReport = ({ child }) => {
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState('2026');

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Monthly Ward Academic Summary</h3>
          <p className="text-xs text-slate-400">Compiled report for {month} {year}</p>
        </div>

        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold">
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold">
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
          <span className="text-[9.5px] text-slate-400 uppercase font-black">Monthly Attendance</span>
          <p className="text-xl font-black text-emerald-600">84.5%</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
          <span className="text-[9.5px] text-slate-400 uppercase font-black">Internal Score</span>
          <p className="text-xl font-black text-blue-600">38 / 50</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
          <span className="text-[9.5px] text-slate-400 uppercase font-black">Homework Submitted</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">100%</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
          <span className="text-[9.5px] text-slate-400 uppercase font-black">Academic Risk</span>
          <p className="text-xl font-black text-emerald-600">Good Standing</p>
        </div>
      </div>
    </div>
  );
};

// 16. NOTIFICATIONS
const ParentNotifications = ({ parent, child }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Parent Official Notifications & Broadcast Feed</h3>
        <p className="text-xs text-slate-400">Important academic alerts & meeting notifications</p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
        <Bell size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Attendance updated for {child?.fullName || 'Ward'}: 84.5% overall compliance.</p>
          <span className="text-[9.5px] text-slate-400 block mt-1">Today</span>
        </div>
      </div>
    </div>
  );
};

// 17. PARENT PROFILE
const ParentProfile = ({ parent, child }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold max-w-xl">
      <div className="border-b pb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Parent Profile & Account Details</h3>
        <p className="text-xs text-slate-400">Read-only account information linked to student ward</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Parent Name</span> <span className="font-black text-xs text-slate-900 dark:text-white">{parent?.fullName || 'Parent / Guardian'}</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Linked Student Ward</span> <span className="font-black text-xs text-blue-600">{child?.fullName || child?.studentName}</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Email Address</span> <span className="font-bold text-xs">{parent?.email || 'parent@kbn.edu'}</span></div>
        <div><span className="text-slate-400 block text-[9.5px] uppercase font-bold">Mobile Contact</span> <span className="font-bold text-xs">{parent?.mobile || '+91 9876543210'}</span></div>
      </div>
    </div>
  );
};
