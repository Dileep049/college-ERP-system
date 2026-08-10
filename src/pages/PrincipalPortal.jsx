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
  if (subPage === 'leaves') return <PrincipalLeaves principal={user} />;
  if (subPage === 'calendar') return <PrincipalCalendar principal={user} />;
  if (subPage === 'cbcs') return <PrincipalCbcs principal={user} />;
  if (subPage === 'documents') return <PrincipalDocuments principal={user} />;
  if (subPage === 'grievances') return <PrincipalGrievances principal={user} />;
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
  const [branch, setBranch] = useState('All');
  const [semester, setSemester] = useState('All');
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useAuth();

  const handleLoadReports = async () => {
    try {
      setLoading(true);
      const auditData = await mockDB.getPrincipalGlobalAcademicAudit(branch, semester);
      setStudentsList(auditData);
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

    const headers = ['Roll Number', 'Student Name', 'Department', 'Semester', 'Attended / Total', 'Attendance %', 'Avg Exam Mark', 'CGPA'];
    const rows = studentsList.map(s => [
      s.rollNumber,
      s.fullName,
      s.department,
      s.semester,
      `${s.attendedClasses}/${s.totalClasses}`,
      `${s.attendancePercentage}%`,
      `${s.avgMarks}/50`,
      s.cgpa
    ]);

    exportPrincipalReport(`All Branch ${branch} Sem ${semester} Exam & Attendance Audit`, headers, rows);
    showToast('All-Branch executive compliance register downloaded.', 'success');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">All-Branch Exam Results & Attendance Audit Matrix</h3>
          <p className="text-xs text-slate-450 mt-1">Principal Executive Portal • Global cross-departmental academic performance ledger</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
            <option value="All">All Departments / Branches</option>
            {KBN_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
            <option value="All">All Semesters</option>
            {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <button
            onClick={handleExportTXT}
            disabled={studentsList.length === 0}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-950 dark:bg-blue-600 dark:hover:bg-blue-755 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
          >
            <Download size={14} />
            <span>Export Campus Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-450">Compiling all-branch metrics...</div>
      ) : studentsList.length === 0 ? (
        <div className="text-center py-20 text-slate-450">No student records match selected filter.</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Semester</th>
                <th className="px-5 py-3 text-center">Exam Score (Avg / 50)</th>
                <th className="px-5 py-3 text-center">Attendance Rate</th>
                <th className="px-5 py-3 text-center">CGPA</th>
                <th className="px-5 py-3 text-center">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-slate-850 dark:text-slate-200">
              {studentsList.map(s => (
                <tr key={s.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-4">{s.rollNumber}</td>
                  <td className="px-5 py-4">{s.fullName}</td>
                  <td className="px-5 py-4"><span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[9.5px] font-black uppercase">{s.department}</span></td>
                  <td className="px-5 py-4">{s.semester}</td>
                  <td className="px-5 py-4 text-center text-purple-600 dark:text-purple-400 font-extrabold">{s.avgMarks} / 50</td>
                  <td className="px-5 py-4 text-center">
                    <span className={s.attendancePercentage >= 75 ? 'text-emerald-500 font-extrabold' : 'text-rose-500 font-extrabold'}>
                      {s.attendancePercentage}% ({s.attendedClasses}/{s.totalClasses})
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400 font-black">{s.cgpa}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded text-[9.5px] font-black uppercase ${
                      s.cgpa >= 8.5 ? 'bg-emerald-500/10 text-emerald-500' :
                      s.attendancePercentage < 75 ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {s.cgpa >= 8.5 ? 'Honors' : s.attendancePercentage < 75 ? 'Defaulter Warning' : 'Good Standing'}
                    </span>
                  </td>
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

// 5. PRINCIPAL LEAVES MANAGEMENT
const PrincipalLeaves = ({ principal }) => {
  const [reviewLeaves, setReviewLeaves] = useState([]);
  const [ownLeaves, setOwnLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');
  const { showToast } = useAuth();

  const loadLeaves = async () => {
    try {
      setLoading(true);
      // Retrieve leaves for principal review (Faculty, HOD, Student)
      const data = await mockDB.getLeaves('principal', principal.uid);
      setReviewLeaves(data);

      // Principal's own leaves
      const ownData = await mockDB.getLeaves('faculty', principal.uid);
      setOwnLeaves(ownData);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [principal]);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!reason || !startDate || !endDate) return;

    try {
      setSubmitting(true);
      await mockDB.applyLeave(
        principal.uid,
        principal.fullName,
        null,
        'All',
        null,
        null,
        reason,
        startDate,
        endDate,
        'principal'
      );
      showToast('Leave request submitted to Super Admin!', 'success');
      setReason('');
      setStartDate('');
      setEndDate('');
      loadLeaves();
    } catch (_) {
      showToast('Could not submit leave.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewLeave = async (leaveId, action) => {
    try {
      await mockDB.reviewLeave(leaveId, action, remarks, 'principal');
      showToast(`Leave application ${action} successfully.`, 'success');
      setRemarks('');
      loadLeaves();
    } catch (_) {
      showToast('Action failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Review Queue */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-slate-400 block uppercase tracking-wider">Leave Review Queue</span>
            <p className="text-[10px] font-normal text-slate-455 mt-0.5">Approve HOD leaves and recommended faculty leave applications</p>
          </div>
          <input 
            type="text" 
            placeholder="Review remarks..." 
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold w-full sm:w-64"
          />
        </div>

        {reviewLeaves.length === 0 ? (
          <div className="py-10 text-center text-slate-400">No leaves pending in review queue.</div>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Leave Period</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 font-bold">
                {reviewLeaves.map(l => {
                  const role = l.applicantRole || l.applicant_role;
                  const prinStat = l.principalStatus || l.principal_status;
                  return (
                    <tr key={l.leaveId}>
                      <td className="px-4 py-3">
                        <div>{l.studentName}</div>
                        <span className={`text-[9px] font-black uppercase ${role === 'hod' ? 'text-purple-500' : 'text-emerald-500'}`}>{role}</span>
                      </td>
                      <td className="px-4 py-3">{l.branch}</td>
                      <td className="px-4 py-3">{l.startDate} to {l.endDate}</td>
                      <td className="px-4 py-3 font-normal">{l.reason}</td>
                      <td className="px-4 py-3 text-center">
                        {prinStat === 'pending' ? (
                          <div className="flex justify-center items-center gap-2">
                            <button 
                              onClick={() => handleReviewLeave(l.leaveId, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReviewLeave(l.leaveId, 'rejected')}
                              className="px-2.5 py-1 bg-rose-650 hover:bg-rose-700 text-white rounded font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            prinStat === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>{prinStat}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Principal Apply Leave & History */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Apply Form */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <h3 className="text-sm font-extrabold text-slate-855 dark:text-white uppercase tracking-wider mb-5">Apply Principal Leave</h3>
          
          <form onSubmit={handleSubmitLeave} className="space-y-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Reason of Absence</label>
              <textarea
                rows="4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide detailed explanation..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-white font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
            >
              {submitting ? 'Submitting...' : 'Apply Leave'}
            </button>
          </form>
        </div>

        {/* Own Leave History */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Your Leaves Ledger</span>
          
          {loading ? (
            <div className="py-20 text-center animate-pulse">Loading...</div>
          ) : ownLeaves.length === 0 ? (
            <div className="py-20 text-center text-slate-455">No absence applications filed.</div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {ownLeaves.map(l => (
                <div key={l.leaveId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs">{l.reason}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">Period: {l.startDate} to {l.endDate}</span>
                    <div className="text-[10px] text-slate-450 mt-2 font-semibold">
                      <span>Workflow status: </span>
                      Super Admin: <span className={l.adminStatus === 'approved' ? 'text-emerald-500' : l.adminStatus === 'rejected' ? 'text-rose-500' : 'text-amber-500'}>{l.adminStatus || 'pending'}</span>
                    </div>
                    {l.remarks && <p className="text-[10px] mt-1 text-slate-500">Remarks: {l.remarks}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                    l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    l.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// 6. PRINCIPAL CALENDAR MANAGER
const PrincipalCalendar = ({ principal }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [year, setYear] = useState('2026-2027');
  const [sem, setSem] = useState('All');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('holiday');
  const [subType, setSubType] = useState('government');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const { showToast } = useAuth();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getCalendarEvents();
      setEvents(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [principal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: editingEvent ? editingEvent.id : undefined,
        year,
        semester: sem,
        title,
        type,
        subType,
        startDate,
        endDate,
        description
      };
      await mockDB.saveCalendarEvent(payload);
      showToast('Academic Calendar updated.', 'success');
      setIsModalOpen(false);
      resetForm();
      loadEvents();
    } catch (_) {
      showToast('Action failed.', 'error');
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setYear('2026-2027');
    setSem('All');
    setTitle('');
    setType('holiday');
    setSubType('government');
    setStartDate('');
    setEndDate('');
    setDescription('');
  };

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setYear(evt.year);
    setSem(evt.semester || 'All');
    setTitle(evt.title);
    setType(evt.type);
    setSubType(evt.subType || 'government');
    setStartDate(evt.startDate);
    setEndDate(evt.endDate);
    setDescription(evt.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await mockDB.deleteCalendarEvent(id);
        showToast('Event deleted from schedule.', 'info');
        loadEvents();
      } catch (_) {
        showToast('Action failed.', 'error');
      }
    }
  };

  const filteredEvents = events.filter(evt => {
    const matchesType = typeFilter === 'all' || evt.type === typeFilter;
    const today = new Date().toISOString().split('T')[0];
    if (viewMode === 'daily') {
      return matchesType && evt.startDate <= today && evt.endDate >= today;
    }
    return matchesType;
  });

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
          >
            <option value="monthly">Monthly Overview</option>
            <option value="daily">Today's Holidays/Events</option>
            <option value="weekly">Weekly view</option>
            <option value="yearly">Yearly Overview</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
          >
            <option value="all">All Calendar Items</option>
            <option value="holiday">Holidays</option>
            <option value="exam">Exams</option>
            <option value="event">Campus Events</option>
            <option value="workshop">Workshops</option>
            <option value="seminar">Seminars</option>
            <option value="placement">Placement Drives</option>
          </select>
        </div>

        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2"
        >
          <span>Publish Calendar Item</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-400">Loading Academic Calendar...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-20 text-center text-slate-450 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800">
          No scheduled events or exams matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(evt => (
            <div key={evt.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-3xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                    evt.type === 'holiday' ? 'bg-red-500/10 text-red-500' :
                    evt.type === 'exam' ? 'bg-amber-500/10 text-amber-500' :
                    evt.type === 'event' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                  }`}>{evt.type}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{evt.startDate}</span>
                </div>
                
                <h4 className="font-extrabold text-sm text-slate-850 dark:text-white mt-3">{evt.title}</h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">{evt.description}</p>
                
                {evt.subType && <span className="text-[9.5px] text-indigo-500 font-bold block mt-2">Category: {evt.subType}</span>}
                {evt.semester && <p className="text-[9.5px] text-slate-400 mt-1">Target Semester: {evt.semester}</p>}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-850 pt-3 mt-3">
                <button onClick={() => handleOpenEdit(evt)} className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-650 rounded text-[10px] font-bold">
                  Edit
                </button>
                <button onClick={() => handleDelete(evt.id)} className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded text-[10px] font-bold">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-500 hover:text-slate-300">
              <X size={16} />
            </button>

            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-5 uppercase tracking-wider">
              {editingEvent ? 'Modify Calendar Event' : 'Publish Calendar Schedule'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Title / Caption</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Mid Term Exam Reschedule" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Event Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold">
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam Schedule</option>
                    <option value="event">Campus Event</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="placement">Placement Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Sub-Type</label>
                  <select value={subType} onChange={(e) => setSubType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold">
                    {type === 'holiday' ? (
                      <>
                        <option value="government">Government Holiday</option>
                        <option value="festival">Festival</option>
                        <option value="college">College Holiday</option>
                      </>
                    ) : type === 'exam' ? (
                      <>
                        <option value="mid">Mid Exam</option>
                        <option value="internal">Internal Exam</option>
                        <option value="semester">Semester Exam</option>
                        <option value="practical">Practical Exam</option>
                      </>
                    ) : (
                      <option value="general">General</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Brief Description</label>
                <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white resize-none font-bold"></textarea>
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-605 hover:bg-blue-700 text-white rounded-xl font-bold transition-all mt-4">
                Publish Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. PRINCIPAL CBCS ELECTIVE OVERSIGHT
const PrincipalCbcs = ({ principal }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getGlobalCourseRegistrations();
      setRegistrations(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [principal]);

  const handleApprove = async (studentId) => {
    try {
      await mockDB.approveGlobalCourseRegistration(studentId);
      showToast('CBCS Course Registrations approved for student.', 'success');
      loadRegistrations();
    } catch (_) {
      showToast('Action failed.', 'error');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-4">
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Choice Based Credit System (CBCS) Oversight</h3>
        <p className="text-xs text-slate-450 mt-1">Review student elective choices, verify credit loads, and approve semester study plans</p>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-400">Loading registrations...</div>
      ) : registrations.length === 0 ? (
        <div className="py-20 text-center text-slate-450">No CBCS course registration submissions pending.</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Branch & Semester</th>
                <th className="px-5 py-3 text-center">Total Credits</th>
                <th className="px-5 py-3 text-center">Status / Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
              {registrations.map(r => (
                <tr key={r.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-4">{r.rollNumber}</td>
                  <td className="px-5 py-4">{r.studentName}</td>
                  <td className="px-5 py-4">{r.department} • {r.semester}</td>
                  <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400">{r.totalCredits || 24} Credits</td>
                  <td className="px-5 py-4 text-center">
                    {r.status === 'approved' ? (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded font-black uppercase text-[10px]">
                        Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApprove(r.studentId)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] transition-colors"
                      >
                        Approve Study Plan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 8. PRINCIPAL DOCUMENT & CERTIFICATE REGISTRAR
const PrincipalDocuments = ({ principal }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const { showToast } = useAuth();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getPendingDocumentRequests();
      setRequests(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [principal]);

  const handleSignApprove = async (id) => {
    try {
      await mockDB.approveDocumentRequest(id, remarks);
      showToast('Official Document digitally signed & released to student!', 'success');
      setRemarks('');
      loadRequests();
    } catch (_) {
      showToast('Approval action failed.', 'error');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Registrar Document & Certificate Sign-off Desk</h3>
          <p className="text-xs text-slate-450 mt-1">Review official student requests for transcripts, bonafide certificates, and conduct verification</p>
        </div>
        <input
          type="text"
          placeholder="Optional registrar remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-400">Loading certificate queue...</div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center text-slate-450">No pending document requests in registrar ledger.</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3">Document Type</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3 text-center">Urgency</th>
                <th className="px-5 py-3 text-center">Requested Date</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-4">{r.docType}</td>
                  <td className="px-5 py-4 font-normal">{r.purpose}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                      r.urgency === 'Urgent Dispatch' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>{r.urgency}</span>
                  </td>
                  <td className="px-5 py-4 text-center">{r.requestedAt}</td>
                  <td className="px-5 py-4 text-center">
                    {r.status === 'approved' ? (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded font-black uppercase text-[10px]">
                        Digitally Released
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSignApprove(r.id)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded font-bold text-[10px] transition-colors"
                      >
                        Sign & Digital Release
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 9. PRINCIPAL CENTRAL GRIEVANCE RESOLVER
const PrincipalGrievances = ({ principal }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { showToast } = useAuth();

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getPendingGrievances();
      setTickets(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, [principal]);

  const handleResolve = async (ticketId) => {
    if (!replyText.trim()) {
      showToast('Please type resolution remarks.', 'warning');
      return;
    }
    try {
      await mockDB.resolveGrievanceTicket(ticketId, replyText);
      showToast('Grievance ticket status updated to RESOLVED.', 'success');
      setActiveReplyId(null);
      setReplyText('');
      loadGrievances();
    } catch (_) {
      showToast('Action failed.', 'error');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold space-y-4">
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Central Campus Grievance Resolution Desk</h3>
        <p className="text-xs text-slate-450 mt-1">Review tickets filed by students or parents, type official resolution remarks, and close issues</p>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-400">Loading grievances ledger...</div>
      ) : tickets.length === 0 ? (
        <div className="py-20 text-center text-slate-450">No reported support tickets in central ledger.</div>
      ) : (
        <div className="space-y-4">
          {tickets.map(t => (
            <div key={t.id} className="p-5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[9.5px] font-black uppercase">{t.category}</span>
                    <span className="text-[10px] text-slate-400 font-bold">Ticket: {t.id.toUpperCase()}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs mt-1.5">{t.subject}</h4>
                  <p className="text-[10.5px] text-slate-555 dark:text-slate-400 font-normal leading-relaxed mt-1.5">{t.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>{t.status}</span>
              </div>

              {t.reply ? (
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1">
                  <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Official Executive Resolution</span>
                  <p className="text-[10.5px] text-slate-600 dark:text-slate-300 font-medium">{t.reply}</p>
                </div>
              ) : activeReplyId === t.id ? (
                <div className="pt-2 space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Type official executive response & resolution..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none dark:text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setActiveReplyId(null)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">Cancel</button>
                    <button onClick={() => handleResolve(t.id)} className="px-3 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold">Submit Resolution</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setActiveReplyId(t.id); setReplyText(''); }} className="px-3 py-1 bg-blue-600 text-white rounded text-[10px] font-bold">
                  Provide Resolution Reply
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrincipalPortal;
