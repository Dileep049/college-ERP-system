import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
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

  if (subPage === 'parent-meetings') return <ParentMeetingsManager counsellor={user} />;
  if (subPage === 'wards') return <WardsDirectory counsellor={user} />;
  if (subPage === 'reports') return <CounsellorReports counsellor={user} />;
  if (subPage === 'leaves') return <CounsellorLeaves counsellor={user} />;
  return <CounsellorDashboard counsellor={user} />;
};

// 1. COUNSELLOR DASHBOARD & MENTORING CONSOLE
const CounsellorDashboard = ({ counsellor }) => {
  const [wards, setWards] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const branchStudents = await mockDB.getWardsForCounsellor(counsellor.uid, counsellor.department);
      setWards(branchStudents);

      const allMeetings = await mockDB.getCounsellingMeetings('counsellor', counsellor.uid);
      setMeetings(allMeetings);

      const absentWards = await mockDB.getWardsAbsentToday(counsellor.uid);
      setWardsAbsentToday(absentWards);

      const lowAtt = branchStudents.filter(s => (s.attendancePercentage || s.attendance || 80) < 75);
      setLowAttendanceWards(lowAtt);

      const highRisk = branchStudents.filter(s => (s.attendancePercentage || s.attendance || 80) < 65);
      setHighRiskWards(highRisk);

      const reminders = await mockDB.getFollowUpReminders(counsellor.uid);
      setFollowUps(reminders);

      const studentConcerns = await mockDB.getStudentConcerns(counsellor.uid);
      setConcerns(studentConcerns);

      const summary = await mockDB.getMonthlyWardSummary(counsellor.uid, selectedMonth, selectedYear);
      setMonthlySummary(summary);

      const sections = await mockDB.getSectionAnalytics(counsellor.department);
      setSectionAnalytics(sections);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounsellorData();
  }, [counsellor, selectedMonth, selectedYear]);

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

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">Loading mentoring dashboard...</div>;

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-950 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full">
              Ward Mentoring & Early Warning System
            </span>
            <h2 className="text-2xl font-black font-display mt-2">Mentoring Command Board</h2>
            <p className="text-xs text-purple-200 mt-0.5">
              Counsellor: <strong className="text-white font-bold">{counsellor.fullName}</strong> • Department of {counsellor.department || 'B.Sc. Computer Science'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowConcernModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-1.5">
              <Plus size={16} />
              <span>Log Student Concern</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Dashboard KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Absentees Today</span>
          <span className="text-xl font-black text-rose-600 mt-0.5 block">{wardsAbsentToday.length}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[9.5px] text-slate-400 block font-bold uppercase">&lt;75% Attendance</span>
          <span className="text-xl font-black text-amber-500 mt-0.5 block">{lowAttendanceWards.length}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[9.5px] text-slate-400 block font-bold uppercase">High Risk (&lt;65%)</span>
          <span className="text-xl font-black text-rose-600 mt-0.5 block">{highRiskWards.length}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Upcoming Follow-ups</span>
          <span className="text-xl font-black text-purple-600 mt-0.5 block">{followUps.length}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Pending Requests</span>
          <span className="text-xl font-black text-indigo-600 mt-0.5 block">{meetings.filter(m => m.status === 'pending').length}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Open Concerns</span>
          <span className="text-xl font-black text-rose-500 mt-0.5 block">{concerns.filter(c => c.status === 'Open' || c.status === 'In Progress').length}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Monthly Sessions</span>
          <span className="text-xl font-black text-emerald-600 mt-0.5 block">{monthlySummary?.counsellingSessions || 18}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Improved Wards</span>
          <span className="text-xl font-black text-emerald-600 mt-0.5 block">{monthlySummary?.improvedStudents || 9}</span>
        </div>
      </div>

      {/* Monthly Ward Summary Card */}
      {monthlySummary && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="text-purple-600" size={18} />
                Monthly Ward Mentoring Summary
              </h3>
              <p className="text-xs text-slate-400">Institutional ward metrics for selected calendar month</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold">
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
              </select>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold">
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Wards</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{monthlySummary.totalWards}</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Attendance</span>
              <span className="text-lg font-black text-emerald-600">{monthlySummary.averageAttendance}%</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Counselling Sessions</span>
              <span className="text-lg font-black text-purple-600">{monthlySummary.counsellingSessions}</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Parent Meetings</span>
              <span className="text-lg font-black text-indigo-600">{monthlySummary.parentMeetings}</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Open Concerns</span>
              <span className="text-lg font-black text-rose-500">{monthlySummary.openConcerns}</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Improved Students</span>
              <span className="text-lg font-black text-emerald-600">{monthlySummary.improvedStudents}</span>
            </div>
          </div>
        </div>
      )}

      {/* Section-wise Analytics Grid */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Section-wise Branch Analytics</h3>
            <p className="text-xs text-slate-400">Comparative attendance and risk metrics across sections in {counsellor.department || 'Branch'}</p>
          </div>
          <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 text-[10px] font-bold rounded-full">
            Dynamic Sections
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sectionAnalytics.map((sec) => (
            <div key={sec.section} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/40 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{sec.section}</h4>
                <span className="text-[10px] text-purple-600 font-bold">{sec.students} Students</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/40 dark:border-slate-800">
                <span className="text-slate-500">Attendance %:</span>
                <span className="font-black text-emerald-600">{sec.attendance}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Pass Rate %:</span>
                <span className="font-black text-purple-600">{sec.passRate}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">At Risk Count:</span>
                <span className="font-black text-rose-500">{sec.atRisk} Students</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Reminders & Student Concerns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Follow-up Reminders */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="text-purple-600" size={18} />
              Upcoming Follow-ups
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Category Reminders</span>
          </div>

          <div className="space-y-3">
            {followUps.map((flw) => (
              <div key={flw.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{flw.studentName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">({flw.rollNumber})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{flw.reason}</p>
                  <span className="text-[9.5px] text-purple-600 font-bold block mt-0.5">Date: {flw.followUpDate}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black ${flw.category === 'Overdue' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse' : 'bg-purple-500/10 text-purple-600'}`}>
                  {flw.category === 'Overdue' ? '🔴 Overdue' : flw.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Student Concern Issue Tracker */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={18} />
              Student Issue Tracker
            </h3>
            <button onClick={() => setShowConcernModal(true)} className="px-2.5 py-1 bg-purple-600 text-white rounded-xl text-[10.5px] font-bold">
              + Log Concern
            </button>
          </div>

          <div className="space-y-3">
            {concerns.map((cn) => (
              <div key={cn.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/40 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 text-[9.5px] font-bold rounded-md uppercase">
                    {cn.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black ${cn.priority === 'Critical' || cn.priority === 'High' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    {cn.priority}
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{cn.title}</h4>
                <p className="text-[10.5px] text-slate-500">{cn.description}</p>
                <div className="flex items-center justify-between text-[9.5px] pt-1 text-slate-400">
                  <span>Student: <strong className="text-slate-700 dark:text-slate-300">{cn.studentName}</strong> ({cn.rollNumber})</span>
                  <span className="font-bold text-emerald-600">Status: {cn.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Log Student Concern Modal */}
      {showConcernModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Create Student Concern</h3>
              <button onClick={() => setShowConcernModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateConcern} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Student</label>
                <select value={concernStudentId} onChange={e => setConcernStudentId(e.target.value)} required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold">
                  <option value="">Select Ward Student</option>
                  {wards.map(w => (
                    <option key={w.uid} value={w.uid}>{w.fullName || w.name} ({w.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                  <select value={concernCategory} onChange={e => setConcernCategory(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold">
                    <option value="Attendance">Attendance</option>
                    <option value="Academic Performance">Academic Performance</option>
                    <option value="Internal Marks">Internal Marks</option>
                    <option value="Backlog">Backlog</option>
                    <option value="Career Guidance">Career Guidance</option>
                    <option value="Placement">Placement</option>
                    <option value="Personal Guidance">Personal Guidance</option>
                    <option value="Behaviour">Behaviour</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Priority</label>
                  <select value={concernPriority} onChange={e => setConcernPriority(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Concern Title</label>
                <input type="text" value={concernTitle} onChange={e => setConcernTitle(e.target.value)} required placeholder="e.g., Attendance drop below 65%" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold" />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Description & Details</label>
                <textarea value={concernDescription} onChange={e => setConcernDescription(e.target.value)} rows="3" placeholder="Provide detailed observation or concern details..." className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"></textarea>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Follow-up Date</label>
                <input type="date" value={concernFollowUp} onChange={e => setConcernFollowUp(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowConcernModal(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md">Create Concern</button>
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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalTab, setModalTab] = useState('PROFILE'); // PROFILE | ACADEMIC | COUNSELLING | ACTIONS
  const [academicProgress, setAcademicProgress] = useState(null);
  const [riskHistory, setRiskHistory] = useState([]);

  useEffect(() => {
    const fetchWards = async () => {
      setLoading(true);
      const res = await mockDB.getWardsForCounsellor(counsellor.uid, counsellor.department);
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
    return nameMatch && riskMatch;
  });

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">Loading ward directory...</div>;

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Header & Search/Filters */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Counselling Wards Roster</h2>
            <p className="text-xs text-slate-400">Assigned ward students in {counsellor.department || 'Department'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or roll..." className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold" />
            </div>
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold">
              <option value="All">All Risk Levels</option>
              <option value="Good">🟢 Good (&gt;=75%)</option>
              <option value="Warning">🟡 Warning (65-74.99%)</option>
              <option value="High Risk">🔴 High Risk (&lt;65%)</option>
            </select>
          </div>
        </div>

        {/* Wards Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Roll Number</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Branch</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Risk Level</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredWards.map((w) => {
                const att = w.attendancePercentage || w.attendance || 80;
                const riskLevel = att < 65 ? 'High Risk' : att < 75 ? 'Warning' : 'Good';
                const status = att > 82 ? 'Improving' : att < 70 ? 'Declining' : 'Stable';
                return (
                  <tr key={w.uid} onClick={() => handleOpenStudentModal(w)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer">
                    <td className="p-4 font-mono font-bold">{w.rollNumber || '22KBN-CS001'}</td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      {w.profilePhotoUrl ? (
                        <img src={w.profilePhotoUrl} alt={w.fullName} className="w-7 h-7 rounded-lg object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-purple-600/10 text-purple-600 font-black text-xs flex items-center justify-center">
                          {(w.fullName || w.name || 'S').substring(0, 1)}
                        </div>
                      )}
                      <span>{w.fullName || w.name}</span>
                    </td>
                    <td className="p-4 font-bold text-purple-600">{w.department || counsellor.department}</td>
                    <td className={`p-4 text-center font-black ${att < 75 ? 'text-rose-500' : 'text-emerald-600'}`}>{att}%</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black ${status === 'Improving' ? 'bg-emerald-500/10 text-emerald-600' : status === 'Declining' ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600'}`}>
                        {status === 'Improving' ? '🟢 Improving' : status === 'Declining' ? '🔴 Declining' : '🔵 Stable'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black ${riskLevel === 'High Risk' ? 'bg-rose-500/10 text-rose-600' : riskLevel === 'Warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {riskLevel === 'High Risk' ? '🔴 High Risk' : riskLevel === 'Warning' ? '🟡 Warning' : '🟢 Good'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-purple-600 text-xs">View Complete Profile →</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Complete View Modal (4 Tabs) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                {selectedStudent.profilePhotoUrl ? (
                  <img src={selectedStudent.profilePhotoUrl} alt={selectedStudent.fullName} className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/30" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 font-black text-lg flex items-center justify-center border-2 border-purple-500/20">
                    {(selectedStudent.fullName || selectedStudent.name || 'S').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedStudent.fullName || selectedStudent.name}</h3>
                  <p className="text-xs text-purple-600 font-bold">{selectedStudent.rollNumber || '22KBN-CS001'} • {selectedStudent.department}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* 4 Tabs Selector */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 gap-4 text-xs font-black">
              {['PROFILE', 'ACADEMIC', 'COUNSELLING', 'ACTIONS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`pb-2 border-b-2 transition-all uppercase tracking-wider ${modalTab === tab ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {modalTab === 'PROFILE' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Semester & Section</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{selectedStudent.semester || 'Semester 6'} — {selectedStudent.section || 'Section A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Email Address</span>
                    <span className="font-extrabold text-purple-600">{selectedStudent.email || `${selectedStudent.rollNumber}@kbn.edu`}</span>
                  </div>
                </div>
              </div>
            )}

            {modalTab === 'ACADEMIC' && academicProgress && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance %</span>
                    <span className="text-lg font-black text-emerald-600">{selectedStudent.attendancePercentage || selectedStudent.attendance || 80}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Internal Marks</span>
                    <span className="text-lg font-black text-purple-600">{academicProgress.internalMarks}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Backlogs</span>
                    <span className="text-lg font-black text-rose-500">{academicProgress.backlogs}</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-500/10 rounded-2xl flex items-center justify-between border border-purple-500/20">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-600 block">Performance Trajectory</span>
                    <span className="text-xs text-slate-700 dark:text-slate-200">Prev Sem: {academicProgress.previousSemester}% → Curr Sem: {academicProgress.currentSemester}%</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-black text-xs">
                    {academicProgress.status === 'Improving' ? '🟢 Improving' : academicProgress.status === 'Declining' ? '🔴 Declining' : '🔵 Stable'}
                  </span>
                </div>
              </div>
            )}

            {modalTab === 'COUNSELLING' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-black text-slate-900 dark:text-white">Student Risk History Timeline</h4>
                <div className="space-y-2">
                  {riskHistory.map((rh, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-purple-600">{rh.date}</span>
                        <p className="text-[10.5px] text-slate-500">{rh.notes}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 dark:text-white block">Att: {rh.attendance}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${rh.risk === 'High Risk' ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>{rh.risk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalTab === 'ACTIONS' && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => alert('Log Session Triggered')} className="p-3 bg-purple-600 text-white font-bold rounded-xl text-xs text-center shadow-md">
                  + Log Counselling Session
                </button>
                <button onClick={() => alert('Follow-up Scheduled')} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs text-center shadow-md">
                  + Schedule Follow-up
                </button>
              </div>
            )}

            <div className="text-right pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-md">
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
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Advanced Monthly Ward Mentoring Report</h2>
            <p className="text-xs text-slate-400">Institutional summary for KBN College • Department of {counsellor.department || 'Branch'}</p>
          </div>
          <button onClick={() => window.print()} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5">
            <Printer size={16} />
            <span>Print / Export PDF</span>
          </button>
        </div>

        {/* Report Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Wards</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{report.summary.totalWards}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Attendance</span>
            <span className="text-xl font-black text-emerald-600">{report.summary.averageAttendance}%</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Sessions Conducted</span>
            <span className="text-xl font-black text-purple-600">{report.summary.counsellingSessions}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Improved Wards</span>
            <span className="text-xl font-black text-emerald-600">{report.summary.improvedStudents}</span>
          </div>
        </div>

        {/* Ward Roster Summary Table */}
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Ward Student Roster & Risk Summary</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-3">Roll Number</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">Attendance %</th>
                <th className="p-3 text-center">Internal Marks</th>
                <th className="p-3 text-center">Backlogs</th>
                <th className="p-3 text-center">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report.wards.map((w) => {
                const att = w.attendancePercentage || w.attendance || 80;
                const risk = att < 65 ? 'High Risk' : att < 75 ? 'Warning' : 'Good';
                return (
                  <tr key={w.uid}>
                    <td className="p-3 font-mono font-bold">{w.rollNumber || '22KBN-CS001'}</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">{w.fullName || w.name}</td>
                    <td className="p-3 text-center font-black text-emerald-600">{att}%</td>
                    <td className="p-3 text-center font-bold">84 / 100</td>
                    <td className="p-3 text-center font-bold text-rose-500">{att < 65 ? 2 : att < 75 ? 1 : 0}</td>
                    <td className="p-3 text-center font-black">{risk}</td>
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

// 4. PARENT MEETINGS MANAGER
const ParentMeetingsManager = ({ counsellor }) => {
  const [meetings, setMeetings] = useState([]);
  useEffect(() => {
    const fetchMeetings = async () => {
      const res = await mockDB.getCounsellingMeetings('counsellor', counsellor.uid);
      setMeetings(res);
    };
    fetchMeetings();
  }, [counsellor]);

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Parent & Student Meeting Schedule</h2>
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <p className="text-slate-400 p-4 text-center">No meetings currently scheduled.</p>
          ) : meetings.map((m) => (
            <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{m.studentName || 'Student'}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{m.title || 'Discussion on academic progress'}</p>
                <span className="text-[9.5px] text-purple-600 font-bold block mt-0.5">{m.date} at {m.time}</span>
              </div>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-600 font-black text-[10px] rounded-full uppercase">
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. COUNSELLOR LEAVES
const CounsellorLeaves = ({ counsellor }) => {
  const [leaves, setLeaves] = useState([]);
  useEffect(() => {
    const fetchLeaves = async () => {
      const res = await mockDB.getLeaves('counsellor', counsellor.uid);
      setLeaves(res);
    };
    fetchLeaves();
  }, [counsellor]);

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Counsellor Leave Applications</h2>
        <div className="space-y-3">
          {leaves.length === 0 ? (
            <p className="text-slate-400 p-4 text-center">No leave applications submitted.</p>
          ) : leaves.map((l) => (
            <div key={l.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{l.reason}</h4>
                <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">{l.startDate} to {l.endDate}</span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 font-black text-[10px] rounded-full uppercase">
                {l.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
