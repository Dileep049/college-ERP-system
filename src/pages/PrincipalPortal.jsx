import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS } from '../services/firebase';
import { COLLEGE_DEPARTMENTS } from '../utils/constants';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  Building, 
  Users, 
  Calendar, 
  TrendingUp, 
  Building2, 
  Download, 
  Check, 
  X, 
  BookOpen,
  Briefcase,
  Award,
  AlertTriangle,
  FileText,
  Filter,
  UserCheck,
  Plus,
  RefreshCw,
  Clock,
  Printer,
  ChevronRight,
  Eye,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Camera,
  Upload,
  RotateCcw,
  Search
} from 'lucide-react';

export const PrincipalPortal = ({ subPage }) => {
  const { user } = useAuth();
  
  if (subPage === 'dashboard') return <PrincipalDashboard principal={user} />;
  if (subPage === 'branches') return <PrincipalBranchAnalytics principal={user} />;
  if (subPage === 'results') return <PrincipalSemesterResults principal={user} />;
  if (subPage === 'performance') return <PrincipalAcademicPerformance principal={user} />;
  if (subPage === 'faculty' || subPage === 'faculty-overview') return <PrincipalFacultyOverview principal={user} />;
  if (subPage === 'ward-counsellors' || subPage === 'counsellors') return <PrincipalWardCounsellorOverview principal={user} />;
  if (subPage === 'attendance') return <PrincipalAttendanceAnalytics principal={user} />;
  if (subPage === 'calendar') return <PrincipalCalendar principal={user} />;
  if (subPage === 'reports') return <PrincipalReports principal={user} />;
  if (subPage === 'leaves') return <PrincipalLeaves principal={user} />;
  if (subPage === 'documents') return <PrincipalDocuments principal={user} />;
  if (subPage === 'placements') return <PrincipalPlacementAnalytics principal={user} />;
  if (subPage === 'settings') return <PrincipalSettings principal={user} />;
  return <PrincipalDashboard principal={user} />;
};

// 1. PRINCIPAL DASHBOARD (EXECUTIVE COMMAND CONSOLE)
const PrincipalDashboard = ({ principal }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchPrincipalData = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getPrincipalAnalytics();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrincipalData();
  }, [principal]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-xs font-semibold">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="h-28 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"></div>)}
        </div>
      </div>
    );
  }

  const cards = stats?.cards || {};
  const insights = stats?.insights || [];
  const topDepartments = stats?.topDepartments || [];

  return (
    <div className="space-y-6 text-xs font-semibold font-sans">
      
      {/* 1. EXECUTIVE COMMAND CONSOLE BANNER (PREMIUM DARK GLASS WITH GOLD ACCENT) */}
      <div className="p-6 md:p-8 rounded-3xl bg-black/50 backdrop-blur-xl border border-yellow-500/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.7)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-yellow-400">
          <Building size={140} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {principal?.profilePhotoUrl ? (
              <img src={principal.profilePhotoUrl} alt={principal?.fullName} className="w-14 h-14 rounded-2xl object-cover border-2 border-yellow-400/70 shadow-xl" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-xl border-2 border-yellow-400/70">
                {principal?.fullName ? principal.fullName.split(' ').map(n => n[0]).join('') : 'DA'}
              </div>
            )}
            <div>
              <span className="px-3 py-1 bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                KBN Executive Command Console
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display mt-1.5 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">Institutional Executive Overview</h2>
              <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">
                Principal: <strong className="text-yellow-300 font-bold drop-shadow">{principal?.fullName || 'Dr. Arthur Pendelton'}</strong> • Institutional Operations & Governance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <a href="/principal/branches" className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl backdrop-blur-md border border-white/20 shadow-md drop-shadow transition-all hover:scale-[1.02]">
              Branch Analytics
            </a>
            <a href="/principal/results" className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-500/25 border border-purple-400/40 drop-shadow transition-all hover:scale-[1.02]">
              Semester Results
            </a>
          </div>
        </div>
      </div>

      {/* 2. 10 DARK TINTED STAT CARDS (EXECUTIVE KPI GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Total Students</span>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.totalStudents}</p>
          <span className="text-[9.5px] text-emerald-300 font-bold block mt-1 drop-shadow-md">Active Enrolled</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Total Faculty</span>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.totalFaculty}</p>
          <span className="text-[9.5px] text-purple-300 font-bold block mt-1 drop-shadow-md">Teaching Staff</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Departments</span>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.totalDepartments}</p>
          <span className="text-[9.5px] text-indigo-300 font-bold block mt-1 drop-shadow-md">Academic Branches</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Total HODs</span>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.totalHODs}</p>
          <span className="text-[9.5px] text-amber-300 font-bold block mt-1 drop-shadow-md">Department Heads</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Ward Counsellors</span>
          <p className="text-white font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.totalWardCounsellors}</p>
          <span className="text-[9.5px] text-cyan-300 font-bold block mt-1 drop-shadow-md">Active Counsellors</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Attendance %</span>
          <p className="text-emerald-300 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.attendancePercentage}%</p>
          <span className="text-[9.5px] text-gray-200 font-bold block mt-1 drop-shadow-md">Institutional Average</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Students At Risk</span>
          <p className="text-rose-400 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.studentsAtRisk}</p>
          <span className="text-[9.5px] text-rose-300 font-bold block mt-1 drop-shadow-md">&lt;75% Attendance / Low</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Students Passed</span>
          <p className="text-emerald-300 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.studentsPassed}</p>
          <span className="text-[9.5px] text-emerald-300 font-bold block mt-1 drop-shadow-md">Semester Passed</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Students Failed</span>
          <p className="text-rose-400 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.studentsFailed}</p>
          <span className="text-[9.5px] text-gray-300 font-bold block mt-1 drop-shadow-md">With Backlogs</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-gray-100 font-extrabold tracking-wide block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Placement Rate</span>
          <p className="text-indigo-300 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-1 font-display">{cards.placementRate}%</p>
          <span className="text-[9.5px] text-indigo-300 font-bold block mt-1 drop-shadow-md">Corporate Selections</span>
        </div>
      </div>

      {/* 3. EXECUTIVE INSIGHTS & TOP PERFORMING DEPARTMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Executive Insights Panel */}
        <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <h3 className="text-base font-extrabold text-white drop-shadow-lg flex items-center gap-2">
              <TrendingUp className="text-purple-400" size={18} />
              Institutional Executive Insights
            </h3>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[9.5px] font-bold rounded-full drop-shadow">
              Automated Analytics
            </span>
          </div>

          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {i + 1}
                </div>
                <p className="text-xs text-gray-100 font-medium drop-shadow-sm leading-relaxed">
                  {ins.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Departments Panel */}
        <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <h3 className="text-base font-extrabold text-white drop-shadow-lg flex items-center gap-2">
              <Award className="text-yellow-400" size={18} />
              Top Performing Departments
            </h3>
            <span className="text-[10px] text-gray-100 font-bold uppercase tracking-wider drop-shadow">Dynamic Ranking</span>
          </div>

          <div className="space-y-3">
            {topDepartments.map((dept) => (
              <div key={dept.name} className="p-3.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shadow-md ${dept.rank === 1 ? 'bg-yellow-400 text-slate-950' : dept.rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-amber-600 text-white'}`}>
                    #{dept.rank}
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold text-white drop-shadow-md">{dept.name}</h4>
                    <p className="text-[10px] text-gray-200 mt-0.5">Pass Rate: <strong className="text-emerald-300 font-bold">{dept.passRate}%</strong> • Avg Marks: {dept.avgMarks}</p>
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <span className="text-purple-300 font-extrabold drop-shadow">{dept.placementRate}% Placement</span>
                  <span className="text-[9.5px] text-gray-200 block font-medium mt-0.5">Att: {dept.attendance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

// 2. BRANCH ANALYTICS & WARD COUNSELLOR VISIBILITY
const PrincipalBranchAnalytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchFacultyAllocations, setBranchFacultyAllocations] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      const res = await mockDB.getBranchAnalytics();
      setData(res);
      setLoading(false);
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchBranchAllocations = async () => {
      if (selectedBranch?.branch) {
        const allocs = await mockDB.getSubjectAllocations(selectedBranch.branch);
        setBranchFacultyAllocations(allocs);
      } else {
        setBranchFacultyAllocations([]);
      }
    };
    fetchBranchAllocations();
  }, [selectedBranch]);

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">Loading branch analytics & ward counsellors...</div>;

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Department Operations
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Branch Analytics & Ward Counsellors</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">View active branch ward counsellors, HOD assignments, and institutional performance metrics</p>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 text-[10.5px] font-bold rounded-full border border-emerald-400/30 shrink-0 self-start sm:self-auto drop-shadow">
          Real-time HOD Sync (Read Only)
        </span>
      </div>

      {/* Main Glass Content Card */}
      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white space-y-8">
        {/* Branch Bar Chart */}
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 drop-shadow-sm">Institutional Branch Comparison Metrics</h3>
          <div className="h-64 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="branch" stroke="#CBD5E1" />
                <YAxis domain={[0, 100]} stroke="#CBD5E1" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Bar dataKey="passRate" fill="#A855F7" name="Pass Rate %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attendance" fill="#10B981" name="Attendance %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placementRate" fill="#38BDF8" name="Placement Rate %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Ward Counsellors Section Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2 drop-shadow-sm">
            <UserCheck className="text-cyan-400" size={18} />
            Branch Ward Counsellors
          </h3>
          <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Dynamic HOD Assignment</span>
        </div>

        {/* Branch Ward Counsellor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((b) => (
            <div 
              key={b.branch} 
              onClick={() => setSelectedBranch(b)}
              className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-cyan-400/50 shadow-lg transition-all cursor-pointer space-y-3 text-white"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white truncate drop-shadow-sm">{b.branch}</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black border ${b.isAssigned ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'}`}>
                  {b.isAssigned ? '🟢 Assigned' : '🟡 Unassigned'}
                </span>
              </div>

              {b.isAssigned ? (
                <div className="flex items-center gap-3 pt-1">
                  {b.counsellorPhoto ? (
                    <img src={b.counsellorPhoto} alt={b.counsellorName} className="w-11 h-11 rounded-xl object-cover border border-cyan-400/40 shadow" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-purple-600/20 text-purple-300 font-black text-sm flex items-center justify-center border border-purple-400/30 shadow">
                      {b.counsellorName?.substring(0, 2).toUpperCase() || 'WC'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-black text-white truncate drop-shadow-sm">{b.counsellorName}</h5>
                    <p className="text-[10px] text-gray-300 truncate">{b.counsellorEmail}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[9.5px]">
                      <span className="text-cyan-300 font-bold">👥 {b.wardStudentsCount} Ward Students</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                  <p className="text-xs font-extrabold text-amber-300">🟡 Ward Counsellor Not Assigned</p>
                  <p className="text-[9.5px] text-gray-400 mt-0.5">Awaiting HOD assignment</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/10 text-gray-300 font-medium">
                <span>HOD: <strong className="text-white font-bold">{b.hodName}</strong></span>
                <span className="text-cyan-300 font-bold hover:underline">Details →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Branch Analytics Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-black text-white drop-shadow-sm">Branch Comparison Table</h3>
          <div className="overflow-hidden rounded-2xl border border-white/10 overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-white">
              <thead className="bg-white/5 uppercase text-[10px] text-gray-300 tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">Branch / Department</th>
                  <th className="p-4">Ward Counsellor</th>
                  <th className="p-4 text-center">Ward Students</th>
                  <th className="p-4 text-center">Faculty</th>
                  <th className="p-4 text-center">Avg Attendance %</th>
                  <th className="p-4 text-center">Pass Rate %</th>
                  <th className="p-4 text-center">Placement Rate %</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((b) => (
                  <tr key={b.branch} onClick={() => setSelectedBranch(b)} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="p-4 font-extrabold text-white">{b.branch}</td>
                    <td className="p-4">
                      {b.isAssigned ? (
                        <div>
                          <span className="font-extrabold text-white block">{b.counsellorName}</span>
                          <span className="text-[10px] text-gray-300 block">{b.counsellorEmail}</span>
                        </div>
                      ) : (
                        <span className="text-amber-300 font-bold text-[10.5px]">🟡 Not Assigned</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-cyan-300">{b.wardStudentsCount}</td>
                    <td className="p-4 text-center font-bold text-gray-300">{b.faculty}</td>
                    <td className="p-4 text-center font-extrabold text-emerald-400">{b.attendance}%</td>
                    <td className="p-4 text-center font-black text-purple-300">{b.passRate}%</td>
                    <td className="p-4 text-center font-black text-cyan-400">{b.placementRate}%</td>
                    <td className="p-4 text-right text-cyan-300 font-bold text-xs">View Overview</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Branch Overview Modal */}
      {selectedBranch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-xl w-full p-6 space-y-6 text-white animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase rounded-full">
                  Branch Overview
                </span>
                <h3 className="text-lg font-black text-white drop-shadow-md mt-1 font-display">{selectedBranch.branch}</h3>
              </div>
              <button onClick={() => setSelectedBranch(null)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* HOD & Ward Counsellor Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-black block">Head of Department (HOD)</span>
                <h4 className="text-sm font-black text-white mt-1">{selectedBranch.hodName}</h4>
                <p className="text-[10.5px] text-cyan-300 font-medium">{selectedBranch.hodEmail}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-black block">Branch Ward Counsellor</span>
                {selectedBranch.isAssigned ? (
                  <div className="mt-1">
                    <h4 className="text-sm font-black text-white">{selectedBranch.counsellorName}</h4>
                    <p className="text-[10.5px] text-cyan-300 font-medium">{selectedBranch.counsellorEmail}</p>
                    <span className="text-[9.5px] text-emerald-400 font-bold block mt-1">👥 {selectedBranch.wardStudentsCount} Assigned Ward Students</span>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-amber-300 mt-1">🟡 Ward Counsellor Not Assigned</p>
                )}
              </div>
            </div>

            {/* Assigned Faculty Section in Branch Modal */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                HOD Assigned Teaching Faculty ({branchFacultyAllocations.length})
              </h4>
              {branchFacultyAllocations.length === 0 ? (
                <div className="p-3 bg-white/5 rounded-xl text-center text-gray-400 text-xs border border-white/10">
                  No active faculty course assignments recorded for {selectedBranch.branch}.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {branchFacultyAllocations.map(fac => (
                    <div key={fac.id || fac.allocationId} className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div>
                        <strong className="text-xs font-black text-white block">{fac.facultyName}</strong>
                        <span className="text-[10.5px] text-cyan-300 font-bold">{fac.subjectName || fac.subject}</span>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="text-gray-300 font-bold block">{fac.semester || 'Semester 1'} • {fac.section || 'Section A'}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[9.5px] font-black uppercase">Assigned</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[9.5px] text-gray-400 block font-bold">Students</span>
                <span className="text-base font-black text-white">{selectedBranch.students}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[9.5px] text-gray-400 block font-bold">Faculty</span>
                <span className="text-base font-black text-white">{selectedBranch.faculty}</span>
              </div>
              <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl">
                <span className="text-[9.5px] block font-bold">Attendance</span>
                <span className="text-base font-black">{selectedBranch.attendance}%</span>
              </div>
              <div className="p-3 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-2xl">
                <span className="text-[9.5px] block font-bold">Pass Rate</span>
                <span className="text-base font-black">{selectedBranch.passRate}%</span>
              </div>
              <div className="p-3 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-2xl">
                <span className="text-[9.5px] block font-bold">Placement</span>
                <span className="text-base font-black">{selectedBranch.placementRate}%</span>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-white/10">
              <button onClick={() => setSelectedBranch(null)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs rounded-xl cursor-pointer transition-all">
                Close Overview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// 3. SEMESTER RESULT ANALYTICS
const PrincipalSemesterResults = () => {
  const [dept, setDept] = useState('All Departments');
  const [year, setYear] = useState('2025-26');
  const [semester, setSemester] = useState('Semester 6');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await mockDB.getSemesterResultAnalytics(dept, year, semester);
      setData(res);
    };
    fetchResults();
  }, [dept, year, semester]);

  if (!data) return <div className="p-8 text-center text-gray-400 text-xs font-bold">Loading semester results...</div>;

  const s = data.summary;

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Header & Filters Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Academic Performance
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Semester Result Analytics</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Institutional academic performance breakdown and subject alerts</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={dept} onChange={e => setDept(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer">
            <option value="All Departments" className="bg-slate-900 text-white">All Departments</option>
            {COLLEGE_DEPARTMENTS.map((d, idx) => (
              <option key={`${d}-${idx}`} value={d} className="bg-slate-900 text-white">{d}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer">
            <option value="2025-26" className="bg-slate-900 text-white">2025-26</option>
            <option value="2026-27" className="bg-slate-900 text-white">2026-27</option>
          </select>
          <select value={semester} onChange={e => setSemester(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer">
            {KBN_SEMESTERS.map(sem => <option key={sem} value={sem} className="bg-slate-900 text-white">{sem}</option>)}
          </select>
        </div>
      </div>

      {/* Semester Performance Dashboard Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
        <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <span className="text-[10px] text-gray-300 block uppercase font-bold">Total Students</span>
          <span className="text-xl font-black text-white">{s.totalStudents}</span>
        </div>
        <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <span className="text-[10px] text-gray-300 block uppercase font-bold">Appeared</span>
          <span className="text-xl font-black text-cyan-300">{s.appearedStudents}</span>
        </div>
        <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <span className="text-[10px] text-gray-300 block uppercase font-bold">Passed</span>
          <span className="text-xl font-black text-emerald-400">{s.passedStudents}</span>
        </div>
        <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <span className="text-[10px] text-gray-300 block uppercase font-bold">Failed</span>
          <span className="text-xl font-black text-rose-400">{s.failedStudents}</span>
        </div>
        <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <span className="text-[10px] text-gray-300 block uppercase font-bold">Pass Rate %</span>
          <span className="text-xl font-black text-purple-300">{s.passPercentage}%</span>
        </div>
        <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <span className="text-[10px] text-gray-300 block uppercase font-bold">Avg %</span>
          <span className="text-xl font-black text-cyan-300">{s.averagePercentage}%</span>
        </div>
      </div>

      {/* Low Performance Alert Banner */}
      {data.lowPerformanceAlerts.length > 0 && (
        <div className="p-5 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl space-y-2 text-white">
          <div className="flex items-center gap-2 text-amber-300 font-black text-xs">
            <AlertTriangle size={18} />
            <span>Academic Performance Alerts (Critical / Attention Required)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.lowPerformanceAlerts.map(al => (
              <div key={al.subject} className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-amber-500/20 text-xs font-bold text-gray-200">
                {al.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Semester Trend & Branch Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <h3 className="text-xs font-black uppercase text-cyan-300 tracking-wider mb-4">Semester-wise Performance Trend</h3>
          <div className="h-60 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={240}>
              <LineChart data={data.semesterTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="semester" stroke="#CBD5E1" />
                <YAxis domain={[60, 100]} stroke="#CBD5E1" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="passRate" stroke="#A855F7" strokeWidth={3} dot={{ r: 5, fill: '#A855F7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
          <h3 className="text-xs font-black uppercase text-cyan-300 tracking-wider mb-4">Branch-wise Semester Performance ({semester})</h3>
          <div className="h-60 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={240}>
              <BarChart data={data.branchComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="branch" stroke="#CBD5E1" />
                <YAxis domain={[50, 100]} stroke="#CBD5E1" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="passRate" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Performance Table Card */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden p-6 space-y-4 text-white">
        <h3 className="text-base font-black text-white drop-shadow-sm">Subject-wise Academic Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-white">
            <thead className="bg-white/5 uppercase text-[10px] text-gray-300 tracking-wider border-b border-white/10">
              <tr>
                <th className="p-3.5">Subject Name</th>
                <th className="p-3.5 text-center">Appeared</th>
                <th className="p-3.5 text-center">Passed</th>
                <th className="p-3.5 text-center">Failed</th>
                <th className="p-3.5 text-center">Pass Rate %</th>
                <th className="p-3.5 text-center">Avg Marks</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.subjects.map((sub) => (
                <tr key={sub.name} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-extrabold text-white">{sub.name}</td>
                  <td className="p-3.5 text-center font-bold text-gray-300">{sub.appeared}</td>
                  <td className="p-3.5 text-center font-bold text-emerald-400">{sub.passed}</td>
                  <td className="p-3.5 text-center font-bold text-rose-400">{sub.failed}</td>
                  <td className="p-3.5 text-center font-black text-purple-300">{sub.passRate}%</td>
                  <td className="p-3.5 text-center font-bold text-cyan-300">{sub.avgMarks}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sub.status === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : sub.status === 'Attention' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'}`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 4. ACADEMIC PERFORMANCE & RISK ANALYTICS
const PrincipalAcademicPerformance = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchRisk = async () => {
      const res = await mockDB.getAcademicRiskAnalytics();
      setData(res);
    };
    fetchRisk();
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-400 text-xs">Loading academic risk analytics...</div>;

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Academic Risk Oversight
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Academic Risk Analytics & Marks Distribution</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Identify students requiring academic intervention and monitor grade distributions</p>
        </div>
      </div>

      {/* Main Glass Content Card */}
      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white space-y-8">
        {/* Marks Distribution Grid */}
        <div>
          <h3 className="text-xs font-black uppercase text-cyan-300 tracking-wider mb-3">Marks Distribution Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {data.distribution.map((d) => (
              <div key={d.range} className="p-4 bg-white/5 rounded-2xl text-center border border-white/10 shadow-sm">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">{d.range}</span>
                <span className="text-2xl font-black text-cyan-300 mt-1 block">{d.count}</span>
                <span className="text-[9px] text-gray-300 block mt-0.5">Students</span>
              </div>
            ))}
          </div>
        </div>

        {/* Students Requiring Attention Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-white drop-shadow-sm">Students Requiring Attention (At Risk)</h3>
          <div className="overflow-hidden rounded-2xl border border-white/10 overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-white">
              <thead className="bg-white/5 uppercase text-[10px] text-gray-300 tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3.5">Roll Number</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5">Semester</th>
                  <th className="p-3.5 text-center">Attendance %</th>
                  <th className="p-3.5">Primary Concern</th>
                  <th className="p-3.5 text-center">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.atRiskStudents.map((st, index) => (
                  <tr key={`${st.rollNumber || st.id || 'st'}-${index}`} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-300">{st.rollNumber}</td>
                    <td className="p-3.5 font-extrabold text-white">{st.name}</td>
                    <td className="p-3.5 font-bold text-purple-300">{st.department}</td>
                    <td className="p-3.5 text-gray-300">{st.semester}</td>
                    <td className={`p-3.5 text-center font-black ${st.attendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>{st.attendance}%</td>
                    <td className="p-3.5 text-gray-300">{st.result}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${st.risk === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : st.risk === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'}`}>
                        {st.risk === 'High' ? '🔴 High' : st.risk === 'Medium' ? '🟡 Medium' : '🟢 Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. FACULTY OVERVIEW & HOD COURSE ALLOCATIONS (VIEW ONLY)
const PrincipalFacultyOverview = ({ principal }) => {
  const [facultyAllocations, setFacultyAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [semesterFilter, setSemesterFilter] = useState('All Semesters');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      let facultyList = [];
      const seenEmails = new Set();
      const seenUids = new Set();

      // 1. PRIMARY QUERY: Fetch ALL users from Firestore `users` collection where role === 'faculty'
      if (isFirebaseConfigured && db) {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('role', '==', 'faculty'));
          const snap = await getDocs(q);
          snap.forEach(docSnap => {
            const data = docSnap.data();
            const uid = docSnap.id;
            const email = (data.email || '').toLowerCase();
            if (email) seenEmails.add(email);
            seenUids.add(uid);
            facultyList.push({
              uid,
              id: uid,
              facultyId: data.employeeId || data.facultyId || uid,
              facultyName: data.fullName || data.name || data.facultyName || 'Faculty Member',
              facultyEmail: data.email || 'N/A',
              facultyPhone: data.mobile || data.phone || data.contactNumber || 'N/A',
              facultyDesignation: data.designation || data.facultyDesignation || 'Faculty Member',
              facultyPhoto: data.photoURL || data.profileImage || data.facultyPhoto || null,
              department: data.department || data.branch || data.assignedBranch || 'N/A',
              branch: data.department || data.branch || data.assignedBranch || 'N/A',
              status: data.status || 'Active',
              ...data
            });
          });
        } catch (fsErr) {
          console.error('[Firestore] Error fetching faculty users:', fsErr);
        }
      }

      // Fallback/Merge mockDB faculty users for offline/demo environments
      try {
        if (mockDB?.getAllUsers) {
          const allMock = await mockDB.getAllUsers();
          const mockFaculty = allMock.filter(u => u.role === 'faculty');
          mockFaculty.forEach(f => {
            const email = (f.email || '').toLowerCase();
            const key = f.uid || f.id || email;
            if ((!email || !seenEmails.has(email)) && (!seenUids.has(key))) {
              if (email) seenEmails.add(email);
              seenUids.add(key);
              facultyList.push({
                uid: f.uid || f.id,
                id: f.uid || f.id,
                facultyId: f.employeeId || f.facultyId || f.uid || f.id,
                facultyName: f.fullName || f.name || f.facultyName || 'Faculty Member',
                facultyEmail: f.email || 'N/A',
                facultyPhone: f.mobile || f.phone || f.contactNumber || 'N/A',
                facultyDesignation: f.designation || f.facultyDesignation || 'Faculty Member',
                facultyPhoto: f.photoURL || f.profileImage || f.facultyPhoto || null,
                department: f.department || f.branch || 'N/A',
                branch: f.department || f.branch || 'N/A',
                status: f.status || 'Active',
                ...f
              });
            }
          });
        }
      } catch (mockErr) {
        console.warn('Mock faculty fetch warning:', mockErr);
      }

      // 2. SECONDARY DATA: Fetch course allocations separately and map to faculty
      let allocations = [];
      if (isFirebaseConfigured && db) {
        try {
          const allocSnap = await getDocs(collection(db, 'courseAllocations'));
          allocSnap.forEach(docSnap => {
            allocations.push({ id: docSnap.id, allocationId: docSnap.id, ...docSnap.data() });
          });
        } catch (allocErr) {
          console.warn('[Firestore] Error fetching courseAllocations:', allocErr);
        }
      }

      // Merge mock course allocations
      try {
        if (mockDB?.getAllFacultyAllocations) {
          const mockAllocs = await mockDB.getAllFacultyAllocations();
          const seenAllocIds = new Set(allocations.map(a => a.id || a.allocationId));
          mockAllocs.forEach(ma => {
            const id = ma.id || ma.allocationId;
            if (id && !seenAllocIds.has(id)) {
              seenAllocIds.add(id);
              allocations.push(ma);
            }
          });
        }
      } catch (_) {}

      // 3. COMBINE FACULTY WITH ALLOCATIONS OR RENDER UNASSIGNED FALLBACK
      const combinedRecords = [];

      facultyList.forEach(fac => {
        const facId = fac.uid || fac.id || fac.employeeId;
        const facEmail = (fac.facultyEmail || fac.email || '').toLowerCase();

        // Match allocations by faculty UID/ID or Email
        const matchedAllocations = allocations.filter(a => {
          const aFacId = a.facultyId || a.uid;
          const aEmail = (a.facultyEmail || a.email || '').toLowerCase();
          return (aFacId && (aFacId === facId || aFacId === fac.uid || aFacId === fac.employeeId)) ||
                 (facEmail && aEmail === facEmail);
        });

        if (matchedAllocations.length > 0) {
          matchedAllocations.forEach(alloc => {
            combinedRecords.push({
              ...fac,
              ...alloc,
              recordKey: `${fac.uid || fac.id}-${alloc.id || alloc.allocationId}`,
              isAllocated: true,
              facultyName: fac.facultyName || alloc.facultyName,
              facultyDesignation: fac.facultyDesignation || alloc.facultyDesignation,
              facultyEmail: fac.facultyEmail || alloc.facultyEmail,
              facultyPhone: fac.facultyPhone || alloc.facultyPhone,
              branch: alloc.branch || alloc.department || fac.department || fac.branch || 'N/A',
              semester: alloc.semester || 'N/A',
              section: alloc.section || 'N/A',
              subjectName: alloc.subjectName || alloc.subject || 'Not Assigned',
              status: alloc.status || fac.status || 'Active'
            });
          });
        } else {
          // Rule 3: GRACEFUL FALLBACK - If no subject assignment yet, keep faculty visible with "Not Assigned"
          combinedRecords.push({
            ...fac,
            recordKey: `${fac.uid || fac.id}-unassigned`,
            isAllocated: false,
            branch: fac.department || fac.branch || 'N/A',
            semester: 'Not Assigned',
            section: 'Not Assigned',
            subjectName: 'Not Assigned',
            status: fac.status || 'Active'
          });
        }
      });

      setFacultyAllocations(combinedRecords);
    } catch (err) {
      console.error('Error loading faculty overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [principal]);

  const filteredAllocations = facultyAllocations.filter((a) => {
    const matchesSearch =
      (a.facultyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.facultyEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.subjectName || a.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.facultyDesignation || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch =
      branchFilter === 'All Branches' ||
      a.branch === branchFilter ||
      a.department === branchFilter;

    const matchesSemester =
      semesterFilter === 'All Semesters' || a.semester === semesterFilter;

    const matchesStatus =
      statusFilter === 'All Statuses' || (a.status || 'Active') === statusFilter;

    return matchesSearch && matchesBranch && matchesSemester && matchesStatus;
  });

  const facultyAllAssignments = selectedFaculty
    ? facultyAllocations.filter(
        (a) =>
          a.isAllocated &&
          ((a.uid && a.uid === selectedFaculty.uid) ||
           (a.facultyEmail && a.facultyEmail === selectedFaculty.facultyEmail))
      )
    : [];

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full text-[10px] font-black uppercase">
              Principal Executive View
            </span>
            <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-black uppercase">
              View Only
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Faculty & Subject Course Allocations</h1>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Real-time breakdown of ALL registered faculty members and their subject course allocations</p>
        </div>
      </div>

      {/* Filters & Search Glass Panel */}
      <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 text-xs font-semibold"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="All Branches" className="bg-slate-900 text-white">All Branches</option>
            {KBN_BRANCHES.map((b, idx) => (
              <option key={`${b}-${idx}`} value={b} className="bg-slate-900 text-white">{b}</option>
            ))}
          </select>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="All Semesters" className="bg-slate-900 text-white">All Semesters</option>
            <option value="Semester 1" className="bg-slate-900 text-white">Semester 1</option>
            <option value="Semester 2" className="bg-slate-900 text-white">Semester 2</option>
            <option value="Semester 3" className="bg-slate-900 text-white">Semester 3</option>
            <option value="Semester 4" className="bg-slate-900 text-white">Semester 4</option>
            <option value="Semester 5" className="bg-slate-900 text-white">Semester 5</option>
            <option value="Semester 6" className="bg-slate-900 text-white">Semester 6</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold focus:bg-white/10 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="All Statuses" className="bg-slate-900 text-white">All Statuses</option>
            <option value="Active" className="bg-slate-900 text-white">Active</option>
            <option value="Inactive" className="bg-slate-900 text-white">Inactive</option>
            <option value="Reassigned" className="bg-slate-900 text-white">Reassigned</option>
          </select>
        </div>

        <span className="text-[11px] font-bold text-cyan-300">
          Showing {filteredAllocations.length} Faculty Members & Allocations
        </span>
      </div>

      {/* Faculty Assignment Table Card */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-white">
            <thead className="bg-white/5 uppercase text-[10px] text-gray-300 tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Official Contact</th>
                <th className="p-4">Branch / Department</th>
                <th className="p-4 text-center">Semester</th>
                <th className="p-4 text-center">Section</th>
                <th className="p-4">Assigned Subject</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400 animate-pulse">Loading faculty user directory...</td>
                </tr>
              ) : filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">No faculty accounts match the selected filters.</td>
                </tr>
              ) : (
                filteredAllocations.map((alloc, idx) => (
                  <tr
                    key={alloc.recordKey || `${alloc.uid}-${idx}`}
                    onClick={() => setSelectedFaculty(alloc)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {alloc.facultyPhoto ? (
                          <img src={alloc.facultyPhoto} alt={alloc.facultyName} className="w-10 h-10 rounded-xl object-cover border border-cyan-400/30 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 font-black flex items-center justify-center border border-purple-400/30 shrink-0">
                            {alloc.facultyName?.substring(0, 2).toUpperCase() || 'FC'}
                          </div>
                        )}
                        <div>
                          <strong className="text-white font-extrabold text-xs block">{alloc.facultyName}</strong>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {alloc.facultyId || alloc.uid || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-gray-300">
                      {alloc.facultyDesignation}
                    </td>

                    <td className="p-4">
                      <span className="text-white block font-medium">{alloc.facultyEmail}</span>
                      <span className="text-[10px] text-gray-400 font-mono">📞 {alloc.facultyPhone}</span>
                    </td>

                    <td className="p-4 font-black">
                      {alloc.branch && alloc.branch !== 'N/A' ? (
                        <span className="text-cyan-300">{alloc.branch}</span>
                      ) : (
                        <span className="text-gray-500 italic font-normal">Not Assigned</span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {alloc.semester && alloc.semester !== 'Not Assigned' && alloc.semester !== 'N/A' ? (
                        <span className="font-bold text-indigo-300">{alloc.semester}</span>
                      ) : (
                        <span className="text-gray-500 italic font-normal">Not Assigned</span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {alloc.section && alloc.section !== 'Not Assigned' && alloc.section !== 'N/A' ? (
                        <span className="font-bold text-gray-300">{alloc.section}</span>
                      ) : (
                        <span className="text-gray-500 italic font-normal">Not Assigned</span>
                      )}
                    </td>

                    <td className="p-4 font-bold">
                      {alloc.subjectName && alloc.subjectName !== 'Not Assigned' && alloc.subjectName !== 'N/A' ? (
                        <span className="font-black text-white">{alloc.subjectName}</span>
                      ) : (
                        <span className="text-gray-500 italic font-normal">Not Assigned</span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-black">
                        {alloc.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Details Drawer Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-6 text-white animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase rounded-full">
                  Faculty Member Profile
                </span>
                <h3 className="text-lg font-black text-white drop-shadow-md mt-1 font-display">{selectedFaculty.facultyName}</h3>
              </div>
              <button onClick={() => setSelectedFaculty(null)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              {selectedFaculty.facultyPhoto ? (
                <img src={selectedFaculty.facultyPhoto} alt={selectedFaculty.facultyName} className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/40 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0 border border-purple-400/30">
                  {selectedFaculty.facultyName?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-sm font-black text-white">{selectedFaculty.facultyName}</h4>
                <p className="text-xs text-cyan-300 font-bold">{selectedFaculty.facultyDesignation}</p>
                <p className="text-[11px] text-gray-300">{selectedFaculty.facultyEmail}</p>
                <p className="text-[11px] text-gray-400 font-mono">📞 {selectedFaculty.facultyPhone}</p>
              </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Active Academic Assignments ({facultyAllAssignments.length})
              </h4>

              {facultyAllAssignments.length === 0 ? (
                <div className="p-4 bg-white/5 rounded-2xl text-center text-gray-400 italic font-normal border border-white/10">
                  No subject course allocations assigned by HOD yet.
                </div>
              ) : (
                facultyAllAssignments.map((asg, idx) => (
                  <div key={idx} className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white">{asg.subjectName || asg.subject}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[9.5px] font-black">Active</span>
                    </div>
                    <div className="text-[11px] text-cyan-300 font-bold">
                      {asg.branch || asg.department} • {asg.semester} • {asg.section}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[11px] text-gray-300">
              <strong className="text-purple-300 block">📌 Principal View Only:</strong>
              This faculty profile is registered in the ERP system. Course assignments are managed by respective HODs.
            </div>

            <div className="text-right border-t border-white/10 pt-3">
              <button onClick={() => setSelectedFaculty(null)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs rounded-xl cursor-pointer transition-all">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 6. WARD COUNSELLOR OVERVIEW (VIEW ONLY)
const PrincipalWardCounsellorOverview = ({ principal }) => {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const data = await mockDB.getAllWardCounsellors();
    setCounsellors(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [principal]);

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full text-[10px] font-black uppercase">
              Principal Executive View
            </span>
            <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-black uppercase">
              View Only
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Branch Ward Counsellors Overview</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Assigned faculty mentors monitoring student ward attendance & performance</p>
        </div>
      </div>

      {/* Ward Counsellor Table Card */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-white">
            <thead className="bg-white/5 uppercase text-[10px] text-gray-300 tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Ward Counsellor</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Official Email</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Assigned Branch</th>
                <th className="p-4 text-center">Ward Students</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400 animate-pulse">Loading branch ward counsellors...</td>
                </tr>
              ) : counsellors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">No active ward counsellors assigned.</td>
                </tr>
              ) : (
                counsellors.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCounsellor(c)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {c.facultyPhoto ? (
                          <img src={c.facultyPhoto} alt={c.facultyName} className="w-10 h-10 rounded-xl object-cover border border-cyan-400/30 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 font-black flex items-center justify-center border border-purple-400/30 shrink-0">
                            {c.facultyName?.substring(0, 2).toUpperCase() || 'WC'}
                          </div>
                        )}
                        <div>
                          <strong className="text-white font-extrabold text-xs block">{c.facultyName}</strong>
                          <span className="text-[10px] text-cyan-300 font-bold">Faculty Ward Mentor</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-300">{c.facultyDesignation || c.designation || 'Faculty Member'}</td>
                    <td className="p-4 font-medium text-white">{c.facultyEmail || c.email}</td>
                    <td className="p-4 font-mono text-gray-400">{c.facultyPhone || '9876543211'}</td>
                    <td className="p-4 font-black text-cyan-300">{c.department}</td>
                    <td className="p-4 text-center font-black text-indigo-300">{c.wardStudentsCount || 181}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-black">
                        {c.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ward Counsellor Details Modal */}
      {selectedCounsellor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-6 text-white animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase rounded-full">
                  Ward Counsellor Profile
                </span>
                <h3 className="text-lg font-black text-white drop-shadow-md mt-1 font-display">{selectedCounsellor.facultyName}</h3>
              </div>
              <button onClick={() => setSelectedCounsellor(null)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              {selectedCounsellor.facultyPhoto ? (
                <img src={selectedCounsellor.facultyPhoto} alt={selectedCounsellor.facultyName} className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/40 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0 border border-purple-400/30">
                  {selectedCounsellor.facultyName?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-sm font-black text-white">{selectedCounsellor.facultyName}</h4>
                <p className="text-xs text-cyan-300 font-bold">{selectedCounsellor.department} Ward Counsellor</p>
                <p className="text-[11px] text-gray-300">{selectedCounsellor.facultyEmail || selectedCounsellor.email}</p>
                <p className="text-[11px] text-gray-400 font-mono">📞 {selectedCounsellor.facultyPhone || '9876543211'}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[9.5px] text-gray-400 font-bold block">Assigned Wards</span>
                <span className="text-lg font-black text-cyan-300">{selectedCounsellor.wardStudentsCount || 181}</span>
              </div>
              <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl">
                <span className="text-[9.5px] font-bold block">Attendance Avg</span>
                <span className="text-lg font-black">84.2%</span>
              </div>
              <div className="p-3 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-2xl">
                <span className="text-[9.5px] font-bold block">Low Att (&lt;75%)</span>
                <span className="text-lg font-black">12 Wards</span>
              </div>
            </div>

            <div className="text-right border-t border-white/10 pt-3">
              <button onClick={() => setSelectedCounsellor(null)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs rounded-xl cursor-pointer transition-all">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 6. ATTENDANCE ANALYTICS
const PrincipalAttendanceAnalytics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAtt = async () => {
      const res = await mockDB.getBranchAnalytics();
      setData(res);
    };
    fetchAtt();
  }, []);

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Institutional Compliance
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Branch-wise Attendance Analytics</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Institutional attendance compliance and low attendance tracking across departments</p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white space-y-4">
        <h3 className="text-sm font-black text-white drop-shadow-sm">Departmental Attendance Metrics</h3>
        <div className="overflow-hidden rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-white">
            <thead className="bg-white/5 uppercase text-[10px] text-gray-300 tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Department / Branch</th>
                <th className="p-4 text-center">Avg Attendance %</th>
                <th className="p-4 text-center">Present %</th>
                <th className="p-4 text-center">Absent %</th>
                <th className="p-4 text-center">Students Below 75%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((b) => (
                <tr key={b.branch} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-extrabold text-white">{b.branch}</td>
                  <td className="p-4 text-center font-black text-emerald-400">{b.attendance}%</td>
                  <td className="p-4 text-center font-bold text-emerald-400">{b.attendance}%</td>
                  <td className="p-4 text-center font-bold text-rose-400">{(100 - b.attendance).toFixed(1)}%</td>
                  <td className="p-4 text-center font-black text-rose-300">{Math.round(b.students * 0.12)} Students</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 7. PLACEMENT ANALYTICS
const PrincipalPlacementAnalytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPlacement = async () => {
      const res = await mockDB.getPlacementAnalytics();
      setData(res);
    };
    fetchPlacement();
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-400 text-xs font-bold">Loading placement analytics...</div>;

  const ov = data.overview;

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Recruitment & Careers
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Corporate Placement Overview</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Institutional recruitment statistics and branch-wise placement performance</p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-6 text-white">
        <h3 className="text-sm font-black text-white drop-shadow-sm">Institutional Placement KPIs</h3>

        {/* Placement KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[9.5px] text-gray-400 block font-bold">Eligible</span>
            <span className="text-lg font-black text-white">{ov.eligibleStudents}</span>
          </div>
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[9.5px] text-gray-400 block font-bold">Registered</span>
            <span className="text-lg font-black text-cyan-300">{ov.registeredStudents}</span>
          </div>
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[9.5px] text-gray-400 block font-bold">Placed</span>
            <span className="text-lg font-black text-emerald-400">{ov.placedStudents}</span>
          </div>
          <div className="p-3.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-2xl">
            <span className="text-[9.5px] block font-bold">Placement Rate</span>
            <span className="text-lg font-black">{ov.placementRate}%</span>
          </div>
          <div className="p-3.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-2xl">
            <span className="text-[9.5px] block font-bold">Companies</span>
            <span className="text-lg font-black">{ov.companiesParticipated}</span>
          </div>
          <div className="p-3.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl">
            <span className="text-[9.5px] block font-bold">Highest Package</span>
            <span className="text-lg font-black">{ov.highestPackage}</span>
          </div>
          <div className="p-3.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-2xl">
            <span className="text-[9.5px] block font-bold">Avg Package</span>
            <span className="text-lg font-black">{ov.averagePackage}</span>
          </div>
        </div>

        {/* Branch Placement Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black uppercase text-cyan-300 tracking-wider">Branch Placement Distribution</h4>
          <div className="overflow-hidden rounded-2xl border border-white/10 overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-white">
              <thead className="bg-white/5 uppercase text-[10px] text-gray-300 tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">Branch / Department</th>
                  <th className="p-4 text-center">Eligible Students</th>
                  <th className="p-4 text-center">Students Placed</th>
                  <th className="p-4 text-center">Placement %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.branchPlacements.map((bp) => (
                  <tr key={bp.department} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-extrabold text-white">{bp.department}</td>
                    <td className="p-4 text-center font-bold text-gray-300">{bp.eligible}</td>
                    <td className="p-4 text-center font-black text-emerald-400">{bp.placed}</td>
                    <td className="p-4 text-center font-black text-cyan-300">{bp.placementRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// 8. LEAVES REVIEW
const PrincipalLeaves = () => {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const fetchLeaves = async () => {
      const res = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
      setLeaves(res);
    };
    fetchLeaves();
  }, []);

  const handleAction = async (id, status) => {
    const updated = leaves.map(l => l.id === id ? { ...l, status } : l);
    localStorage.setItem('acad_leave_requests', JSON.stringify(updated));
    setLeaves(updated);
  };

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Staff Administration
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Faculty & Staff Leaves Review</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Institutional leave applications and approval oversight</p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
        <h3 className="text-sm font-black text-white drop-shadow-sm">Leave Applications Log</h3>
        <div className="overflow-hidden rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-white">
            <thead className="bg-white/5 uppercase text-[10px] text-gray-300 tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Applicant</th>
                <th className="p-4">Department</th>
                <th className="p-4">Leave Type</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaves.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No pending leave applications recorded.</td></tr>
              ) : leaves.map((l) => (
                <tr key={l.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">{l.facultyName || l.applicantName || 'Faculty Member'}</td>
                  <td className="p-4 font-bold text-cyan-300">{l.department}</td>
                  <td className="p-4 text-gray-300">{l.leaveType || 'Casual Leave'}</td>
                  <td className="p-4 text-gray-300">{l.startDate} to {l.endDate}</td>
                  <td className="p-4 text-gray-300">{l.reason}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${l.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : l.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {l.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(l.id, 'approved')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-md cursor-pointer transition-all">Approve</button>
                        <button onClick={() => handleAction(l.id, 'rejected')} className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold shadow-md cursor-pointer transition-all">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 9. ACADEMIC CALENDAR
const PrincipalCalendar = () => {
  const events = [
    { title: 'Semester 6 Mid Examinations', date: 'March 15, 2026', type: 'Exam' },
    { title: 'Ugadi Holiday', date: 'March 22, 2026', type: 'Holiday' },
    { title: 'Practical Lab Assessment', date: 'April 05, 2026', type: 'Exam' },
    { title: 'End Semester Examinations', date: 'April 20, 2026', type: 'Exam' },
    { title: 'Summer Vacation Starts', date: 'May 10, 2026', type: 'Vacation' }
  ];

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Schedules & Deadlines
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Institutional Academic Calendar</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Key examination milestones, practical assessments, and university holidays</p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
        <h3 className="text-sm font-black text-white drop-shadow-sm">Upcoming Institutional Events</h3>
        <div className="space-y-3">
          {events.map((ev, i) => (
            <div key={i} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between border border-white/10 transition-colors">
              <div>
                <h4 className="text-sm font-black text-white">{ev.title}</h4>
                <p className="text-xs text-cyan-300 font-bold mt-0.5">{ev.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${ev.type === 'Exam' ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'}`}>
                {ev.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 10. DOCUMENT DISPATCH
const PrincipalDocuments = () => {
  const docs = [
    { id: 'DOC-901', student: 'A. Vikram', dept: 'CSE', type: 'Bonafide Certificate', status: 'Dispatched', date: '2026-03-01' },
    { id: 'DOC-902', student: 'R. Divya', dept: 'ECE', type: 'Official Transcript', status: 'Pending Approval', date: '2026-03-02' },
    { id: 'DOC-903', student: 'S. Karthik', dept: 'EEE', type: 'Transfer Certificate', status: 'Dispatched', date: '2026-03-03' }
  ];

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Registry & Archives
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Document Dispatch & Certification Track</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Verification and approval log for student certificates, transcripts, and credentials</p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
        <h3 className="text-sm font-black text-white drop-shadow-sm">Dispatched & Pending Certificates</h3>
        <div className="overflow-hidden rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-white">
            <thead className="bg-white/5 uppercase text-[10px] text-gray-300 tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Req ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Department</th>
                <th className="p-4">Document Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {docs.map((d) => (
                <tr key={d.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-cyan-300">{d.id}</td>
                  <td className="p-4 font-bold text-white">{d.student}</td>
                  <td className="p-4 font-bold text-purple-300">{d.dept}</td>
                  <td className="p-4 text-gray-300">{d.type}</td>
                  <td className="p-4 text-gray-300">{d.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${d.status === 'Dispatched' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 11. COMPILE REPORTS
const PrincipalReports = () => {
  const reports = [
    { title: 'Semester Academic Performance Report', cat: 'Academic', format: 'PDF / Excel' },
    { title: 'Institutional Attendance Compliance Report', cat: 'Attendance', format: 'PDF' },
    { title: 'Faculty Workload & Department Report', cat: 'Faculty', format: 'Excel' },
    { title: 'Corporate Placement Placement Drive Summary', cat: 'Placement', format: 'PDF' }
  ];

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent min-h-screen text-white font-sans">
      {/* Universal Glass Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Executive Intelligence
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">Institutional Report Compiler</h2>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">Generate, view, and export compliance and institutional intelligence dossiers</p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
        <h3 className="text-sm font-black text-white drop-shadow-sm">Available Institutional Dossiers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((r, i) => (
            <div key={i} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between transition-all">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-cyan-300 block">{r.cat}</span>
                <h4 className="text-xs font-black text-white mt-0.5">{r.title}</h4>
                <span className="text-[9.5px] text-gray-300 block mt-1">Export Format: {r.format}</span>
              </div>
              <button onClick={() => window.print()} className="px-3.5 py-2 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105">
                <Printer size={14} />
                <span>Export</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 12. PRINCIPAL SETTINGS & PROFILE MANAGEMENT
const PrincipalSettings = ({ principal }) => {
  const { user, showToast, updateProfilePhoto } = useAuth();
  const currentUser = principal || user || {};

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser.fullName || currentUser.name || 'Dr. Arthur Pendelton');
  const [email, setEmail] = useState(currentUser.email || 'principal@kbn.edu');
  const [phone, setPhone] = useState(currentUser.phone || currentUser.phoneNumber || '+91 98450 11223');
  const [designation, setDesignation] = useState(currentUser.designation || 'Principal & Institutional Executive');
  const [qualifications, setQualifications] = useState(currentUser.qualifications || 'Ph.D. in Computer Science & Engineering, M.Tech, B.Tech');
  const [officeRoom, setOfficeRoom] = useState(currentUser.officeRoom || 'Room 101, Executive Chambers, Administrative Block');
  const [bio, setBio] = useState(currentUser.bio || 'Leading academic excellence, NIRF accreditation, strategic industry alliances, and state-of-the-art campus research initiatives across all engineering disciplines.');
  
  // Photo State
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(currentUser.profilePhotoUrl || currentUser.photo || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid file format. Please select a JPG, JPEG, PNG, or WEBP image.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds maximum limit of 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setPhotoUrl(reader.result);
      setMessage('New photo selected. Click "Confirm Photo" or "Save Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!photoPreview && !photoUrl) return;
    try {
      setIsUploading(true);
      const chosenPhoto = photoPreview || photoUrl;
      await updateProfilePhoto(chosenPhoto);
      setPhotoPreview(null);
      setMessage('Profile photo updated successfully!');
      showToast('Principal profile photo updated!', 'success');
      setTimeout(() => setMessage(''), 4000);
    } catch (e) {
      showToast('Failed to upload photo. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestoreDefault = async () => {
    if (window.confirm('Are you sure you want to restore the default initial avatar?')) {
      try {
        setIsUploading(true);
        await updateProfilePhoto(null);
        setPhotoPreview(null);
        setPhotoUrl('');
        setMessage('Default avatar restored!');
        showToast('Default initial avatar restored.', 'info');
        setTimeout(() => setMessage(''), 4000);
      } catch (e) {
        showToast('Failed to restore avatar.', 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = {
        ...currentUser,
        fullName,
        name: fullName,
        email,
        phone,
        phoneNumber: phone,
        designation,
        qualifications,
        officeRoom,
        bio,
        profilePhotoUrl: photoUrl || currentUser.profilePhotoUrl,
        photo: photoUrl || currentUser.photo
      };

      if (photoPreview && updateProfilePhoto) {
        try {
          await updateProfilePhoto(photoPreview);
        } catch (_) {}
      }

      localStorage.setItem('acad_user', JSON.stringify(updatedUser));
      localStorage.setItem('acad_current_user', JSON.stringify(updatedUser));
      showToast('Principal profile information updated successfully!', 'success');
      setMessage('Profile changes saved successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      showToast('Failed to save profile changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const activePhoto = photoPreview || photoUrl || currentUser.profilePhotoUrl;
  const initialLetters = fullName ? fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'AP';

  return (
    <div className="space-y-6 text-xs font-semibold bg-transparent text-white font-sans max-w-4xl mx-auto">
      
      {/* Universal Glass Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-3 py-0.5 rounded-full border border-cyan-400/30 drop-shadow-md">
            Institutional Governance
          </span>
          <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md mt-1.5 font-display">
            Executive Profile & Institutional Settings
          </h3>
          <p className="text-xs text-gray-200 font-semibold drop-shadow-sm mt-0.5">
            Manage your executive credentials, official contact channels, qualifications, and system presence
          </p>
        </div>
        <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-2xl shrink-0 self-start md:self-auto">
          <ShieldCheck size={28} className="text-cyan-300" />
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Glass Settings Card */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white hover:border-white/20 transition-all space-y-8">
        
        {/* Profile Photo & Quick Credentials Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="relative group shrink-0">
            {activePhoto ? (
              <img
                src={activePhoto}
                alt="Principal"
                className="w-28 h-28 rounded-3xl object-cover border-2 border-cyan-400/60 shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500/80 to-amber-700/80 text-white font-black text-3xl flex items-center justify-center shadow-xl border-2 border-amber-400/50">
                {initialLetters}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow"></span>
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-base md:text-lg font-black text-white drop-shadow-md">{fullName}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase border border-cyan-400/30">
                  Principal
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-semibold">{designation}</p>
              <p className="text-[11px] text-gray-300 font-mono mt-0.5">{email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
              <label className="px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/30 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02]">
                <Camera size={14} />
                <span>{activePhoto ? 'Change Photo' : 'Upload Photo'}</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
              </label>

              {photoPreview && (
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={isUploading}
                  className="px-4 py-2.5 bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/40 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Upload size={14} />
                  <span>{isUploading ? 'Uploading...' : 'Confirm Photo'}</span>
                </button>
              )}

              {activePhoto && (
                <button
                  type="button"
                  onClick={handleRestoreDefault}
                  disabled={isUploading}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 hover:text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw size={14} />
                  <span>Restore Initial</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Supported formats: JPG, JPEG, PNG, WEBP (Max 5 MB)</p>
          </div>
        </div>

        {/* 2. PERSONAL INFORMATION UPDATE FORM */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-md border border-cyan-400/30">
              Personal Credentials
            </span>
            <h4 className="text-base font-black text-white drop-shadow-md mt-1.5 font-display">
              Personal Information Update
            </h4>
            <p className="text-xs text-gray-300 font-medium mt-0.5">
              Update your institutional leadership identity, official channels, qualifications, and vision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Dr. Arthur Pendelton"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Official Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="principal@kbn.edu"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Contact Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+91 98450 11223"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Designation / Institutional Title
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Principal & Institutional Executive"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Academic Qualifications
              </label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="Ph.D. in Computer Science, M.Tech"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
              />
            </div>

            {/* Office Room */}
            <div>
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Office Location / Executive Chambers
              </label>
              <input
                type="text"
                value={officeRoom}
                onChange={(e) => setOfficeRoom(e.target.value)}
                placeholder="Room 101, Executive Chambers, Admin Block"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
              />
            </div>

            {/* Photo URL option */}
            <div className="md:col-span-2">
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Profile Photo Direct Image URL (Optional)
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPhotoPreview(null);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs"
              />
            </div>

            {/* Bio / Overview */}
            <div className="md:col-span-2">
              <label className="block text-gray-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                Institutional Vision & Executive Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your leadership message or institutional vision..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-semibold text-xs resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>All updates sync with your session and institutional records immediately.</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <UserCheck size={16} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};
