import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_BRANCHES, KBN_SEMESTERS } from '../services/firebase';
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
  RotateCcw
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  const cards = stats?.cards || {};
  const insights = stats?.insights || [];
  const topDepartments = stats?.topDepartments || [];

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building size={140} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {principal?.profilePhotoUrl ? (
              <img src={principal.profilePhotoUrl} alt={principal?.fullName} className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/50 shadow-xl" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-xl border-2 border-amber-400/50">
                {principal?.fullName ? principal.fullName.split(' ').map(n => n[0]).join('') : 'DA'}
              </div>
            )}
            <div>
              <span className="px-3 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full">
                KBN Executive Command Console
              </span>
              <h2 className="text-2xl font-black font-display mt-1">Institutional Executive Overview</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Principal: <strong className="text-white font-bold">{principal?.fullName || 'Dr. Arthur Pendelton'}</strong> • Institutional Operations & Governance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/principal/branches" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl backdrop-blur-md border border-white/10">
              Branch Analytics
            </a>
            <a href="/principal/results" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-500/20">
              Semester Results
            </a>
          </div>
        </div>
      </div>

      {/* 10 Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Students</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cards.totalStudents}</p>
          <span className="text-[9.5px] text-emerald-500 font-bold block mt-1">Active Enrolled</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Faculty</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cards.totalFaculty}</p>
          <span className="text-[9.5px] text-purple-500 font-bold block mt-1">Teaching Staff</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Departments</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cards.totalDepartments}</p>
          <span className="text-[9.5px] text-indigo-500 font-bold block mt-1">Academic Branches</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total HODs</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cards.totalHODs}</p>
          <span className="text-[9.5px] text-amber-500 font-bold block mt-1">Department Heads</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Ward Counsellors</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cards.totalWardCounsellors}</p>
          <span className="text-[9.5px] text-emerald-500 font-bold block mt-1">Active Counsellors</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Attendance %</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{cards.attendancePercentage}%</p>
          <span className="text-[9.5px] text-slate-400 font-bold block mt-1">Institutional Average</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Students At Risk</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{cards.studentsAtRisk}</p>
          <span className="text-[9.5px] text-rose-500 font-bold block mt-1">&lt;75% Attendance / Low</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Students Passed</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{cards.studentsPassed}</p>
          <span className="text-[9.5px] text-emerald-500 font-bold block mt-1">Semester Passed</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Students Failed</span>
          <p className="text-2xl font-black text-rose-500 mt-1">{cards.studentsFailed}</p>
          <span className="text-[9.5px] text-slate-400 font-bold block mt-1">With Backlogs</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Placement Rate</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{cards.placementRate}%</p>
          <span className="text-[9.5px] text-indigo-500 font-bold block mt-1">Corporate Selections</span>
        </div>
      </div>

      {/* Executive Insights & Top Performing Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Executive Insights (Generated from Database Calculations) */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-purple-600" size={18} />
              Institutional Executive Insights
            </h3>
            <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 text-[9.5px] font-bold rounded-full">
              Automated Analytics
            </span>
          </div>

          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-purple-600/10 text-purple-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {ins.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Departments */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="text-amber-500" size={18} />
              Top Performing Departments
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dynamic Ranking</span>
          </div>

          <div className="space-y-3">
            {topDepartments.map((dept) => (
              <div key={dept.name} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${dept.rank === 1 ? 'bg-amber-400 text-slate-950' : dept.rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-amber-700 text-white'}`}>
                    #{dept.rank}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{dept.name}</h4>
                    <p className="text-[10px] text-slate-400">Pass Rate: <strong className="text-emerald-600">{dept.passRate}%</strong> • Avg Marks: {dept.avgMarks}</p>
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <span className="text-purple-600 dark:text-purple-400 font-black">{dept.placementRate}% Placement</span>
                  <span className="text-[9.5px] text-slate-400 block font-medium">Att: {dept.attendance}%</span>
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
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Branch Analytics & Ward Counsellors</h2>
            <p className="text-xs text-slate-400">View active branch ward counsellors, HOD assignments, and institutional performance metrics</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10.5px] font-bold rounded-full border border-emerald-500/20">
            Real-time HOD Sync (Read Only)
          </span>
        </div>

        {/* Branch Bar Chart */}
        <div className="h-64 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="branch" stroke="#94A3B8" />
              <YAxis domain={[0, 100]} stroke="#94A3B8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="passRate" fill="#9333EA" name="Pass Rate %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="attendance" fill="#10B981" name="Attendance %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="placementRate" fill="#3B82F6" name="Placement Rate %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Ward Counsellors Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="text-purple-600" size={18} />
            Branch Ward Counsellors
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dynamic HOD Assignment</span>
        </div>

        {/* Branch Ward Counsellor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {data.map((b) => (
            <div 
              key={b.branch} 
              onClick={() => setSelectedBranch(b)}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{b.branch}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black ${b.isAssigned ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {b.isAssigned ? '🟢 Assigned' : '🟡 Ward Counsellor Not Assigned'}
                </span>
              </div>

              {b.isAssigned ? (
                <div className="flex items-center gap-3 pt-1">
                  {b.counsellorPhoto ? (
                    <img src={b.counsellorPhoto} alt={b.counsellorName} className="w-10 h-10 rounded-xl object-cover border border-purple-500/30" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 font-black text-sm flex items-center justify-center border border-purple-500/20">
                      {b.counsellorName?.substring(0, 2).toUpperCase() || 'WC'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">{b.counsellorName}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{b.counsellorEmail}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[9.5px]">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">👥 {b.wardStudentsCount} Ward Students</span>
                      {b.counsellorId && <span className="text-slate-400">• ID: {b.counsellorId}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center">
                  <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400">🟡 Ward Counsellor Not Assigned</p>
                  <p className="text-[9.5px] text-slate-400 mt-0.5">Awaiting HOD assignment</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-200/40 dark:border-slate-800 text-slate-500 font-medium">
                <span>HOD: <strong className="text-slate-700 dark:text-slate-300 font-bold">{b.hodName}</strong></span>
                <span className="text-purple-600 font-bold hover:underline">View Branch Details →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Branch Analytics Table */}
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Branch Comparison Table</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((b) => (
                <tr key={b.branch} onClick={() => setSelectedBranch(b)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer">
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white">{b.branch}</td>
                  <td className="p-4">
                    {b.isAssigned ? (
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">{b.counsellorName}</span>
                        <span className="text-[10px] text-slate-400 block">{b.counsellorEmail}</span>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-bold text-[10.5px]">🟡 Not Assigned</span>
                    )}
                  </td>
                  <td className="p-4 text-center font-bold text-purple-600">{b.wardStudentsCount}</td>
                  <td className="p-4 text-center font-bold">{b.faculty}</td>
                  <td className="p-4 text-center font-extrabold text-emerald-600">{b.attendance}%</td>
                  <td className="p-4 text-center font-black text-purple-600">{b.passRate}%</td>
                  <td className="p-4 text-center font-black text-indigo-600">{b.placementRate}%</td>
                  <td className="p-4 text-right text-purple-600 font-bold text-xs">View Overview</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Overview Modal */}
      {selectedBranch && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 text-[10px] font-black uppercase rounded-full">
                  Branch Overview
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{selectedBranch.branch}</h3>
              </div>
              <button onClick={() => setSelectedBranch(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* HOD & Ward Counsellor Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Head of Department (HOD)</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">{selectedBranch.hodName}</h4>
                <p className="text-[10.5px] text-purple-600 font-medium">{selectedBranch.hodEmail}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Branch Ward Counsellor</span>
                {selectedBranch.isAssigned ? (
                  <div className="mt-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedBranch.counsellorName}</h4>
                    <p className="text-[10.5px] text-purple-600 font-medium">{selectedBranch.counsellorEmail}</p>
                    <span className="text-[9.5px] text-emerald-600 font-bold block mt-1">👥 {selectedBranch.wardStudentsCount} Assigned Ward Students</span>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-amber-600 mt-1">🟡 Ward Counsellor Not Assigned</p>
                )}
              </div>
            </div>

            {/* Assigned Faculty Section in Branch Modal */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                HOD Assigned Teaching Faculty ({branchFacultyAllocations.length})
              </h4>
              {branchFacultyAllocations.length === 0 ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-slate-400 text-xs">
                  No active faculty course assignments recorded for {selectedBranch.branch}.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {branchFacultyAllocations.map(fac => (
                    <div key={fac.id || fac.allocationId} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <strong className="text-xs font-black text-slate-900 dark:text-white block">{fac.facultyName}</strong>
                        <span className="text-[10.5px] text-purple-600 dark:text-purple-400 font-bold">{fac.subjectName || fac.subject}</span>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="text-indigo-600 font-bold block">{fac.semester || 'Semester 1'} • {fac.section || 'Section A'}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[9.5px] font-black uppercase">Assigned</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[9.5px] text-slate-400 block font-bold">Students</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{selectedBranch.students}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[9.5px] text-slate-400 block font-bold">Faculty</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{selectedBranch.faculty}</span>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                <span className="text-[9.5px] block font-bold">Attendance</span>
                <span className="text-base font-black">{selectedBranch.attendance}%</span>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
                <span className="text-[9.5px] block font-bold">Pass Rate</span>
                <span className="text-base font-black">{selectedBranch.passRate}%</span>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl">
                <span className="text-[9.5px] block font-bold">Placement</span>
                <span className="text-base font-black">{selectedBranch.placementRate}%</span>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setSelectedBranch(null)} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-md">
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

  if (!data) return <div className="p-8 text-center text-slate-400 text-xs">Loading semester results...</div>;

  const s = data.summary;

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Header & Filters */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Semester Result Analytics</h2>
          <p className="text-xs text-slate-400">Institutional academic performance breakdown and subject alerts</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={dept} onChange={e => setDept(e.target.value)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold">
            <option value="All Departments">All Departments</option>
            <option value="B.Sc. Computer Science (CS)">CSE</option>
            <option value="B.Sc. Electronics (ECE)">ECE</option>
            <option value="B.Sc. Electrical (EEE)">EEE</option>
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold">
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
          </select>
          <select value={semester} onChange={e => setSemester(e.target.value)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold">
            {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Semester Performance Dashboard Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Students</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">{s.totalStudents}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Appeared</span>
          <span className="text-xl font-black text-purple-600">{s.appearedStudents}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Passed</span>
          <span className="text-xl font-black text-emerald-600">{s.passedStudents}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Failed</span>
          <span className="text-xl font-black text-rose-500">{s.failedStudents}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Pass Rate %</span>
          <span className="text-xl font-black text-purple-600">{s.passPercentage}%</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Avg %</span>
          <span className="text-xl font-black text-indigo-600">{s.averagePercentage}%</span>
        </div>
      </div>

      {/* Low Performance Alert Banner */}
      {data.lowPerformanceAlerts.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs">
            <AlertTriangle size={18} />
            <span>Academic Performance Alerts (Critical / Attention Required)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.lowPerformanceAlerts.map(al => (
              <div key={al.subject} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-500/20 text-xs font-bold text-slate-800 dark:text-slate-200">
                {al.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Semester Trend & Branch Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Semester-wise Performance Trend</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.semesterTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="semester" stroke="#94A3B8" />
                <YAxis domain={[60, 100]} stroke="#94A3B8" />
                <Tooltip />
                <Line type="monotone" dataKey="passRate" stroke="#9333EA" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Branch-wise Semester Performance ({semester})</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branchComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="branch" stroke="#94A3B8" />
                <YAxis domain={[50, 100]} stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="passRate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden overflow-x-auto p-6 space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Subject-wise Academic Performance</h3>
        <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
            <tr>
              <th className="p-3">Subject Name</th>
              <th className="p-3 text-center">Appeared</th>
              <th className="p-3 text-center">Passed</th>
              <th className="p-3 text-center">Failed</th>
              <th className="p-3 text-center">Pass Rate %</th>
              <th className="p-3 text-center">Avg Marks</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.subjects.map((sub) => (
              <tr key={sub.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-extrabold text-slate-900 dark:text-white">{sub.name}</td>
                <td className="p-3 text-center font-bold">{sub.appeared}</td>
                <td className="p-3 text-center font-bold text-emerald-600">{sub.passed}</td>
                <td className="p-3 text-center font-bold text-rose-500">{sub.failed}</td>
                <td className="p-3 text-center font-black text-purple-600">{sub.passRate}%</td>
                <td className="p-3 text-center font-bold">{sub.avgMarks}</td>
                <td className="p-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sub.status === 'Critical' ? 'bg-rose-500/10 text-rose-600' : sub.status === 'Attention' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {sub.status}
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
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Academic Risk Analytics & Marks Distribution</h2>
        <p className="text-xs text-slate-400 mb-6">Identify students requiring academic intervention and monitor grade distributions</p>

        {/* Marks Distribution Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {data.distribution.map((d) => (
            <div key={d.range} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-200/40 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">{d.range}</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block">{d.count}</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Students</span>
            </div>
          ))}
        </div>

        {/* Students Requiring Attention Table */}
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Students Requiring Attention (At Risk)</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-3">Roll Number</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Semester</th>
                <th className="p-3 text-center">Attendance %</th>
                <th className="p-3">Primary Concern</th>
                <th className="p-3 text-center">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.atRiskStudents.map((st) => (
                <tr key={st.rollNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold">{st.rollNumber}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{st.name}</td>
                  <td className="p-3 font-bold text-purple-600">{st.department}</td>
                  <td className="p-3 text-slate-500">{st.semester}</td>
                  <td className={`p-3 text-center font-black ${st.attendance < 75 ? 'text-rose-500' : 'text-emerald-600'}`}>{st.attendance}%</td>
                  <td className="p-3 text-slate-500">{st.result}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${st.risk === 'High' ? 'bg-rose-500/10 text-rose-600' : st.risk === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
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
  );
};

// 5. FACULTY OVERVIEW & HOD COURSE ALLOCATIONS (VIEW ONLY)
const PrincipalFacultyOverview = ({ principal }) => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [semesterFilter, setSemesterFilter] = useState('All Semesters');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const data = await mockDB.getAllFacultyAllocations();
    setAllocations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [principal]);

  const filteredAllocations = allocations.filter((a) => {
    const matchesSearch =
      (a.facultyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.facultyEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.subjectName || a.subject || '').toLowerCase().includes(searchTerm.toLowerCase());

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
    ? allocations.filter(
        (a) =>
          a.facultyId === selectedFaculty.facultyId ||
          a.facultyEmail === selectedFaculty.facultyEmail
      )
    : [];

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 bg-purple-500/10 text-purple-600 rounded-full text-[10px] font-black uppercase">
              Principal Executive View
            </span>
            <span className="px-3 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase">
              View Only
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">Faculty & Subject Course Allocations</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time breakdown of WHO teaches WHAT subject for WHICH branch, semester & section</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          >
            <option value="All Branches">All Branches</option>
            {KBN_BRANCHES.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          >
            <option value="All Semesters">All Semesters</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
            <option value="Semester 3">Semester 3</option>
            <option value="Semester 4">Semester 4</option>
            <option value="Semester 5">Semester 5</option>
            <option value="Semester 6">Semester 6</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Reassigned">Reassigned</option>
          </select>
        </div>

        <span className="text-[11px] font-bold text-slate-400">
          Showing {filteredAllocations.length} Faculty Assignments
        </span>
      </div>

      {/* Faculty Assignment Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-400 animate-pulse">Loading faculty course allocations...</td>
              </tr>
            ) : filteredAllocations.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-400">No faculty assignments match the selected filters.</td>
              </tr>
            ) : (
              filteredAllocations.map((alloc) => (
                <tr
                  key={alloc.id || alloc.allocationId}
                  onClick={() => setSelectedFaculty(alloc)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-all"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {alloc.facultyPhoto ? (
                        <img src={alloc.facultyPhoto} alt={alloc.facultyName} className="w-10 h-10 rounded-xl object-cover border border-purple-500/30 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 font-black flex items-center justify-center border border-purple-500/20 shrink-0">
                          {alloc.facultyName?.substring(0, 2).toUpperCase() || 'FC'}
                        </div>
                      )}
                      <div>
                        <strong className="text-slate-900 dark:text-white font-extrabold text-xs block">{alloc.facultyName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {alloc.facultyId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{alloc.facultyDesignation}</td>
                  <td className="p-4">
                    <span className="text-slate-900 dark:text-white block font-medium">{alloc.facultyEmail}</span>
                    <span className="text-[10px] text-slate-400 font-mono">📞 {alloc.facultyPhone}</span>
                  </td>
                  <td className="p-4 font-black text-purple-600 dark:text-purple-400">{alloc.branch || alloc.department}</td>
                  <td className="p-4 text-center font-bold text-indigo-600">{alloc.semester}</td>
                  <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{alloc.section}</td>
                  <td className="p-4 font-black text-slate-900 dark:text-white">{alloc.subjectName || alloc.subject}</td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black">
                      {alloc.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Faculty Details Drawer Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 text-[10px] font-black uppercase rounded-full">
                  Faculty Assignment Profile
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{selectedFaculty.facultyName}</h3>
              </div>
              <button onClick={() => setSelectedFaculty(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              {selectedFaculty.facultyPhoto ? (
                <img src={selectedFaculty.facultyPhoto} alt={selectedFaculty.facultyName} className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/30 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {selectedFaculty.facultyName?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedFaculty.facultyName}</h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">{selectedFaculty.facultyDesignation}</p>
                <p className="text-[11px] text-slate-400">{selectedFaculty.facultyEmail}</p>
                <p className="text-[11px] text-slate-400 font-mono">📞 {selectedFaculty.facultyPhone}</p>
              </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Active Academic Assignments ({facultyAllAssignments.length})</h4>
              {facultyAllAssignments.map((asg, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white">{asg.subjectName || asg.subject}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[9.5px] font-black">Active</span>
                  </div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                    {asg.branch || asg.department} • {asg.semester} • {asg.section}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[11px] text-slate-600 dark:text-slate-300">
              <strong className="text-purple-700 dark:text-purple-300 block">📌 Principal View Only:</strong>
              This allocation was configured by the respective Head of Department (HOD). Principal has read-only audit visibility.
            </div>

            <div className="text-right border-t border-slate-100 dark:border-slate-800 pt-3">
              <button onClick={() => setSelectedFaculty(null)} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl">
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
    <div className="space-y-6 text-xs font-semibold">
      {/* Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 bg-purple-500/10 text-purple-600 rounded-full text-[10px] font-black uppercase">
              Principal Executive View
            </span>
            <span className="px-3 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase">
              View Only
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">Branch Ward Counsellors Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Assigned faculty mentors monitoring student ward attendance & performance</p>
        </div>
      </div>

      {/* Ward Counsellor Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400 animate-pulse">Loading branch ward counsellors...</td>
              </tr>
            ) : counsellors.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400">No active ward counsellors assigned.</td>
              </tr>
            ) : (
              counsellors.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCounsellor(c)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-all"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {c.facultyPhoto ? (
                        <img src={c.facultyPhoto} alt={c.facultyName} className="w-10 h-10 rounded-xl object-cover border border-purple-500/30 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 font-black flex items-center justify-center border border-purple-500/20 shrink-0">
                          {c.facultyName?.substring(0, 2).toUpperCase() || 'WC'}
                        </div>
                      )}
                      <div>
                        <strong className="text-slate-900 dark:text-white font-extrabold text-xs block">{c.facultyName}</strong>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Faculty Ward Mentor</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{c.facultyDesignation || c.designation || 'Faculty Member'}</td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{c.facultyEmail || c.email}</td>
                  <td className="p-4 font-mono text-slate-500">{c.facultyPhone || '9876543211'}</td>
                  <td className="p-4 font-black text-purple-600 dark:text-purple-400">{c.department}</td>
                  <td className="p-4 text-center font-black text-indigo-600">{c.wardStudentsCount || 181}</td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black">
                      {c.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Ward Counsellor Details Modal */}
      {selectedCounsellor && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 text-[10px] font-black uppercase rounded-full">
                  Ward Counsellor Profile
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{selectedCounsellor.facultyName}</h3>
              </div>
              <button onClick={() => setSelectedCounsellor(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              {selectedCounsellor.facultyPhoto ? (
                <img src={selectedCounsellor.facultyPhoto} alt={selectedCounsellor.facultyName} className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/30 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {selectedCounsellor.facultyName?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedCounsellor.facultyName}</h4>
                <p className="text-xs text-purple-600 font-bold">{selectedCounsellor.department} Ward Counsellor</p>
                <p className="text-[11px] text-slate-400">{selectedCounsellor.facultyEmail || selectedCounsellor.email}</p>
                <p className="text-[11px] text-slate-400 font-mono">📞 {selectedCounsellor.facultyPhone || '9876543211'}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[9.5px] text-slate-400 font-bold block">Assigned Wards</span>
                <span className="text-lg font-black text-purple-600">{selectedCounsellor.wardStudentsCount || 181}</span>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                <span className="text-[9.5px] font-bold block">Attendance Avg</span>
                <span className="text-lg font-black">84.2%</span>
              </div>
              <div className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl">
                <span className="text-[9.5px] font-bold block">Low Att (&lt;75%)</span>
                <span className="text-lg font-black">12 Wards</span>
              </div>
            </div>

            <div className="text-right border-t border-slate-100 dark:border-slate-800 pt-3">
              <button onClick={() => setSelectedCounsellor(null)} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl">
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
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Branch-wise Attendance Analytics</h2>
        <p className="text-xs text-slate-400 mb-6">Institutional attendance compliance and low attendance tracking across departments</p>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Department / Branch</th>
                <th className="p-4 text-center">Avg Attendance %</th>
                <th className="p-4 text-center">Present %</th>
                <th className="p-4 text-center">Absent %</th>
                <th className="p-4 text-center">Students Below 75%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((b) => (
                <tr key={b.branch} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white">{b.branch}</td>
                  <td className="p-4 text-center font-black text-emerald-600">{b.attendance}%</td>
                  <td className="p-4 text-center font-bold text-emerald-600">{b.attendance}%</td>
                  <td className="p-4 text-center font-bold text-rose-500">{(100 - b.attendance).toFixed(1)}%</td>
                  <td className="p-4 text-center font-black text-rose-600">{Math.round(b.students * 0.12)} Students</td>
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

  if (!data) return <div className="p-8 text-center text-slate-400 text-xs">Loading placement analytics...</div>;

  const ov = data.overview;

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Corporate Placement Overview</h2>
          <p className="text-xs text-slate-400">Institutional recruitment statistics and branch-wise placement performance</p>
        </div>

        {/* Placement KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[9.5px] text-slate-400 block font-bold">Eligible</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{ov.eligibleStudents}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[9.5px] text-slate-400 block font-bold">Registered</span>
            <span className="text-lg font-black text-purple-600">{ov.registeredStudents}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[9.5px] text-slate-400 block font-bold">Placed</span>
            <span className="text-lg font-black text-emerald-600">{ov.placedStudents}</span>
          </div>
          <div className="p-3.5 bg-purple-500/10 text-purple-600 rounded-2xl">
            <span className="text-[9.5px] block font-bold">Placement Rate</span>
            <span className="text-lg font-black">{ov.placementRate}%</span>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-600 rounded-2xl">
            <span className="text-[9.5px] block font-bold">Companies</span>
            <span className="text-lg font-black">{ov.companiesParticipated}</span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <span className="text-[9.5px] block font-bold">Highest Package</span>
            <span className="text-lg font-black">{ov.highestPackage}</span>
          </div>
          <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl">
            <span className="text-[9.5px] block font-bold">Avg Package</span>
            <span className="text-lg font-black">{ov.averagePackage}</span>
          </div>
        </div>

        {/* Branch Placement Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Branch / Department</th>
                <th className="p-4 text-center">Eligible Students</th>
                <th className="p-4 text-center">Students Placed</th>
                <th className="p-4 text-center">Placement %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.branchPlacements.map((bp) => (
                <tr key={bp.department} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white">{bp.department}</td>
                  <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{bp.eligible}</td>
                  <td className="p-4 text-center font-black text-emerald-600">{bp.placed}</td>
                  <td className="p-4 text-center font-black text-purple-600">{bp.placementRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Faculty & Staff Leaves Review</h2>
          <p className="text-xs text-slate-400">Institutional leave applications and approval oversight</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaves.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No pending leave applications.</td></tr>
              ) : leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{l.facultyName || l.applicantName || 'Faculty Member'}</td>
                  <td className="p-4 font-bold text-purple-600">{l.department}</td>
                  <td className="p-4 text-slate-500">{l.leaveType || 'Casual Leave'}</td>
                  <td className="p-4 text-slate-500">{l.startDate} to {l.endDate}</td>
                  <td className="p-4 text-slate-500">{l.reason}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : l.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {l.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(l.id, 'approved')} className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold">Approve</button>
                        <button onClick={() => handleAction(l.id, 'rejected')} className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold">Reject</button>
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
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Institutional Academic Calendar</h2>
        <div className="space-y-3">
          {events.map((ev, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{ev.title}</h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-0.5">{ev.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${ev.type === 'Exam' ? 'bg-purple-500/10 text-purple-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
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
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Document Dispatch & Certification Track</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Req ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Department</th>
                <th className="p-4">Document Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {docs.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-mono font-bold">{d.id}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{d.student}</td>
                  <td className="p-4 font-bold text-purple-600">{d.dept}</td>
                  <td className="p-4 text-slate-500">{d.type}</td>
                  <td className="p-4 text-slate-500">{d.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${d.status === 'Dispatched' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
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
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Institutional Report Compiler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((r, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-purple-600 block">{r.cat}</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{r.title}</h4>
                <span className="text-[9.5px] text-slate-400 block mt-1">Export Format: {r.format}</span>
              </div>
              <button onClick={() => window.print()} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1">
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

// 12. PRINCIPAL SETTINGS & PROFILE PHOTO MANAGEMENT
const PrincipalSettings = ({ principal }) => {
  const { updateProfilePhoto } = useAuth();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return alert('Invalid file format. Please select a JPG, JPEG, PNG, or WEBP image.');
    }

    if (file.size > 5 * 1024 * 1024) {
      return alert('File size exceeds maximum limit of 5 MB.');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!photoPreview) return;
    try {
      setIsUploading(true);
      await updateProfilePhoto(photoPreview);
      setPhotoPreview(null);
      setMessage('Profile photo updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (e) {
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestoreDefault = async () => {
    if (confirm('Are you sure you want to restore the default initial avatar (DA)?')) {
      try {
        setIsUploading(true);
        await updateProfilePhoto(null);
        setPhotoPreview(null);
        setMessage('Default avatar restored!');
        setTimeout(() => setMessage(''), 4000);
      } catch (e) {
        alert('Failed to restore avatar.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Profile Photo Management Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Principal Profile & Photo Management</h2>
          <p className="text-xs text-slate-400">Manage your official Principal profile photo displayed across the Institutional Console</p>
        </div>

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl text-xs font-bold">
            {message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/40 dark:border-slate-800">
          <div className="relative group">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-500 shadow-lg" />
            ) : principal?.profilePhotoUrl ? (
              <img src={principal.profilePhotoUrl} alt="Principal" className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-500/40 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-400/50">
                {principal?.fullName ? principal.fullName.split(' ').map(n => n[0]).join('') : 'DA'}
              </div>
            )}
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{principal?.fullName || 'Dr. Arthur Pendelton'}</h3>
              <p className="text-xs text-purple-600 font-bold">Principal (Institutional Executive)</p>
              <p className="text-[11px] text-slate-400">{principal?.email || 'principal@kbn.edu'}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <label className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5">
                <Camera size={14} />
                <span>{principal?.profilePhotoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
              </label>

              {photoPreview && (
                <button onClick={handleSavePhoto} disabled={isUploading} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5">
                  <Upload size={14} />
                  <span>{isUploading ? 'Uploading...' : 'Confirm Upload'}</span>
                </button>
              )}

              {(principal?.profilePhotoUrl || photoPreview) && (
                <button onClick={handleRestoreDefault} disabled={isUploading} className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5">
                  <RotateCcw size={14} />
                  <span>Restore Default Avatar</span>
                </button>
              )}
            </div>
            <p className="text-[9.5px] text-slate-400">Supported formats: JPG, JPEG, PNG, WEBP (Max 5 MB)</p>
          </div>
        </div>
      </div>

    </div>
  );
};
