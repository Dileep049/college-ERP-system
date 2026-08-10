import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_SEMESTERS, KBN_BRANCHES, BRANCH_SUBJECT_MAP } from '../services/firebase';
import jsPDF from 'jspdf';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Download, 
  Check, 
  X, 
  FileText, 
  Filter, 
  UserCheck,
  Plus,
  RefreshCw,
  Award,
  AlertTriangle,
  Bell,
  Lock,
  Clock,
  Briefcase,
  ClipboardList,
  Building2,
  Settings,
  Printer,
  ChevronRight,
  Eye,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  Search,
  UserX,
  MessageSquare
} from 'lucide-react';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6366F1'];

export const HODPortal = ({ subPage }) => {
  const { user } = useAuth();
  const [activeSubPage, setActiveSubPage] = useState(subPage || 'dashboard');
  const [notifications, setNotifications] = useState([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState(null);

  useEffect(() => {
    if (subPage) setActiveSubPage(subPage);
  }, [subPage]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.department) {
        const notifs = [
          { id: 'n1', title: 'Pending Leave Request', message: 'Prof. Ravi Kumar applied for 2 days Casual Leave.', time: '10 mins ago', type: 'leave' },
          { id: 'n2', title: 'Low Attendance Alert', message: '3 students in Section A fell below 75% attendance.', time: '1 hour ago', type: 'alert' },
          { id: 'n3', title: 'Workload Warning', message: 'Prof. Arun is assigned 26 hours/week (Overloaded).', time: '3 hours ago', type: 'workload' }
        ];
        setNotifications(notifs);
      }
    };
    fetchNotifications();
  }, [user]);

  const renderSubPage = () => {
    switch (activeSubPage) {
      case 'dashboard':
        return <HODDashboard hod={user} onNavigate={setActiveSubPage} setQuickActionModal={setQuickActionModal} />;
      case 'overview':
        return <DepartmentOverview hod={user} />;
      case 'faculty-directory':
      case 'faculty':
        return <FacultyDirectory hod={user} />;
      case 'ward-counsellors':
        return <WardCounsellorManagement hod={user} />;
      case 'workload':
        return <FacultyWorkloadManagement hod={user} />;
      case 'attendance-monitoring':
        return <AttendanceMonitoring hod={user} />;
      case 'attendance-unlocks':
        return <HODAttendanceUnlocks hod={user} />;
      case 'faculty-leaves':
      case 'leaves':
        return <FacultyLeaveReview hod={user} />;
      case 'academic-performance':
        return <AcademicPerformance hod={user} />;
      case 'curriculum':
        return <HODCurriculum hod={user} />;
      case 'announcements':
        return <DepartmentAnnouncements hod={user} />;
      case 'reports':
        return <HODReports hod={user} />;
      case 'audit-logs':
        return <HODAuditLogs hod={user} />;
      case 'settings':
        return <HODSettings hod={user} />;
      default:
        return <HODDashboard hod={user} onNavigate={setActiveSubPage} setQuickActionModal={setQuickActionModal} />;
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Top Header Bar with Notifications & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Department Administration
            </span>
            <span className="text-xs text-slate-400 font-semibold">• {user?.department || 'CSE Department'}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            HOD Command Portal — {user?.fullName || 'Dr. Alan Turing'}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubPage('ward-counsellors')}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5"
          >
            <UserCheck size={14} />
            <span>Assign Counsellor</span>
          </button>
          <button
            onClick={() => setActiveSubPage('faculty-leaves')}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <Calendar size={14} />
            <span>Review Leaves</span>
          </button>
          <button
            onClick={() => setActiveSubPage('reports')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} />
            <span>Reports</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all relative"
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Department Alerts</span>
                  <button onClick={() => setShowNotifDrawer(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main SubPage Content */}
      {renderSubPage()}
    </div>
  );
};

// -------------------------------------------------------------
// 1. HOD DASHBOARD
// -------------------------------------------------------------
const HODDashboard = ({ hod, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await mockDB.getHODStats(hod?.department);
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, [hod]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        ))}
      </div>
    );
  }

  const kpiCards = [
    { title: 'Total Faculty', value: stats?.totalFaculty || 25, change: '+2 this year', icon: Users, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Total Students', value: stats?.totalStudents || 620, change: 'Across 4 sections', icon: BookOpen, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Total Wards', value: stats?.totalWards || 620, change: '3 Ward Counsellors', icon: UserCheck, color: 'text-sky-500 bg-sky-500/10' },
    { title: 'Present Today', value: stats?.presentToday || 542, change: '87.4% present', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Absent Today', value: stats?.absentToday || 78, change: '12.6% absent', icon: XCircle, color: 'text-rose-500 bg-rose-500/10' },
    { title: 'Overall Attendance %', value: `${stats?.attendancePercentage}%`, change: '+1.8% vs last month', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-600/10' },
    { title: 'Faculty on Leave Today', value: stats?.facultyOnLeaveToday || 3, change: 'Coverage arranged', icon: Calendar, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Pending Leave Requests', value: stats?.pendingLeaves || 6, change: 'Requires HOD review', icon: AlertCircle, color: 'text-rose-600 bg-rose-600/10', action: () => onNavigate('faculty-leaves') },
    { title: 'Approved Leaves (Month)', value: stats?.approvedLeavesThisMonth || 14, change: 'Processed', icon: Check, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Rejected Leaves (Month)', value: stats?.rejectedLeavesThisMonth || 4, change: 'Exam conflicts', icon: X, color: 'text-slate-500 bg-slate-500/10' }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Display Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.action}
              className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between ${kpi.action ? 'cursor-pointer hover:border-purple-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Hub */}
      <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold flex items-center gap-2">
            <Briefcase size={16} /> HOD Quick Action Center
          </h3>
          <span className="text-[10px] text-purple-200 font-medium">Departmental Control Shortcuts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5">
          <button onClick={() => onNavigate('ward-counsellors')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-xs font-bold transition-all border border-white/10">
            👥 Assign Ward Counsellor
          </button>
          <button onClick={() => onNavigate('faculty-leaves')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-xs font-bold transition-all border border-white/10">
            📝 Review Faculty Leaves
          </button>
          <button onClick={() => onNavigate('reports')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-xs font-bold transition-all border border-white/10">
            📊 Generate Monthly Report
          </button>
          <button onClick={() => onNavigate('attendance-unlocks')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-xs font-bold transition-all border border-white/10">
            🔓 Unlock Attendance
          </button>
          <button onClick={() => onNavigate('attendance-monitoring')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-xs font-bold transition-all border border-white/10">
            ⚠️ Low Attendance Students
          </button>
          <button onClick={() => onNavigate('workload')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-xs font-bold transition-all border border-white/10">
            💼 Faculty Workload
          </button>
          <button onClick={() => onNavigate('announcements')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-xs font-bold transition-all border border-white/10">
            📢 Post Announcement
          </button>
        </div>
      </div>

      {/* Attendance Graph & Section Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Daily Department Attendance Roster</h3>
              <p className="text-[11px] text-slate-400">Present vs Absent student count by day</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">87.4% Avg</span>
          </div>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.graphs.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">Section-wise Attendance</h3>
            <p className="text-[11px] text-slate-400 mb-4">Department sections strength distribution</p>
            <div className="space-y-3">
              {stats?.graphs.sectionWise.map((sec) => (
                <div key={sec.section} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{sec.section}</span>
                    <span className="text-purple-600 dark:text-purple-400">{sec.Attendance}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${sec.Attendance}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{sec.Students} Students Assigned</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => onNavigate('overview')} className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1">
            <span>Full Department Overview</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. DEPARTMENT OVERVIEW
// -------------------------------------------------------------
const DepartmentOverview = ({ hod }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getHODStats(hod?.department);
      setStats(data);
    };
    load();
  }, [hod]);

  return (
    <div className="space-y-6">
      {/* Department Metadata Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
            {stats?.academicYear} • {stats?.currentSemester}
          </span>
          <h2 className="text-2xl font-black mt-2">{hod?.department || 'B.Sc. Computer Science (CS)'}</h2>
          <p className="text-xs text-purple-200 mt-1">Head of Department: {hod?.fullName || 'Dr. Alan Turing'}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[10px] text-purple-200 block">Total Faculty</span>
            <span className="text-lg font-black">{stats?.totalFaculty}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[10px] text-purple-200 block">Total Students</span>
            <span className="text-lg font-black">{stats?.totalStudents}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[10px] text-purple-200 block">Sections</span>
            <span className="text-lg font-black">{stats?.deptSectionsCount}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[10px] text-purple-200 block">Counsellors</span>
            <span className="text-lg font-black">{stats?.counsellorsCount}</span>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Attendance Performance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-emerald-500">87.4%</p>
              <span className="text-[10px] text-slate-400">Department aggregate rate</span>
            </div>
            <div className="w-16 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ value: 87.4 }, { value: 12.6 }]} innerRadius={18} outerRadius={26} dataKey="value">
                    <Cell fill="#10B981" />
                    <Cell fill="#E2E8F0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Academic Performance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-purple-600">78.5 Avg</p>
              <span className="text-[10px] text-slate-400">Internal marks average</span>
            </div>
            <Award className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Curriculum Progress</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-indigo-500">76.5%</p>
              <span className="text-[10px] text-slate-400">Syllabus units completed</span>
            </div>
            <ClipboardList className="text-indigo-500" size={32} />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-4">Monthly Attendance Trend</h3>
          <div className="h-56 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.graphs.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis domain={[50, 100]} stroke="#94A3B8" />
                <Tooltip />
                <Line type="monotone" dataKey="Attendance" stroke="#8B5CF6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-4">Faculty Workload Distribution</h3>
          <div className="h-56 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.graphs.workload}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="faculty" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. BRANCH-LEVEL WARD COUNSELLOR MANAGEMENT VIEW (1 BRANCH = 1 ACTIVE COUNSELLOR)
// -------------------------------------------------------------
const WardCounsellorManagement = ({ hod }) => {
  const [counsellors, setCounsellors] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // active | history
  const [deptList, setDeptList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReplacementConfirmModal, setShowReplacementConfirmModal] = useState(false);
  const [selectedWardSection, setSelectedWardSection] = useState(null);
  const [wardStudents, setWardStudents] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    department: hod?.department || 'B.Sc. Computer Science (CS)',
    facultyId: ''
  });

  const [selectedFacultyInfo, setSelectedFacultyInfo] = useState(null);
  const [totalDeptStudentCount, setTotalDeptStudentCount] = useState(181);
  const [existingActiveCounsellor, setExistingActiveCounsellor] = useState(null);

  const loadData = async () => {
    const list = await mockDB.getWardCounsellors(hod?.department);
    setCounsellors(list.filter(c => c.status === 'Active'));
    setHistoryList(list.filter(c => c.status === 'Inactive'));

    const depts = await mockDB.getDepartmentsList();
    setDeptList(depts);
  };

  useEffect(() => {
    loadData();
  }, [hod]);

  // Load faculty when department changes in form
  useEffect(() => {
    const fetchDeptFaculty = async () => {
      if (formData.department) {
        const facs = await mockDB.getFacultyByDepartment(formData.department);
        setFacultyList(facs);
        if (facs.length > 0 && !facs.some(f => f.uid === formData.facultyId)) {
          setFormData(prev => ({ ...prev, facultyId: facs[0].uid }));
          setSelectedFacultyInfo(facs[0]);
        }

        const count = await mockDB.getDepartmentStudentCount(formData.department);
        setTotalDeptStudentCount(count);

        const activeC = await mockDB.getActiveBranchWardCounsellor(formData.department);
        setExistingActiveCounsellor(activeC || null);
      }
    };
    fetchDeptFaculty();
  }, [formData.department]);

  // Update selected faculty info
  useEffect(() => {
    const fac = facultyList.find(f => f.uid === formData.facultyId);
    setSelectedFacultyInfo(fac || null);
  }, [formData.facultyId, facultyList]);

  const handleAssignClick = (e) => {
    e.preventDefault();
    if (!formData.facultyId) return alert('Please select a faculty member.');

    if (existingActiveCounsellor && existingActiveCounsellor.facultyId !== formData.facultyId) {
      // Show Replacement Confirmation Modal
      setShowReplacementConfirmModal(true);
    } else {
      executeAssignment();
    }
  };

  const executeAssignment = async () => {
    await mockDB.assignBranchWardCounsellor(
      formData.department,
      formData.facultyId,
      hod
    );
    setShowAssignModal(false);
    setShowReplacementConfirmModal(false);
    loadData();
  };

  const handleRemove = async (counsellor) => {
    if (confirm(`Are you sure you want to remove ${counsellor.facultyName} as Branch Ward Counsellor for ${counsellor.department}?`)) {
      await mockDB.removeWardCounsellorV2(counsellor.id, hod);
      loadData();
    }
  };

  const handleViewWards = async (counsellor) => {
    setSelectedWardSection(counsellor);
    const students = await mockDB.getWardsBySection(counsellor.department || hod?.department, 'Section A');
    setWardStudents(students);
  };

  const activeBranchCounsellor = counsellors.length > 0 ? counsellors[0] : null;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Branch Ward Counsellor Management</h2>
          <p className="text-xs text-slate-400">One Branch = One Active Ward Counsellor across all department sections</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold mr-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-xl uppercase text-[10px] tracking-wider transition-all ${activeTab === 'active' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
            >
              Active Branch Assignment ({counsellors.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl uppercase text-[10px] tracking-wider transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
            >
              History ({historyList.length})
            </button>
          </div>

          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Assign Branch Ward Counsellor</span>
          </button>
        </div>
      </div>

      {/* Branch Ward Counsellor Summary Card */}
      {activeBranchCounsellor && activeTab === 'active' && (
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
              {activeBranchCounsellor.facultyName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950">
                Active Branch Ward Counsellor
              </span>
              <h3 className="text-xl font-black mt-1">{activeBranchCounsellor.facultyName}</h3>
              <p className="text-xs text-purple-200">{activeBranchCounsellor.designation} • Department of {activeBranchCounsellor.department}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-purple-100 font-semibold">
                <span>Total Ward Students: <strong className="text-white font-black">{activeBranchCounsellor.wardStudentsCount} Wards</strong></span>
                <span>Sections Covered: <strong className="text-white font-black">A, B, C, D</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleViewWards(activeBranchCounsellor)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/20"
            >
              View All Ward Students
            </button>
            <button
              onClick={() => {
                setFormData({
                  department: activeBranchCounsellor.department,
                  facultyId: activeBranchCounsellor.facultyId
                });
                setShowAssignModal(true);
              }}
              className="px-4 py-2 bg-white text-purple-900 hover:bg-purple-50 rounded-xl text-xs font-extrabold shadow-lg"
            >
              Change Counsellor
            </button>
          </div>
        </div>
      )}

      {/* Active Branch Ward Counsellors Table */}
      {activeTab === 'active' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Department / Branch</th>
                <th className="p-4">Active Ward Counsellor</th>
                <th className="p-4">Faculty ID</th>
                <th className="p-4">Designation</th>
                <th className="p-4 text-center">Sections</th>
                <th className="p-4 text-center">Total Ward Students</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {counsellors.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{c.department}</td>
                  <td className="p-4 font-bold text-purple-600 dark:text-purple-400">
                    {c.facultyName}
                    <span className="text-[10px] text-slate-400 block font-normal">{c.facultyEmail}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-500">{c.facultyId}</td>
                  <td className="p-4 text-slate-500">{c.designation}</td>
                  <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">Section A, B, C, D</td>
                  <td className="p-4 text-center font-black text-purple-600">{c.wardStudentsCount} Wards</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold">
                      Active
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleViewWards(c)}
                      className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg hover:bg-indigo-500/20 text-[11px] font-bold"
                    >
                      View Wards
                    </button>
                    <button
                      onClick={() => {
                        setFormData({
                          department: c.department,
                          facultyId: c.facultyId
                        });
                        setShowAssignModal(true);
                      }}
                      className="px-2.5 py-1 bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500/20 text-[11px] font-bold"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => handleRemove(c)}
                      className="px-2.5 py-1 bg-rose-500/10 text-rose-600 rounded-lg hover:bg-rose-500/20 text-[11px] font-bold"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignment History Table */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
          {historyList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No historical ward counsellor assignments found.</div>
          ) : (
            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-4">Faculty</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Assigned Date</th>
                  <th className="p-4">Removed Date</th>
                  <th className="p-4">Assigned By</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyList.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{h.facultyName}</td>
                    <td className="p-4 font-bold text-purple-600">{h.department}</td>
                    <td className="p-4 text-slate-500">{h.assignedDate || (h.assignedAt ? new Date(h.assignedAt).toLocaleDateString() : 'N/A')}</td>
                    <td className="p-4 text-slate-500">{h.removedAt ? new Date(h.removedAt).toLocaleDateString() : 'Replaced'}</td>
                    <td className="p-4 text-slate-400">{h.assignedByName || 'HOD'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-bold">
                        Inactive
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Ward Student Roster Drawer */}
      {selectedWardSection && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Department Ward Roster — {selectedWardSection.department}
                </h3>
                <p className="text-xs text-slate-400">
                  Active Ward Counsellor: {selectedWardSection.facultyName} ({selectedWardSection.wardStudentsCount} Ward Students across Sections A, B, C, D)
                </p>
              </div>
              <button onClick={() => setSelectedWardSection(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {/* Ward Student Table */}
            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[9px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Section</th>
                  <th className="p-3 text-center">Attendance</th>
                  <th className="p-3 text-center">Marks</th>
                  <th className="p-3">Fee Status</th>
                  <th className="p-3">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {wardStudents.map((st) => (
                  <tr key={st.rollNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold">{st.rollNumber}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                    <td className="p-3 font-bold text-purple-600">Section A</td>
                    <td className={`p-3 text-center font-extrabold ${st.attendance < 75 ? 'text-rose-500' : 'text-emerald-600'}`}>{st.attendance}%</td>
                    <td className="p-3 text-center font-bold">{st.internalMarks}/100</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${st.feeStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {st.feeStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${st.academicRisk === 'High' ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {st.academicRisk} Risk
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Branch Ward Counsellor Form Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAssignClick} className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Assign Branch Ward Counsellor</h3>
                <p className="text-xs text-slate-400">One Branch = One Active Ward Counsellor across all sections</p>
              </div>
              <button type="button" onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Department Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Branch / Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {deptList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Faculty Dropdown (Filtered to Selected Department) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Faculty ({facultyList.length} Active)</label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {facultyList.length === 0 ? (
                    <option value="">No faculty members available for {formData.department}</option>
                  ) : (
                    facultyList.map((f) => (
                      <option key={f.uid} value={f.uid}>
                        {f.fullName} — {f.designation || 'Faculty'} ({f.employeeId || f.uid})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Branch Summary Preview Card */}
              {selectedFacultyInfo && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-purple-600 dark:text-purple-400 block">Department Assignment Preview</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{formData.department}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-[9.5px] font-black rounded-md">1 Branch = 1 Counsellor</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300 pt-1 border-t border-purple-500/20">
                    <div>Selected Faculty: <strong className="text-slate-900 dark:text-white">{selectedFacultyInfo.fullName}</strong></div>
                    <div>Designation: <strong>{selectedFacultyInfo.designation || 'Associate Professor'}</strong></div>
                    <div>Total Dept Students: <strong className="text-purple-600 dark:text-purple-400">{totalDeptStudentCount} Wards</strong></div>
                    <div>Total Sections: <strong>Section A, B, C, D</strong></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-500/20"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Ward Counsellor Replacement Confirmation Modal */}
      {showReplacementConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle size={22} />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Existing Ward Counsellor Found</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              <strong>{formData.department}</strong> already has an active Branch Ward Counsellor:
              <br />
              <span className="text-purple-600 font-extrabold block my-1">
                {existingActiveCounsellor?.facultyName} ({existingActiveCounsellor?.designation})
              </span>
              Do you want to replace the existing Ward Counsellor with <strong>{selectedFacultyInfo?.fullName}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReplacementConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeAssignment}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20"
              >
                Replace Ward Counsellor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 4. FACULTY LEAVE REVIEW & CONFLICT DETECTION
// -------------------------------------------------------------
const FacultyLeaveReview = ({ hod }) => {
  const [leaves, setLeaves] = useState([]);
  const [tab, setTab] = useState('pending'); // pending | approved | rejected | all
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [rejectionModalLeave, setRejectionModalLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadLeaves = async () => {
    const list = await mockDB.getFacultyLeavesForHOD(hod?.department);
    setLeaves(list);
  };

  useEffect(() => {
    loadLeaves();
  }, [hod]);

  const handleOpenLeaveModal = async (leave) => {
    setSelectedLeave(leave);
    const warnings = await mockDB.checkLeaveConflicts(leave.facultyId, leave.startDate || leave.fromDate, leave.endDate || leave.toDate, hod?.department);
    setConflicts(warnings);
  };

  const handleApprove = async (leaveId) => {
    await mockDB.reviewFacultyLeave(leaveId, 'approved', '', hod);
    setSelectedLeave(null);
    loadLeaves();
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return alert('Please enter rejection reason.');
    await mockDB.reviewFacultyLeave(rejectionModalLeave.leaveId, 'rejected', rejectionReason, hod);
    setRejectionModalLeave(null);
    setRejectionReason('');
    setSelectedLeave(null);
    loadLeaves();
  };

  const filteredLeaves = leaves.filter(l => tab === 'all' ? true : l.status === tab);

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Faculty Leave Review</h2>
          <p className="text-xs text-slate-400">Review faculty leave applications with automatic conflict detection</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          {['pending', 'approved', 'rejected', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-xl uppercase text-[10px] tracking-wider transition-all ${
                tab === t ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Leaves List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
        {filteredLeaves.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No leave requests found under "{tab}" category.</div>
        ) : (
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Faculty</th>
                <th className="p-4">Leave Type</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Days</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Applied On</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeaves.map((l) => (
                <tr key={l.leaveId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {l.facultyName}
                    <span className="text-[10px] text-slate-400 block font-normal">{l.facultyCode}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px]">
                      {l.leaveType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{l.startDate || l.fromDate} to {l.endDate || l.toDate}</td>
                  <td className="p-4 font-black">{l.numberOfDays}</td>
                  <td className="p-4 text-slate-500 max-w-xs truncate">{l.reason}</td>
                  <td className="p-4 text-slate-400">{l.appliedDate}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                      l.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {l.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenLeaveModal(l)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold text-xs hover:bg-purple-700"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review & Conflict Detection Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Leave Application Review</h3>
              <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Faculty Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLeave.facultyName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Leave Type</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLeave.leaveType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">From Date - To Date</span>
                  <span className="font-bold">{selectedLeave.startDate || selectedLeave.fromDate} to {selectedLeave.endDate || selectedLeave.toDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Duration</span>
                  <span className="font-bold">{selectedLeave.numberOfDays} Days</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Reason for Leave</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedLeave.reason}
                </p>
              </div>

              {/* Automatic Leave Conflict Detection Panel */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1.5">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Automatic Leave Conflict Detection Analysis
                </span>
                {conflicts.map((w, idx) => (
                  <p key={idx} className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">{w}</p>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectionModalLeave(selectedLeave)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => handleApprove(selectedLeave.leaveId)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  Approve Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Reason Input Modal */}
      {rejectionModalLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-rose-600">Rejection Reason Required</h3>
              <button type="button" onClick={() => setRejectionModalLeave(null)} className="text-slate-400"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500">Please provide reason for rejecting leave request of {rejectionModalLeave.facultyName}:</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Leave cannot be approved because internal examinations are scheduled during this period."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectionModalLeave(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl">Confirm Rejection</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 5. MONTHLY REPORTS & EXPORT (PDF, EXCEL, PRINT)
// -------------------------------------------------------------
const HODReports = ({ hod }) => {
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState('2026');
  const [facultyFilter, setFacultyFilter] = useState('All');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      const data = await mockDB.getMonthlyFacultyLeaveReport(hod?.department, month, year, facultyFilter);
      setReportData(data);
    };
    fetchReport();
  }, [hod, month, year, facultyFilter]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Department Monthly Leave Report — ${month} ${year}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Department: ${hod?.department || 'CSE'} | HOD: ${hod?.fullName || 'Dr. Alan Turing'}`, 14, 28);
    
    let y = 40;
    doc.text(`Total Requests: ${reportData?.summary.totalRequests} | Approved: ${reportData?.summary.approved} | Rejected: ${reportData?.summary.rejected}`, 14, y);
    y += 10;
    
    reportData?.tableData.forEach((row, i) => {
      doc.text(`${i + 1}. ${row.facultyName} - Leaves: ${row.totalLeaves} (Approved: ${row.approved}, Rejected: ${row.rejected}, Pending: ${row.pending}) Days: ${row.totalDays}`, 14, y);
      y += 8;
    });

    doc.save(`HOD_Leave_Report_${month}_${year}.pdf`);
  };

  const handleExportExcel = () => {
    let csv = `Faculty,Total Leaves,Approved,Rejected,Pending,Total Days\n`;
    reportData?.tableData.forEach(row => {
      csv += `"${row.facultyName}",${row.totalLeaves},${row.approved},${row.rejected},${row.pending},${row.totalDays}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HOD_Leave_Report_${month}_${year}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Monthly Faculty Leave & Analytics Report</h2>
          <p className="text-xs text-slate-400">Generate, view, and export departmental leave statistics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold">
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <button onClick={handleExportPDF} className="px-3 py-2 bg-rose-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-500/20">
            <Download size={14} /> PDF
          </button>
          <button onClick={handleExportExcel} className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button onClick={handlePrint} className="px-3 py-2 bg-slate-700 text-white font-bold rounded-xl flex items-center gap-1.5">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] uppercase text-slate-400 block font-bold">Total Requests</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{reportData?.summary.totalRequests}</span>
        </div>
        <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-3xl border border-emerald-500/20">
          <span className="text-[10px] uppercase block font-bold">Approved</span>
          <span className="text-2xl font-black">{reportData?.summary.approved}</span>
        </div>
        <div className="p-4 bg-rose-500/10 text-rose-600 rounded-3xl border border-rose-500/20">
          <span className="text-[10px] uppercase block font-bold">Rejected</span>
          <span className="text-2xl font-black">{reportData?.summary.rejected}</span>
        </div>
        <div className="p-4 bg-amber-500/10 text-amber-600 rounded-3xl border border-amber-500/20">
          <span className="text-[10px] uppercase block font-bold">Pending</span>
          <span className="text-2xl font-black">{reportData?.summary.pending}</span>
        </div>
        <div className="p-4 bg-purple-500/10 text-purple-600 rounded-3xl border border-purple-500/20">
          <span className="text-[10px] uppercase block font-bold">Total Leave Days</span>
          <span className="text-2xl font-black">{reportData?.summary.totalDays}</span>
        </div>
        <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-3xl border border-indigo-500/20">
          <span className="text-[10px] uppercase block font-bold">Avg Days/Faculty</span>
          <span className="text-2xl font-black">{reportData?.summary.avgDaysPerFaculty}</span>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
        <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
            <tr>
              <th className="p-4">Faculty Name</th>
              <th className="p-4 text-center">Total Leaves</th>
              <th className="p-4 text-center">Approved</th>
              <th className="p-4 text-center">Rejected</th>
              <th className="p-4 text-center">Pending</th>
              <th className="p-4 text-center">Total Leave Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {reportData?.tableData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{row.facultyName}</td>
                <td className="p-4 text-center font-black">{row.totalLeaves}</td>
                <td className="p-4 text-center text-emerald-600 font-extrabold">{row.approved}</td>
                <td className="p-4 text-center text-rose-600 font-extrabold">{row.rejected}</td>
                <td className="p-4 text-center text-amber-600 font-extrabold">{row.pending}</td>
                <td className="p-4 text-center font-black text-purple-600">{row.totalDays} Days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. FACULTY WORKLOAD MANAGEMENT
// -------------------------------------------------------------
const FacultyWorkloadManagement = ({ hod }) => {
  const [workload, setWorkload] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getFacultyWorkload(hod?.department);
      setWorkload(data);
    };
    load();
  }, [hod]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Faculty Workload Management</h2>
        <p className="text-xs text-slate-400">Monitor teaching hours, assigned subjects, and workload statuses</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
        <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
            <tr>
              <th className="p-4">Faculty Member</th>
              <th className="p-4">Assigned Subjects</th>
              <th className="p-4 text-center">Classes / Week</th>
              <th className="p-4 text-center">Hours / Week</th>
              <th className="p-4 text-center">Attendance %</th>
              <th className="p-4 text-center">Leaves Taken</th>
              <th className="p-4 text-right">Workload Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {workload.map((f) => (
              <tr key={f.facultyId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{f.name}</td>
                <td className="p-4">{f.subjects.join(', ')}</td>
                <td className="p-4 text-center font-bold">{f.classesPerWeek}</td>
                <td className="p-4 text-center font-black">{f.hoursPerWeek} hrs</td>
                <td className="p-4 text-center text-emerald-600 font-extrabold">{f.attendance}%</td>
                <td className="p-4 text-center">{f.leavesTaken}</td>
                <td className="p-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    f.status === 'Overloaded' ? 'bg-rose-500/10 text-rose-600' :
                    f.status === 'High' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 7. ATTENDANCE MONITORING & LOW ATTENDANCE STUDENTS
// -------------------------------------------------------------
const AttendanceMonitoring = ({ hod }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Department Attendance Monitoring</h2>
        <p className="text-xs text-slate-400">Track student attendance rates and identify low attendance risk students (&lt;75%)</p>
      </div>

      <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-3">
        <h3 className="text-sm font-extrabold text-rose-600 flex items-center gap-2">
          <AlertCircle size={16} /> Students Below 75% Attendance Threshold
        </h3>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[9px] text-slate-400">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Section</th>
                <th className="p-3 text-center">Attendance</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-mono font-bold">CSE-2023-002</td>
                <td className="p-3 font-bold text-slate-900 dark:text-white">Avala Anand Babu</td>
                <td className="p-3">Section A</td>
                <td className="p-3 text-center text-rose-600 font-black">68.5%</td>
                <td className="p-3 text-right">
                  <button className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold text-xs">Add Remark</button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold">CSE-2023-006</td>
                <td className="p-3 font-bold text-slate-900 dark:text-white">Orsu Brahmaiah</td>
                <td className="p-3">Section C</td>
                <td className="p-3 text-center text-rose-600 font-black">71.0%</td>
                <td className="p-3 text-right">
                  <button className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold text-xs">Add Remark</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 8. ACADEMIC PERFORMANCE & CURRICULUM
// -------------------------------------------------------------
const AcademicPerformance = ({ hod }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await mockDB.getDepartmentAcademicPerformance(hod?.department);
      setData(res);
    };
    load();
  }, [hod]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Academic Performance Analytics</h2>
        <p className="text-xs text-slate-400">Department internal marks performance & section comparisons</p>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block font-bold">Overall Average</span>
          <span className="text-2xl font-black text-purple-600">{data?.avgInternalMarks} / 100</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block font-bold">Mid-1 Avg</span>
          <span className="text-2xl font-black text-blue-600">{data?.mid1Average}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block font-bold">Mid-2 Avg</span>
          <span className="text-2xl font-black text-indigo-600">{data?.mid2Average}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block font-bold">Assignments Avg</span>
          <span className="text-2xl font-black text-emerald-600">{data?.assignmentAverage}</span>
        </div>
      </div>
    </div>
  );
};

const HODCurriculum = ({ hod }) => {
  const [curr, setCurr] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDB.getCurriculumProgress(hod?.department);
      setCurr(data);
    };
    load();
  }, [hod]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Curriculum Progress Tracker</h2>
        <p className="text-xs text-slate-400">Track unit completion progress for all department subjects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {curr.map((item) => (
          <div key={item.id} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{item.subject}</h3>
              <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 text-[10px] font-bold rounded-lg">{item.progressPercentage}%</span>
            </div>
            <p className="text-xs text-slate-400">Faculty: {item.faculty}</p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${item.progressPercentage}%` }}></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>{item.completedUnits} / {item.totalUnits} Units Completed</span>
              <span className="text-emerald-600 font-bold">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 9. OTHER SECTIONS (Faculty Directory, Announcements, Audit Logs, Settings, Unlocks)
// -------------------------------------------------------------
const FacultyDirectory = ({ hod }) => {
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    setFaculty(users.filter(u => u.role === 'faculty'));
  }, [hod]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Department Faculty Directory</h2>
        <p className="text-xs text-slate-400">Complete listing of faculty members and their profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {faculty.map((f) => (
          <div key={f.uid} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
                {f.fullName[0]}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{f.fullName}</h3>
                <span className="text-[10px] text-slate-400 block">{f.designation || 'Faculty Member'}</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <p>Email: {f.email}</p>
              <p>ID: {f.employeeId || f.uid}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DepartmentAnnouncements = ({ hod }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', targetAudience: 'All Faculty', priority: 'High' });

  const load = async () => {
    const data = await mockDB.getDepartmentAnnouncements(hod?.department);
    setAnnouncements(data);
  };

  useEffect(() => { load(); }, [hod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mockDB.createDepartmentAnnouncement(formData, hod);
    setShowModal(false);
    setFormData({ title: '', description: '', targetAudience: 'All Faculty', priority: 'High' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Department Announcements</h2>
          <p className="text-xs text-slate-400">Publish notices to faculty, students, or specific section wards</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-2xl shadow-lg">
          + Create Announcement
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 text-[10px] font-bold rounded-lg">{a.targetAudience}</span>
              <span className="text-[10px] text-slate-400">{a.date}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{a.description}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 space-y-3 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Create Announcement</h3>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              required
            />
            <textarea
              rows={3}
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              required
            />
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="All Faculty">All Faculty</option>
              <option value="All Students">All Students</option>
              <option value="Ward Counsellors">Ward Counsellors</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">Post Notice</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const HODAttendanceUnlocks = ({ hod }) => {
  const [unlocks, setUnlocks] = useState([]);
  const [formData, setFormData] = useState({ facultyName: 'Prof. Ravi Kumar', subject: 'Machine Learning', date: '2026-08-10', period: 'Period 3', reason: 'Attendance correction' });

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('acad_attendance_edit_requests') || '[]');
    setUnlocks(list);
  }, []);

  const handleGrant = async (e) => {
    e.preventDefault();
    const newLog = {
      id: 'unlock-' + Math.random().toString(36).substr(2, 8),
      ...formData,
      unlockedBy: hod?.fullName || 'Dr. Alan Turing (HOD)',
      time: new Date().toLocaleString()
    };
    const updated = [newLog, ...unlocks];
    setUnlocks(updated);
    localStorage.setItem('acad_attendance_edit_requests', JSON.stringify(updated));

    await mockDB.logHODAudit('Attendance Unlocked', 'Attendance Unlocks', `Granted unlock to ${formData.facultyName} for ${formData.subject}`, hod);
    alert('Attendance unlock permission granted and logged to audit trail.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Attendance Unlock Management</h2>
        <p className="text-xs text-slate-400">Grant attendance modification permissions to faculty members</p>
      </div>

      <form onSubmit={handleGrant} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Grant Attendance Unlock</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <input type="text" value={formData.facultyName} onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700" placeholder="Faculty Name" />
          <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700" placeholder="Subject" />
          <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700" />
          <input type="text" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700" placeholder="Reason" />
        </div>
        <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">Grant Unlock</button>
      </form>
    </div>
  );
};

const HODAuditLogs = ({ hod }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await mockDB.getHODAuditLogs(hod?.department);
      setLogs(data);
    };
    fetchLogs();
  }, [hod]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">HOD Audit Logs</h2>
        <p className="text-xs text-slate-400">Security audit trail of all HOD actions and authorization events</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
        <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
            <tr>
              <th className="p-4">Date / Time</th>
              <th className="p-4">User</th>
              <th className="p-4">Module</th>
              <th className="p-4">Action</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <tr key={log.logId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-4 font-mono text-slate-400 text-[11px]">{new Date(log.date).toLocaleString()}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{log.user}</td>
                <td className="p-4"><span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 rounded-lg text-[10px] font-bold">{log.module}</span></td>
                <td className="p-4 font-bold text-indigo-600">{log.action}</td>
                <td className="p-4 text-slate-500">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HODSettings = ({ hod }) => {
  const [profile, setProfile] = useState({
    mobile: hod?.mobile || '9876543210',
    officeRoom: hod?.officeRoom || 'Room 304, Tech Block',
    officeHours: hod?.officeHours || 'Mon - Fri: 10:00 AM - 4:00 PM',
    profilePhotoUrl: hod?.profilePhotoUrl || null
  });

  const [stats, setStats] = useState({
    facultyCount: 25,
    studentCount: 620,
    sectionsCount: 4,
    wardCounsellorName: 'Prof. Ravi Kumar',
    attendancePercentage: 87.4,
    pendingLeavesCount: 6
  });

  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      const s = await mockDB.getHODProfileStats(hod?.department);
      setStats(s);
    };
    loadStats();
  }, [hod]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return alert('Invalid file format. Supported formats: JPG, JPEG, PNG, WEBP');
    }

    if (file.size > 5 * 1024 * 1024) {
      return alert('File size exceeds maximum limit of 5 MB.');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPhoto(reader.result);
      setShowPreviewModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    try {
      setIsSaving(true);
      await mockDB.updateHODProfile(hod.uid, { profilePhotoUrl: previewPhoto }, hod);
      setProfile(prev => ({ ...prev, profilePhotoUrl: previewPhoto }));
      setShowPreviewModal(false);
      showToast('Profile photo updated successfully!', 'success');
    } catch (_) {
      showToast('Failed to update profile photo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (confirm('Are you sure you want to remove your profile photo?')) {
      await mockDB.updateHODProfile(hod.uid, { profilePhotoUrl: null }, hod);
      setProfile(prev => ({ ...prev, profilePhotoUrl: null }));
      showToast('Profile photo removed.', 'info');
    }
  };

  const handleSaveProfileFields = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await mockDB.updateHODProfile(hod.uid, profile, hod);
      showToast('HOD profile details updated successfully!', 'success');
    } catch (_) {
      showToast('Could not save profile changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const hodInitials = hod?.fullName ? hod.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'AT';

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Profile Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Profile Photo / Default Initials Avatar */}
          <div className="relative group">
            {profile.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt="HOD Profile"
                className="w-20 h-20 rounded-3xl object-cover border-2 border-purple-500 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center border-2 border-purple-500 shadow-lg">
                {hodInitials}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md cursor-pointer">
              <Upload size={14} />
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{hod?.fullName || 'Dr. Alan Turing'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-black uppercase">
                HOD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{hod?.department || 'Computer Science and Engineering'}</p>
            <p className="text-xs font-mono text-purple-600 dark:text-purple-400 mt-1">{hod?.email || 'hod.cse@kbn.edu'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {profile.profilePhotoUrl && (
            <button
              onClick={handleRemovePhoto}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl font-bold text-xs"
            >
              Remove Photo
            </button>
          )}
          <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/20 cursor-pointer flex items-center gap-1.5">
            <Upload size={14} />
            <span>Change Profile Photo</span>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
          </label>
        </div>
      </div>

      {/* Department Summary Statistics */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl space-y-4">
        <h3 className="text-sm font-black text-purple-300 uppercase tracking-wider">Department Summary Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[9.5px] text-slate-300 block font-bold">Total Faculty</span>
            <span className="text-xl font-black">{stats.facultyCount}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[9.5px] text-slate-300 block font-bold">Total Students</span>
            <span className="text-xl font-black text-purple-300">{stats.studentCount}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[9.5px] text-slate-300 block font-bold">Sections</span>
            <span className="text-xl font-black">{stats.sectionsCount}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md col-span-2 sm:col-span-1">
            <span className="text-[9.5px] text-slate-300 block font-bold">Ward Counsellor</span>
            <span className="text-xs font-black text-emerald-300 truncate block mt-1">{stats.wardCounsellorName}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[9.5px] text-slate-300 block font-bold">Attendance %</span>
            <span className="text-xl font-black text-emerald-400">{stats.attendancePercentage}%</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-[9.5px] text-slate-300 block font-bold">Pending Leaves</span>
            <span className="text-xl font-black text-amber-300">{stats.pendingLeavesCount}</span>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <form onSubmit={handleSaveProfileFields} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit HOD Profile Information</h3>
          <p className="text-xs text-slate-400">Update contact details and office availability. Official role and department are read-only.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Read-Only Fields */}
          <div>
            <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Role (Read-Only)</label>
            <input
              type="text"
              value="Head of Department (HOD)"
              disabled
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Department (Read-Only)</label>
            <input
              type="text"
              value={hod?.department || 'Computer Science and Engineering (CSE)'}
              disabled
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Employee ID (Read-Only)</label>
            <input
              type="text"
              value={hod?.employeeId || 'HOD-CSE-01'}
              disabled
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Official Email (Read-Only)</label>
            <input
              type="text"
              value={hod?.email || 'hod.cse@kbn.edu'}
              disabled
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-bold cursor-not-allowed"
            />
          </div>

          {/* Editable Fields */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold mb-1">Mobile Number</label>
            <input
              type="text"
              value={profile.mobile}
              onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold mb-1">Office Room Location</label>
            <input
              type="text"
              value={profile.officeRoom}
              onChange={(e) => setProfile({ ...profile, officeRoom: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold mb-1">Office Hours / Availability</label>
            <input
              type="text"
              value={profile.officeHours}
              onChange={(e) => setProfile({ ...profile, officeHours: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Image Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Profile Photo Preview</h3>
            <div className="w-32 h-32 rounded-3xl overflow-hidden mx-auto border-4 border-purple-600 shadow-xl">
              <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Do you want to apply this image as your HOD profile photo?</p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePhoto}
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
