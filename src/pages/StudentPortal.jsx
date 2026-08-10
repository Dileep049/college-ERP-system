import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import confetti from 'canvas-confetti';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  Award, 
  Calendar, 
  BookOpen, 
  Briefcase, 
  Clock, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  TrendingUp, 
  User,
  CreditCard,
  Library,
  UserCheck,
  Check,
  Activity,
  AlertCircle,
  CheckSquare,
  ArrowRight,
  Ticket,
  Home,
  MessageSquare,
  ClipboardList,
  FileCheck,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

// Main Student Portal Router Switch
export const StudentPortal = ({ subPage }) => {
  const { user } = useAuth();
  const [studentUser, setStudentUser] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  useEffect(() => {
    const resolveStudent = async () => {
      try {
        setLoadingStudent(true);
        if (user?.role === 'parent') {
          const allUsers = await mockDB.getAllUsers();
          const child = allUsers.find(u => u.role === 'student' && u.rollNumber === user.rollNumber);
          if (child) {
            setStudentUser(child);
          } else {
            const firstStudent = allUsers.find(u => u.role === 'student');
            setStudentUser(firstStudent);
          }
        } else {
          setStudentUser(user);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStudent(false);
      }
    };
    resolveStudent();
  }, [user]);

  if (loadingStudent || !studentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-955">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-505 border-t-transparent"></div>
        <p className="mt-4 text-slate-500 font-medium">Resolving student profile...</p>
      </div>
    );
  }

  const isParent = user?.role === 'parent';
  
  if (subPage === 'dashboard') return <StudentDashboard student={studentUser} isParent={isParent} />;
  if (subPage === 'attendance') return <StudentAttendance student={studentUser} isParent={isParent} />;
  if (subPage === 'leaves') return <StudentLeaves student={studentUser} isParent={isParent} />;
  if (subPage === 'notes') return <StudentNotes student={studentUser} isParent={isParent} />;
  if (subPage === 'placements') return <StudentPlacements student={studentUser} isParent={isParent} />;
  if (subPage === 'fees') return <StudentFees student={studentUser} isParent={isParent} />;
  if (subPage === 'library') return <StudentLibrary student={studentUser} isParent={isParent} />;
  if (subPage === 'counselling') return <StudentCounselling student={studentUser} isParent={isParent} />;
  if (subPage === 'marks') return <StudentMarks student={studentUser} isParent={isParent} />;
  if (subPage === 'results') return <StudentResults student={studentUser} isParent={isParent} />;
  if (subPage === 'assignments') return <StudentAssignments student={studentUser} isParent={isParent} />;
  if (subPage === 'document-requests') return <StudentDocumentRequests student={studentUser} isParent={isParent} />;
  if (subPage === 'support-desk') return <StudentSupportDesk student={studentUser} isParent={isParent} />;
  return <StudentDashboard student={studentUser} isParent={isParent} />;
};

// Skeleton Loader
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    </div>
  </div>
);

// 1. STUDENT DASHBOARD
const StudentDashboard = ({ student, isParent }) => {
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [notes, setNotes] = useState([]);
  const [drives, setDrives] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
        const profile = studentsList.find(s => s.uid === student.uid || s.studentId === student.uid) || {
          attendancePercentage: 78,
          totalClasses: 120,
          attendedClasses: 94,
          cgpa: 8.8
        };
        setStudentProfile(profile);

        const leavesData = await mockDB.getLeaves('student', student.uid);
        const notesData = await mockDB.getNotes(student.department, student.semester);
        const drivesData = await mockDB.getPlacementDrives();
        const announcementsData = await mockDB.getAnnouncements();
        const regStatus = await mockDB.getStudentRegistrationStatus(student.uid);

        setLeaves(leavesData.slice(0, 3));
        setNotes(notesData.slice(0, 3));
        setDrives(drivesData.slice(0, 3));
        setAnnouncements(announcementsData.slice(0, 3));
        setRegisteredCourses(regStatus);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [student]);

  if (loading) return <DashboardSkeleton />;

  // Mocked SGPA/CGPA history across semesters
  const academicProgressData = [
    { name: 'Sem 1', SGPA: 8.40, CGPA: 8.40 },
    { name: 'Sem 2', SGPA: 8.65, CGPA: 8.52 },
    { name: 'Sem 3', SGPA: 8.80, CGPA: 8.62 },
    { name: 'Sem 4', SGPA: 8.92, CGPA: 8.70 },
    { name: 'Sem 5', SGPA: 9.05, CGPA: 8.78 },
    { name: 'Sem 6', SGPA: studentProfile?.cgpa || 8.8, CGPA: studentProfile?.cgpa || 8.8 }
  ];

  // Choice Based Credit System (CBCS) calculation
  const registeredCredits = registeredCourses ? registeredCourses.courses.reduce((sum, c) => sum + c.credits, 0) : 0;
  const totalCompletedCredits = 112 + (registeredCourses?.status === 'approved' ? registeredCredits : 0);
  const totalDegreeCredits = 160;
  const creditPercentage = Math.round((totalCompletedCredits / totalDegreeCredits) * 100);

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Welcome Hero & Institutional Info */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-650 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="z-10">
          <span className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-wider block w-fit mb-3">University Student Profile</span>
          <h2 className="text-2xl font-black font-display tracking-tight">Welcome back, {student.fullName}!</h2>
          <p className="text-sm text-blue-100 font-medium mt-1">
            Department of {student.department} • {student.semester} (Section {studentProfile?.section || 'A'})
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-blue-200">
            <span>Roll Number: <strong className="text-white font-black">{student.rollNumber}</strong></span>
            <span>Hall Ticket: <strong className="text-white font-black">{studentProfile?.hallTicketNumber || 'HT-2023-999'}</strong></span>
            <span>Counsellor: <strong className="text-white font-black">{student.counsellorName || 'Dr. Bruce Banner'}</strong></span>
          </div>
        </div>
        
        {/* Floating GPA Card */}
        <div className="z-10 shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-lg">
          <div className="text-right">
            <span className="text-[9px] font-black text-blue-200 uppercase tracking-wider block">Cumulative CGPA</span>
            <span className="text-3xl font-black text-white">{studentProfile?.cgpa || '8.8'}</span>
            <span className="text-[9px] text-emerald-300 font-bold block mt-0.5">● Grade A+ Excellent</span>
          </div>
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-white border border-white/10">
            <Award size={24} className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GPA Progression Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Performance Analytics</span>
                <h3 className="text-sm font-black text-slate-805 dark:text-white mt-0.5">Academic SGPA / CGPA Progression</h3>
              </div>
              <span className="text-[9px] px-2 py-0.5 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-md font-bold">CBCS Scale</span>
            </div>
            
            <div className="h-64 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={academicProgressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSGPA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCGPA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.9)', color: '#0f172a' }} />
                  <Area type="monotone" dataKey="SGPA" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSGPA)" name="Semester SGPA" />
                  <Area type="monotone" dataKey="CGPA" stroke="#4f46e5" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorCGPA)" name="Cumulative CGPA" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Credit Tracker & Radial Progress */}
        <div className="space-y-6">
          
          {/* Degree Credit Tracker Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Graduation Credit Tracker</span>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{totalCompletedCredits}</span>
                <span className="text-slate-400 font-bold text-[11px]"> / {totalDegreeCredits} Credits</span>
              </div>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-xl">{creditPercentage}% Complete</span>
            </div>
            
            <div className="mt-5 w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-650 transition-all duration-500"
                style={{ width: `${creditPercentage}%` }}
              ></div>
            </div>
            <p className="mt-3 text-[9.5px] text-slate-455 dark:text-slate-400 leading-relaxed font-bold">
              {registeredCourses ? (
                registeredCourses.status === 'approved' ? (
                  <span className="text-emerald-500">✔ Choice Elective registered credits included in degree total.</span>
                ) : (
                  <span className="text-amber-500">● {registeredCredits} registered elective credits are pending academic dean review.</span>
                )
              ) : (
                <span className="text-rose-500">⚠ Upcoming semester Choice Elective registration not filed. Settle now!</span>
              )}
            </p>
          </div>

          {/* Radial Attendance Widget */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 text-slate-100 dark:text-slate-800/10 pointer-events-none transform translate-y-4 translate-x-2">
              <Activity size={120} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Attendance Matrix</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{studentProfile?.attendancePercentage || 78}%</span>
                <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold">
                  ({studentProfile?.attendedClasses || 94}/{studentProfile?.totalClasses || 120} sessions)
                </span>
              </div>
              <div className="mt-4 w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    (studentProfile?.attendancePercentage || 78) >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                  }`}
                  style={{ width: `${studentProfile?.attendancePercentage || 78}%` }}
                ></div>
              </div>
              <p className="mt-3 text-[10px] text-slate-450 dark:text-slate-400 font-bold flex items-center gap-1.5">
                {(studentProfile?.attendancePercentage || 78) >= 75 ? (
                  <span className="text-emerald-500 font-extrabold">● Academic Attendance Clear (Passed Threshold)</span>
                ) : (
                  <span className="text-rose-500 font-extrabold">● Shortage Warning: Settle attendance before hall ticket release</span>
                )}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Quick University Portals Cards */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-5">Quick Access Portal Links</span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <a href="/student/leaves" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 text-center hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all group flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar size={18} />
            </div>
            <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">Apply Leave</span>
            <span className="text-[9px] text-slate-400 mt-1 block">Leave Request</span>
          </a>
          <a href="/student/marks" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 text-center hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-all group flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText size={18} />
            </div>
            <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">Internal Marks</span>
            <span className="text-[9px] text-slate-400 mt-1 block">Mid Examinations</span>
          </a>
          <a href="/student/results" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 text-center hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition-all group flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Award size={18} />
            </div>
            <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">Semester Results</span>
            <span className="text-[9px] text-slate-400 mt-1 block">Grades & GPA</span>
          </a>
          <a href="/student/document-requests" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 text-center hover:bg-purple-50/50 dark:hover:bg-slate-800 transition-all group flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileCheck size={18} />
            </div>
            <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">Document Desk</span>
            <span className="text-[9px] text-slate-400 mt-1 block">Bonafide/Transcript</span>
          </a>
          <a href="/student/support-desk" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 text-center hover:bg-rose-50/50 dark:hover:bg-slate-800 transition-all group flex flex-col items-center col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare size={18} />
            </div>
            <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">Helpdesk Ticket</span>
            <span className="text-[9px] text-slate-400 mt-1 block">Support & Grievances</span>
          </a>
        </div>
      </div>

      {/* Grid for Leaves, Jobs, Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Absence ledger */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-3 mb-3">Absence ledger</span>
            <div className="space-y-3">
              {leaves.length === 0 ? (
                <div className="text-center py-6 text-slate-400 dark:text-slate-550 text-xs font-semibold">No leaves reported.</div>
              ) : (
                leaves.map(l => (
                  <div key={l.leaveId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate">{l.reason}</p>
                      <span className="text-[9px] text-slate-450 mt-0.5">{l.startDate} to {l.endDate}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                      l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      l.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          {!isParent && (
            <a href="/student/leaves" className="mt-4 flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold hover:underline">
              <span>Apply for leave absence</span>
              <ArrowRight size={14} />
            </a>
          )}
        </div>

        {/* Placement Updates */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-3 mb-3">Placement Updates</span>
            <div className="space-y-3">
              {drives.filter(d => d.status === 'upcoming').length === 0 ? (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-semibold">No scheduled job drives.</div>
              ) : (
                drives.filter(d => d.status === 'upcoming').map((d, idx) => (
                  <div key={d.driveId || d.id || idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <div>
                      <p className="text-xs font-black text-slate-850 dark:text-slate-250 truncate max-w-[120px]">{d.companyName}</p>
                      <span className="text-[9px] text-slate-450 font-bold mt-0.5 block truncate max-w-[120px]">{d.role}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">{d.salaryPackage || d.package}</span>
                      <span className="text-[8.5px] text-slate-450 font-bold mt-0.5 block">{d.driveDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <a href="/student/placements" className="mt-4 flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold hover:underline">
            <span>Register for placements drives</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Notices notice board */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-3 mb-3">Notice Board Announcements</span>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="text-center py-6 text-slate-455">No notices posted.</div>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs truncate">{ann.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed line-clamp-2 mt-1">{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <a href="/student/calendar" className="mt-4 flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold hover:underline">
            <span>View academic calendar events</span>
            <ArrowRight size={14} />
          </a>
        </div>

      </div>

    </div>
  );
};

// 2. STUDENT LEAVES APPLICATION
const StudentLeaves = ({ student, isParent }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAuth();

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getLeaves('student', student.uid);
      setLeaves(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !startDate || !endDate) return;

    try {
      setSubmitting(true);
      await mockDB.applyLeave(
        student.uid,
        student.fullName,
        student.rollNumber,
        student.department,
        student.semester,
        student.counsellorId || 'coun-cse',
        reason,
        startDate,
        endDate
      );
      showToast('Leave request submitted to Ward Counsellor!', 'success');
      setReason('');
      setStartDate('');
      setEndDate('');
      loadLeaves();
    } catch (_) {
      showToast('Could not file leaves form.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
      
      {/* Apply Form */}
      {!isParent ? (
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
        <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Apply Leave Absence</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Reason of Absence</label>
            <textarea
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed explanation..."
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
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-755 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <span>{submitting ? 'Filing form...' : 'Submit Application'}</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
      ) : (
        <div className="lg:col-span-2 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 self-start">
          <h3 className="text-sm font-extrabold uppercase mb-2">Read-Only Access</h3>
          <p className="font-bold leading-relaxed">As a Parent, you have read-only access to view the child's leave history and statuses. New leave filing is disabled.</p>
        </div>
      )}

      {/* History */}
      <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/65 dark:border-slate-800 shadow-xl">
        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Leaves Ledger History</span>
        
        {loading ? (
          <div className="py-20 text-center animate-pulse">Loading list...</div>
        ) : leaves.length === 0 ? (
          <div className="py-20 text-center text-slate-455">No absence applications filed.</div>
        ) : (
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {leaves.map(l => (
              <div key={l.leaveId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs truncate max-w-xs">{l.reason}</h4>
                  <span className="text-[10px] text-slate-400 mt-1 block">Period: {l.startDate} to {l.endDate}</span>
                  <div className="text-[10px] text-slate-400 mt-2 font-semibold">
                    {l.remarks ? (
                      <p className="text-slate-650 dark:text-slate-350">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">Counsellor Remarks:</span> {l.remarks}
                      </p>
                    ) : (
                      <p className="italic text-slate-400">No remarks from Counsellor yet.</p>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                  l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                  l.status === 'rejected' ? 'bg-rose-500/10 text-rose-505' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// 2.5 STUDENT ATTENDANCE HISTORY & ANALYTICS SUBPAGE
const StudentAttendance = ({ student }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = mockDB.subscribeStudentAttendance(student.uid, student.rollNumber, (data) => {
      setAttendance(data || []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [student]);

  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.status === 'present').length;
  const leaveClasses = attendance.filter(a => a.status === 'leave' || a.status === 'leave_approved').length;
  const absentClasses = attendance.filter(a => a.status === 'absent').length;

  const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Attendance Percentage</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{attendancePct}%</span>
            <span className={`text-[10px] font-bold ${attendancePct >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {attendancePct >= 75 ? 'Clear Threshold' : 'Shortage Warning'}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2 block">{totalClasses}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Sessions Attended</span>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 block">{presentClasses}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Absences & Leaves</span>
          <span className="text-3xl font-black text-rose-500 mt-2 block">{absentClasses} <span className="text-slate-400 text-xs font-normal">({leaveClasses} Leaves)</span></span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <span>My Lecture-Wise Attendance Log</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 font-extrabold border border-emerald-500/20">Firestore Live</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time period-wise attendance records (Periods 1 - 6)</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Syncing attendance records from Firestore...</div>
        ) : attendance.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold">No attendance records logged for your account yet.</div>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 text-[10px]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Faculty Name</th>
                  <th className="px-4 py-3 text-center">P1</th>
                  <th className="px-4 py-3 text-center">P2</th>
                  <th className="px-4 py-3 text-center">P3</th>
                  <th className="px-4 py-3 text-center">P4</th>
                  <th className="px-4 py-3 text-center">P5</th>
                  <th className="px-4 py-3 text-center">Active Period Status</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs">
                {/* Group attendance records by date & subject */}
                {Object.values(attendance.reduce((acc, curr) => {
                  const groupKey = `${curr.date}_${curr.subject}`;
                  if (!acc[groupKey]) {
                    acc[groupKey] = {
                      date: curr.date,
                      subject: curr.subject,
                      facultyName: curr.facultyName,
                      periods: {},
                      remarks: curr.remarks,
                      latestStatus: curr.status
                    };
                  }
                  const pNum = Number(curr.period || curr.lecturePeriod || 1);
                  acc[groupKey].periods[pNum] = curr.status;
                  if (curr.remarks) acc[groupKey].remarks = curr.remarks;
                  return acc;
                }, {})).map((group, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{group.date}</td>
                    <td className="px-4 py-3.5">{group.subject}</td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{group.facultyName || 'Subject Faculty'}</td>
                    
                    {[1, 2, 3, 4, 5].map(pNum => {
                      const st = group.periods[pNum];
                      return (
                        <td key={pNum} className="px-2 py-3.5 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-[9.5px] font-black uppercase ${
                            st === 'present' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                            st === 'absent' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                            st === 'leave' || st === 'leave_approved' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                            'bg-slate-100 dark:bg-slate-800/60 text-slate-400'
                          }`}>
                            {st ? st.slice(0, 1).toUpperCase() : '—'}
                          </span>
                        </td>
                      );
                    })}

                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        group.latestStatus === 'present' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        group.latestStatus === 'absent' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {group.latestStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-normal italic">{group.remarks || '—'}</td>
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

// 3. STUDY NOTES DOWNLOAD SECTION
const StudentNotes = ({ student }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getNotes(student.department, student.semester);
        setNotes(data);
      } catch (_) {}
      finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [student]);

  const handleDownloadSim = (filename) => {
    showToast(`Downloading file: ${filename} (simulated)`, 'success');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-805 pb-4 mb-4">Branch Study Materials</span>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse">Loading study files...</div>
      ) : notes.length === 0 ? (
        <div className="py-20 text-center text-slate-455">No notes files uploaded by branch faculty.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(n => (
            <div key={n.noteId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{n.topic}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{n.subject} • Taught by: {n.facultyName}</p>
                <p className="text-[9.5px] text-slate-450 mt-0.5">{n.description}</p>
              </div>
              <button
                onClick={() => handleDownloadSim(n.fileName)}
                className="p-2.5 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100/50 text-blue-600 dark:text-blue-400 rounded-xl"
                title="Download lecture slides"
              >
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. STUDENT INTERNAL MARKS SUBPAGE
const StudentMarks = ({ student }) => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Real-time listener for published internal marks for this student
    const unsubscribe = mockDB.subscribeStudentMarks(student.uid, student.rollNumber, (data) => {
      setMarks(data || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [student]);

  const marksList = Array.isArray(marks) ? marks : [];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <span>My Internal Marks Sheet</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 font-extrabold border border-emerald-500/20">Live Firestore Sync</span>
          </h3>
          <p className="text-xs text-slate-455 dark:text-slate-400 mt-1">Official published midterm assessments and total internal marks</p>
        </div>
      </div>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-455">Syncing published grades from Firestore...</div>
      ) : marksList.length === 0 ? (
        <div className="py-20 text-center text-slate-455">No published internal marks logged for your profile yet.</div>
      ) : (
        <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
                <th className="px-5 py-3">Subject Name</th>
                <th className="px-5 py-3">Faculty Name</th>
                <th className="px-5 py-3 text-center">Mid-Term 1 (30)</th>
                <th className="px-5 py-3 text-center">Mid-Term 2 (30)</th>
                <th className="px-5 py-3 text-center">Assignments (10)</th>
                <th className="px-5 py-3 text-center">Total Score</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Published Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-105 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-bold">
              {marksList.map((m, idx) => (
                <tr key={m.markId || m.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-4">{m.subject}</td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{m.facultyName || 'Faculty Member'}</td>
                  <td className="px-5 py-4 text-center">{m.mid1}</td>
                  <td className="px-5 py-4 text-center">{m.mid2}</td>
                  <td className="px-5 py-4 text-center">{m.assignments}</td>
                  <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400 font-extrabold">{m.total}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {m.status || 'Published'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-slate-400 text-[11px]">
                    {m.publishedAt ? new Date(m.publishedAt).toLocaleDateString() : (m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : 'Recent')}
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

// 5. STUDENT SEMESTER RESULTS
const StudentResults = () => {
  // Mocking past semester results logs
  const results = [
    { sem: 'Semester 1', gpa: '8.40', status: 'Passed', credits: 22 },
    { sem: 'Semester 2', gpa: '8.65', status: 'Passed', credits: 22 },
    { sem: 'Semester 3', gpa: '8.80', status: 'Passed', credits: 24 },
    { sem: 'Semester 4', gpa: '8.92', status: 'Passed', credits: 24 },
    { sem: 'Semester 5', gpa: '9.05', status: 'Passed', credits: 20 }
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">Past Semesters Transcript</span>
      
      <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
              <th className="px-5 py-3">Academic Term</th>
              <th className="px-5 py-3 text-center">Completed Credits</th>
              <th className="px-5 py-3 text-center">Result Status</th>
              <th className="px-5 py-3 text-center">SGPA Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-bold">
            {results.map(r => (
              <tr key={r.sem} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                <td className="px-5 py-4">{r.sem}</td>
                <td className="px-5 py-4 text-center">{r.credits}</td>
                <td className="px-5 py-4 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-black rounded">{r.status}</span>
                </td>
                <td className="px-5 py-4 text-center text-blue-600 dark:text-blue-400 font-extrabold">{r.gpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 6. STUDENT ASSIGNMENTS SUBPAGE
const StudentAssignments = ({ student, isParent }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useAuth();

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getAssignments(student.department, student.semester);
      setAssignments(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [student]);

  const handleSubmitAssignment = async (e, aid) => {
    e.preventDefault();
    if (files.length === 0) {
      showToast('Please select at least one file to upload.', 'warning');
      return;
    }

    try {
      setUploading(true);
      await mockDB.submitAssignment(
        aid,
        student.uid,
        student.fullName || student.full_name,
        student.rollNumber,
        files
      );
      showToast('Assignment submitted successfully!', 'success');
      setFiles([]);
      setSubmittingId(null);
      loadAssignments();
    } catch (_) {
      showToast('Could not submit answers.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-805 pb-4 mb-4">Class Assignments Ledger</span>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse">Loading homework...</div>
      ) : assignments.length === 0 ? (
        <div className="py-20 text-center text-slate-455">No pending assignments allocated for your class.</div>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => {
            const aid = a.id || a.assignmentId;
            const submission = a.submissions?.find(s => s.studentId === student.uid);
            return (
              <div key={aid} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{a.title}</h4>
                    {a.fileName && (
                      <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">
                        Download Reference
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-455 mt-1">{a.subject} • Target due date: <span className="text-rose-500 font-extrabold">{a.dueDate}</span></p>
                  <p className="text-[10.5px] text-slate-655 dark:text-slate-400 mt-1.5">{a.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {submission ? (
                    <div className="text-right">
                      <span className={`px-2 py-0.5 text-[9px] rounded font-black uppercase ${
                        submission.status === 'late' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>{submission.status === 'late' ? 'Late' : 'Submitted'}</span>
                      <span className="block text-[10px] text-slate-400 mt-1">Grade Score: <span className="text-blue-600 dark:text-blue-400 font-black">{submission.grade}</span></span>
                      {submission.feedback && <p className="text-[9.5px] text-slate-500 font-normal italic mt-0.5">Feedback: {submission.feedback}</p>}
                    </div>
                  ) : submittingId === aid ? (
                    <form onSubmit={(e) => handleSubmitAssignment(e, aid)} className="flex items-center gap-2">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setFiles(Array.from(e.target.files))}
                        required
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded font-bold text-xs"
                      />
                      <button
                        type="submit"
                        disabled={uploading}
                        className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg"
                      >
                        {uploading ? 'Uploading...' : 'Submit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSubmittingId(null); setFiles([]); }}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => !isParent && setSubmittingId(aid)}
                      disabled={isParent}
                      className="px-4 py-2 bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 hover:bg-blue-755 text-white rounded-xl font-bold shadow"
                    >
                      {isParent ? 'View Only' : 'Upload Submission'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 7. ONLINE PAYMENT FEE UPGRADE
const StudentFees = ({ student, isParent }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState(null);
  
  // Checkout form states
  const [payMethod, setPayMethod] = useState('UPI');
  const [cardNumber, setCardNumber] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [upiAddress, setUpiAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const { showToast } = useAuth();

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getFees(student.uid);
      setFees(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [student]);

  const handlePayFee = async (e) => {
    e.preventDefault();
    if (!activeInvoice) return;

    try {
      setProcessing(true);
      await mockDB.payFee(activeInvoice.invoiceId, payMethod);
      showToast(`Payment of ₹${activeInvoice.amount.toLocaleString()} received successfully!`, 'success');
      
      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Clear checkout states
      setActiveInvoice(null);
      setCardNumber('');
      setCardCVV('');
      setUpiAddress('');
      loadFees();
    } catch (_) {
      showToast('Could not complete payment.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSim = (inv) => {
    const rawDate = inv.paidAt || inv.date || new Date().toISOString();
    const invId = inv.invoiceId || inv.id || 'N/A';
    let content = `==========================================================\n`;
    content += `KBN COLLEGE ERP - PAYMENT RECEIPT\n`;
    content += `==========================================================\n`;
    content += `Receipt Id   : REC-${String(invId).toUpperCase()}\n`;
    content += `Date         : ${new Date(rawDate).toLocaleDateString()}\n`;
    content += `Roll Number  : ${inv.rollNumber || student?.rollNumber || 'N/A'}\n`;
    content += `Student Name : ${inv.studentName || student?.fullName || 'N/A'}\n`;
    content += `Branch       : ${inv.department || student?.department || 'N/A'}\n`;
    content += `Semester     : ${inv.semester || 'N/A'}\n`;
    content += `==========================================================\n`;
    content += `Fee Category : ${inv.feeType || 'General Fee'}\n`;
    content += `Method       : ${inv.paymentMethod || 'Online'}\n`;
    content += `Amount Paid  : INR ${inv.amount ? inv.amount.toLocaleString() : 0}.00\n`;
    content += `Status       : SUCCESSFUL TRANSACTION\n`;
    content += `==========================================================\n`;
    content += `Generated by KBN Central Accounts Counter.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${(inv.feeType || 'Fee').replace(/\s+/g, '_')}_${invId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Receipt download initialized.', 'success');
  };

  const unpaid = fees.filter(f => f.status === 'unpaid');
  const paid = fees.filter(f => f.status === 'paid');

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Alert Warning */}
      {unpaid.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-bold">
            Attention: You have {unpaid.length} outstanding dues. Settle invoices before the semester exam hall tickets release.
          </p>
        </div>
      )}

      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Central Fee Payment Board</h2>
          <p className="text-sm text-blue-100 mt-1">Settle Tuition, Exam, Bus, and Hostel fees instantly</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <CreditCard size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Fee Invoices */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Outstanding */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Outstanding Invoices ({unpaid.length})</span>
            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading invoices...</div>
            ) : unpaid.length === 0 ? (
              <div className="py-8 text-center text-slate-455">No outstanding invoices. All clear!</div>
            ) : (
              <div className="space-y-3">
                {unpaid.map((inv, idx) => (
                  <div key={inv.invoiceId || inv.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{inv.feeType}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Semester: {inv.semester} • Due Date: {inv.dueDate}</p>
                      <span className="text-xs font-black text-rose-500 block mt-1">₹{inv.amount.toLocaleString()}</span>
                    </div>
                    {!isParent && (
                      <button
                        onClick={() => setActiveInvoice(inv)}
                        className="px-4 py-2 bg-blue-605 hover:bg-blue-755 text-white rounded-xl font-bold shadow"
                      >
                        Settle Invoice
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paid History */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Receipts Logs history ({paid.length})</span>
            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading history...</div>
            ) : paid.length === 0 ? (
              <div className="py-8 text-center text-slate-455">No completed transactions logged.</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {paid.map((inv, idx) => (
                  <div key={inv.invoiceId || inv.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-805 dark:text-slate-200 text-xs">{inv.feeType}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Paid on: {inv.paidAt ? String(inv.paidAt).split('T')[0] : (inv.date || 'N/A')} via {inv.paymentMethod || 'Online'}</p>
                      <span className="text-xs font-black text-emerald-500 block mt-1">₹{inv.amount ? inv.amount.toLocaleString() : 0}</span>
                    </div>
                    <button
                      onClick={() => handleDownloadSim(inv)}
                      className="p-2.5 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100/50 text-blue-600 dark:text-blue-400 rounded-xl"
                      title="Download payment receipt"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Settle Checkout Box */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-855 pb-4 mb-5">Transactions checkout</span>
          
          {isParent ? (
            <div className="py-20 text-center text-amber-500 font-bold">
              Parent View Mode: Online invoice settlement is restricted to students.
            </div>
          ) : !activeInvoice ? (
            <div className="py-20 text-center text-slate-450 dark:text-slate-500 font-bold">
              Choose an outstanding invoice to open checkout details.
            </div>
          ) : (
            <form onSubmit={handlePayFee} className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Settling Category</span>
                <p className="text-sm font-black text-slate-850 dark:text-white mt-1">{activeInvoice.feeType}</p>
                <p className="text-slate-450 text-[10px] font-semibold mt-0.5">{activeInvoice.semester}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Settle Dues</span>
                <p className="text-xl font-black text-blue-650 mt-1">₹{activeInvoice.amount.toLocaleString()}.00</p>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Payment channels</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-350">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={payMethod === 'UPI'}
                      onChange={() => setPayMethod('UPI')}
                    />
                    <span>UPI Address</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-350">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={payMethod === 'Card'}
                      onChange={() => setPayMethod('Card')}
                    />
                    <span>Credit / Debit Card</span>
                  </label>
                </div>
              </div>

              {payMethod === 'UPI' ? (
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">UPI Address (VPA)</label>
                  <input
                    type="text"
                    value={upiAddress}
                    onChange={(e) => setUpiAddress(e.target.value)}
                    placeholder="student@okaxis"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">16-Digit Card Number</label>
                    <input
                      type="text"
                      maxLength="16"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4321 0987 6543 2100"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">CVV Mask</label>
                    <input
                      type="password"
                      maxLength="3"
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value)}
                      placeholder="•••"
                      required
                      className="w-20 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white text-center font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
              >
                <span>{processing ? 'Authorizing checkout...' : `Complete Settle`}</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};

// 8. LIBRARY CATALOG BORROWS
const StudentLibrary = ({ student, isParent }) => {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const list = await mockDB.getBooks();
      setBooks(list);
      const userIssues = await mockDB.getIssuedBooks(student.uid);
      setIssues(userIssues);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, [student]);

  const handleRequestBook = async (bookId, title) => {
    try {
      await mockDB.requestBook(student.uid, student.fullName, student.rollNumber, bookId);
      showToast(`Borrow request placed for: ${title}! Approval pending at librarian office.`, 'success');
      loadLibrary();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.includes(search)
  );

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 to-indigo-650 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display">Central Library Catalogue search</h2>
          <p className="text-sm text-teal-100 mt-1">Audit borrow logs, textbook catalog search and outstanding fines</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <Library size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Catalogue search */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Book catalogue search</span>
              <button onClick={loadLibrary} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg"><RefreshCw size={12} /></button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, author name, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
              />
            </div>

            {loading ? (
              <div className="py-20 text-center animate-pulse">Loading catalogue...</div>
            ) : filteredBooks.length === 0 ? (
              <div className="py-20 text-center text-slate-455">No books match search query filters.</div>
            ) : (
              <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Book details</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">Checkout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-805 dark:text-slate-250 font-bold">
                    {filteredBooks.map(book => (
                      <tr key={book.bookId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="px-4 py-3">
                          <h4 className="font-extrabold text-slate-805 dark:text-white text-xs">{book.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{book.author} • ISBN: {book.isbn}</p>
                        </td>
                        <td className="px-4 py-3">{book.category}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => !isParent && handleRequestBook(book.bookId, book.title)}
                            disabled={book.availableCopies === 0 || isParent}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                              book.availableCopies === 0 || isParent
                                ? 'bg-slate-105 text-slate-450 border border-slate-200' 
                                : 'bg-teal-650 hover:bg-teal-700 text-white shadow'
                            }`}
                          >
                            {isParent ? 'View Only' : book.availableCopies === 0 ? 'Out of Stock' : 'Request Book'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

        {/* User borrow logs */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Your circulation ledger</span>
          
          {loading ? (
            <div className="py-10 text-center animate-pulse">Loading transaction records...</div>
          ) : issues.length === 0 ? (
            <div className="py-12 text-center text-slate-455">No borrow transaction history found.</div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {issues.map(item => (
                <div key={item.transactionId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-250 text-xs">{item.bookTitle}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Transaction ID: {item.transactionId.toUpperCase()}</p>
                    </div>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                      item.status === 'returned' ? 'bg-slate-200 text-slate-500' :
                      item.status === 'issued' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {item.status !== 'requested' && (
                    <div className="grid grid-cols-2 gap-4 text-[9.5px] font-bold text-slate-455 mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-800">
                      <div>
                        <span>Issue Date</span>
                        <span className="block text-slate-700 dark:text-slate-350 mt-0.5">{item.issueDate}</span>
                      </div>
                      <div>
                        <span>{item.status === 'returned' ? 'Returned Date' : 'Due Date'}</span>
                        <span className="block text-slate-700 dark:text-slate-350 mt-0.5">{item.status === 'returned' ? item.returnDate : item.dueDate}</span>
                      </div>
                    </div>
                  )}

                  {item.fine > 0 && (
                    <div className="mt-2.5 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-center font-extrabold">
                      Overdue Fines: ₹{item.fine} (₹10/day delay)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// 9. STUDENT COUNSELLING VIEW ASSIGNED MENTOR
const StudentCounselling = ({ student, isParent }) => {
  const [logs, setLogs] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counsellor, setCounsellor] = useState(null);

  // Slot booking states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [booking, setBooking] = useState(false);
  const { showToast } = useAuth();

  const loadCounselling = async () => {
    try {
      setLoading(true);
      const activeCounsellor = await mockDB.getStudentWardCounsellor(student);
      setCounsellor(activeCounsellor);

      const userLogs = await mockDB.getCounsellingLogs(student.uid);
      setLogs(userLogs);

      const userMeetings = await mockDB.getCounsellingMeetings('student', student.uid);
      setMeetings(userMeetings);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounselling();
  }, [student]);

  const handleBookSlot = async (e) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    try {
      setBooking(true);
      await mockDB.requestCounsellingMeeting(
        student.uid,
        student.fullName,
        counsellor?.uid || student.counsellorId || 'coun-cse',
        counsellor?.fullName || student.counsellorName || 'Dr. Bruce Banner',
        title,
        date,
        time
      );
      showToast('Counselling slot request sent to assigned mentor!', 'success');
      setTitle('');
      setDate('');
      setTime('');
      loadCounselling();
    } catch (_) {
      showToast('Could not schedule slot.', 'error');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner Assigned Counsellor or Unassigned State */}
      {!counsellor ? (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h2 className="text-base font-black">Ward Counsellor Not Assigned</h2>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold leading-relaxed">
            Your department ({student.department} — {student.section || 'Section A'}) has not assigned a Ward Counsellor yet.
            Once your Head of Department (HOD) assigns a faculty member to your section, their contact details, email, and office hours will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[9.5px] font-bold text-sky-200 uppercase tracking-wider block">My Ward Counsellor</span>
            <h2 className="text-2xl font-extrabold font-display mt-1">{counsellor.fullName}</h2>
            <p className="text-sm text-sky-100 mt-1">{counsellor.designation || 'Associate Professor'} • Department of {counsellor.department || student.department}</p>
            <div className="text-[11px] text-sky-200 mt-3 space-y-1 bg-white/10 p-3 rounded-xl border border-white/10">
              <p>Employee ID: <span className="font-extrabold text-white">{counsellor.employeeId || 'FAC-CSE-02'}</span></p>
              <p>Email: <span className="font-extrabold text-white">{counsellor.email || 'counsellor@kbn.edu'}</span></p>
              <p>Contact Number: <span className="font-extrabold text-white">{counsellor.mobile || counsellor.contactNumber || '9876543210'}</span></p>
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shrink-0 text-center self-start">
            <span className="text-[10px] text-sky-200 uppercase block font-bold">Office Hours</span>
            <span className="text-xs font-black">{counsellor.officeHours || 'Mon - Fri (2PM - 4PM)'}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Book slot Form */}
        {!isParent ? (
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Schedule meeting slot</h3>
          
          <form onSubmit={handleBookSlot} className="space-y-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Discussion Focus</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Guidance on Projects / Midterm stress"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Target Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Time (24h format)</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={booking}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow flex items-center justify-center gap-1.5"
            >
              <span>{booking ? 'Scheduling...' : 'Send Request'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
        ) : (
          <div className="lg:col-span-2 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 self-start">
            <h3 className="text-sm font-extrabold uppercase mb-2">Read-Only Access</h3>
            <p className="font-bold leading-relaxed">As a Parent, you have read-only access to view the child's counselling slots and diary logs. New appointment bookings are disabled.</p>
          </div>
        )}

        {/* Requests & logs */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Requests statuses */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Slot Requests Status</span>
            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading requests...</div>
            ) : meetings.length === 0 ? (
              <div className="py-6 text-center text-slate-455">No requested slots scheduled.</div>
            ) : (
              <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {meetings.map(meet => (
                  <div key={meet.meetingId} className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-250 text-xs">{meet.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Date: {meet.date} at {meet.time}</p>
                    </div>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                      meet.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      meet.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {meet.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Counselling session logs review */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Counselling Diaries Feed</span>
            {loading ? (
              <div className="py-10 text-center animate-pulse">Loading diaries...</div>
            ) : logs.length === 0 ? (
              <div className="py-10 text-center text-slate-455">No counselling diaries recorded.</div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {logs.map(log => (
                  <div key={log.logId} className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-2">
                      <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{log.topic}</h4>
                      <span className="text-[9.5px] text-slate-450 font-bold">{log.date}</span>
                    </div>
                    <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-semibold text-[11px]">{log.notes}</p>
                    {log.actionItems && (
                      <div className="mt-2 pt-2 border-t border-dashed border-slate-200/40 dark:border-slate-800">
                        <span className="text-[9.5px] font-black text-slate-450 uppercase block">Mentors Action goals</span>
                        <p className="text-[10.5px] text-slate-550 dark:text-slate-400 whitespace-pre-line leading-relaxed font-mono mt-1 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-150 dark:border-slate-850">{log.actionItems}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

// 10. PLACEMENTS NOTIFICATIONS & UPDATES
const StudentPlacements = ({ student, isParent }) => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState({ cgpa: 8.0 });
  const { showToast } = useAuth();

  const loadPlacements = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getPlacementDrives();
      setDrives(data);

      const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
      const profile = studentsList.find(s => s.studentId === student.uid) || { cgpa: 8.0 };
      setStudentProfile(profile);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlacements();
  }, [student]);

  const handleApply = async (driveId, company) => {
    try {
      await mockDB.applyForDrive(driveId, student.uid);
      showToast(`Successfully registered your candidacy for ${company}!`, 'success');
      loadPlacements();
    } catch (_) {
      showToast('Could not submit application.', 'error');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl text-xs font-semibold">
      <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider border-b border-slate-100 dark:border-slate-805 pb-4 mb-4">Campus Placements Drive schedule</span>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse">Loading placement events...</div>
      ) : drives.length === 0 ? (
        <div className="py-20 text-center text-slate-455">No active placement drives scheduled.</div>
      ) : (
        <div className="space-y-4">
          {drives.map((drive, idx) => {
            const applicants = Array.isArray(drive.applicants) ? drive.applicants : [];
            const selectedStudents = Array.isArray(drive.selectedStudents) ? drive.selectedStudents : [];
            const hasApplied = student?.uid ? applicants.includes(student.uid) : false;
            const isSelected = student?.uid ? selectedStudents.includes(student.uid) : false;
            const driveId = drive.driveId || drive.id || `drive-${idx}`;
            const salaryPackage = drive.salaryPackage || drive.package || 'N/A';
            return (
              <div key={driveId} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs">{drive.companyName}</h4>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                      drive.status === 'completed' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {drive.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 mt-1">{drive.role} • <span className="text-blue-600 dark:text-blue-400 font-extrabold">{salaryPackage}</span></p>
                  <p className="text-[9.5px] text-slate-455 mt-1 font-semibold">Criteria: {drive.eligibility}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {isSelected ? (
                    <span className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] border border-emerald-600 shadow">Hired / Selected</span>
                  ) : hasApplied ? (
                    <span className="px-3.5 py-1.5 bg-slate-205 dark:bg-slate-800 text-slate-500 rounded-xl font-bold uppercase text-[10px]">Registered</span>
                  ) : (
                    <button
                      onClick={() => !isParent && handleApply(driveId, drive.companyName)}
                      disabled={drive.status === 'completed' || isParent}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-755 disabled:bg-slate-200 text-white rounded-xl font-bold shadow"
                    >
                      {isParent ? 'View Only' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 11. STUDENT ACADEMIC CALENDAR (READ ONLY)
const StudentCalendar = ({ student, isParent }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly');
  const [typeFilter, setTypeFilter] = useState('all');

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
  }, [student]);

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
      
      {/* Filters bar */}
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
        <span className="text-[10px] text-slate-400 font-bold uppercase">View Mode</span>
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
            <div key={evt.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-3xl">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                  evt.type === 'holiday' ? 'bg-red-500/10 text-red-500' :
                  evt.type === 'exam' ? 'bg-amber-500/10 text-amber-500' :
                  evt.type === 'event' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                }`}>{evt.type}</span>
                <span className="text-[10px] text-slate-400 font-bold">{evt.startDate}</span>
              </div>
              
              <h4 className="font-extrabold text-sm text-slate-850 dark:text-white mt-3">{evt.title}</h4>
              <p className="text-[10.5px] text-slate-550 dark:text-slate-400 mt-1 font-normal leading-relaxed">{evt.description}</p>
              
              {evt.subType && <span className="text-[9.5px] text-indigo-500 font-bold block mt-2">Category: {evt.subType}</span>}
              {evt.semester && <p className="text-[9.5px] text-slate-400 mt-1 font-semibold">Scope: {evt.semester}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 12. STUDENT TIMETABLE VIEW (READ ONLY)
const StudentTimetable = ({ student, isParent }) => {
  const [section, setSection] = useState('A');
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { num: 1, slot: '09:00 - 10:00' },
    { num: 2, slot: '10:00 - 11:00' },
    { num: 3, slot: '11:00 - 12:00' },
    { num: 4, slot: '01:00 - 02:00' },
    { num: 5, slot: '02:00 - 03:00' }
  ];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getTimetables(student.department, student.semester);
        const sectionTimetable = data.find(t => t.section === section);
        setTimetableSlots(sectionTimetable?.timetable || []);
      } catch (_) {}
      finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [student, section]);

  const getSlot = (day, num) => {
    return timetableSlots.find(s => s.day === day && s.periodNumber === num);
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Section selector */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-md">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Department Class timetable</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{student.department} • {student.semester}</span>
        </div>

        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
        >
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden p-5">
        <span className="text-xs font-black text-slate-400 block uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">Class Weekly Timetable</span>
        
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Loading Timetable...</div>
        ) : timetableSlots.length === 0 ? (
          <div className="py-20 text-center text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No active timetables found for Section {section}. Contact HOD to build class schedules.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-100 dark:border-slate-855 text-[10px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-455 border-b border-slate-100 dark:border-slate-800/80 font-bold uppercase">
                  <th className="px-4 py-3 border border-slate-100 dark:border-slate-855">Day</th>
                  {periods.map(p => (
                    <th key={p.num} className="px-4 py-3 border border-slate-100 dark:border-slate-855 text-center">
                      Period {p.num}<br />
                      <span className="text-[8.5px] font-normal text-slate-400">{p.slot}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day} className="hover:bg-slate-50/20">
                    <td className="px-4 py-3 border border-slate-100 dark:border-slate-855 font-extrabold bg-slate-50/50 dark:bg-slate-955/20">{day}</td>
                    {periods.map(p => {
                      const slot = getSlot(day, p.num);
                      return (
                        <td key={p.num} className="p-3 border border-slate-100 dark:border-slate-855 text-center">
                          {slot ? (
                            <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-1">
                              <div className="font-extrabold text-blue-650 dark:text-blue-400">{slot.subject}</div>
                              <div className="text-slate-455 text-[9px]">{slot.facultyName}</div>
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded text-[8.5px]">{slot.classroom}</span>
                            </div>
                          ) : (
                            <span className="text-slate-350 dark:text-slate-700">-</span>
                          )}
                        </td>
                      );
                    })}
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


// 13. CHOICE BASED CREDIT SYSTEM (CBCS) COURSE ENROLLMENT
const StudentCourseRegistration = ({ student, isParent }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadRegistration = async () => {
    try {
      setLoading(true);
      const allCourses = await mockDB.getCbcsCourses(student.semester, student.department);
      setCourses(allCourses);
      const reg = await mockDB.getStudentRegistrationStatus(student.uid);
      setStatus(reg);
      if (reg) {
        setSelectedCourses(reg.courses);
      } else {
        // Pre-select core courses
        const cores = allCourses.filter(c => c.type === 'core');
        setSelectedCourses(cores);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistration();
  }, [student]);

  const handleToggleCourse = (course) => {
    if (status?.status === 'submitted' || status?.status === 'approved') return;

    if (course.type === 'core') return; // Core courses are mandatory

    const exists = selectedCourses.some(c => c.id === course.id);
    if (exists) {
      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  const minCredits = 14;
  const maxCredits = 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalCredits < minCredits || totalCredits > maxCredits) {
      showToast(`Selected credits (${totalCredits}) must be between ${minCredits} and ${maxCredits}!`, 'error');
      return;
    }

    try {
      const reg = await mockDB.registerCbcsCourses(student.uid, selectedCourses);
      setStatus(reg);
      showToast('Course enrollment registered successfully! Pending Dean Approval.', 'success');
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <div className="py-20 text-center animate-pulse text-slate-400">Loading Electives Catalog...</div>;

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-display">Choice Based Credit System (CBCS)</h2>
          <p className="text-sm text-blue-150 mt-1">Select Core and Professional/Open Elective courses for the upcoming semester</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <ClipboardList size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Core & Electives Lists */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Core Courses (Mandatory)</span>
            <div className="space-y-3">
              {courses.filter(c => c.type === 'core').map(c => (
                <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">{c.code}</span>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-xs mt-0.5">{c.title}</h4>
                    <p className="text-[9.5px] text-slate-455 mt-1">{c.faculty} • Time: {c.slot}</p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black">{c.credits} Credits</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Elective Choices (Professional & Open)</span>
            <div className="space-y-3">
              {courses.filter(c => c.type !== 'core').map(c => {
                const isSelected = selectedCourses.some(sc => sc.id === c.id);
                const disabled = status?.status === 'submitted' || status?.status === 'approved';
                return (
                  <div key={c.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500/60 shadow-md' 
                      : 'bg-slate-50 dark:bg-slate-800/20 border-slate-150 dark:border-slate-800/80 hover:border-slate-300'
                  }`} onClick={() => handleToggleCourse(c)}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                          c.type === 'elective_prof' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-purple-500/10 text-purple-500'
                        }`}>
                          {c.type === 'elective_prof' ? 'Professional' : 'Open'} Elective
                        </span>
                        <span className="text-[10px] font-black text-slate-455 uppercase">{c.code}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-850 dark:text-white text-xs mt-1">{c.title}</h4>
                      <p className="text-[9.5px] text-slate-455 mt-1">{c.faculty} • Time: {c.slot}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400">{c.credits} Credits</span>
                      {!disabled && (
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check size={12} />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Credit Tracker & Submit Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-855 pb-4 mb-4">Enrollment Tracker</span>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black">Registration Status</span>
                {status ? (
                  <div className="mt-2 p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-center font-black uppercase text-[10.5px]">
                    ✔ {status.status} (Submitted {status.registeredAt ? String(status.registeredAt).split('T')[0] : 'N/A'})
                  </div>
                ) : (
                  <div className="mt-2 p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-center font-black uppercase text-[10.5px]">
                    ● Draft / Not Submitted
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black">Total Choice Credits Selected</span>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{totalCredits}</span>
                  <span className="text-slate-400 font-bold text-xs">/ {maxCredits} max credits</span>
                </div>
                <div className="mt-3 w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalCredits >= minCredits && totalCredits <= maxCredits ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                    }`}
                    style={{ width: `${(totalCredits / maxCredits) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-slate-450 font-bold block mt-2">Required Credit Range: {minCredits} - {maxCredits} credits.</span>
              </div>

              {selectedCourses.length > 0 && (
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-4">
                  <span className="text-[10px] text-slate-400 uppercase font-black block mb-2">Selection Summary</span>
                  <ul className="space-y-1.5 text-[10.5px] font-bold text-slate-700 dark:text-slate-350">
                    {selectedCourses.map(sc => (
                      <li key={sc.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                        <span className="truncate max-w-[160px]">{sc.title}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-black">{sc.credits} cr</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(!status || status.status === 'submitted') && !isParent && (
                <button
                  onClick={handleSubmit}
                  disabled={totalCredits < minCredits || totalCredits > maxCredits || status?.status === 'submitted'}
                  className="w-full py-3 bg-blue-650 hover:bg-blue-755 disabled:bg-slate-105 disabled:text-slate-450 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Submit Final Course Registrations</span>
                  <ArrowRight size={14} />
                </button>
              )}
              {isParent && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-center font-bold">
                  Read-Only Parent Mode: Course choices selection is locked.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

// 14. DIGITAL EXAM HALL TICKET / ADMIT CARD
const StudentHallTicket = ({ student }) => {
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadClearance = async () => {
    try {
      setLoading(true);
      const studentFees = await mockDB.getFees(student.uid);
      setFees(studentFees);
      
      const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
      const profile = studentsList.find(s => s.uid === student.uid || s.studentId === student.uid) || {
        attendancePercentage: 78
      };
      setAttendance(profile.attendancePercentage);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClearance();
  }, [student]);

  const unpaidInvoices = fees.filter(f => f.status === 'unpaid');
  const isFeesCleared = unpaidInvoices.length === 0;
  const isAttendanceCleared = (attendance || 0) >= 75;
  const isCleared = isFeesCleared && isAttendanceCleared;

  const handlePrint = () => {
    showToast('Initializing secure PDF printer module...', 'success');
    window.print();
  };

  if (loading) return <div className="py-20 text-center animate-pulse text-slate-400">Verifying academic clearance logs...</div>;

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-650 to-blue-700 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-display">University Admit Card Dispatch Desk</h2>
          <p className="text-sm text-indigo-150 mt-1">Download and print your digital Hall Ticket for upcoming Semester Examinations</p>
        </div>
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
          <Ticket size={24} />
        </div>
      </div>

      {!isCleared ? (
        /* Shortage Lock Screen */
        <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20 animate-bounce">
            <XCircle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-855 dark:text-white">Admit Card Restricted</h3>
            <p className="text-slate-455 mt-1 font-medium leading-relaxed">Your profile has not completed all departmental clearance requirements. Settle deficits below.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4 text-left">
            <div className={`p-4 rounded-2xl border ${isFeesCleared ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
              <div className="flex items-center gap-2">
                {isFeesCleared ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span className="font-extrabold uppercase tracking-wider text-[10px]">Fee Clearance</span>
              </div>
              <p className="text-[10.5px] mt-2 font-medium">
                {isFeesCleared ? '✔ Central Account ledger cleared.' : `● Owe ${unpaidInvoices.length} unpaid fee invoices.`}
              </p>
              {!isFeesCleared && (
                <a href="/student/fees" className="mt-2 text-[10px] font-black underline block">Pay Dues →</a>
              )}
            </div>

            <div className={`p-4 rounded-2xl border ${isAttendanceCleared ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
              <div className="flex items-center gap-2">
                {isAttendanceCleared ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span className="font-extrabold uppercase tracking-wider text-[10px]">Attendance status</span>
              </div>
              <p className="text-[10.5px] mt-2 font-medium">
                {isAttendanceCleared ? `✔ Attendance is satisfactory (${attendance}%).` : `● short attendance (${attendance}% < 75%).`}
              </p>
              {!isAttendanceCleared && (
                <a href="/student/counselling" className="mt-2 text-[10px] font-black underline block">Contact Counsellor →</a>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Hall Ticket admitting card render */
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Printable Admit Card Layout */}
          <div id="printable-admit-card" className="p-8 bg-white dark:bg-slate-900 border-4 border-double border-slate-300 dark:border-slate-800 rounded-3xl shadow-xl space-y-6 text-slate-800 dark:text-slate-100 font-sans print:border-none print:shadow-none print:bg-white print:text-black">
            
            {/* Header college logo */}
            <div className="flex justify-between items-start border-b-2 border-slate-300 dark:border-slate-800 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-650 uppercase tracking-widest block">Affiliated to State Tech University</span>
                <h1 className="text-xl font-black font-display text-slate-900 dark:text-white">KBN DEGREE & TECHNICAL COLLEGE</h1>
                <p className="text-[10.5px] text-slate-500">Central Academic Controller Board • Hall Ticket Admit Card</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-md text-[9px] font-black uppercase">Cleared / Released</span>
                <span className="block text-[9.5px] text-slate-400 mt-1">Dispatch Code: releases-2026-6S</span>
              </div>
            </div>

            {/* Student bio details grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              
              {/* Photo placeholder */}
              <div className="w-32 h-40 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-750 rounded-xl flex flex-col items-center justify-center text-center p-3">
                <User size={40} className="text-slate-400 dark:text-slate-655" />
                <span className="text-[8px] text-slate-400 font-bold mt-2 uppercase">Official Student Image</span>
              </div>

              {/* Data attributes */}
              <div className="md:col-span-3 grid grid-cols-2 gap-4 text-[11px] font-bold text-slate-650 dark:text-slate-350">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Candidate Name</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{student.fullName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Roll Registration No.</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{student.rollNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Department / Branch</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{student.department} Engineering</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Semester / Term</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{student.semester}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Center of Examinations</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">KBN Central Block Complex</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Dean Sign-off Code</span>
                  <span className="text-slate-900 dark:text-white font-mono font-extrabold">DEAN-STU-KBN-7729</span>
                </div>
              </div>

            </div>

            {/* Examination schedule timetable */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Registered Examinations Timetable</span>
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-[10.5px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-455 border-b border-slate-150 dark:border-slate-800/80 font-bold uppercase">
                      <th className="px-4 py-2">Subject Code</th>
                      <th className="px-4 py-2">Subject Name</th>
                      <th className="px-4 py-2">Exam Date</th>
                      <th className="px-4 py-2">Time Slot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-bold text-slate-800 dark:text-slate-200">
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5">CS-601</td>
                      <td className="px-4 py-2.5">Neural Networks & Deep Learning</td>
                      <td className="px-4 py-2.5">Sept 5, 2026</td>
                      <td className="px-4 py-2.5">09:30 AM - 12:30 PM</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5">CS-602</td>
                      <td className="px-4 py-2.5">Compiler Design & Theory</td>
                      <td className="px-4 py-2.5">Sept 7, 2026</td>
                      <td className="px-4 py-2.5">09:30 AM - 12:30 PM</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5">CS-603</td>
                      <td className="px-4 py-2.5">Software Engineering Architecture</td>
                      <td className="px-4 py-2.5">Sept 9, 2026</td>
                      <td className="px-4 py-2.5">09:30 AM - 12:30 PM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom barcode verification */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-5 gap-4">
              <div className="text-[10px] text-slate-455 font-bold space-y-1">
                <p>1. Candidates must arrive at the examination center 30 minutes before schedule.</p>
                <p>2. Bring this digital hall ticket printout along with college ID card.</p>
              </div>
              <div className="flex flex-col items-center">
                {/* Barcode Mock */}
                <div className="w-48 h-8 bg-slate-900 dark:bg-slate-700 flex items-center justify-around px-2 py-1 font-mono text-[9px] text-white tracking-widest font-black select-none border border-slate-800">
                  ||||| | ||||| | ||||| | ||||| | ||
                </div>
                <span className="text-[8px] text-slate-450 mt-1 uppercase font-bold">{student.rollNumber}</span>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-755 text-white rounded-xl font-bold shadow-lg flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Print Admit Card</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

// 15. DOCUMENT REQUEST DESK
const StudentDocumentRequests = ({ student, isParent }) => {
  const [requests, setRequests] = useState([]);
  const [docType, setDocType] = useState('Bonafide Certificate');
  const [purpose, setPurpose] = useState('');
  const [urgency, setUrgency] = useState('Standard');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAuth();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getDocumentRequests(student.uid);
      setRequests(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose) return;

    try {
      setSubmitting(true);
      await mockDB.submitDocumentRequest(student.uid, { docType, purpose, urgency });
      showToast('Document request logged! Dean Registrar notified.', 'success');
      setPurpose('');
      setUrgency('Standard');
      loadRequests();
    } catch (_) {
      showToast('Failed to log document request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepStatusClass = (currentStatus, targetStatus) => {
    const statuses = ['pending', 'approved', 'printed', 'ready'];
    const currentIdx = statuses.indexOf(currentStatus);
    const targetIdx = statuses.indexOf(targetStatus);

    if (currentIdx >= targetIdx) {
      return 'bg-emerald-500 text-white border-emerald-500';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
      
      {/* Form Card */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
        <h3 className="text-sm font-extrabold text-slate-855 dark:text-white uppercase tracking-wider mb-5">Request Official Document</h3>
        
        {isParent ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
            Parent View Mode: Official transcript request actions are disabled.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Document / Certificate Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              >
                <option value="Bonafide Certificate">Bonafide Certificate</option>
                <option value="Official Transcript of Grades">Official Transcript of Grades</option>
                <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
                <option value="Migration Certificate">Migration Certificate</option>
                <option value="Course Completion Certificate">Course Completion Certificate</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Purpose of Request</label>
              <textarea
                rows="3"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Provide details e.g., Higher Education / Education Loan / Visa application..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white resize-none font-medium"
              ></textarea>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Priority Dispatch Level</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-855 dark:text-slate-300">
                  <input
                    type="radio"
                    name="urgency"
                    checked={urgency === 'Standard'}
                    onChange={() => setUrgency('Standard')}
                  />
                  <span>Standard Process (3-5 Days)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-855 dark:text-slate-300">
                  <input
                    type="radio"
                    name="urgency"
                    checked={urgency === 'Urgent'}
                    onChange={() => setUrgency('Urgent')}
                  />
                  <span>Urgent Dispatch (24 Hours)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-650 hover:bg-blue-755 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? 'Filing request...' : 'Log Request'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>

      {/* History Ledger List */}
      <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Request Logs history</span>
        
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Loading document logs...</div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center text-slate-455">No official certificate requests logged on student profile.</div>
        ) : (
          <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
            {requests.map(r => (
              <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs">{r.docType}</h4>
                    <p className="text-[10px] text-slate-450 mt-1">Filed on {r.requestedAt} • Purpose: {r.purpose}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                    r.urgency === 'Urgent' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                  }`}>
                    {r.urgency}
                  </span>
                </div>

                {/* Progress Timeline Stepper */}
                <div className="grid grid-cols-4 items-center text-[8.5px] font-bold text-center relative pt-2">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-2.5 z-0"></div>
                  
                  <div className="z-10 flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-black ${getStepStatusClass(r.status, 'pending')}`}>1</div>
                    <span className="mt-1 block text-slate-455 uppercase">Filed</span>
                  </div>

                  <div className="z-10 flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-black ${getStepStatusClass(r.status, 'approved')}`}>2</div>
                    <span className="mt-1 block text-slate-455 uppercase">Approved</span>
                  </div>

                  <div className="z-10 flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-black ${getStepStatusClass(r.status, 'printed')}`}>3</div>
                    <span className="mt-1 block text-slate-455 uppercase">Printed</span>
                  </div>

                  <div className="z-10 flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-black ${getStepStatusClass(r.status, 'ready')}`}>4</div>
                    <span className="mt-1 block text-slate-455 uppercase">Ready / Shipped</span>
                  </div>
                </div>

                {r.remarks && (
                  <p className="p-2 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-[10px] rounded-lg">
                    <strong>Registrar Notes:</strong> {r.remarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// 16. HOSTEL ALLOTMENT & TRANSPORT DESK
const StudentHostelTransport = ({ student, isParent }) => {
  const [details, setDetails] = useState({ hostel: null, transport: null });
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  // Selection states
  const [block, setBlock] = useState('Boys Block A');
  const [roomType, setRoomType] = useState('AC Double Share');
  const [messPlan, setMessPlan] = useState('Vegetarian');
  const [submittingHostel, setSubmittingHostel] = useState(false);

  const [route, setRoute] = useState('Route 3 (Suburbs to Campus)');
  const [pickupPoint, setPickupPoint] = useState('');
  const [submittingBus, setSubmittingBus] = useState(false);

  const loadAllotments = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getHostelTransportDetails(student.uid);
      setDetails(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllotments();
  }, [student]);

  const handleBookHostel = async (e) => {
    e.preventDefault();
    try {
      setSubmittingHostel(true);
      await mockDB.bookHostelOrTransport(student.uid, 'hostel', { block, roomType, messPlan });
      showToast('Hostel room application booked and allocated!', 'success');
      loadAllotments();
    } catch (_) {
      showToast('Hostel booking failed.', 'error');
    } finally {
      setSubmittingHostel(false);
    }
  };

  const handleBookBus = async (e) => {
    e.preventDefault();
    if (!pickupPoint) return;

    try {
      setSubmittingBus(true);
      await mockDB.bookHostelOrTransport(student.uid, 'transport', { route, pickupPoint });
      showToast('Transport pass issued successfully!', 'success');
      loadAllotments();
    } catch (_) {
      showToast('Bus transport allotment failed.', 'error');
    } finally {
      setSubmittingBus(false);
    }
  };

  if (loading) return <div className="py-20 text-center animate-pulse text-slate-400">Loading residential allocations...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
      
      {/* Hostel Accommodation Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between">
        <div>
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">University Hostel Accommodation</span>
          
          {details.hostel ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-605 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-855 dark:text-white text-xs">Room Allocated</h4>
                  <span className="text-[10px] text-slate-450 mt-1 block">Allocated on {details.hostel?.bookedAt ? String(details.hostel.bookedAt).split('T')[0] : 'N/A'}</span>
                </div>
                <span className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-[9.5px] uppercase">Active Allotment</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] font-bold text-slate-700 dark:text-slate-350">
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block">Residential Block</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{details.hostel.block}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block">Room Specification</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{details.hostel.roomType}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block">Dining Mess Plan</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{details.hostel.messPlan}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block">Room Number (Assigned)</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">Room {Math.floor(100 + Math.random() * 800)}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookHostel} className="space-y-4 pt-2">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Select Residential Block</label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                >
                  <option value="Boys Block A">Boys Block A</option>
                  <option value="Boys Block B">Boys Block B</option>
                  <option value="Girls Block C">Girls Block C</option>
                  <option value="Girls Block D">Girls Block D</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Room Accommodation Tier</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                >
                  <option value="AC Single Suite">AC Single Suite (Premium)</option>
                  <option value="AC Double Share">AC Double Share</option>
                  <option value="Non-AC Double Share">Non-AC Double Share</option>
                  <option value="Non-AC Triple Share">Non-AC Triple Share (Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Dining Plan choice</label>
                <select
                  value={messPlan}
                  onChange={(e) => setMessPlan(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                >
                  <option value="Vegetarian">Vegetarian (Central Mess)</option>
                  <option value="Non-Vegetarian">Non-Vegetarian (Central Mess)</option>
                  <option value="South Indian Special">South Indian Special</option>
                  <option value="North Indian Special">North Indian Special</option>
                </select>
              </div>

              {isParent ? (
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl text-center">Room booking requires student authentication.</div>
              ) : (
                <button
                  type="submit"
                  disabled={submittingHostel}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-755 text-white rounded-xl font-bold shadow-lg transition-all"
                >
                  {submittingHostel ? 'Allocating hostel room...' : 'Book Hostel Suite & Allot Room'}
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Bus / Transport Allotment Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between">
        <div>
          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">University Transport Pass</span>
          
          {details.transport ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 text-blue-650 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-855 dark:text-white text-xs">Bus Pass Issued</h4>
                  <span className="text-[10px] text-slate-450 mt-1 block">Allotted on {details.transport?.bookedAt ? String(details.transport.bookedAt).split('T')[0] : 'N/A'}</span>
                </div>
                <span className="px-3.5 py-1.5 bg-blue-650 text-white rounded-xl font-black text-[9.5px] uppercase">Allotted Pass</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] font-bold text-slate-700 dark:text-slate-350">
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block">Bus Route Name</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{details.transport.route}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block">Pickup Boarding Point</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{details.transport.pickupPoint}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block">Bus Vehicle Number</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">AP-02-TS-{Math.floor(1000 + Math.random() * 8000)}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block">Est. Morning Pickup Time</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">07:45 AM</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookBus} className="space-y-4 pt-2">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Select Transport Route</label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
                >
                  <option value="Route 1 (Downtown to Campus)">Route 1 (Downtown to Campus)</option>
                  <option value="Route 3 (Suburbs to Campus)">Route 3 (Suburbs to Campus)</option>
                  <option value="Route 5 (City Center Express)">Route 5 (City Center Express)</option>
                  <option value="Route 8 (Metro Station Shuttle)">Route 8 (Metro Station Shuttle)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Pickup / Boarding Point</label>
                <input
                  type="text"
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  placeholder="e.g., Central Clock Tower Circle / Suburb Metro Exit..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">Annual Route Fee</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 block mt-1">₹18,000 / Academic Year</span>
              </div>

              {isParent ? (
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl text-center">Transport booking requires student authentication.</div>
              ) : (
                <button
                  type="submit"
                  disabled={submittingBus}
                  className="w-full py-3 bg-blue-650 hover:bg-blue-755 text-white rounded-xl font-bold shadow-lg transition-all"
                >
                  {submittingBus ? 'Filing transport route pass...' : 'Acquire Transport Pass & Allot Route'}
                </button>
              )}
            </form>
          )}
        </div>
      </div>

    </div>
  );
};

// 17. GRIEVANCE TICKET HELPDESK
const StudentSupportDesk = ({ student, isParent }) => {
  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState('Academics');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAuth();

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getGrievanceTickets(student.uid);
      setTickets(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !description) return;

    try {
      setSubmitting(true);
      await mockDB.submitGrievanceTicket(student.uid, { category, subject, description });
      showToast('Support Ticket submitted successfully! IT / Admin Cell notified.', 'success');
      setSubject('');
      setDescription('');
      loadTickets();
    } catch (_) {
      showToast('Support Ticket submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs font-semibold">
      
      {/* Ticket form */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl self-start">
        <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Create Helpdesk Ticket</h3>
        
        {isParent ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
            Parent View Mode: Support ticket creation is disabled.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Grievance Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none dark:text-white font-bold"
              >
                <option value="Academics">Academics & Curriculum</option>
                <option value="Fee / Invoice">Fee & Finance ledger</option>
                <option value="Hostel / Mess">Hostel & Food Mess</option>
                <option value="Library Services">Library Services</option>
                <option value="Transport Route">Transport Route & Passes</option>
                <option value="IT Infrastructure">IT Infrastructure & WiFi</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Subject Topic</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Unable to log on campus Wi-Fi router / Fee discrepancy"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase">Elaborate Ticket Description</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details of your grievance. Include relevant dates and transaction details..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-white resize-none font-medium"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? 'Submitting ticket...' : 'Submit Support Ticket'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>

      {/* Tickets List */}
      <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">Your Support Tickets Ledger</span>
        
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Loading support tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center text-slate-455">No grievances filed. Your profile has zero reported support issues.</div>
        ) : (
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {tickets.map(t => (
              <div key={t.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[9.5px] font-black uppercase">{t.category}</span>
                      <span className="text-[10px] text-slate-400 font-bold">Ticket: {t.id.toUpperCase()}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs mt-1.5">{t.subject}</h4>
                    <p className="text-[10.5px] text-slate-555 dark:text-slate-400 font-medium leading-relaxed mt-1.5">{t.description}</p>
                    <span className="text-[9.5px] text-slate-400 mt-1 block">Filed on {t.createdAt}</span>
                  </div>
                  
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                    t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                    t.status === 'processing' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {t.status}
                  </span>
                </div>

                {t.reply ? (
                  <div className="mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1">
                    <span className="text-[9.5px] font-black text-emerald-650 dark:text-emerald-400 uppercase tracking-wider block">Dean / Staff Resolution Response</span>
                    <p className="text-[10.5px] text-slate-655 dark:text-slate-350 font-semibold leading-relaxed">{t.reply}</p>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Resolved at {t.updatedAt}</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-405 italic">● Staff reviewer response is pending.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};


