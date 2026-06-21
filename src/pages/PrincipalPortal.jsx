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
  DollarSign,
  Briefcase
} from 'lucide-react';

export const PrincipalPortal = ({ subPage }) => {
  const { user } = useAuth();
  
  if (subPage === 'dashboard') return <PrincipalDashboard principal={user} />;
  if (subPage === 'branches') return <PrincipalBranches principal={user} />;
  if (subPage === 'reports') return <PrincipalReports principal={user} />;
  return <PrincipalDashboard principal={user} />;
};

// 1. PRINCIPAL DASHBOARD
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
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building size={140} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold font-display">KBN Executive Command Console</h2>
          <p className="text-sm text-slate-400 mt-1">
            Principal: {principal.fullName} • Global Administration Oversight
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Enrolled Wards</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{stats?.cards.totalStudents}</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
            <Users size={20} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Faculty Members</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{stats?.cards.totalFaculty}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <Building2 size={20} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Academic Branches</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{KBN_BRANCHES.length}</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
            <Calendar size={20} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Global Attendance compliance</span>
            <p className="text-3xl font-black text-blue-605 mt-1.5">{stats?.cards.attendancePercentage}%</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Financials, placements & circulation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Total ERP Fees Settle</span>
            <p className="text-2xl font-black text-slate-850 dark:text-white mt-1">₹{(stats?.cards.totalCollected || 0).toLocaleString()}</p>
            <span className="text-[9px] text-slate-400 block mt-0.5">of ₹{(stats?.cards.totalInvoiced || 0).toLocaleString()} invoiced</span>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl"><DollarSign size={18} /></div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Library assets loan</span>
            <p className="text-2xl font-black text-slate-850 dark:text-white mt-1">{stats?.cards.activeCheckouts}</p>
            <span className="text-[9px] text-slate-400 block mt-0.5">textbooks currently checked out</span>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl"><BookOpen size={18} /></div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Placed Candidates</span>
            <p className="text-2xl font-black text-emerald-500 mt-1">{stats?.cards.placedCount}</p>
            <span className="text-[9px] text-slate-400 block mt-0.5">KBN placed students</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl"><Briefcase size={18} /></div>
        </div>
      </div>

      {/* Comparisons Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Branch attendance comparison */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider mb-5">Attendance Rate comparison by branch</span>
          <div className="h-64 text-[9.5px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.graphs.branchAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis domain={[50, 100]} stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="Attendance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student enrollment distributions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider mb-5">Student Enrollment comparisons</span>
          <div className="h-64 text-[9.5px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.graphs.deptComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="Students" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

// 2. PRINCIPAL BRANCHES LIST
const PrincipalBranches = () => {
  const [branchesData, setBranchesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const users = await mockDB.getAllUsers();
        const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
        const fees = JSON.parse(localStorage.getItem('acad_fees') || '[]');
        
        const branchRows = KBN_BRANCHES.map(branchName => {
          const branchStuds = users.filter(u => u.role === 'student' && u.department === branchName);
          const studentIds = branchStuds.map(s => s.uid);
          
          const profiles = studentsList.filter(p => studentIds.includes(p.studentId));
          const avgCGPA = profiles.length > 0 ? (profiles.reduce((acc, curr) => acc + curr.cgpa, 0) / profiles.length).toFixed(2) : '8.00';
          const avgAtt = profiles.length > 0 ? Math.round(profiles.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / profiles.length) : 100;
          
          const branchFees = fees.filter(f => f.department === branchName);
          const collected = branchFees.filter(f => f.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

          return {
            name: branchName,
            studentCount: branchStuds.length,
            gpa: avgCGPA,
            attendance: avgAtt,
            feesCollected: collected
          };
        });

        setBranchesData(branchRows);
      } catch (_) {}
      finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Branch Performance comparison ledger</span>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-450">Loading branch lists...</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Branch Name</th>
                <th className="px-5 py-3 text-center">Student count</th>
                <th className="px-5 py-3 text-center">Average CGPA</th>
                <th className="px-5 py-3 text-center">Average Attendance</th>
                <th className="px-5 py-3 text-center">Fees Settle Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
              {branchesData.map(b => (
                <tr key={b.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-4">{b.name}</td>
                  <td className="px-5 py-4 text-center">{b.studentCount}</td>
                  <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400">{b.gpa}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={b.attendance >= 75 ? 'text-emerald-500' : 'text-rose-505'}>{b.attendance}%</span>
                  </td>
                  <td className="px-5 py-4 text-center">₹{b.feesCollected.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 4. PRINCIPAL REPORTS & EXPORTS
const PrincipalReports = () => {
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState('Semester 6');
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useAuth();

  const handleLoadReports = async () => {
    try {
      setLoading(true);
      const stdUsers = await mockDB.getStudentsByBranchAndSemester(branch, semester);
      const studentProfiles = JSON.parse(localStorage.getItem('acad_students') || '[]');

      const reportRows = stdUsers.map(user => {
        const profile = studentProfiles.find(s => s.studentId === user.uid) || {
          attendancePercentage: 100,
          totalClasses: 0,
          attendedClasses: 0,
          cgpa: 8.0
        };
        return {
          id: user.uid,
          name: user.fullName,
          rollNumber: user.rollNumber,
          attendance: profile.attendancePercentage,
          attended: profile.attendedClasses,
          total: profile.totalClasses,
          cgpa: profile.cgpa
        };
      });

      setStudentsList(reportRows);
    } catch (_) {
      showToast('Could not load reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadReports();
  }, [branch, semester]);

  const handleExportTXT = () => {
    if (studentsList.length === 0) return;

    const headers = ['Roll Number', 'Student Name', 'Attended', 'Total Lectures', 'Attendance %', 'Current CGPA'];
    const rows = studentsList.map(s => [
      s.rollNumber,
      s.name,
      s.attended,
      s.total,
      `${s.attendance}%`,
      s.cgpa
    ]);

    exportPrincipalReport(`${branch} Sem ${semester} Student Standings`, headers, rows);
    showToast('Campus compliance sheet downloaded.', 'success');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Institutional Standings Compiler</h3>
          <p className="text-xs text-slate-450 mt-1">Select parameters to review student CGPA and attendance reports</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
            {KBN_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
            {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <button
            onClick={handleExportTXT}
            disabled={studentsList.length === 0}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-950 dark:bg-blue-600 dark:hover:bg-blue-755 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
          >
            <Download size={14} />
            <span>Download Reports TXT</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-450">Compiling statistics...</div>
      ) : studentsList.length === 0 ? (
        <div className="text-center py-20 text-slate-450">No students register matches this filter.</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3 text-center">Attended Lectures</th>
                <th className="px-5 py-3 text-center">Total Lectures</th>
                <th className="px-5 py-3 text-center">Attendance Rate</th>
                <th className="px-5 py-3 text-center">CGPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-slate-850 dark:text-slate-200">
              {studentsList.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-4">{s.rollNumber}</td>
                  <td className="px-5 py-4">{s.name}</td>
                  <td className="px-5 py-4 text-center">{s.attended}</td>
                  <td className="px-5 py-4 text-center">{s.total}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={s.attendance >= 75 ? 'text-emerald-505' : 'text-rose-505'}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400">{s.cgpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const exportPrincipalReport = (title, headers, rows) => {
  let content = `=========================================================================\n`;
  content += `KBN CAMPUS COMPLIANCE REGISTER\n`;
  content += `Scope: ${title.toUpperCase()}\n`;
  content += `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
  content += `=========================================================================\n\n`;

  let headerLine = '';
  headers.forEach(h => {
    headerLine += h.padEnd(22);
  });
  content += headerLine + '\n';
  content += '='.repeat(110) + '\n';

  rows.forEach(row => {
    let rowLine = '';
    row.forEach(cell => {
      rowLine += String(cell).padEnd(22);
    });
    content += rowLine + '\n';
  });

  content += '\n=========================== END OF REPORT =============================\n';

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_CampusReport.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
export default PrincipalPortal;
