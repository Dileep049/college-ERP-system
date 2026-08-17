import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured, mockDB, KBN_BRANCHES, KBN_SEMESTERS, BRANCH_SUBJECT_MAP, getSubjectsForBranch } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FacultyDashboard } from '../components/FacultyDashboard';
import { 
  LayoutDashboard,
  BookOpen,
  Users,
  CheckSquare,
  FileText,
  Briefcase,
  ClipboardList,
  TrendingUp,
  Activity,
  Calendar,
  UserCheck,
  Search,
  Plus,
  Trash2,
  Edit,
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
  Award,
  Bell,
  MessageSquare,
  ShieldCheck,
  X,
  FileSpreadsheet,
  Building2,
  Lock
} from 'lucide-react';

// Helper to resolve locked faculty department
const getFacultyDept = (faculty) => {
  return faculty?.assignedDepartment || faculty?.department || faculty?.branch || 'B.Sc. Computer Science (CS)';
};

export const FacultyPortal = ({ subPage }) => {
  const { user } = useAuth();

  // 1. Check URL Query Parameters Access Guard
  const searchParams = new URLSearchParams(window.location.search);
  const reqDept = searchParams.get('department') || searchParams.get('branch');
  const assignedDept = getFacultyDept(user);

  if (reqDept) {
    const normReq = reqDept.toUpperCase().trim();
    const normAssigned = assignedDept.toUpperCase().trim();
    const isDeptValid = normReq === normAssigned || normAssigned.includes(normReq) || normReq.includes(normAssigned) || (normReq.includes('AI') && normAssigned.includes('AI'));

    if (!isDeptValid) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-black/40 backdrop-blur-md rounded-3xl border border-rose-500/30 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto font-black text-2xl border border-rose-500/20">
            🔒
          </div>
          <h2 className="text-xl font-black text-white">Department Access Restricted</h2>
          <p className="text-sm font-bold text-rose-400">
            You are not assigned to this department.
          </p>
          <p className="text-xs text-gray-300 leading-relaxed">
            Your account ({user?.email}) is strictly assigned to <strong>{assignedDept}</strong> by your Head of Department. Access to {reqDept} is blocked.
          </p>
          <button
            onClick={() => window.location.href = '/faculty/dashboard'}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            Return to Faculty Dashboard
          </button>
        </div>
      );
    }
  }

  // 2. Check Inactive Assignment Status
  if (user?.assignmentStatus === 'inactive') {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-black/40 backdrop-blur-md rounded-3xl border border-amber-500/30 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto font-black text-2xl border border-amber-500/20">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-white">No Active Assignment</h2>
        <p className="text-sm font-bold text-amber-400">
          No active department/class assignment has been provided by your HOD.
        </p>
        <p className="text-xs text-gray-300 leading-relaxed">
          Please contact your Head of Department (HOD) to assign your department, semester, section, and subject.
        </p>
      </div>
    );
  }
  
  if (subPage === 'dashboard') return <FacultyDashboard faculty={user} />;
  if (subPage === 'classes') return <FacultyClasses faculty={user} />;
  if (subPage === 'students') return <FacultyStudents faculty={user} />;
  if (subPage === 'attendance') return <FacultyAttendance faculty={user} />;
  if (subPage === 'marks') return <FacultyMarks faculty={user} />;
  if (subPage === 'assignments') return <FacultyAssignments faculty={user} />;
  if (subPage === 'notes') return <FacultyNotes faculty={user} />;
  if (subPage === 'academic-performance') return <FacultyAcademicPerformance faculty={user} />;
  if (subPage === 'student-progress') return <FacultyStudentProgress faculty={user} />;
  if (subPage === 'leaves') return <FacultyLeaves faculty={user} />;
  if (subPage === 'reports') return <FacultyReports faculty={user} />;
  if (subPage === 'profile') return <FacultyProfile faculty={user} />;
  if (subPage === 'ward-counselling' || subPage === 'wards') return <FacultyWardCounselling faculty={user} />;
  return <FacultyDashboard faculty={user} />;
};

// Helper to calculate student risk level
const calculateStudentRisk = (attendance, totalMarks) => {
  const att = parseFloat(attendance || 80);
  const marks = parseFloat(totalMarks || 35);

  if (att < 65 || marks < 20) return { level: 'High Risk', class: 'bg-rose-500/10 text-rose-500 border-rose-500/30', reason: att < 65 ? 'Attendance below 65%' : 'Internal Marks below 20/50' };
  if (att < 75 || marks < 28) return { level: 'Warning', class: 'bg-amber-500/10 text-amber-500 border-amber-500/30', reason: att < 75 ? 'Attendance between 65%-75%' : 'Internal Marks between 20-28' };
  return { level: 'Good', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', reason: 'Satisfactory Academic Record' };
};

// FacultyPortal routes subpages to dedicated portal components

// 2. MY CLASSES
const FacultyClasses = ({ faculty }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const facultyDept = getFacultyDept(faculty);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        const allocs = await mockDB.getSubjectAllocations(facultyDept, faculty?.uid);
        
        if (allocs.length > 0) {
          setClasses(allocs);
        } else {
          setClasses([
            { id: 'c1', subject: 'Neural Networks & Deep Learning', subjectCode: 'CS-601', department: facultyDept, semester: 'Semester 6', section: 'Section A', studentsCount: 42, lecturePeriod: 'Period 2 (10:00 - 11:00 AM)', academicYear: '2025-2026' },
            { id: 'c2', subject: 'Cloud Computing & DevOps Architecture', subjectCode: 'CS-602', department: facultyDept, semester: 'Semester 6', section: 'Section B', studentsCount: 38, lecturePeriod: 'Period 4 (01:30 - 02:30 PM)', academicYear: '2025-2026' },
            { id: 'c3', subject: 'Artificial Intelligence & Expert Systems Lab', subjectCode: 'CS-605L', department: facultyDept, semester: 'Semester 6', section: 'Section A', studentsCount: 40, lecturePeriod: 'Lab Session (02:30 - 04:30 PM)', academicYear: '2025-2026' }
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, [faculty]);

  return (
    <div className="space-y-6 text-xs font-semibold text-white">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-xl border border-white/10 text-white shadow-lg flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase border border-white/15">Department: {facultyDept}</span>
          <h2 className="text-xl font-black font-display mt-2 text-white drop-shadow-sm">My Allocated Academic Classes</h2>
          <p className="text-xs text-gray-300 mt-1">Teaching allocation & active class logs assigned to {faculty?.fullName}</p>
        </div>
        <BookOpen size={28} className="text-cyan-300" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(c => (
          <div key={c.id || c.subjectCode} className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 flex flex-col justify-between hover:bg-black/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="px-3 py-1 bg-blue-500/20 text-cyan-300 rounded-xl text-[10px] font-black uppercase border border-blue-500/30">
                  {c.subjectCode || 'CS-601'}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">{c.academicYear || '2025-2026'}</span>
              </div>

              <h3 className="text-sm font-black text-white leading-snug drop-shadow-sm">{c.subject || c.subjectName}</h3>
              
              <div className="grid grid-cols-2 gap-2 text-gray-300 py-2 border-y border-white/10">
                <div><span className="text-gray-400 block text-[9.5px] uppercase font-bold">Department</span> <span className="font-black text-xs text-cyan-300">{facultyDept}</span></div>
                <div><span className="text-gray-400 block text-[9.5px] uppercase font-bold">Sem / Sec</span> <span className="font-black text-xs text-white">{c.semester} - {c.section || 'Section A'}</span></div>
                <div><span className="text-gray-400 block text-[9.5px] uppercase font-bold">Enrolled Students</span> <span className="font-black text-xs text-emerald-400">{c.studentsCount || 42} Students</span></div>
                <div><span className="text-gray-400 block text-[9.5px] uppercase font-bold">Lecture Slot</span> <span className="font-bold text-[10.5px] text-white">{c.lecturePeriod || 'Period 2'}</span></div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 border-t border-white/10">
              <a href="/faculty/students" className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10.5px] font-extrabold transition-all flex items-center gap-1">
                <Users size={13} /> Students
              </a>
              <a href="/faculty/attendance" className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[10.5px] font-extrabold hover:bg-blue-700 transition-all flex items-center gap-1">
                <CheckSquare size={13} /> Attendance
              </a>
              <a href="/faculty/marks" className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-[10.5px] font-extrabold hover:bg-purple-700 transition-all flex items-center gap-1">
                <FileText size={13} /> Marks
              </a>
              <a href="/faculty/assignments" className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10.5px] font-extrabold hover:bg-emerald-700 transition-all flex items-center gap-1">
                <Briefcase size={13} /> Tasks
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. MY STUDENTS & ACADEMIC PROFILE DRAWER
const FacultyStudents = ({ faculty }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedSec, setSelectedSec] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const facultyDept = getFacultyDept(faculty);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getStudents(facultyDept);
        setStudents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [faculty]);

  const filteredStudents = students.filter(s => {
    const nameMatch = (s.fullName || s.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
                      (s.rollNumber || '').toLowerCase().includes(search.toLowerCase());
    const semMatch = selectedSem === 'All' || s.semester === selectedSem;
    const secMatch = selectedSec === 'All' || s.section === selectedSec || (selectedSec === 'A' && (!s.section || s.section === 'A'));
    return nameMatch && semMatch && secMatch;
  });

  return (
    <div className="space-y-6 text-xs font-semibold text-white">
      
      {/* 1. Header & Search Controls (Standard Glass Top Section) */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg mb-6 flex flex-wrap gap-4 items-center justify-between w-full max-w-full">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 rounded-2xl font-black border border-blue-500/30 flex items-center gap-1.5 shadow-sm shrink-0">
            <Lock size={13} /> {facultyDept}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white drop-shadow-sm">Assigned Department Student Directory</h3>
            <p className="text-[10.5px] text-gray-300">Roster automatically scoped to logged-in faculty department</p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium shadow-inner"
            />
          </div>

          <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="flex-1 min-w-[130px] px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-400 cursor-pointer">
            <option value="All" className="bg-slate-900 text-white">All Semesters</option>
            {KBN_SEMESTERS.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
          </select>

          <select value={selectedSec} onChange={(e) => setSelectedSec(e.target.value)} className="flex-1 min-w-[120px] px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-400 cursor-pointer">
            <option value="All" className="bg-slate-900 text-white">All Sections</option>
            <option value="A" className="bg-slate-900 text-white">Section A</option>
            <option value="B" className="bg-slate-900 text-white">Section B</option>
            <option value="C" className="bg-slate-900 text-white">Section C</option>
          </select>
        </div>
      </div>

      {/* 2. Student Roster Table (Standard Dark Glass Table) */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg space-y-3 p-4 sm:p-5 w-full max-w-full">
        <h3 className="text-sm font-bold text-white drop-shadow-sm border-b border-white/10 pb-3">
          Department Students Roster ({filteredStudents.length} Students)
        </h3>

        {loading ? (
          <div className="py-16 text-center animate-pulse text-gray-400 font-medium">Loading student roster for {facultyDept}...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-medium">No students match the specified filter criteria in {facultyDept}.</div>
        ) : (
          <div className="w-full max-w-full overflow-hidden border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md shadow-lg">
          <table className="w-full table-fixed text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="w-[30%] px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                <th className="w-[14%] whitespace-nowrap px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Roll Number</th>
                <th className="w-[14%] whitespace-nowrap px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Semester / Sec</th>
                <th className="w-[14%] whitespace-nowrap px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance %</th>
                <th className="w-[14%] whitespace-nowrap px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Internal Score</th>
                <th className="w-[14%] whitespace-nowrap px-3 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white font-medium">
              {filteredStudents.map(s => {
                const att = parseFloat(s.attendancePercentage || s.attendance || 82);
                const marks = parseFloat(s.internalMarks || 38);

                return (
                  <tr key={s.uid || s.studentId || s.rollNumber} className="hover:bg-white/5 transition-colors">
                    <td className="w-[30%] px-3 py-3 whitespace-normal align-middle text-sm font-bold text-white">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {s.studentName ? s.studentName[0].toUpperCase() : 'S'}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-sm font-bold text-white tracking-wide break-words">{s.fullName || s.studentName}</p>
                          <p className="text-[10.5px] text-gray-400 break-words">{s.department || facultyDept}</p>
                        </div>
                      </div>
                    </td>
                    <td className="w-[14%] whitespace-nowrap px-3 py-3 font-mono text-sm font-medium text-cyan-300 align-middle">{s.rollNumber}</td>
                    <td className="w-[14%] whitespace-nowrap px-3 py-3 text-center text-sm font-medium text-gray-200 align-middle">{s.semester} - {s.section || 'A'}</td>
                    <td className="w-[14%] whitespace-nowrap px-3 py-3 text-center text-sm font-bold text-emerald-400 align-middle">{att}%</td>
                    <td className="w-[14%] whitespace-nowrap px-3 py-3 text-center text-sm font-medium text-gray-200 align-middle">{marks} / 50</td>
                    <td className="w-[14%] whitespace-nowrap px-3 py-3 text-right align-middle">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center justify-center gap-1 shadow cursor-pointer hover:scale-[1.02]"
                      >
                        <Eye size={13} /> Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Student Academic Profile Drawer Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">Student Academic Performance Card</h3>
              <button onClick={() => setSelectedStudent(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><X size={18} /></button>
            </div>

            <div className="flex items-center gap-4 py-2 border-b border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-cyan-300 border border-blue-500/30 flex items-center justify-center font-black text-lg shrink-0">
                {selectedStudent.studentName ? selectedStudent.studentName[0].toUpperCase() : 'S'}
              </div>
              <div>
                <h4 className="text-base font-black text-white">{selectedStudent.fullName || selectedStudent.studentName}</h4>
                <p className="text-xs text-cyan-300 font-bold">{selectedStudent.rollNumber} • {selectedStudent.department || facultyDept}</p>
                <p className="text-[10.5px] text-gray-400">{selectedStudent.semester} ({selectedStudent.section || 'Section A'})</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-[9.5px] text-gray-400 uppercase font-bold block">Attendance Percentage</span>
                <span className="text-lg font-black text-emerald-400">{selectedStudent.attendancePercentage || selectedStudent.attendance || 82}%</span>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-[9.5px] text-gray-400 uppercase font-bold block">Subject Internal Marks</span>
                <span className="text-lg font-black text-cyan-300">{selectedStudent.internalMarks || 38} / 50</span>
              </div>
            </div>

            <button onClick={() => setSelectedStudent(null)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all cursor-pointer">
              Close Profile Card
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// 4. ATTENDANCE & ATTENDANCE MARKING (AUTOMATIC FACULTY TEACHING SCOPE LOCK)
const FacultyAttendance = ({ faculty }) => {
  const facultyDept = getFacultyDept(faculty);
  const [teachingAssignments, setTeachingAssignments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lecturePeriod, setLecturePeriod] = useState('Period 2 (10:00 - 11:00 AM)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [semester, setSemester] = useState('Semester 6');
  const [section, setSection] = useState('Section A');
  const [subject, setSubject] = useState('Neural Networks & Deep Learning');

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useAuth();

  const availableSubjects = Array.from(new Set([subject, 'Data Structures', 'Operating Systems', 'Machine Learning'].filter(Boolean)));

  useEffect(() => {
    const fetchAssigns = async () => {
      setLoading(true);
      const assigns = await mockDB.getFacultyAssignments(faculty?.uid || faculty?.id || faculty?.email);
      const activeOnly = assigns.filter(a => a.status === 'active' || a.status === 'Active');
      setTeachingAssignments(activeOnly);
      setLoading(false);
    };
    fetchAssigns();
  }, [faculty]);

  const currentScope = teachingAssignments[selectedIndex] || null;

  const loadStudentsForAttendance = async () => {
    if (!currentScope) return;
    try {
      setLoading(true);
      const data = await mockDB.getStudentsByBranchAndSemester(currentScope.department, currentScope.semester, currentScope.section);
      setStudents(data);

      const initialMap = {};
      data.forEach(s => {
        initialMap[s.uid || s.studentId || s.rollNumber] = 'Present';
      });
      setAttendanceMap(initialMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentScope) {
      loadStudentsForAttendance();
    }
  }, [selectedIndex, teachingAssignments]);

  if (!loading && teachingAssignments.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/30 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto font-black text-2xl border border-rose-500/20">
          🔒
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Scope Access Restricted</h2>
        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
          You are not authorized to access this academic scope.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          No active teaching assignment has been provided by your Head of Department for your account ({faculty?.email}).
        </p>
      </div>
    );
  }

  const handleStatusToggle = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      const records = Object.keys(attendanceMap).map(uid => {
        const stud = students.find(s => (s.uid || s.studentId || s.rollNumber) === uid);
        return {
          studentId: uid,
          rollNumber: stud?.rollNumber || stud?.roll || stud?.usn || '',
          studentName: stud?.fullName || stud?.studentName || stud?.name || 'Student',
          status: attendanceMap[uid]
        };
      });

      await mockDB.markAttendance(records, date, subject, facultyDept, semester, section, faculty?.uid, lecturePeriod);
      showToast(`Attendance for ${subject} logged & saved for ${facultyDept}!`, 'success');
    } catch (e) {
      console.error(e);
      showToast(e.message || 'Could not save attendance.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-white">
      
      {/* Selector Bar */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg mb-6 space-y-4">
        
        {/* Step Flow Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white drop-shadow-sm">Mark Class Lecture Attendance</h3>
            <p className="text-xs text-gray-300">Faculty Department → Semester → Section → Subject → Mark Attendance</p>
          </div>

          {/* Locked Read-Only Department Badge */}
          <div className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 rounded-xl border border-blue-500/30 flex items-center gap-2 shadow-sm">
            <Lock size={13} className="text-cyan-300" />
            <div>
              <span className="text-[9px] uppercase tracking-wider block font-bold text-gray-300">Department (Auto Loaded)</span>
              <span className="font-bold text-xs text-white">{facultyDept}</span>
            </div>
          </div>
        </div>

        {/* Class Selection Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">

          <div>
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Semester *</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer">
              {KBN_SEMESTERS.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Section *</label>
            <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer">
              <option value="Section A" className="bg-slate-900 text-white">Section A</option>
              <option value="Section B" className="bg-slate-900 text-white">Section B</option>
              <option value="Section C" className="bg-slate-900 text-white">Section C</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Subject *</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer">
              {availableSubjects.map((subj, idx) => <option key={`${subj}-${idx}`} value={subj} className="bg-slate-900 text-white">{subj}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Lecture Period *</label>
            <select value={lecturePeriod} onChange={(e) => setLecturePeriod(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer">
              <option value="Period 1 (09:00 - 10:00 AM)" className="bg-slate-900 text-white">Period 1 (09:00 - 10:00 AM)</option>
              <option value="Period 2 (10:00 - 11:00 AM)" className="bg-slate-900 text-white">Period 2 (10:00 - 11:00 AM)</option>
              <option value="Period 3 (11:15 - 12:15 PM)" className="bg-slate-900 text-white">Period 3 (11:15 - 12:15 PM)</option>
              <option value="Period 4 (01:30 - 02:30 PM)" className="bg-slate-900 text-white">Period 4 (01:30 - 02:30 PM)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Attendance Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer" />
          </div>

        </div>
      </div>

      {/* Student List for Attendance */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg p-4 sm:p-5 space-y-4 w-full max-w-full">
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white drop-shadow-sm">Student Roster Attendance Marking</h3>
            <p className="text-xs text-gray-300">Recording attendance for {subject} • {semester} ({section})</p>
          </div>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] shrink-0"
          >
            <CheckCircle2 size={15} /> {saving ? 'Saving...' : 'Submit & Lock Attendance'}
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center animate-pulse text-gray-400 font-medium">Loading student roster for {facultyDept}...</div>
        ) : (
          <div className="w-full max-w-full overflow-x-hidden">
            <table className="w-full table-fixed text-left border-collapse">
              <thead className="bg-black/40 border-b border-white/10">
                <tr>
                  <th className="w-[20%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Roll Number</th>
                  <th className="w-[45%] px-2 sm:px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                  <th className="w-[35%] px-2 sm:px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status Toggle</th>
                </tr>
              </thead>
              <tbody className="text-white font-medium">
                {students.map(s => {
                  const uid = s.uid || s.studentId || s.rollNumber;
                  const currentStatus = attendanceMap[uid] || 'Present';
                  return (
                    <tr key={uid} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                      <td className="px-2 sm:px-3 py-3 whitespace-normal break-words font-mono text-xs sm:text-sm font-medium text-cyan-300 align-middle">{s.rollNumber}</td>
                      <td className="px-2 sm:px-3 py-3 whitespace-normal break-words align-middle">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={s.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} alt="" className="w-7 h-7 rounded-full object-cover border border-white/20 shadow-sm shrink-0 hidden sm:block" />
                          <span className="text-xs sm:text-sm font-semibold text-white tracking-wide drop-shadow-sm break-words">{s.fullName || s.studentName}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-3 whitespace-normal text-center align-middle">
                        <div className="inline-flex rounded-xl bg-white/5 p-0.5 sm:p-1 border border-white/10 max-w-full">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(uid, 'Present')}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${currentStatus === 'Present' ? 'bg-emerald-500 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(uid, 'Absent')}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${currentStatus === 'Absent' ? 'bg-rose-500 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(uid, 'Late')}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${currentStatus === 'Late' ? 'bg-amber-500 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

// 5. INTERNAL MARKS (AUTOMATIC FACULTY TEACHING SCOPE LOCK)
const FacultyMarks = ({ faculty }) => {
  const facultyDept = getFacultyDept(faculty);
  const [teachingAssignments, setTeachingAssignments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [semester, setSemester] = useState('Semester 6');
  const [section, setSection] = useState('Section A');
  const [subject, setSubject] = useState('Neural Networks & Deep Learning');
  const availableSubjects = Array.from(new Set([subject, 'Data Structures', 'Operating Systems', 'Machine Learning'].filter(Boolean)));

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [marksMap, setMarksMap] = useState({});
  const { showToast } = useAuth();

  useEffect(() => {
    const fetchAssigns = async () => {
      setLoading(true);
      const assigns = await mockDB.getFacultyAssignments(faculty?.uid || faculty?.id || faculty?.email);
      const activeOnly = assigns.filter(a => a.status === 'active' || a.status === 'Active');
      setTeachingAssignments(activeOnly);
      setLoading(false);
    };
    fetchAssigns();
  }, [faculty]);

  const currentScope = teachingAssignments[selectedIndex] || null;

  useEffect(() => {
    const loadMarks = async () => {
      if (!currentScope) return;
      try {
        setLoading(true);
        let realStudents = [];
        if (isFirebaseConfigured && db) {
          try {
            const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
            const snapUsers = await getDocs(qUsers);
            const usersList = snapUsers.docs.map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() }));

            const qProf = query(collection(db, 'profiles'), where('role', '==', 'student'));
            const snapProf = await getDocs(qProf);
            const profList = snapProf.docs.map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() }));

            const sMap = new Map();
            [...usersList, ...profList].forEach(s => {
              if (s.uid) sMap.set(s.uid, s);
            });
            realStudents = Array.from(sMap.values());
          } catch (err) {
            console.warn("Firestore student roster query failed in FacultyMarks:", err);
          }
        }

        const mockData = await mockDB.getStudentsByBranchAndSemester(currentScope.department, currentScope.semester, currentScope.section);

        // Filter students for current scope
        const combinedMap = new Map();
        
        // 1. Primary: Real Firestore student user documents
        realStudents.forEach(st => {
          const stDept = (st.department || st.branch || '').trim();
          const stSem = (st.semester || '').trim();
          const stSec = (st.section || '').trim();

          const bMatch = !stDept || isDepartmentMatch(currentScope.department, stDept) || isDepartmentMatch(stDept, currentScope.department);
          const sMatch = !stSem || stSem === 'All' || normalizeSemester(stSem) === normalizeSemester(currentScope.semester);

          if (bMatch && sMatch) {
            const key = st.uid || st.id || st.rollNumber;
            if (key) combinedMap.set(key, st);
          }
        });

        // 2. Secondary: Mock data ONLY if no Firestore students match
        if (combinedMap.size === 0) {
          mockData.forEach(st => {
            const key = st.uid || st.id || st.rollNumber;
            if (key) combinedMap.set(key, st);
          });
        }

        const finalStudentList = Array.from(combinedMap.values());
        setStudents(finalStudentList);

        // Load existing published/saved marks
        const existingMarks = await mockDB.getBranchMarks(currentScope.department, currentScope.semester, subject);
        const map = {};
        finalStudentList.forEach(s => {
          const uid = s.uid || s.studentId || s.rollNumber;
          const roll = s.rollNumber || s.hallTicketNumber || s.studentRollNumber;
          const matchedMark = existingMarks.find(m => (roll && (m.rollNumber === roll || m.studentRollNumber === roll)) || (uid && (m.studentId === uid || m.studentUid === uid)));

          map[uid] = {
            mid1: matchedMark ? matchedMark.mid1 : (s.mid1 || 16),
            mid2: matchedMark ? matchedMark.mid2 : (s.mid2 || 17),
            assignments: matchedMark ? matchedMark.assignments : (s.assignmentMarks || s.assignments || 8)
          };
        });
        setMarksMap(map);
      } catch (e) {
        console.error("Error loading student roster in FacultyMarks:", e);
      } finally {
        setLoading(false);
      }
    };
    if (currentScope) loadMarks();
  }, [selectedIndex, teachingAssignments, subject]);

  if (!loading && teachingAssignments.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/30 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto font-black text-2xl border border-rose-500/20">
          🔒
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Scope Access Restricted</h2>
        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
          You are not authorized to access this academic scope.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          No active teaching assignment has been provided by your Head of Department for your account ({faculty?.email}).
        </p>
      </div>
    );
  }

  const handleMarkChange = (uid, field, val) => {
    const num = Math.max(0, Math.min(field === 'assignments' ? 10 : 20, Number(val) || 0));
    setMarksMap(prev => ({
      ...prev,
      [uid]: { ...prev[uid], [field]: num }
    }));
  };

  const handleSaveMarks = async () => {
    try {
      setSaving(true);
      const records = students.map(s => {
        const uid = s.uid || s.studentId || s.rollNumber;
        const roll = s.rollNumber || s.hallTicketNumber || s.studentRollNumber || uid;
        const m = marksMap[uid] || { mid1: 16, mid2: 17, assignments: 8 };
        const total = (Number(m.mid1) || 0) + (Number(m.mid2) || 0) + (Number(m.assignments) || 0);

        return {
          studentId: uid,
          studentUid: uid,
          rollNumber: roll,
          studentRollNumber: roll,
          studentName: s.fullName || s.name || s.studentName || 'Student',
          department: facultyDept,
          branch: facultyDept,
          semester: currentScope?.semester || semester,
          section: currentScope?.section || section,
          subject: subject,
          mid1: Number(m.mid1) || 0,
          mid2: Number(m.mid2) || 0,
          assignments: Number(m.assignments) || 0,
          total: total,
          status: 'Published',
          facultyId: faculty?.uid || faculty?.id || 'fac-1',
          facultyName: faculty?.fullName || faculty?.name || 'Faculty'
        };
      });

      await mockDB.saveInternalMarksBatch(records);
      showToast(`Internal marks saved & published for ${records.length} students.`, 'success');
    } catch (e) {
      console.error("Error saving internal marks:", e);
      showToast('Could not save marks.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-white">
      
      {/* 1. Header & Filters Controls Bar */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg mb-6 space-y-4 w-full max-w-full">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div>
            <h3 className="text-sm font-bold text-white drop-shadow-sm">Assigned Subject Internal Marks Entry</h3>
            <p className="text-xs text-gray-300">Mid-Term 1 (20) + Mid-Term 2 (20) + Assignments (10) = Total (50 Marks)</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 rounded-xl font-bold border border-blue-500/30 flex items-center gap-1.5 shadow-sm shrink-0">
              <Lock size={13} className="text-cyan-300" /> {facultyDept}
            </div>
            <button
              onClick={handleSaveMarks}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] shrink-0"
            >
              <CheckCircle2 size={15} /> {saving ? 'Saving...' : 'Save & Publish Marks'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Semester *</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer">
              {KBN_SEMESTERS.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Section *</label>
            <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer">
              <option value="Section A" className="bg-slate-900 text-white">Section A</option>
              <option value="Section B" className="bg-slate-900 text-white">Section B</option>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Subject *</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer">
              {availableSubjects.map((subj, idx) => <option key={`${subj}-${idx}`} value={subj} className="bg-slate-900 text-white">{subj}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Marks Roster Table */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg p-4 sm:p-5 space-y-4 w-full max-w-full">
        {loading ? (
          <div className="py-16 text-center animate-pulse text-gray-400 font-medium">Loading student marks roster...</div>
        ) : (
          <div className="w-full max-w-full overflow-x-hidden">
            <table className="w-full table-fixed text-left border-collapse">
              <thead className="bg-black/40 border-b border-white/10">
                <tr>
                  <th className="w-[30%] px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Roll Number</th>
                  <th className="w-[12%] px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Mid-1 (20)</th>
                  <th className="w-[12%] px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Mid-2 (20)</th>
                  <th className="w-[12%] px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Assign (10)</th>
                  <th className="w-[10%] px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Total (50)</th>
                  <th className="w-[9%] px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="text-white font-medium">
                {students.map(s => {
                  const uid = s.uid || s.studentId || s.rollNumber;
                  const m = marksMap[uid] || { mid1: 16, mid2: 17, assignments: 8 };
                  const total = m.mid1 + m.mid2 + m.assignments;

                  return (
                    <tr key={uid} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                      <td className="px-4 py-3 whitespace-normal break-words text-sm font-semibold text-white tracking-wide drop-shadow-sm">{s.fullName || s.studentName}</td>
                      <td className="px-4 py-3 whitespace-normal break-words font-mono text-sm font-medium text-cyan-300">{s.rollNumber}</td>
                      <td className="px-4 py-3 whitespace-normal text-center">
                        <input
                          type="number"
                          max={20}
                          value={m.mid1}
                          onChange={(e) => handleMarkChange(uid, 'mid1', e.target.value)}
                          className="w-14 px-1.5 py-1 bg-white/5 border border-white/10 rounded-lg text-center font-medium text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-normal text-center">
                        <input
                          type="number"
                          max={20}
                          value={m.mid2}
                          onChange={(e) => handleMarkChange(uid, 'mid2', e.target.value)}
                          className="w-14 px-1.5 py-1 bg-white/5 border border-white/10 rounded-lg text-center font-medium text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-normal text-center">
                        <input
                          type="number"
                          max={10}
                          value={m.assignments}
                          onChange={(e) => handleMarkChange(uid, 'assignments', e.target.value)}
                          className="w-14 px-1.5 py-1 bg-white/5 border border-white/10 rounded-lg text-center font-medium text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-normal text-center font-semibold text-sm text-cyan-300">{total}/50</td>
                      <td className="px-4 py-3 whitespace-normal text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold uppercase border whitespace-nowrap ${
                          total >= 40 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                          total >= 28 ? 'bg-blue-500/20 text-cyan-300 border-blue-400/30' : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                        }`}>
                          {total >= 40 ? 'Excellent' : total >= 28 ? 'Good' : 'Needs Work'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 6. ASSIGNMENTS & FILE UPLOAD (AUTO ATTACH FACULTY DEPARTMENT)
const FacultyAssignments = ({ faculty }) => {
  const facultyDept = getFacultyDept(faculty);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(faculty?.assignedSubject || faculty?.subject || 'Neural Networks & Deep Learning');
  const [semester, setSemester] = useState(faculty?.assignedSemester || faculty?.semester || 'Semester 1');
  const [section, setSection] = useState(faculty?.assignedSection || faculty?.section || 'Section A');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]);
  const [file, setFile] = useState(null);

  const { showToast } = useAuth();

  const availableSubjects = getSubjectsForBranch(facultyDept).length > 0 
    ? getSubjectsForBranch(facultyDept) 
    : ['Data Structures', 'Operating Systems', 'Database Management Systems', 'Neural Networks'];

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getAssignments(facultyDept);
      setAssignments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [facultyDept]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title || !subject || !dueDate) {
      showToast('Please fill in all required fields (title, subject, due date).', 'error');
      return;
    }

    if (!file) {
      showToast('Please select an assignment file to upload.', 'error');
      return;
    }

    console.log("[Assignment] Selected file:", file?.name);
    console.log("[Assignment] File type:", file?.type);
    console.log("[Assignment] File size:", file?.size);

    try {
      setUploading(true);
      await mockDB.createAssignment(
        title,
        description,
        facultyDept,
        semester,
        subject,
        dueDate,
        faculty?.uid,
        faculty?.fullName || 'Faculty',
        file,
        section
      );

      showToast(`Assignment published & assigned to ${facultyDept} (${semester})!`, 'success');
      setTitle('');
      setDescription('');
      setFile(null);
      await loadAssignments();
    } catch (e) {
      console.error("Assignment upload error:", e);
      showToast(e.message || 'File upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Delete assignment?")) return;
    try {
      await mockDB.deleteAssignment(id);
      showToast('Assignment deleted.', 'success');
      loadAssignments();
    } catch (_) {}
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-white">
      
      {/* Create Assignment Form */}
      <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white drop-shadow-sm">Create & Upload Course Assignment</h3>
          <div className="px-3.5 py-1 bg-blue-500/20 text-cyan-300 rounded-xl font-black border border-blue-500/30 flex items-center gap-1.5 shadow-sm">
            <Lock size={13} className="text-cyan-300" /> {facultyDept}
          </div>
        </div>

        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Assignment Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lab Task #4 - Backpropagation Algorithm Implementation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Subject *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium cursor-pointer">
                {availableSubjects.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Target Semester *</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium cursor-pointer">
                {KBN_SEMESTERS.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Target Section *</label>
              <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium cursor-pointer">
                <option value="Section A" className="bg-slate-900 text-white">Section A</option>
                <option value="Section B" className="bg-slate-900 text-white">Section B</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Description & Guidelines</label>
            <textarea
              rows={2}
              placeholder="Provide assignment guidelines and submission criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <input
              type="file"
              key={file ? 'assign-file-selected' : 'assign-file-empty'}
              onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white file:bg-blue-600 file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-white file:font-bold file:mr-3"
            />

            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Upload size={15} /> {uploading ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </div>

      {/* Published Assignments List */}
      <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4">
        <h3 className="text-sm font-black text-white drop-shadow-sm border-b border-white/10 pb-3">
          Published Assignments Roster ({facultyDept})
        </h3>

        {loading ? (
          <div className="py-12 text-center animate-pulse text-gray-400">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No assignments created yet for {facultyDept}.</div>
        ) : (
          <div className="space-y-3">
            {assignments.map(a => (
              <div key={a.id || a.assignmentId} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 hover:bg-white/10 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 border border-blue-500/30 rounded font-bold text-[9.5px] uppercase">{a.subject}</span>
                    <h4 className="font-bold text-white text-xs">{a.title}</h4>
                  </div>
                  <p className="text-[10.5px] text-gray-300 mt-1">{a.description}</p>
                  <span className="text-[9.5px] text-rose-400 block font-bold mt-1">Due Date: {a.dueDate} • Target: {a.department || facultyDept} ({a.semester})</span>
                </div>

                <div className="flex items-center gap-2">
                  {a.fileUrl && (
                    <a href={a.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                      <Download size={14} />
                    </a>
                  )}
                  <button onClick={() => handleDeleteAssignment(a.id || a.assignmentId)} className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl transition-all cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// 7. STUDY NOTES & FILE UPLOAD (AUTO ATTACH FACULTY DEPARTMENT)
const FacultyNotes = ({ faculty }) => {
  const facultyDept = getFacultyDept(faculty);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(faculty?.assignedSubject || faculty?.subject || 'Neural Networks & Deep Learning');
  const [semester, setSemester] = useState(faculty?.assignedSemester || faculty?.semester || 'Semester 1');
  const [section, setSection] = useState(faculty?.assignedSection || faculty?.section || 'Section A');
  const [file, setFile] = useState(null);

  const { showToast } = useAuth();

  const availableSubjects = getSubjectsForBranch(facultyDept).length > 0 
    ? getSubjectsForBranch(facultyDept) 
    : ['Data Structures', 'Operating Systems', 'Database Management Systems', 'Neural Networks'];

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getNotes(facultyDept);
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [facultyDept]);

  const handleUploadNotes = async (e) => {
    e.preventDefault();
    if (!topic || !subject) {
      showToast('Please fill in required fields (topic, subject).', 'error');
      return;
    }

    if (!file) {
      showToast('Please select a study note file to upload.', 'error');
      return;
    }

    console.log("[Study Notes] Selected file:", file?.name);
    console.log("[Study Notes] File type:", file?.type);
    console.log("[Study Notes] File size:", file?.size);

    try {
      setUploading(true);
      await mockDB.uploadNote(
        faculty?.uid,
        faculty?.fullName || faculty?.full_name || 'Faculty',
        facultyDept,
        semester,
        subject,
        topic,
        description,
        file?.name || 'notes.pdf',
        file,
        section,
        faculty?.email || ''
      );

      showToast(`Study notes published & linked to ${facultyDept} (${semester})!`, 'success');
      setTopic('');
      setDescription('');
      setFile(null);
      await loadNotes();
    } catch (e) {
      console.error("Notes upload error:", e);
      showToast(e.message || 'File upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete lecture note?")) return;
    try {
      await mockDB.deleteNote(id);
      showToast('Notes deleted.', 'success');
      loadNotes();
    } catch (_) {}
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-white">
      
      {/* Upload Notes Form */}
      <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white drop-shadow-sm">Upload Academic Study Notes & Materials</h3>
          <div className="px-3.5 py-1 bg-blue-500/20 text-cyan-300 rounded-xl font-black border border-blue-500/30 flex items-center gap-1.5 shadow-sm">
            <Lock size={13} className="text-cyan-300" /> {facultyDept}
          </div>
        </div>

        <form onSubmit={handleUploadNotes} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Topic Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Unit 3 - Convolutional Neural Networks Architecture"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Subject *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium cursor-pointer">
                {availableSubjects.map(s => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Target Semester *</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium cursor-pointer">
                {KBN_SEMESTERS.map(s => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Target Section *</label>
              <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium cursor-pointer">
                <option value="Section A" className="bg-slate-900 text-white">Section A</option>
                <option value="Section B" className="bg-slate-900 text-white">Section B</option>
                <option value="Section C" className="bg-slate-900 text-white">Section C</option>
                <option value="EM" className="bg-slate-900 text-white">Section EM</option>
                <option value="All" className="bg-slate-900 text-white">All Sections</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Brief Description / Key Summary</label>
            <textarea
              rows={2}
              placeholder="Overview of lecture slides or reference PDF..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <input
              type="file"
              key={file ? 'notes-file-selected' : 'notes-file-empty'}
              onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white file:bg-blue-600 file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-white file:font-bold file:mr-3"
            />

            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Upload size={15} /> {uploading ? 'Uploading...' : 'Publish Study Note'}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Notes List */}
      <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4">
        <h3 className="text-sm font-black text-white drop-shadow-sm border-b border-white/10 pb-3">
          Uploaded Study Notes Ledger ({facultyDept})
        </h3>

        {loading ? (
          <div className="py-12 text-center animate-pulse text-gray-400">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No study notes uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map(n => (
              <div key={n.noteId || n.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-3 hover:bg-white/10 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-bold text-[9.5px] uppercase">{n.subject}</span>
                    <span className="text-[9.5px] text-gray-400">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-2">{n.topic || n.title}</h4>
                  <p className="text-[10.5px] text-gray-300 mt-1">{n.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-[10px] text-gray-400 font-mono">{n.fileName || 'notes.pdf'}</span>
                  <div className="flex items-center gap-2">
                    {n.fileUrl && (
                      <a href={n.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all">
                        <Download size={13} />
                      </a>
                    )}
                    <button onClick={() => handleDeleteNote(n.noteId || n.id)} className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl transition-all cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// 8. ACADEMIC PERFORMANCE MATRIX
const FacultyAcademicPerformance = ({ faculty }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const facultyDept = getFacultyDept(faculty);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getStudents(facultyDept);
        setStudents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [facultyDept]);

  return (
    <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-4 text-xs font-semibold">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-black text-white">Class Academic Performance Matrix</h3>
          <p className="text-xs text-gray-400">Integrated attendance & internal mark evaluations for {facultyDept}</p>
        </div>
        <TrendingUp size={22} className="text-emerald-400" />
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-gray-400 font-bold">Loading academic performance matrix...</div>
      ) : (
        <div className="w-full max-w-full overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 font-bold uppercase tracking-wider border-b border-white/10 text-[10px]">
                <th className="w-[30%] px-3 py-3 text-left">Student Name</th>
                <th className="w-[16%] whitespace-nowrap px-3 py-3 text-left">Roll Number</th>
                <th className="w-[14%] whitespace-nowrap px-3 py-3 text-center">Attendance</th>
                <th className="w-[14%] whitespace-nowrap px-3 py-3 text-center">Internal Score</th>
                <th className="w-[12%] whitespace-nowrap px-3 py-3 text-center">Submissions</th>
                <th className="w-[14%] whitespace-nowrap px-3 py-3 text-right">Academic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {students.map(s => {
                const att = parseFloat(s.attendancePercentage || s.attendance || 82);
                const marks = parseFloat(s.internalMarks || 38);
                const submissions = s.submissions || '100%';
                const status = s.academicStatus || 'Good';

                return (
                  <tr key={s.uid || s.studentId || s.rollNumber} className="hover:bg-white/5 transition-colors">
                    <td className="w-[30%] px-3 py-3 whitespace-normal align-middle text-sm font-bold text-white">
                      {s.fullName || s.studentName}
                    </td>
                    <td className="w-[16%] whitespace-nowrap px-3 py-3 text-sm text-cyan-300 font-mono align-middle">
                      {s.rollNumber}
                    </td>
                    <td className="w-[14%] whitespace-nowrap px-3 py-3 text-center text-sm font-bold text-emerald-400 align-middle">
                      {att}%
                    </td>
                    <td className="w-[14%] whitespace-nowrap px-3 py-3 text-center text-sm font-bold text-gray-200 align-middle">
                      {marks} / 50
                    </td>
                    <td className="w-[12%] whitespace-nowrap px-3 py-3 text-center text-sm font-bold text-purple-300 align-middle">
                      {submissions}
                    </td>
                    <td className="w-[14%] whitespace-nowrap px-3 py-3 text-right text-sm align-middle">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block">
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 9. STUDENT PROGRESS (EARLY WARNING SYSTEM)
const FacultyStudentProgress = ({ faculty }) => {
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);

  const facultyDept = getFacultyDept(faculty);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getStudents(facultyDept);
        const list = data.filter(s => (s.attendancePercentage || s.attendance || 80) < 75 || (s.gpa || 8.0) < 6.5);
        setAtRiskList(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [facultyDept]);

  return (
    <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-4 text-xs font-semibold text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-black text-white">Student Progress Early Warning Tracker ({facultyDept})</h3>
          <p className="text-xs text-gray-400">Identifies students requiring academic intervention or attendance boost</p>
        </div>
        <Activity size={22} className="text-rose-400" />
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-gray-400">Loading student progress alerts...</div>
      ) : atRiskList.length === 0 ? (
        <div className="py-16 text-center text-gray-400 font-bold">No students currently require academic progress warnings in {facultyDept}. All candidates maintain &gt;75% attendance.</div>
      ) : (
        <div className="space-y-3">
          {atRiskList.map(s => {
            const att = parseFloat(s.attendancePercentage || s.attendance || 68);
            const risk = calculateStudentRisk(att, 24);

            return (
              <div key={s.uid || s.studentId} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-xs">{s.fullName || s.studentName}</h4>
                    <span className="font-mono text-cyan-300 text-[10px]">{s.rollNumber}</span>
                  </div>
                  <p className="text-[10.5px] text-gray-300">Department: {s.department || facultyDept} • {s.semester}</p>
                  <p className="text-[10.5px] text-rose-400 font-bold">Reason: {risk.reason}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-400 block">{att}% Attendance</span>
                    <span className="text-[9.5px] text-gray-400 block">Needs +{Math.max(0, 75 - att).toFixed(1)}% to reach 75%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 10. FACULTY LEAVE & LEAVE HISTORY
const FacultyLeaves = ({ faculty }) => {
  const facultyDept = getFacultyDept(faculty);

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  const { showToast } = useAuth();

  useEffect(() => {
    if (!faculty) return;
    setLoading(true);

    const facultyUid = faculty.uid || faculty.id;
    const facultyEmail = faculty.email;
    let unsubscribe = null;

    const setupLeavesListener = async () => {
      try {
        // 1. Real-time Firebase Subscription (Query Match on facultyId)
        if (isFirebaseConfigured && db) {
          try {
            const leavesRef = collection(db, 'facultyLeaves');
            const q = query(
              leavesRef,
              where('facultyId', '==', facultyUid)
            );

            // 2. Real-time Update via onSnapshot
            unsubscribe = onSnapshot(q, (snapshot) => {
              const fsLeaves = [];
              snapshot.forEach((docSnap) => {
                const d = docSnap.data();
                fsLeaves.push({
                  id: docSnap.id,
                  ...d
                });
              });

              // Merge with local storage fallback entries
              const localLeaves = JSON.parse(localStorage.getItem('acad_faculty_leaves') || '[]');
              const myLocalLeaves = localLeaves.filter(l =>
                (facultyUid && (l.facultyId === facultyUid || l.id === facultyUid)) ||
                (facultyEmail && l.email === facultyEmail)
              );

              const mergedMap = new Map();
              [...fsLeaves, ...myLocalLeaves].forEach(item => {
                const key = item.id || item.leaveId;
                if (key && !mergedMap.has(key)) {
                  mergedMap.set(key, item);
                }
              });

              const mergedList = Array.from(mergedMap.values());

              // 3. Timestamp Sorting (newest first)
              mergedList.sort((a, b) => {
                const dateA = new Date(a.submittedAt || a.startDate || a.fromDate || 0);
                const dateB = new Date(b.submittedAt || b.startDate || b.fromDate || 0);
                return dateB - dateA;
              });

              setLeaves(mergedList);
              setLoading(false);
            }, (error) => {
              console.error("[Firestore onSnapshot Error in FacultyLeaves]:", error);
              fallbackLocalLeaves();
            });

            return;
          } catch (fsErr) {
            console.error("[Firestore Query Setup Error in FacultyLeaves]:", fsErr);
          }
        }

        fallbackLocalLeaves();
      } catch (err) {
        console.error("[Error in setupLeavesListener]:", err);
        setLoading(false);
      }
    };

    const fallbackLocalLeaves = async () => {
      try {
        const data = await mockDB.getFacultyLeavesForHOD(facultyDept || 'All');
        const myLeaves = data.filter(l =>
          (facultyUid && (l.facultyId === facultyUid || l.id === facultyUid)) ||
          (facultyEmail && l.email === facultyEmail)
        );

        myLeaves.sort((a, b) => {
          const dateA = new Date(a.submittedAt || a.startDate || a.fromDate || 0);
          const dateB = new Date(b.submittedAt || b.startDate || b.fromDate || 0);
          return dateB - dateA;
        });

        setLeaves(myLeaves);
      } catch (e) {
        console.error("[Error in fallbackLocalLeaves]:", e);
      } finally {
        setLoading(false);
      }
    };

    setupLeavesListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [faculty, facultyDept]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) return;

    try {
      setApplying(true);
      const days = Math.max(1, Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1);
      const newLeave = await mockDB.applyFacultyLeave({
        leaveType,
        startDate: fromDate,
        endDate: toDate,
        totalDays: isNaN(days) ? 1 : days,
        reason
      }, faculty);

      if (newLeave) {
        setLeaves(prev => {
          const exists = prev.some(l => l.id === newLeave.id || l.leaveId === newLeave.leaveId);
          if (exists) return prev;
          const updated = [newLeave, ...prev];
          updated.sort((a, b) => {
            const dateA = new Date(a.submittedAt || a.startDate || a.fromDate || 0);
            const dateB = new Date(b.submittedAt || b.startDate || b.fromDate || 0);
            return dateB - dateA;
          });
          return updated;
        });
      }

      showToast('Faculty leave application submitted to HOD successfully.', 'success');
      setReason('');
      setFromDate('');
      setToDate('');
    } catch (err) {
      console.error("[Error Submitting Faculty Leave]:", err);
      showToast('Could not submit leave application.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-white">
      
      {/* Apply Leave Form */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-xl border border-white/10 shadow-lg space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Apply for Faculty Leave (Requires HOD Approval)</h3>

        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Leave Type</label>
              <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer">
                <option value="Casual Leave" className="bg-slate-900 text-white">Casual Leave</option>
                <option value="Sick Leave" className="bg-slate-900 text-white">Sick Leave</option>
                <option value="Earned Leave" className="bg-slate-900 text-white">Earned Leave</option>
                <option value="Duty Leave" className="bg-slate-900 text-white">Duty Leave (Conference / Workshop)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">From Date</label>
              <input type="date" required value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer" />
            </div>

            <div>
              <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">To Date</label>
              <input type="date" required value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-300 uppercase font-bold block mb-1">Reason for Leave</label>
            <textarea
              rows={2}
              required
              placeholder="State clear purpose for leave application..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl font-medium focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={applying}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <Calendar size={15} /> {applying ? 'Submitting...' : 'Submit Leave Application'}
          </button>
        </form>
      </div>

      {/* Leave History Ledger */}
      <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-4">
        <h3 className="text-sm font-black text-white border-b border-white/10 pb-3">Faculty Leave Application History</h3>

        {loading ? (
          <div className="py-12 text-center animate-pulse text-gray-400">Loading leave history...</div>
        ) : leaves.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No leave applications filed yet.</div>
        ) : (
          <div className="w-full max-w-full overflow-hidden border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md shadow-lg">
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 font-bold uppercase tracking-wider border-b border-white/10 text-[10px]">
                  <th className="w-[20%] px-3 py-3">Leave Type</th>
                  <th className="w-[22%] px-3 py-3 text-center whitespace-nowrap">From - To Date</th>
                  <th className="w-[26%] px-3 py-3">Reason</th>
                  <th className="w-[14%] px-3 py-3 text-center whitespace-nowrap">Status</th>
                  <th className="w-[18%] px-3 py-3 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-gray-200">
                {leaves.map(l => (
                  <tr key={l.id || l.leaveId || Math.random()} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 py-3 font-bold text-white break-words align-middle">{l.leaveType}</td>
                    <td className="px-3 py-3 text-center text-gray-300 font-mono text-xs whitespace-nowrap align-middle">
                      {l.startDate || l.fromDate || 'N/A'} to {l.endDate || l.toDate || 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-gray-300 font-normal text-xs break-words align-middle">{l.reason}</td>
                    <td className="px-3 py-3 text-center whitespace-nowrap align-middle">
                      <span className={`px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase inline-block ${
                        l.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                        l.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-[11px] text-gray-400 font-normal italic break-words align-middle">
                      {l.status === 'Approved' ? `Approved by: ${l.approvedBy || 'HOD'}` :
                       l.status === 'Rejected' ? `Reason: ${l.rejectionReason || 'Exceeds quota'}` : 'Pending Review'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

// 11. FACULTY REPORTS
const FacultyReports = ({ faculty }) => {
  const facultyDept = getFacultyDept(faculty);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-6 text-xs font-semibold text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div>
          <h3 className="text-base font-black text-white">Academic Performance & Class Attendance Reports</h3>
          <p className="text-xs text-gray-400">Department: {facultyDept} • Subject audit reports & score sheets</p>
        </div>
        <button onClick={handlePrint} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow flex items-center gap-2 transition-all cursor-pointer">
          <Printer size={15} /> Print / Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-all">
          <FileText className="text-cyan-400" size={24} />
          <h4 className="font-bold text-white text-xs">Subject Attendance Summary Report</h4>
          <p className="text-[10.5px] text-gray-400">Includes student-wise attendance percentage for {facultyDept}.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-all">
          <FileSpreadsheet className="text-purple-400" size={24} />
          <h4 className="font-bold text-white text-xs">Internal Marks Audit Statement</h4>
          <p className="text-[10.5px] text-gray-400">Detailed breakdown of Mid 1, Mid 2, and assignment scores.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-all">
          <Activity className="text-emerald-400" size={24} />
          <h4 className="font-bold text-white text-xs">Academic Risk & Progress Report</h4>
          <p className="text-[10.5px] text-gray-400">Lists students falling below the mandatory 75% attendance threshold.</p>
        </div>
      </div>
    </div>
  );
};

// 12. PROFILE & PHOTO UPLOAD (READ-ONLY DEPARTMENT DISPLAY)
const FacultyProfile = ({ faculty }) => {
  const [photo, setPhoto] = useState(faculty?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [uploading, setUploading] = useState(false);
  const { showToast } = useAuth();

  const facultyDept = getFacultyDept(faculty);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      setUploading(true);
      await mockDB.updateUserProfile(faculty?.uid, { photo });
      showToast('Profile photo updated successfully across all portals.', 'success');
    } catch (_) {
      showToast('Could not update profile photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-6 text-xs font-semibold max-w-2xl text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-black text-white">Faculty Profile Information</h3>
          <p className="text-xs text-gray-400 mt-0.5">Faculty identity, assigned department, and photo avatar</p>
        </div>
        <span className="px-3.5 py-1.5 bg-blue-500/20 text-cyan-300 font-bold rounded-xl border border-blue-500/30 flex items-center gap-1.5 shadow-sm">
          <Lock size={13} className="text-cyan-300" /> {facultyDept}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <img src={photo} alt="" className="w-24 h-24 rounded-3xl object-cover border-2 border-blue-500/60 shadow-lg" />
        <div className="space-y-2">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handlePhotoSelect}
            className="text-xs text-gray-300"
          />
          <p className="text-[10px] text-gray-400">Max size: 5MB (JPG, PNG, WEBP). Unified avatar across Faculty & Counsellor consoles.</p>
          <button
            onClick={handleSaveProfile}
            disabled={uploading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-all cursor-pointer"
          >
            {uploading ? 'Saving...' : 'Upload Profile Photo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4 text-gray-200">
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-gray-400 block text-[9.5px] uppercase font-bold">Faculty Name</span>
          <span className="font-bold text-sm text-white">{faculty?.fullName || faculty?.name || 'Prof. Charles Xavier'}</span>
        </div>

        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-gray-400 block text-[9.5px] uppercase font-bold">Email Contact</span>
          <span className="font-bold text-xs text-gray-200">{faculty?.email || 'faculty.cse@kbn.edu'}</span>
        </div>

        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-gray-400 block text-[9.5px] uppercase font-bold">Designation</span>
          <span className="font-bold text-xs text-cyan-300">{faculty?.designation || 'Senior Professor'}</span>
        </div>

        <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/30">
          <span className="text-gray-400 block text-[9.5px] uppercase font-bold flex items-center justify-between">
            <span>Department (Locked)</span>
            <Lock size={12} className="text-cyan-300" />
          </span>
          <span className="font-bold text-xs text-cyan-300">{facultyDept}</span>
        </div>
      </div>
    </div>
  );
};

// 13. WARD COUNSELLING FALLBACK FOR COUNSELLOR FACULTY
const FacultyWardCounselling = ({ faculty }) => {
  const facultyDept = getFacultyDept(faculty);

  return (
    <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-4 text-xs font-semibold text-white">
      <h3 className="text-base font-black text-white border-b border-white/10 pb-4">Assigned Branch Ward Counselling Console ({facultyDept})</h3>
      <p className="text-gray-300">Accessing Ward Counsellor Console for assigned branch wards.</p>
      <a href="/counsellor/dashboard" className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow transition-all">
        Open Ward Counsellor Console
      </a>
    </div>
  );
};

export default FacultyPortal;
