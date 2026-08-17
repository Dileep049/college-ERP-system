import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_SEMESTERS, KBN_BRANCHES, BRANCH_SUBJECT_MAP } from '../services/firebase';
import { AssignWardCounsellorModal } from '../components/AssignWardCounsellorModal';
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
        return <FacultyManagement hod={user} />;
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
    <div className="space-y-6 font-sans pb-12 bg-transparent min-h-screen text-white">
      {/* 1. ROYAL PURPLE GLASS HOD COMMAND BANNER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-xl border border-purple-500/30 p-5 md:p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/30 drop-shadow-md">
              GLOBAL ADMINISTRATION
            </span>
            <span className="text-xs text-purple-200 font-semibold drop-shadow-md">• ALL DEPARTMENTS</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white drop-shadow-lg mt-1.5 font-display">
            HOD Command Portal — {user?.fullName || 'Dr. Alan Turing'}
          </h1>
          <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">
            Real-time department oversight, faculty workload management & academic metrics
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveSubPage('ward-counsellors')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25 border border-purple-400/40 flex items-center gap-1.5 drop-shadow-md cursor-pointer hover:scale-[1.02]"
          >
            <UserCheck size={14} />
            <span>Assign Counsellor</span>
          </button>
          <button
            onClick={() => setActiveSubPage('faculty-leaves')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 border border-indigo-400/40 flex items-center gap-1.5 drop-shadow-md cursor-pointer hover:scale-[1.02]"
          >
            <Calendar size={14} />
            <span>Review Leaves</span>
          </button>
          <button
            onClick={() => setActiveSubPage('reports')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 border border-emerald-400/40 flex items-center gap-1.5 drop-shadow-md cursor-pointer hover:scale-[1.02]"
          >
            <FileSpreadsheet size={14} />
            <span>Reports</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/15 hover:bg-white/10 transition-all relative shadow-md cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-md">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-3 w-80 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 p-4 space-y-3 text-white">
                <div className="flex items-center justify-between border-b border-white/15 pb-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider drop-shadow">Department Alerts</span>
                  <button onClick={() => setShowNotifDrawer(false)} className="text-gray-300 hover:text-white"><X size={14} /></button>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-gray-300 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-200 mt-1 leading-relaxed">{n.message}</p>
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
      const data = await mockDB.getHODStats('All');
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, [hod]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-28 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"></div>
        ))}
      </div>
    );
  }

  const kpiCards = [
    { title: 'Total Faculty', value: stats?.totalFaculty || 25, change: '+2 this year', icon: Users, color: 'text-purple-300 bg-purple-500/20 border border-purple-400/30' },
    { title: 'Total Students', value: stats?.totalStudents || 620, change: 'Across 4 sections', icon: BookOpen, color: 'text-blue-300 bg-blue-500/20 border border-blue-400/30' },
    { title: 'Total Wards', value: stats?.totalWards || 620, change: '3 Ward Counsellors', icon: UserCheck, color: 'text-sky-300 bg-sky-500/20 border border-sky-400/30' },
    { title: 'Present Today', value: stats?.presentToday || 542, change: '87.4% present', icon: CheckCircle2, color: 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/30' },
    { title: 'Absent Today', value: stats?.absentToday || 78, change: '12.6% absent', icon: XCircle, color: 'text-rose-300 bg-rose-500/20 border border-rose-400/30' },
    { title: 'Overall Attendance %', value: `${stats?.attendancePercentage}%`, change: '+1.8% vs last month', icon: TrendingUp, color: 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/30' },
    { title: 'Faculty on Leave Today', value: stats?.facultyOnLeaveToday || 3, change: 'Coverage arranged', icon: Calendar, color: 'text-amber-300 bg-amber-500/20 border border-amber-400/30' },
    { title: 'Pending Leave Requests', value: stats?.pendingLeaves || 6, change: 'Requires HOD review', icon: AlertCircle, color: 'text-rose-300 bg-rose-500/20 border border-rose-400/30', action: () => onNavigate('faculty-leaves') },
    { title: 'Approved Leaves (Month)', value: stats?.approvedLeavesThisMonth || 14, change: 'Processed', icon: Check, color: 'text-indigo-300 bg-indigo-500/20 border border-indigo-400/30' },
    { title: 'Rejected Leaves (Month)', value: stats?.rejectedLeavesThisMonth || 4, change: 'Exam conflicts', icon: X, color: 'text-gray-300 bg-white/10 border border-white/20' }
  ];

  return (
    <div className="space-y-6">
      {/* 2. DARK TINTED STAT CARDS (10 KPI TILES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.action}
              className={`p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between ${kpi.action ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{kpi.title}</span>
                <div className={`p-2 rounded-xl shadow-md ${kpi.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-white font-black text-3xl sm:text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] font-display">{kpi.value}</p>
                <span className="text-[10.5px] text-gray-100 font-bold drop-shadow-md mt-1 block">{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. HOD QUICK ACTION CENTER (ROYAL PURPLE GLASS) */}
      <div className="p-5 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-xl border border-purple-500/30 text-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold flex items-center gap-2 drop-shadow-lg">
            <Briefcase size={16} className="text-purple-300" /> HOD Quick Action Center
          </h3>
          <span className="text-[10px] text-purple-200 font-bold drop-shadow-md">Departmental Control Shortcuts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5">
          <button onClick={() => onNavigate('ward-counsellors')} className="p-2.5 bg-black/40 hover:bg-white/15 backdrop-blur-md rounded-2xl text-center text-xs font-bold transition-all border border-white/15 text-white drop-shadow-md cursor-pointer hover:scale-[1.02]">
            👥 Assign Counsellor
          </button>
          <button onClick={() => onNavigate('faculty-leaves')} className="p-2.5 bg-black/40 hover:bg-white/15 backdrop-blur-md rounded-2xl text-center text-xs font-bold transition-all border border-white/15 text-white drop-shadow-md cursor-pointer hover:scale-[1.02]">
            📝 Review Leaves
          </button>
          <button onClick={() => onNavigate('reports')} className="p-2.5 bg-black/40 hover:bg-white/15 backdrop-blur-md rounded-2xl text-center text-xs font-bold transition-all border border-white/15 text-white drop-shadow-md cursor-pointer hover:scale-[1.02]">
            📊 Monthly Report
          </button>
          <button onClick={() => onNavigate('attendance-unlocks')} className="p-2.5 bg-black/40 hover:bg-white/15 backdrop-blur-md rounded-2xl text-center text-xs font-bold transition-all border border-white/15 text-white drop-shadow-md cursor-pointer hover:scale-[1.02]">
            🔓 Unlock Attendance
          </button>
          <button onClick={() => onNavigate('attendance-monitoring')} className="p-2.5 bg-black/40 hover:bg-white/15 backdrop-blur-md rounded-2xl text-center text-xs font-bold transition-all border border-white/15 text-white drop-shadow-md cursor-pointer hover:scale-[1.02]">
            ⚠️ Low Attendance
          </button>
          <button onClick={() => onNavigate('workload')} className="p-2.5 bg-black/40 hover:bg-white/15 backdrop-blur-md rounded-2xl text-center text-xs font-bold transition-all border border-white/15 text-white drop-shadow-md cursor-pointer hover:scale-[1.02]">
            💼 Faculty Workload
          </button>
          <button onClick={() => onNavigate('announcements')} className="p-2.5 bg-black/40 hover:bg-white/15 backdrop-blur-md rounded-2xl text-center text-xs font-bold transition-all border border-white/15 text-white drop-shadow-md cursor-pointer hover:scale-[1.02]">
            📢 Announcements
          </button>
        </div>
      </div>

      {/* 4. ATTENDANCE GRAPH & SECTION COMPARISON PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white drop-shadow-lg">Daily Department Attendance Roster</h3>
              <p className="text-[11px] text-gray-100 font-medium drop-shadow-md mt-0.5">Present vs Absent student count by day</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full drop-shadow-md">87.4% Avg</span>
          </div>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.graphs.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white drop-shadow-lg mb-1">Section-wise Attendance</h3>
            <p className="text-[11px] text-gray-100 font-medium drop-shadow-md mb-4">Department sections strength distribution</p>
            <div className="space-y-3">
              {stats?.graphs.sectionWise.map((sec) => (
                <div key={sec.section} className="p-3 rounded-xl bg-black/30 border border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>{sec.section}</span>
                    <span className="text-purple-300 font-extrabold drop-shadow">{sec.Attendance}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-400 to-indigo-400 h-full rounded-full shadow-[0_0_8px_rgba(192,132,252,0.5)]" style={{ width: `${sec.Attendance}%` }}></div>
                  </div>
                  <span className="text-[10px] text-gray-200 font-medium drop-shadow-sm mt-1 block">{sec.Students} Students Assigned</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => onNavigate('overview')} className="w-full mt-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1 drop-shadow cursor-pointer">
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
      const data = await mockDB.getHODStats('All');
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
          <h2 className="text-2xl font-black mt-2">All Departments</h2>
          <p className="text-xs text-purple-200 mt-1">Head of Department: {hod?.fullName || 'Dr. Alan Turing'} • Global oversight</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Attendance Performance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-emerald-400">87.4%</p>
              <span className="text-[10px] text-slate-300">Department aggregate rate</span>
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

        <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Academic Performance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-purple-300">78.5 Avg</p>
              <span className="text-[10px] text-slate-300">Internal marks average</span>
            </div>
            <Award className="text-purple-300" size={32} />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <h3 className="text-xs font-black uppercase text-slate-300 mb-4">Monthly Attendance Trend</h3>
          <div className="h-56 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.graphs.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis domain={[50, 100]} stroke="#cbd5e1" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} />
                <Line type="monotone" dataKey="Attendance" stroke="#8B5CF6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <h3 className="text-xs font-black uppercase text-slate-300 mb-4">Faculty Workload Distribution</h3>
          <div className="h-56 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.graphs.workload}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                <XAxis dataKey="faculty" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} />
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
// 3. FACULTY DIRECTORY & TEACHING ASSIGNMENTS MODULE (facultyAssignments)
// -------------------------------------------------------------
const FacultyManagement = ({ hod }) => {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'assignments' | 'leaves'
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [facultyLeaves, setFacultyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFacultyView, setSelectedFacultyView] = useState(null);
  
  // Rejection modal state for Faculty Leave
  const [rejectionLeaveId, setRejectionLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const deptName = 'All';

  const emptyFormData = {
    facultyId: '',
    facultyName: '',
    facultyEmail: '',
    facultyPhone: '',
    department: deptName,
    semester: 'Semester 6',
    section: 'A',
    academicYear: '2026-2027',
    subject: '',
    subjectCode: ''
  };

  const [formData, setFormData] = useState(emptyFormData);

  const loadData = async () => {
    setLoading(true);
    const facs = await mockDB.getFacultyByDepartment('All');
    const facAssigns = await mockDB.getFacultyAssignments(null, 'All');
    const leaves = await mockDB.getFacultyLeavesForHOD('All');
    setFacultyMembers(facs);
    setAssignments(facAssigns);
    setFacultyLeaves(leaves);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [hod]);

  // When faculty selected in dropdown, auto-fill details
  const handleFacultySelectChange = (e) => {
    const facId = e.target.value;
    const fac = facultyMembers.find(f => f.uid === facId || f.id === facId);
    if (fac) {
      setFormData(prev => ({
        ...prev,
        facultyId: fac.uid || fac.id,
        facultyName: fac.fullName || fac.name || 'Prof. Faculty',
        facultyEmail: fac.email || 'faculty@kbn.edu',
        facultyPhone: fac.phone || fac.mobile || fac.phoneNumber || '9876543211'
      }));
    } else {
      setFormData(prev => ({ ...prev, facultyId: facId }));
    }
  };

  const subjectsForDept = (formData.department && BRANCH_SUBJECT_MAP[formData.department])
    ? BRANCH_SUBJECT_MAP[formData.department]
    : ['Artificial Intelligence', 'Machine Learning', 'Neural Networks', 'Python Programming', 'Data Science & Analytics', 'Compiler Design', 'Software Engineering'];

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!formData.facultyId) return alert('Please select a Faculty member.');
    if (!formData.department) return alert('Please select Branch / Department.');
    if (!formData.semester) return alert('Semester is mandatory.');
    if (!formData.section) return alert('Section is mandatory.');
    if (!formData.academicYear) return alert('Academic Year is mandatory.');
    if (!formData.subject) return alert('Subject is mandatory.');

    await mockDB.saveFacultyAssignment({
      facultyId: formData.facultyId,
      facultyName: formData.facultyName,
      facultyEmail: formData.facultyEmail,
      facultyPhone: formData.facultyPhone,
      department: formData.department,
      semester: formData.semester,
      section: formData.section,
      academicYear: formData.academicYear,
      subject: formData.subject,
      subjectCode: formData.subjectCode || (formData.subject.toUpperCase().slice(0, 3) + '601')
    }, hod);

    setShowAssignModal(false);
    setFormData(emptyFormData);
    loadData();
  };

  const handleDeactivateAssignment = async (assignId, subjectName) => {
    if (confirm(`Deactivate teaching assignment for ${subjectName}?`)) {
      await mockDB.deactivateFacultyAssignment(assignId, hod);
      loadData();
    }
  };

  const handleApproveLeave = async (leaveId) => {
    await mockDB.reviewFacultyLeave(leaveId, 'Approved', '', hod);
    loadData();
  };

  const handleRejectLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return alert('Rejection reason is required.');
    await mockDB.reviewFacultyLeave(rejectionLeaveId, 'Rejected', rejectionReason.trim(), hod);
    setRejectionLeaveId(null);
    setRejectionReason('');
    loadData();
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-purple-600" size={20} />
            Faculty Directory & Teaching Workload
          </h2>
          <p className="text-xs text-slate-400">Manage faculty members, teaching subject assignments (`facultyAssignments`), and faculty leave applications</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-xl uppercase text-[10px] tracking-wider transition-all ${activeTab === 'directory' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
            >
              Faculty Directory ({facultyMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3 py-1.5 rounded-xl uppercase text-[10px] tracking-wider transition-all ${activeTab === 'assignments' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
            >
              Teaching Assignments ({assignments.filter(a => a.status === 'active' || a.status === 'Active').length})
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-3 py-1.5 rounded-xl uppercase text-[10px] tracking-wider transition-all ${activeTab === 'leaves' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
            >
              Faculty Leaves ({facultyLeaves.filter(l => l.status === 'Pending').length})
            </button>
          </div>
          <button
            onClick={() => {
              setFormData(emptyFormData);
              setShowAssignModal(true);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Assign Teaching</span>
          </button>
        </div>
      </div>

      {/* Directory Cards View */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {facultyMembers.map((fac) => {
            const facId = fac.uid || fac.id;
            const facAssigns = assignments.filter(a => (a.facultyId === facId || a.email === fac.email) && (a.status === 'active' || a.status === 'Active'));

            return (
              <div key={facId} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  {fac.photo || fac.profilePhotoUrl ? (
                    <img src={fac.photo || fac.profilePhotoUrl} alt={fac.fullName || fac.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/30 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shrink-0">
                      {(fac.fullName || fac.name || 'FC').split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                  )}
                  <div className="overflow-hidden space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase">
                        Status: {fac.status || 'Active'}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-[9px] font-black uppercase">
                        AY: {fac.academicYear || '2026-2027'}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">{fac.fullName || fac.name}</h3>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">Employee ID: {fac.employeeId || fac.facultyId || facId}</p>
                    <p className="text-[11px] text-slate-400 truncate">Email: {fac.email}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Phone: {fac.phone || fac.mobile || fac.phoneNumber || '9876543211'}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">Dept: {fac.department || deptName}</p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">Scope: {fac.semester || 'Semester 1'} • {fac.section?.startsWith('Section') ? fac.section : `Section ${fac.section || 'A'}`}</p>
                  </div>
                </div>

                {/* Teaching Assignments Scope Box */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-xs space-y-2">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Active Teaching Assignments ({facAssigns.length})
                  </div>
                  {facAssigns.length > 0 ? (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {facAssigns.map(a => (
                        <div key={a.id} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-purple-500/20 text-[11px]">
                          <strong className="text-slate-900 dark:text-white block">{a.subject} ({a.subjectCode})</strong>
                          <span className="text-purple-600 dark:text-purple-400 font-bold block">{a.department}</span>
                          <span className="text-slate-400 block">{a.semester} • Section {a.section} • AY {a.academicYear}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-[11px]">No active subject assignment</div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedFacultyView(fac)}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold"
                  >
                    View Faculty
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 rounded-xl text-[11px] font-bold"
                  >
                    View Assignments
                  </button>
                  <button
                    onClick={() => {
                      setFormData({
                        ...emptyFormData,
                        facultyId: fac.uid || fac.id,
                        facultyName: fac.fullName || fac.name,
                        facultyEmail: fac.email,
                        facultyPhone: fac.phone || fac.mobile || '9876543211'
                      });
                      setShowAssignModal(true);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold shadow-md"
                  >
                    Assign Teaching
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teaching Assignments Table View */}
      {activeTab === 'assignments' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Faculty Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Department</th>
                <th className="p-4">Subject</th>
                <th className="p-4 text-center">Semester</th>
                <th className="p-4 text-center">Section</th>
                <th className="p-4 font-mono">Academic Year</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">No teaching assignments found. Click "Assign Faculty" to create one.</td>
                </tr>
              ) : (
                assignments.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{alloc.facultyName}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{alloc.email || alloc.facultyEmail}</td>
                    <td className="p-4 font-mono text-slate-500">{alloc.phone || alloc.facultyPhone}</td>
                    <td className="p-4 font-bold text-purple-600">{alloc.department}</td>
                    <td className="p-4 font-black text-slate-800 dark:text-slate-200">{alloc.subject} ({alloc.subjectCode})</td>
                    <td className="p-4 text-center font-bold text-purple-600">{alloc.semester}</td>
                    <td className="p-4 text-center font-bold text-indigo-600">Sec {alloc.section}</td>
                    <td className="p-4 font-mono text-slate-500">{alloc.academicYear || '2026-2027'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${alloc.status === 'active' || alloc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                        {alloc.status === 'active' || alloc.status === 'Active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {(alloc.status === 'active' || alloc.status === 'Active') && (
                        <button
                          onClick={() => handleDeactivateAssignment(alloc.id, alloc.subject)}
                          className="px-2.5 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-lg text-[11px] font-bold"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Faculty Leaves Desk View */}
      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Faculty Leave Applications</h3>
              <p className="text-xs text-slate-400">Review leave applications submitted by faculty members in {deptName}</p>
            </div>
          </div>

          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-3">Faculty Name</th>
                <th className="p-3">Leave Type</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {facultyLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No faculty leave requests found.</td>
                </tr>
              ) : (
                facultyLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{leave.facultyName}</td>
                    <td className="p-3 font-extrabold text-purple-600">{leave.leaveType}</td>
                    <td className="p-3 font-mono">{leave.startDate} to {leave.endDate} ({leave.totalDays} day/s)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">{leave.reason}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
                        leave.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {leave.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleApproveLeave(leave.id)}
                            className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectionLeaveId(leave.id)}
                            className="px-3 py-1 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs font-bold shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {leave.status === 'Rejected' && leave.rejectionReason ? `Reason: ${leave.rejectionReason}` : 'Reviewed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Faculty Form Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAssignSubmit} className="bg-white dark:bg-slate-900 max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Assign Faculty</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">Assign Faculty to Academic Subject Teaching Scope</p>
              </div>
              <button type="button" onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 1. Select Faculty/User */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Faculty/User <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.facultyId}
                  onChange={handleFacultySelectChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  required
                >
                  <option value="">[ Select Faculty ]</option>
                  {facultyMembers.map((f) => (
                    <option key={f.uid || f.id} value={f.uid || f.id}>
                      {f.fullName || f.name} • Faculty ID: {f.facultyId || f.employeeId || f.uid} • Email: {f.email}
                    </option>
                  ))}
                </select>
              </div>
              {/* Auto-filled Read-only Faculty Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-[10px] uppercase text-slate-400 mb-0.5">Faculty Name</label>
                  <input
                    type="text"
                    value={formData.facultyName}
                    readOnly
                    placeholder="[ Auto-filled ]"
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] uppercase text-slate-400 mb-0.5">Faculty ID</label>
                  <input
                    type="text"
                    value={formData.facultyId}
                    readOnly
                    placeholder="[ Auto-filled ]"
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-600 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] uppercase text-slate-400 mb-0.5">Email</label>
                  <input
                    type="email"
                    value={formData.facultyEmail}
                    readOnly
                    placeholder="[ Auto-filled ]"
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Department / Branch */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  required
                >
                  <option value="">[ Select Branch ]</option>
                  {KBN_BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Semester & Section Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Semester <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  >
                    <option value="">[ Select Semester ]</option>
                    {KBN_SEMESTERS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  >
                    <option value="">[ Select Section ]</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  required
                >
                  <option value="2026-2027">2026-2027</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>

              {/* Subject & Subject Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => {
                      const subj = e.target.value;
                      setFormData({ 
                        ...formData, 
                        subject: subj,
                        subjectCode: subj ? (subj.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) + '601') : ''
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  >
                    <option value="">[ Select Subject ]</option>
                    {subjectsForDept.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    placeholder="[ Optional / Auto-filled ]"
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-purple-500/20"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 4. BRANCH-LEVEL WARD COUNSELLOR MANAGEMENT VIEW (1 SCOPE = 1 ACTIVE COUNSELLOR)
// -------------------------------------------------------------
const WardCounsellorManagement = ({ hod }) => {
  const [counsellors, setCounsellors] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // active | history
  const [deptList, setDeptList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReplacementConfirmModal, setShowReplacementConfirmModal] = useState(false);
  const [selectedWardSection, setSelectedWardSection] = useState(null);
  const [wardStudents, setWardStudents] = useState([]);
  const [scopeConflictAssignment, setScopeConflictAssignment] = useState(null);

  // Form state containing ONLY the 5 required fields
  const [formData, setFormData] = useState({
    wardCounsellorId: '',
    wardCounsellorName: '',
    department: hod?.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
    semester: 'Semester 6',
    section: 'Section A',
    academicYear: '2026-2027'
  });

  const loadData = async () => {
    // Pass null so HOD retrieves ALL ward counsellor assignments across all departments globally
    const list = await mockDB.getWardCounsellorAssignments(null);
    setCounsellors(list.filter(c => c.status === 'active' || c.status === 'Active'));
    setHistoryList(list.filter(c => c.status === 'inactive' || c.status === 'Inactive'));

    const depts = await mockDB.getDepartmentsList();
    setDeptList(depts);
  };

  useEffect(() => {
    loadData();
  }, [hod]);

  // Fetch existing active users/faculty members for the dropdown selection
  useEffect(() => {
    const fetchUsers = async () => {
      const users = await mockDB.getAllActiveFacultyUsers();
      setUserList(users);
      if (users.length > 0 && !formData.wardCounsellorId) {
        const u = users[0];
        setFormData(prev => ({
          ...prev,
          wardCounsellorId: u.uid || u.id || 'usr-1',
          wardCounsellorName: u.fullName || u.name || 'Dileep'
        }));
      }
    };
    fetchUsers();
  }, [showAssignModal]);

  const handleUserSelect = (e) => {
    const uid = e.target.value;
    const found = userList.find(u => (u.uid || u.id) === uid);
    if (found) {
      setFormData(prev => ({
        ...prev,
        wardCounsellorId: found.uid || found.id,
        wardCounsellorName: found.fullName || found.name || 'Dileep'
      }));
    } else {
      setFormData(prev => ({ ...prev, wardCounsellorId: uid }));
    }
  };

  const handleAssignSubmitModal = async (submittedData) => {
    setFormData(submittedData);
    if (!submittedData.wardCounsellorId) return alert('Please select a Ward Counsellor.');
    if (!submittedData.department) return alert('Please select Branch / Department.');
    if (!submittedData.semester) return alert('Semester is mandatory.');
    if (!submittedData.section) return alert('Section is mandatory.');
    if (!submittedData.academicYear) return alert('Academic Year is mandatory.');

    // Check active scope conflict: Only 1 active counsellor per (Branch + Semester + Section + Academic Year)
    const existing = await mockDB.checkActiveAssignmentForScope(
      submittedData.department,
      submittedData.semester,
      submittedData.section,
      submittedData.academicYear
    );

    if (existing && existing.wardCounsellorId !== submittedData.wardCounsellorId && existing.facultyId !== submittedData.wardCounsellorId) {
      setScopeConflictAssignment(existing);
      setShowReplacementConfirmModal(true);
    } else {
      executeAssignment(submittedData);
    }
  };

  const executeAssignment = async (overrideData = null) => {
    const dataToUse = overrideData || formData;
    const payload = {
      wardCounsellorId: dataToUse.wardCounsellorId,
      wardCounsellorName: dataToUse.wardCounsellorName,
      facultyId: dataToUse.wardCounsellorId,
      facultyName: dataToUse.wardCounsellorName,
      branch: dataToUse.department,
      department: dataToUse.department,
      semester: dataToUse.semester,
      section: dataToUse.section,
      academicYear: dataToUse.academicYear
    };

    await mockDB.saveWardCounsellorAssignment(payload, hod);
    setShowAssignModal(false);
    setShowReplacementConfirmModal(false);
    setScopeConflictAssignment(null);
    loadData();
  };

  const handleDeactivate = async (assignment) => {
    if (confirm(`Deactivate Ward Counsellor assignment for ${assignment.wardCounsellorName || assignment.facultyName} (${assignment.department} - ${assignment.semester} ${assignment.section})?`)) {
      await mockDB.deactivateWardCounsellorAssignment(assignment.id, hod);
      loadData();
    }
  };

  const handleViewWards = async (counsellor) => {
    setSelectedWardSection(counsellor);
    const secStr = counsellor.section.startsWith('Section') ? counsellor.section : `Section ${counsellor.section}`;
    const students = await mockDB.getWardsBySection(counsellor.department || hod?.department, secStr);
    setWardStudents(students);
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Ward Counsellor Assignments</h2>
          <p className="text-xs text-slate-400">One Branch + Semester + Section + Academic Year = One Active Ward Counsellor</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold mr-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-xl uppercase text-[10px] tracking-wider transition-all ${activeTab === 'active' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
            >
              Active ({counsellors.length})
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
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Assign Counsellor</span>
          </button>
        </div>
      </div>

      {/* Ward Counsellor Table — Showing ONLY required columns */}
      {activeTab === 'active' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-x-auto">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Active Ward Counsellors Ledger</h3>
            <span className="text-xs text-slate-500 dark:text-slate-300 font-bold">{counsellors.length} Active Assignments</span>
          </div>
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-700 dark:text-slate-300 tracking-wider">
              <tr>
                <th className="px-4 py-3.5 text-slate-700 dark:text-slate-300">Ward Counsellor</th>
                <th className="px-4 py-3.5 text-slate-700 dark:text-slate-300">Branch</th>
                <th className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">Semester</th>
                <th className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">Section</th>
                <th className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">Academic Year</th>
                <th className="px-4 py-3.5 text-slate-700 dark:text-slate-300">Status</th>
                <th className="px-4 py-3.5 text-right text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {counsellors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 dark:text-slate-300 font-normal">
                    No active Ward Counsellor assignments found. Click "Assign Counsellor" to create one.
                  </td>
                </tr>
              ) : (
                counsellors.map((c) => {
                  const cName = c.wardCounsellorName || c.facultyName || c.name || c.fullName || 'No Name';
                  const cBranch = c.branch || c.department || 'No Branch';
                  const cSem = c.semester || 'No Semester';
                  const cSec = c.section ? (c.section.startsWith('Section') ? c.section : `Section ${c.section}`) : 'No Section';
                  const cAy = c.academicYear || 'No Academic Year';

                  return (
                    <tr key={c.id || c.wardCounsellorId || Math.random()} className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        {cName}
                      </td>
                      <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-300 font-medium whitespace-nowrap">
                        {cBranch}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white font-medium">
                        {cSem}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-indigo-600 dark:text-indigo-300 font-medium">
                        {cSec}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white font-medium font-mono">
                        {cAy}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleViewWards(c)}
                          className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-500/20 text-xs font-bold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setFormData({
                              wardCounsellorId: c.wardCounsellorId || c.facultyId,
                              wardCounsellorName: cName,
                              department: cBranch,
                              semester: cSem,
                              section: cSec,
                              academicYear: cAy
                            });
                            setShowAssignModal(true);
                          }}
                          className="px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500/20 text-xs font-bold"
                        >
                          Edit Scope
                        </button>
                        <button
                          onClick={() => handleDeactivate(c)}
                          className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-500/20 text-xs font-bold"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignment History Table */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-x-auto">
          {historyList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-300">No historical ward counsellor assignments found.</div>
          ) : (
            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-700 dark:text-slate-300 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 text-slate-700 dark:text-slate-300">Ward Counsellor</th>
                  <th className="px-4 py-3.5 text-slate-700 dark:text-slate-300">Branch</th>
                  <th className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">Semester</th>
                  <th className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">Section</th>
                  <th className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">Academic Year</th>
                  <th className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">Assigned Date</th>
                  <th className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyList.map((h) => {
                  const hName = h.wardCounsellorName || h.facultyName || h.name || h.fullName || 'No Name';
                  const hBranch = h.branch || h.department || 'No Branch';
                  const hSem = h.semester || 'No Semester';
                  const hSec = h.section ? (h.section.startsWith('Section') ? h.section : `Section ${h.section}`) : 'No Section';
                  const hAy = h.academicYear || 'No Academic Year';

                  return (
                    <tr key={h.id || Math.random()} className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">{hName}</td>
                      <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-300 font-medium whitespace-nowrap">{hBranch}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white font-medium">{hSem}</td>
                      <td className="px-4 py-3 text-sm text-center text-indigo-600 dark:text-indigo-300 font-medium">{hSec}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white font-medium font-mono">{hAy}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white font-medium">{h.assignedAt ? new Date(h.assignedAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold">
                          Inactive
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
                  Ward Roster — {selectedWardSection.branch || selectedWardSection.department}
                </h3>
                <p className="text-xs text-slate-400">
                  Ward Counsellor: <strong>{selectedWardSection.wardCounsellorName || selectedWardSection.facultyName}</strong> ({selectedWardSection.semester} • {selectedWardSection.section} • AY {selectedWardSection.academicYear})
                </p>
              </div>
              <button onClick={() => setSelectedWardSection(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[9px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Section</th>
                  <th className="p-3 text-center">Attendance</th>
                  <th className="p-3 text-center">Marks</th>
                  <th className="p-3">Fee Status</th>
                  <th className="p-3">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {wardStudents.map((st) => (
                  <tr key={st.rollNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold">{st.rollNumber}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                    <td className="p-3 font-bold text-purple-600">{selectedWardSection.section}</td>
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

      {/* 1. ASSIGN WARD COUNSELLOR FORM MODAL */}
      <AssignWardCounsellorModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssignSubmit={handleAssignSubmitModal}
        hod={hod}
        deptList={deptList}
        initialFormData={formData}
      />

      {/* Active Assignment Conflict Modal */}
      {showReplacementConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle size={22} />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Active Assignment Exists</h3>
            </div>
            
            <p className="text-xs text-rose-600 dark:text-rose-400 font-extrabold bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
              This academic scope already has an active Ward Counsellor.
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Current Active Counsellor:</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">{scopeConflictAssignment?.wardCounsellorName || scopeConflictAssignment?.facultyName}</h4>
              <p className="text-purple-600 dark:text-purple-400 font-bold">{scopeConflictAssignment?.department}</p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">{scopeConflictAssignment?.semester} • {scopeConflictAssignment?.section} ({scopeConflictAssignment?.academicYear})</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowReplacementConfirmModal(false);
                  if (scopeConflictAssignment) handleViewWards(scopeConflictAssignment);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 text-xs font-bold hover:bg-indigo-500/20"
              >
                View Current Counsellor
              </button>
              <button
                type="button"
                onClick={executeAssignment}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20"
              >
                Change Counsellor
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
    const list = await mockDB.getLeaves('hod', hod?.uid, 'All');
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
    await mockDB.reviewLeave(leaveId, 'Approved', 'Approved by HOD', hod);
    setSelectedLeave(null);
    loadLeaves();
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return alert('Please enter rejection reason.');
    await mockDB.reviewLeave(rejectionModalLeave.leaveId || rejectionModalLeave.id, 'Rejected', rejectionReason, hod);
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden overflow-x-auto">
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
      const data = await mockDB.getMonthlyFacultyLeaveReport('All', month, year, facultyFilter);
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden overflow-x-auto">
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
      const data = await mockDB.getFacultyWorkload('All');
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

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden overflow-x-auto">
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden overflow-x-auto">
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
      const res = await mockDB.getDepartmentAcademicPerformance('All');
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

// -------------------------------------------------------------
// 9. OTHER SECTIONS (Announcements, Audit Logs, Settings, Unlocks)
// -------------------------------------------------------------

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

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden overflow-x-auto">
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
  const { user, showToast, updateProfilePhoto } = useAuth();
  const currentHOD = hod || user || {};

  const [fullName, setFullName] = useState(currentHOD.fullName || currentHOD.name || 'Dr. Alan Turing');
  const [email, setEmail] = useState(currentHOD.email || 'hod.cse@kbn.edu');
  const [mobile, setMobile] = useState(currentHOD.mobile || currentHOD.phone || '+91 98765 43210');
  const [officeRoom, setOfficeRoom] = useState(currentHOD.officeRoom || 'Room 304, Tech Block - Floor 3');
  const [officeHours, setOfficeHours] = useState(currentHOD.officeHours || 'Mon - Fri: 10:00 AM - 4:00 PM');
  const [bio, setBio] = useState(currentHOD.bio || 'Managing departmental curriculum, academic faculty allocations, laboratory infrastructures, and student research projects.');
  const [photoUrl, setPhotoUrl] = useState(currentHOD.profilePhotoUrl || currentHOD.photo || '');

  const [stats, setStats] = useState({
    facultyCount: 25,
    studentCount: 620,
    sectionsCount: 4,
    wardCounsellorName: 'Prof. Ravi Kumar',
    attendancePercentage: 87.4,
    pendingLeavesCount: 6
  });

  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      const s = await mockDB.getHODProfileStats(currentHOD?.department);
      setStats(s);
    };
    loadStats();
  }, [currentHOD]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid file format. Supported formats: JPG, JPEG, PNG, WEBP', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds maximum limit of 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPhoto(reader.result);
      setPhotoUrl(reader.result);
      showToast('Photo selected! Click Save Profile Changes to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      try {
        if (updateProfilePhoto) await updateProfilePhoto(null);
        setPhotoUrl('');
        setPreviewPhoto(null);
        showToast('Profile photo removed.', 'info');
      } catch (_) {
        showToast('Could not remove photo.', 'error');
      }
    }
  };

  const handleSaveProfileFields = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = {
        ...currentHOD,
        fullName,
        name: fullName,
        email,
        mobile,
        phone: mobile,
        officeRoom,
        officeHours,
        bio,
        profilePhotoUrl: photoUrl || currentHOD.profilePhotoUrl,
        photo: photoUrl || currentHOD.photo
      };

      if (previewPhoto && updateProfilePhoto) {
        try {
          await updateProfilePhoto(previewPhoto);
        } catch (_) {}
      }

      await mockDB.updateHODProfile(currentHOD.uid || currentHOD.id, updated, currentHOD);
      localStorage.setItem('acad_user', JSON.stringify(updated));
      localStorage.setItem('acad_current_user', JSON.stringify(updated));
      showToast('HOD profile details updated successfully!', 'success');
    } catch (_) {
      showToast('Could not save profile changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const activePhoto = previewPhoto || photoUrl || currentHOD.profilePhotoUrl;
  const hodInitials = fullName ? fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'AT';

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans max-w-4xl mx-auto">
      
      {/* Universal Glass Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group shrink-0">
            {activePhoto ? (
              <img
                src={activePhoto}
                alt="HOD Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-400/60 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600/80 to-indigo-600/80 text-white font-black text-2xl flex items-center justify-center border-2 border-purple-400/40 shadow-lg">
                {hodInitials}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer transition-all hover:scale-105">
              <Upload size={14} />
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white drop-shadow-md">{fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-400/30">
                HOD
              </span>
            </div>
            <p className="text-xs text-gray-200 font-semibold mt-0.5">{currentHOD?.department || 'Computer Science and Engineering'}</p>
            <p className="text-xs font-mono text-cyan-300 mt-1">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activePhoto && (
            <button
              onClick={handleRemovePhoto}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs cursor-pointer transition-all"
            >
              Remove Photo
            </button>
          )}
          <label className="px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/30 border border-blue-400/40 cursor-pointer flex items-center gap-1.5 transition-all hover:scale-[1.02]">
            <Upload size={14} />
            <span>Change Profile Photo</span>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
          </label>
        </div>
      </div>

      {/* Department Summary Statistics Card */}
      <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white space-y-4">
        <h3 className="text-xs font-black text-cyan-300 uppercase tracking-wider">Department Live Operations Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[9.5px] text-gray-300 block font-bold">Total Faculty</span>
            <span className="text-xl font-black text-white">{stats.facultyCount}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[9.5px] text-gray-300 block font-bold">Total Students</span>
            <span className="text-xl font-black text-cyan-300">{stats.studentCount}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[9.5px] text-gray-300 block font-bold">Sections</span>
            <span className="text-xl font-black text-white">{stats.sectionsCount}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[9.5px] text-gray-300 block font-bold">Ward Counsellor</span>
            <span className="text-xs font-black text-emerald-300 truncate block mt-1">{stats.wardCounsellorName}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[9.5px] text-gray-300 block font-bold">Attendance %</span>
            <span className="text-xl font-black text-emerald-400">{stats.attendancePercentage}%</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[9.5px] text-gray-300 block font-bold">Pending Leaves</span>
            <span className="text-xl font-black text-amber-300">{stats.pendingLeavesCount}</span>
          </div>
        </div>
      </div>

      {/* Profile Details Form Card */}
      <form onSubmit={handleSaveProfileFields} className="bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white hover:border-white/20 transition-all space-y-6">
        <div className="border-b border-white/10 pb-3">
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-md border border-cyan-400/30">
            Profile Credentials
          </span>
          <h3 className="text-base font-black text-white drop-shadow-md mt-1.5 font-display">
            Personal Information & Office Configuration
          </h3>
          <p className="text-xs text-gray-300 font-medium mt-0.5">
            Update personal contact details, office availability hours, and vision statement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-gray-300 uppercase text-[10px] font-extrabold tracking-wider mb-1.5">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
            />
          </div>

          {/* Official Email */}
          <div>
            <label className="block text-gray-300 uppercase text-[10px] font-extrabold tracking-wider mb-1.5">Official Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-gray-300 uppercase text-[10px] font-extrabold tracking-wider mb-1.5">Mobile Number *</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
            />
          </div>

          {/* Office Room */}
          <div>
            <label className="block text-gray-300 uppercase text-[10px] font-extrabold tracking-wider mb-1.5">Office Room Location</label>
            <input
              type="text"
              value={officeRoom}
              onChange={(e) => setOfficeRoom(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
            />
          </div>

          {/* Office Hours */}
          <div className="md:col-span-2">
            <label className="block text-gray-300 uppercase text-[10px] font-extrabold tracking-wider mb-1.5">Office Hours / Availability</label>
            <input
              type="text"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
            />
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-gray-300 uppercase text-[10px] font-extrabold tracking-wider mb-1.5">Departmental Vision & Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs resize-none"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 cursor-pointer transition-all hover:scale-[1.02]"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HODPortal;
