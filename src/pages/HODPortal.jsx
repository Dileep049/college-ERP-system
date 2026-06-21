import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB, KBN_SEMESTERS } from '../services/firebase';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
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
  Download, 
  Check, 
  X, 
  FileText, 
  Filter, 
  UserCheck,
  Plus,
  RefreshCw,
  Award
} from 'lucide-react';

export const HODPortal = ({ subPage }) => {
  const { user } = useAuth();
  
  if (subPage === 'dashboard') return <HODDashboard hod={user} />;
  if (subPage === 'faculty') return <HODFaculty hod={user} />;
  if (subPage === 'reports') return <HODReports hod={user} />;
  return <HODDashboard hod={user} />;
};

// 1. HOD DEPARTMENT DASHBOARD
const HODDashboard = ({ hod }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('daily'); // daily | weekly | monthly

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getHODAnalytics(hod.department);
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [hod]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-xs font-bold">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-650 to-indigo-600 text-white shadow-xl">
        <h2 className="text-2xl font-extrabold font-display">{hod.department} Department</h2>
        <p className="text-sm text-purple-105 mt-1">HOD: {hod.fullName} • Departmental Analytics Overseer</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department Wards</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{stats?.totalStudents}</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
            <Users size={20} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Present Today</span>
            <p className="text-3xl font-black text-emerald-500 mt-1.5">{stats?.presentToday}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Absent Today</span>
            <p className="text-3xl font-black text-rose-500 mt-1.5">{stats?.absentToday}</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
            <X size={20} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <p className="text-3xl font-black text-blue-600 mt-1.5">{stats?.attendancePercentage}%</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Dept Financials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Department Fees Settle</span>
            <p className="text-2xl font-black text-slate-850 dark:text-white mt-1">₹{(stats?.totalDeptCollected || 0).toLocaleString()}</p>
            <span className="text-[9px] text-slate-400 block mt-0.5">of ₹{(stats?.totalDeptInvoiced || 0).toLocaleString()} invoiced</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl"><TrendingUp size={18} /></div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Library Checkouts</span>
            <p className="text-2xl font-black text-slate-850 dark:text-white mt-1">{stats?.deptLibraryIssues}</p>
            <span className="text-[9px] text-slate-400 block mt-0.5">Books active checkouts</span>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl"><BookOpen size={18} /></div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Outstanding Dues</span>
            <p className="text-2xl font-black text-rose-500 mt-1">₹{((stats?.totalDeptInvoiced || 0) - (stats?.totalDeptCollected || 0)).toLocaleString()}</p>
            <span className="text-[9px] text-slate-400 block mt-0.5">unpaid pending collections</span>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl"><X size={18} /></div>
        </div>
      </div>

      {/* Recharts Analytics Graph */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-250">Attendance Graph Timelines</h3>
            <p className="text-[10px] text-slate-400">timelines for the active branch cycle</p>
          </div>
          <div className="flex bg-slate-105 dark:bg-slate-800 rounded-xl p-1">
            {['daily', 'weekly', 'monthly'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeTab === tab ? 'bg-white dark:bg-slate-900 text-purple-600 shadow' : 'text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'daily' ? (
              <BarChart data={stats?.graphs.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" fill="#10B981" radius={[4,4,0,0]} />
                <Bar dataKey="Absent" fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            ) : activeTab === 'weekly' ? (
              <LineChart data={stats?.graphs.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis domain={[50, 100]} stroke="#94A3B8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Attendance" stroke="#8B5CF6" strokeWidth={3} />
              </LineChart>
            ) : (
              <AreaChart data={stats?.graphs.monthly}>
                <defs>
                  <linearGradient id="colorHODAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis domain={[50, 100]} stroke="#94A3B8" />
                <Tooltip />
                <Area type="monotone" dataKey="Attendance" stroke="#7C3AED" strokeWidth={3} fill="url(#colorHODAtt)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

// 2. HOD FACULTY DIRECTORY & SUBJECT ALLOCATIONS
const HODFaculty = ({ hod }) => {
  const [facultyList, setFacultyList] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAuth();

  const loadFacultyAndAllocs = async () => {
    try {
      setLoading(true);
      const users = await mockDB.getAllUsers();
      const facs = users.filter(u => u.role === 'faculty' && (u.assignedBranches?.includes(hod.department) || u.department === hod.department));
      setFacultyList(facs);

      const list = await mockDB.getSubjectAllocations(hod.department);
      setAllocations(list);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyAndAllocs();
  }, [hod]);

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedFacultyId || !subjectName) return;

    try {
      setSubmitting(true);
      const teacher = facultyList.find(f => f.uid === selectedFacultyId);
      await mockDB.allocateSubject(
        hod.department,
        semester,
        subjectName,
        selectedFacultyId,
        teacher ? teacher.fullName : 'Faculty Member'
      );

      // Mutate subjects array on local user listing for instant sync
      const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
      const userIdx = users.findIndex(u => u.uid === selectedFacultyId);
      if (userIdx !== -1) {
        if (!users[userIdx].subjects) users[userIdx].subjects = [];
        if (!users[userIdx].subjects.includes(subjectName)) {
          users[userIdx].subjects.push(subjectName);
          localStorage.setItem('acad_users', JSON.stringify(users));
        }
      }

      showToast(`Assigned ${subjectName} to ${teacher?.fullName || 'Faculty'}!`, 'success');
      setSubjectName('');
      loadFacultyAndAllocs();
    } catch (_) {
      showToast('Could not allocate subject.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
      
      {/* Allocate Subjects Form */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
        <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Allocate Subject Module</h3>
        <form onSubmit={handleAllocate} className="space-y-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Select Teacher</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
            >
              <option value="" disabled>Choose Faculty</option>
              {facultyList.map(f => <option key={f.uid} value={f.uid}>{f.fullName}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
            >
              {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Subject Title</label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g., Computer Organization & Architecture"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            <span>{submitting ? 'Allocating...' : 'Assign Subject'}</span>
          </button>
        </form>
      </div>

      {/* Directory & Allocs lists */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Allocated Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Subject Allocations</span>
          
          {loading ? (
            <div className="py-6 text-center animate-pulse">Loading allocations...</div>
          ) : allocations.length === 0 ? (
            <div className="py-6 text-center text-slate-450">No subject allocations logged.</div>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {allocations.map(al => (
                <div key={al.allocationId} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{al.subjectName}</h4>
                    <p className="text-[10px] text-slate-450 mt-1">{al.semester} • Assigned to: {al.facultyName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Faculty List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Departmental Faculty</span>
          {loading ? (
            <div className="py-6 text-center animate-pulse">Loading teachers...</div>
          ) : facultyList.length === 0 ? (
            <div className="py-6 text-center text-slate-450">No teachers in this branch.</div>
          ) : (
            <div className="space-y-3">
              {facultyList.map(teacher => (
                <div key={teacher.uid} className="p-3.5 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-850 rounded-xl flex gap-3 items-center">
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-650 rounded-xl flex items-center justify-center font-black">{teacher.fullName.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{teacher.fullName}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">{teacher.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// 4. HOD ACADEMIC REPORTS & COUNSELLOR AUDITS
const HODReports = ({ hod }) => {
  const [semester, setSemester] = useState('Semester 6');
  const [studentsList, setStudentsList] = useState([]);
  const [counsellingList, setCounsellingList] = useState([]);
  const [parentMeetings, setParentMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState('academic'); // academic | counsellor | parents
  const { showToast } = useAuth();

  const handleLoadReports = async () => {
    try {
      setLoading(true);
      // Fetch branch students list
      const stdUsers = await mockDB.getStudentsByBranchAndSemester(hod.department, semester);
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

      // Fetch counselling diaries for these student ids
      const rawLogs = JSON.parse(localStorage.getItem('acad_counseling_logs') || '[]');
      const branchCounselling = rawLogs.filter(log => stdUsers.find(su => su.uid === log.studentId));
      setCounsellingList(branchCounselling);

      // Fetch parent meeting diaries
      const rawParentMeets = JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]');
      const branchPTA = rawParentMeets.filter(m => stdUsers.find(su => su.uid === m.studentId));
      setParentMeetings(branchPTA);
    } catch (_) {
      showToast('Could not load department ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadReports();
  }, [semester]);

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

    exportReport(`${hod.department} - ${semester} Student Report`, headers, rows);
    showToast('Student report txt downloaded successfully!', 'success');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      
      {/* Top filter section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Academic & Branch Auditing reports</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Settle grades, attendance lists, and audit counsellor sessions</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
          >
            {KBN_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <button
            onClick={handleExportTXT}
            disabled={studentsList.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-755 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
          >
            <Download size={14} />
            <span>Export Academic TXT</span>
          </button>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex bg-slate-50 dark:bg-slate-850 p-1 rounded-xl w-fit mb-5">
        <button
          onClick={() => setActiveReportTab('academic')}
          className={`px-4 py-2 rounded-lg transition-all ${activeReportTab === 'academic' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow font-bold' : 'text-slate-500'}`}
        >
          Attendance & CGPA Grades
        </button>
        <button
          onClick={() => setActiveReportTab('counsellor')}
          className={`px-4 py-2 rounded-lg transition-all ${activeReportTab === 'counsellor' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow font-bold' : 'text-slate-500'}`}
        >
          Ward Counsellor feedback
        </button>
        <button
          onClick={() => setActiveReportTab('parents')}
          className={`px-4 py-2 rounded-lg transition-all ${activeReportTab === 'parents' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow font-bold' : 'text-slate-500'}`}
        >
          PTA meetings history
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse">Loading department data ledger...</div>
      ) : (
        <>
          {activeReportTab === 'academic' && (
            studentsList.length === 0 ? (
              <div className="py-12 text-center text-slate-450">No students registered in this semester list.</div>
            ) : (
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                      <th className="px-5 py-3">Roll Number</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3 text-center">Classes Attended</th>
                      <th className="px-5 py-3 text-center">Total Classes</th>
                      <th className="px-5 py-3 text-center">Attendance %</th>
                      <th className="px-5 py-3 text-center">CGPA Score</th>
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
                          <span className={s.attendance >= 75 ? 'text-emerald-500 font-extrabold' : 'text-rose-500 font-extrabold'}>{s.attendance}%</span>
                        </td>
                        <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400">{s.cgpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {activeReportTab === 'counsellor' && (
            counsellingList.length === 0 ? (
              <div className="py-12 text-center text-slate-450">No counseling logs filed for students of this semester.</div>
            ) : (
              <div className="space-y-4">
                {counsellingList.map(log => (
                  <div key={log.logId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">Ward: {log.studentName}</h4>
                        <p className="text-[10px] text-sky-600 font-bold mt-0.5">Assigned Counsellor: {log.counsellorName}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{log.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-semibold mt-1">Topic: <span className="text-slate-850 dark:text-slate-100 font-extrabold">{log.topic}</span></p>
                    <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-medium mt-1">Notes: {log.notes}</p>
                  </div>
                ))}
              </div>
            )
          )}

          {activeReportTab === 'parents' && (
            parentMeetings.length === 0 ? (
              <div className="py-12 text-center text-slate-455">No parent meetings documented in history files.</div>
            ) : (
              <div className="space-y-4">
                {parentMeetings.map(pta => (
                  <div key={pta.meetingId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">Ward: {pta.studentName}</h4>
                        <p className="text-[10px] text-purple-650 font-bold mt-0.5">Parent Meeting: {pta.parentName}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{pta.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-medium mt-1">Conference Notes: {pta.notes}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

    </div>
  );
};

// Report exporter helper
const exportReport = (title, headers, rows) => {
  let content = `=========================================================================\n`;
  content += `${title.toUpperCase()}\n`;
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
  a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_Report.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
export default HODPortal;
